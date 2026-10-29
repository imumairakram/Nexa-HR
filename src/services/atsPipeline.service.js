const prisma = require('../config/prisma');
const cacheService = require('./cache.service');
const { broadcastInAppNotification } = require('./notification.service');
const { parseResume } = require('./resumeParser.service');
const {
  matchJobOpening,
  screenCandidate,
  evaluateDecision,
} = require('./aiScreening.service');
const { markEmailAsProcessed } = require('./gmail.service');

// Sync Telemetry State
const syncTelemetry = {
  lastSyncTime: null,
  processedCount: 0,
  confirmedCount: 0,
  screenedOutCount: 0,
  unmatchedCount: 0,
  errorCount: 0,
  lastErrors: [],
};

/**
 * Generate unique applicationId (e.g. "APP-8291")
 */
async function generateApplicationId() {
  for (let i = 0; i < 10; i++) {
    const candidateCode = `APP-${Math.floor(1000 + Math.random() * 9000)}`;
    const existing = await prisma.jobApplication.findUnique({
      where: { applicationId: candidateCode },
      select: { id: true },
    });
    if (!existing) return candidateCode;
  }
  return `APP-${Date.now().toString().slice(-4)}`;
}

/**
 * Record an error in sync telemetry
 */
function recordTelemetryError(msg) {
  syncTelemetry.errorCount++;
  syncTelemetry.lastErrors.unshift({
    timestamp: new Date().toISOString(),
    message: msg.slice(0, 300),
  });
  if (syncTelemetry.lastErrors.length > 20) {
    syncTelemetry.lastErrors.pop();
  }
}

/**
 * Process a single candidate email application end-to-end
 *
 * @param {Object} email - Object containing messageId, senderName, senderEmail, subject, bodyText, attachments
 * @returns {Promise<Object>} Processed application outcome
 */
async function processEmailApplication(email) {
  const { messageId, senderName, senderEmail, subject, bodyText, attachments } = email;

  // 1. Idempotency check via gmailMessageId
  const existingByMessage = await prisma.jobApplication.findUnique({
    where: { gmailMessageId: messageId },
  });
  if (existingByMessage) {
    console.log(`[ATS PIPELINE] Email with messageId ${messageId} already processed. Skipping duplicate.`);
    await markEmailAsProcessed(messageId);
    return { skipped: true, reason: 'Already processed', applicationId: existingByMessage.id };
  }

  // 2. Locate CV attachment (PDF or DOCX)
  const primaryAttachment = attachments[0];
  if (!primaryAttachment || !primaryAttachment.buffer) {
    console.warn(`[ATS PIPELINE] Email ${messageId} has no attachments. Marking processed.`);
    await markEmailAsProcessed(messageId);
    return { skipped: true, reason: 'No valid CV attachment' };
  }

  // 3. Parse resume buffer & upload to Cloudinary
  console.log(`[ATS PIPELINE] Parsing CV attachment "${primaryAttachment.filename}" (${primaryAttachment.size} bytes)...`);
  const parsed = await parseResume({
    buffer: primaryAttachment.buffer,
    filename: primaryAttachment.filename,
    mimetype: primaryAttachment.mimeType,
  });

  // 4. Retrieve all ACTIVE jobs for requisition matching
  const activeJobs = await prisma.jobOpening.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { createdAt: 'desc' },
  });

  // 5. Step A: Job Requisition Matching
  const matchResult = await matchJobOpening({
    emailSubject: subject,
    emailBody: bodyText,
    resumeText: parsed.text,
    activeJobs,
  });

  const matchedJob = matchResult.matchedJob;

  // Handle UNMATCHED: No active job matches with >= 0.5 confidence
  if (!matchedJob) {
    console.log(`[ATS PIPELINE] No active job matched for "${subject}". Saving as UNMATCHED.`);
    const appId = await generateApplicationId();

    const application = await prisma.jobApplication.create({
      data: {
        applicationId: appId,
        jobOpeningId: null,
        name: senderName || 'Unknown Applicant',
        email: senderEmail,
        role: subject.slice(0, 50) || 'Unmatched Requisition',
        department: 'General Talent Pool',
        location: 'HQ / Remote',
        stage: 'APPLIED',
        status: 'ACTIVE',
        source: 'GMAIL',
        gmailMessageId: messageId,
        resumeSummary: parsed.text.slice(0, 300) || 'Scanned or empty CV text. Route for manual review.',
        notes: `AI Match Note: ${matchResult.reasoning}`,
        aiScore: null,
        aiStatus: 'UNMATCHED',
        aiScreenedAt: new Date(),
        resumeUrl: parsed.resumeUrl,
      },
    });

    syncTelemetry.unmatchedCount++;
    syncTelemetry.processedCount++;
    await markEmailAsProcessed(messageId);
    cacheService.invalidateTags(['recruitment', 'dashboard']);

    return { success: true, status: 'UNMATCHED', application };
  }

  // 6. Check for CV parsing failure (e.g. scanned PDF without extractable text)
  if (parsed.parseStatus === 'FAILED' && (!parsed.text || parsed.text.length < 50)) {
    console.warn(`[ATS PIPELINE] CV text empty or scanned PDF. Routing to manual review.`);
    const appId = await generateApplicationId();

    const application = await prisma.jobApplication.create({
      data: {
        applicationId: appId,
        jobOpeningId: matchedJob.id,
        name: senderName || 'Unknown Applicant',
        email: senderEmail,
        role: matchedJob.title,
        department: matchedJob.department,
        location: matchedJob.location,
        stage: 'APPLIED',
        status: 'ACTIVE',
        source: 'GMAIL',
        gmailMessageId: messageId,
        resumeSummary: 'Text extraction returned insufficient text (scanned PDF or image). Route for manual HR evaluation.',
        notes: 'AI Parse Status: FAILED (Scanned CV). Manual review required.',
        aiScore: null,
        aiStatus: 'ERROR',
        aiScreenedAt: new Date(),
        resumeUrl: parsed.resumeUrl,
      },
    });

    syncTelemetry.errorCount++;
    syncTelemetry.processedCount++;
    await markEmailAsProcessed(messageId);
    cacheService.invalidateTags(['recruitment', 'dashboard']);

    return { success: true, status: 'ERROR', application };
  }

  // 7. Step B: AI ATS Resume Scoring
  console.log(`[ATS PIPELINE] Scoring candidate CV against requisition: "${matchedJob.title}"...`);
  let screeningData;
  try {
    screeningData = await screenCandidate({
      job: matchedJob,
      resumeText: parsed.text,
      emailSubject: subject,
      emailBody: bodyText,
    });
  } catch (aiErr) {
    console.error(`[ATS PIPELINE] AI scoring failed for ${senderEmail}:`, aiErr.message);
    recordTelemetryError(`AI scoring failed for ${senderEmail}: ${aiErr.message}`);

    const appId = await generateApplicationId();
    const application = await prisma.jobApplication.create({
      data: {
        applicationId: appId,
        jobOpeningId: matchedJob.id,
        name: senderName || 'Unknown Applicant',
        email: senderEmail,
        role: matchedJob.title,
        department: matchedJob.department,
        location: matchedJob.location,
        stage: 'APPLIED',
        status: 'ACTIVE',
        source: 'GMAIL',
        gmailMessageId: messageId,
        resumeSummary: parsed.text.slice(0, 300),
        notes: `AI Scoring Error: ${aiErr.message}. Routed for manual evaluation.`,
        aiStatus: 'ERROR',
        aiScreenedAt: new Date(),
        resumeUrl: parsed.resumeUrl,
      },
    });

    syncTelemetry.errorCount++;
    syncTelemetry.processedCount++;
    await markEmailAsProcessed(messageId);
    cacheService.invalidateTags(['recruitment', 'dashboard']);

    return { success: false, status: 'ERROR', application, error: aiErr.message };
  }

  // 8. Server-side Decision Computation
  const decision = evaluateDecision(screeningData.score);
  const candidateName = screeningData.candidate?.name || senderName || 'Candidate';
  const candidateEmail = (screeningData.candidate?.email || senderEmail || '').toLowerCase();
  const candidatePhone = screeningData.candidate?.phone || null;
  const candidateRole = matchedJob.title;
  const candidateExp = screeningData.candidate?.yearsExperience
    ? `${screeningData.candidate.yearsExperience} Years`
    : matchedJob.experience || '3 Years';

  // 9. Database Transaction with Duplicate Protection
  // Duplicate check: same candidate email + same job opening -> update/attach instead of creating duplicate
  const resultApplication = await prisma.$transaction(async (tx) => {
    const existing = await tx.jobApplication.findFirst({
      where: {
        jobOpeningId: matchedJob.id,
        email: candidateEmail,
      },
    });

    const appData = {
      name: candidateName,
      phone: candidatePhone,
      role: candidateRole,
      department: matchedJob.department,
      location: matchedJob.location,
      experience: candidateExp,
      stage: decision.isPass ? 'APPLIED' : 'SCREENED_OUT',
      status: 'ACTIVE',
      source: 'GMAIL',
      gmailMessageId: messageId,
      resumeSummary: screeningData.summary || parsed.text.slice(0, 300),
      notes: `AI ATS Score: ${screeningData.score}/100 (Threshold: ${decision.threshold}). Recommendation: ${screeningData.recommendation}.`,
      tags: screeningData.candidate?.topSkills || [],
      aiScore: screeningData.score,
      aiBreakdown: screeningData.breakdown,
      aiSummary: screeningData.summary,
      aiStrengths: screeningData.strengths,
      aiGaps: screeningData.gaps,
      aiStatus: decision.status,
      aiScreenedAt: new Date(),
      resumeUrl: parsed.resumeUrl,
    };

    if (existing) {
      console.log(`[ATS PIPELINE] Updating existing application (${existing.applicationId}) for ${candidateEmail}`);
      return await tx.jobApplication.update({
        where: { id: existing.id },
        data: appData,
      });
    } else {
      const appId = await generateApplicationId();
      return await tx.jobApplication.create({
        data: {
          applicationId: appId,
          jobOpeningId: matchedJob.id,
          email: candidateEmail,
          ...appData,
        },
      });
    }
  });

  // 10. Notifications, Telemetry & Invalidation
  syncTelemetry.processedCount++;
  if (decision.isPass) {
    syncTelemetry.confirmedCount++;
    console.log(
      `[ATS PIPELINE] PASS -> Candidate ${candidateName} confirmed for "${matchedJob.title}" with score ${screeningData.score}/100`
    );

    // In-app notification to HR / Admin users
    try {
      await broadcastInAppNotification({
        title: 'New AI-Confirmed Candidate',
        message: `New AI-confirmed candidate: ${candidateName} for ${matchedJob.title} (Score: ${screeningData.score}/100)`,
        type: 'success',
        category: 'RECRUITMENT',
        link: '/recruitment/pipeline',
        targetRoles: ['ADMIN', 'HR_MANAGER'],
      });
    } catch (notifErr) {
      console.warn('[ATS PIPELINE] Could not send in-app notification:', notifErr.message);
    }
  } else {
    syncTelemetry.screenedOutCount++;
    console.log(
      `[ATS PIPELINE] SCREENED OUT -> Candidate ${candidateName} scored ${screeningData.score}/100 (below ${decision.threshold}). Auditable in screened-out drawer.`
    );
  }

  // 11. Invalidate cache so Jobs Workspace and ATS Pipeline update immediately
  cacheService.invalidateTags(['recruitment', 'dashboard']);
  cacheService.invalidateByRoute('/recruitment');

  // 12. Mark email as processed in Gmail
  await markEmailAsProcessed(messageId);

  return {
    success: true,
    status: decision.status,
    application: resultApplication,
    score: screeningData.score,
    threshold: decision.threshold,
  };
}

/**
 * Orchestrates a batch of emails fetched from Gmail
 * Safe: One failing email never interrupts the rest of the batch
 *
 * @param {Array<Object>} emails
 * @returns {Promise<Object>} Batch summary
 */
async function processEmailBatch(emails) {
  syncTelemetry.lastSyncTime = new Date().toISOString();
  const results = [];

  for (const email of emails) {
    try {
      const result = await processEmailApplication(email);
      results.push(result);
    } catch (error) {
      console.error(`[ATS PIPELINE] Error processing email from ${email.senderEmail}:`, error.message);
      recordTelemetryError(`Error processing email from ${email.senderEmail}: ${error.message}`);
      // Mark processed to prevent poison pill loop
      if (email.messageId) {
        await markEmailAsProcessed(email.messageId).catch(() => null);
      }
      results.push({ success: false, error: error.message, email: email.senderEmail });
    }
  }

  return {
    total: emails.length,
    processed: results.length,
    results,
    telemetry: getSyncStatus(),
  };
}

/**
 * Returns current sync status and metrics
 */
function getSyncStatus() {
  const threshold = parseInt(process.env.ATS_PASS_THRESHOLD || '70', 10);
  return {
    ...syncTelemetry,
    passThreshold: threshold,
  };
}

/**
 * Re-scan an existing application with AI
 */
async function rescanApplication(applicationId) {
  const application = await prisma.jobApplication.findUnique({
    where: { id: applicationId },
    include: { jobOpening: true },
  });

  if (!application) {
    throw new Error('Application not found');
  }

  if (!application.jobOpening) {
    throw new Error('Application does not have a linked job requisition to scan against');
  }

  const resumeText = application.resumeSummary || 'No resume text available.';
  const screeningData = await screenCandidate({
    job: application.jobOpening,
    resumeText,
  });

  const decision = evaluateDecision(screeningData.score);

  const updated = await prisma.jobApplication.update({
    where: { id: applicationId },
    data: {
      aiScore: screeningData.score,
      aiBreakdown: screeningData.breakdown,
      aiSummary: screeningData.summary,
      aiStrengths: screeningData.strengths,
      aiGaps: screeningData.gaps,
      aiStatus: decision.status,
      aiScreenedAt: new Date(),
      stage: decision.isPass ? 'APPLIED' : 'SCREENED_OUT',
      notes: `${application.notes || ''}\n[Rescan ${new Date().toISOString()}] Score: ${screeningData.score}/100. Status: ${decision.status}.`.trim(),
    },
  });

  cacheService.invalidateTags(['recruitment', 'dashboard']);
  cacheService.invalidateByRoute('/recruitment');

  return updated;
}

/**
 * HR manual override to promote a screened-out/unmatched/error application to the APPLIED stage
 */
async function overrideApplication(applicationId, user) {
  const application = await prisma.jobApplication.findUnique({
    where: { id: applicationId },
    include: { jobOpening: true },
  });

  if (!application) {
    throw new Error('Application not found');
  }

  const actorName = user?.name || user?.email || 'HR Administrator';
  const timestamp = new Date().toISOString();
  const overrideNote = `[HR OVERRIDE by ${actorName} at ${timestamp}] Manually promoted from ${application.aiStatus} to CONFIRMED in APPLIED stage.`;

  const updated = await prisma.jobApplication.update({
    where: { id: applicationId },
    data: {
      stage: 'APPLIED',
      status: 'ACTIVE',
      aiStatus: 'CONFIRMED',
      notes: application.notes ? `${application.notes}\n${overrideNote}` : overrideNote,
    },
  });

  cacheService.invalidateTags(['recruitment', 'dashboard']);
  cacheService.invalidateByRoute('/recruitment');

  return updated;
}

module.exports = {
  processEmailApplication,
  processEmailBatch,
  getSyncStatus,
  rescanApplication,
  overrideApplication,
};

