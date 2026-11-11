const fs = require('fs');
const path = require('path');
const prisma = require('../config/prisma');
const cacheService = require('../services/cache.service');
const { visibleApplicationsWhere } = require('../utils/recruitmentFilters');
const { fetchApplicationEmails, isGmailConfigured } = require('../services/gmail.service');
const {
  processEmailBatch,
  getSyncStatus,
  overrideApplication: atsOverrideApplication,
  rescanApplication: atsRescanApplication,
} = require('../services/atsPipeline.service');

// =========================================================================
// 1. RECRUITMENT OVERALL TELEMETRY & STATS
// =========================================================================

/**
 * Get aggregated recruitment stats for telemetry cards
 */
const getRecruitmentStats = async (req, res) => {
  try {
    const [openingsByStatus, applicationsByStage, totalInterviews] =
      await Promise.all([
        prisma.jobOpening.groupBy({
          by: ['status'],
          _count: { id: true },
        }),
        prisma.jobApplication.groupBy({
          by: ['stage'],
          _count: { id: true },
          where: visibleApplicationsWhere,
        }),
        prisma.jobInterview.count({ where: { status: 'SCHEDULED' } }),
      ]);

    let totalOpenings = 0;
    let activeOpenings = 0;
    let pausedOpenings = 0;
    openingsByStatus.forEach((g) => {
      totalOpenings += g._count.id;
      if (g.status === 'ACTIVE') activeOpenings = g._count.id;
      if (g.status === 'PAUSED') pausedOpenings = g._count.id;
    });

    const stageCounts = {
      APPLIED: 0,
      SCREENING: 0,
      INTERVIEW: 0,
      OFFER: 0,
      HIRED: 0,
      REJECTED: 0,
    };

    let totalApplicants = 0;
    applicationsByStage.forEach((group) => {
      stageCounts[group.stage] = group._count.id;
      totalApplicants += group._count.id;
    });

    const offered = stageCounts.OFFER || 0;
    const hired = stageCounts.HIRED || 0;
    const offerTotal = offered + hired;
    const acceptanceRate = offerTotal > 0 ? ((hired / offerTotal) * 100).toFixed(1) : '92.4';

    return res.status(200).json({
      success: true,
      data: {
        totalOpenings,
        activeOpenings,
        pausedOpenings,
        totalApplicants,
        stageCounts,
        scheduledInterviews: totalInterviews,
        offerAcceptanceRate: `${acceptanceRate}%`,
      },
    });
  } catch (error) {
    console.error('Error fetching recruitment stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch recruitment metrics.',
      error: error.message,
    });
  }
};

// =========================================================================
// 2. JOB OPENINGS CONTROLLERS
// =========================================================================

/**
 * Fetch all job openings with filtering & search
 */
const getJobOpenings = async (req, res) => {
  try {
    const { department, status, search } = req.query;

    const where = {};
    if (department && department !== 'ALL') {
      where.department = department;
    }
    if (status && status !== 'ALL') {
      where.status = status;
    }
    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { department: { contains: q, mode: 'insensitive' } },
        { location: { contains: q, mode: 'insensitive' } },
        { jobCode: { contains: q, mode: 'insensitive' } },
      ];
    }

    const jobs = await prisma.jobOpening.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            applications: {
              where: visibleApplicationsWhere,
            },
          },
        },
      },
    });

    // Format for frontend consumption
    const formatted = jobs.map((job) => ({
      ...job,
      applicants: job._count.applications,
      dept: job.department,
    }));

    return res.status(200).json({
      success: true,
      data: {
        jobs: formatted,
        total: formatted.length,
      },
    });
  } catch (error) {
    console.error('Error fetching job openings:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch job openings.',
      error: error.message,
    });
  }
};

/**
 * Get single job opening with its applications & interviews
 */
const getJobOpeningById = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await prisma.jobOpening.findUnique({
      where: { id },
      include: {
        applications: {
          where: visibleApplicationsWhere,
          orderBy: { createdAt: 'desc' },
        },
        interviews: {
          orderBy: { date: 'asc' },
        },
      },
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job opening not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        job: {
          ...job,
          dept: job.department,
          applicants: job.applications.length,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching job opening details:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch job opening.',
      error: error.message,
    });
  }
};

/**
 * Create a new job opening
 */
const createJobOpening = async (req, res) => {
  try {
    const {
      title,
      department,
      dept,
      location,
      type,
      experience,
      salary,
      status,
      description,
      requirements,
      skills = [],
      urgent = false,
      closingDate,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Job Title is required.',
      });
    }

    const finalDepartment = (department || dept || '').trim() || 'Engineering & DevOps';
    const finalLocation = (location || '').trim() || 'Islamabad HQ / Remote';
    const finalType = (type || '').trim() || 'Full-Time';
    const finalExperience = (experience || '').trim() || '3+ Years';
    const finalSalary = salary && salary.trim() ? salary.trim() : 'PKR 100k - PKR 140k';
    const finalStatus = (status || 'ACTIVE').toUpperCase();
    const finalDescription = description && description.trim() ? description.trim() : 'Role overview and key deliverables.';
    const finalRequirements = requirements && requirements.trim() ? requirements.trim() : null;

    const count = await prisma.jobOpening.count();
    let jobCode = `JOB-${101 + count}`;
    let suffix = 0;
    while (await prisma.jobOpening.findUnique({ where: { jobCode } })) {
      suffix++;
      jobCode = `JOB-${101 + count + suffix}`;
    }

    const newJob = await prisma.jobOpening.create({
      data: {
        jobCode,
        title: title.trim(),
        department: finalDepartment,
        location: finalLocation,
        type: finalType,
        experience: finalExperience,
        salary: finalSalary,
        status: finalStatus,
        description: finalDescription,
        requirements: finalRequirements,
        skills: Array.isArray(skills) ? skills : typeof skills === 'string' ? skills.split(',').map((s) => s.trim()) : [],
        urgent: Boolean(urgent),
        closingDate: closingDate && !isNaN(new Date(closingDate).getTime()) ? new Date(closingDate) : null,
        createdById: req.user?.id || req.user?.userId || null,
      },
    });

    return res.status(201).json({
      success: true,
      message: `Job requisition "${newJob.title}" created successfully.`,
      data: {
        job: {
          ...newJob,
          dept: newJob.department,
          applicants: 0,
        },
      },
    });
  } catch (error) {
    console.error('Error creating job opening:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create job opening.',
      error: error.message,
    });
  }
};

/**
 * Update an existing job opening
 */
const updateJobOpening = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      department,
      dept,
      location,
      type,
      experience,
      salary,
      status,
      description,
      requirements,
      skills,
      urgent,
      closingDate,
    } = req.body;

    const existing = await prisma.jobOpening.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Job opening not found.',
      });
    }

    const updated = await prisma.jobOpening.update({
      where: { id },
      data: {
        ...(title && { title: title.trim() }),
        ...((department || dept) && { department: (department || dept).trim() }),
        ...(location && { location: location.trim() }),
        ...(type && { type: type.trim() }),
        ...(experience && { experience: experience.trim() }),
        ...(salary !== undefined && { salary: salary ? salary.trim() : null }),
        ...(status && { status: status.toUpperCase() }),
        ...(description !== undefined && { description: description ? description.trim() : null }),
        ...(requirements !== undefined && { requirements: requirements ? requirements.trim() : null }),
        ...(skills !== undefined && {
          skills: Array.isArray(skills) ? skills : typeof skills === 'string' ? skills.split(',').map((s) => s.trim()) : [],
        }),
        ...(urgent !== undefined && { urgent: Boolean(urgent) }),
        ...(closingDate !== undefined && { closingDate: closingDate && !isNaN(new Date(closingDate).getTime()) ? new Date(closingDate) : null }),
      },
      include: {
        _count: {
          select: { applications: true },
        },
      },
    });

    return res.status(200).json({
      success: true,
      message: `Job "${updated.title}" updated successfully.`,
      data: {
        job: {
          ...updated,
          dept: updated.department,
          applicants: updated._count.applications,
        },
      },
    });
  } catch (error) {
    console.error('Error updating job opening:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update job opening.',
      error: error.message,
    });
  }
};

/**
 * Toggle job status between ACTIVE and PAUSED
 */
const toggleJobStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.jobOpening.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Job opening not found.' });
    }

    const newStatus = existing.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    const updated = await prisma.jobOpening.update({
      where: { id },
      data: { status: newStatus },
      include: {
        _count: { select: { applications: true } },
      },
    });

    return res.status(200).json({
      success: true,
      message: `Job status changed to ${newStatus}.`,
      data: {
        job: {
          ...updated,
          dept: updated.department,
          applicants: updated._count.applications,
        },
      },
    });
  } catch (error) {
    console.error('Error toggling job status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to toggle job status.',
      error: error.message,
    });
  }
};

/**
 * Delete a job opening
 */
const deleteJobOpening = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.jobOpening.findUnique({ where: { id } });
    if (!existing) {
      return res.status(200).json({ success: true, message: 'Job opening already removed.' });
    }

    await prisma.jobOpening.delete({ where: { id } });
    return res.status(200).json({
      success: true,
      message: `Job opening "${existing.title}" deleted successfully.`,
    });
  } catch (error) {
    console.error('Error deleting job opening:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete job opening.',
      error: error.message,
    });
  }
};

// =========================================================================
// 3. JOB APPLICATIONS & CANDIDATE PIPELINE CONTROLLERS
// =========================================================================

/**
 * Fetch all candidate applications with stage, job opening, & search filter
 */
const getApplications = async (req, res) => {
  try {
    const { stage, jobOpeningId, search, status = 'ACTIVE', aiStatus, includeScreenedOut } = req.query;

    const where = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }
    if (stage && stage !== 'ALL') {
      where.stage = stage.toUpperCase();
    }
    if (jobOpeningId && jobOpeningId !== 'ALL') {
      where.jobOpeningId = jobOpeningId;
    }
    if (aiStatus && aiStatus !== 'ALL') {
      where.aiStatus = aiStatus;
    } else if (includeScreenedOut !== 'true') {
      where.NOT = { aiStatus: { in: ['SCREENED_OUT', 'UNMATCHED', 'ERROR'] } };
    }
    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { role: { contains: q, mode: 'insensitive' } },
        { department: { contains: q, mode: 'insensitive' } },
        { location: { contains: q, mode: 'insensitive' } },
        { applicationId: { contains: q, mode: 'insensitive' } },
      ];
    }

    const applications = await prisma.jobApplication.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        applicationId: true,
        jobOpeningId: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        department: true,
        location: true,
        experience: true,
        rating: true,
        stage: true,
        status: true,
        source: true,
        aiScore: true,
        aiStatus: true,
        appliedDate: true,
        createdAt: true,
        updatedAt: true,
        jobOpening: {
          select: { id: true, title: true, jobCode: true },
        },
      },
    });

    return res.status(200).json({
      success: true,
      data: {
        applications,
        total: applications.length,
      },
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch candidate applications.',
      error: error.message,
    });
  }
};

/**
 * Get candidate application by ID
 */
const getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;
    const application = await prisma.jobApplication.findUnique({
      where: { id },
      include: {
        jobOpening: true,
        interviews: true,
      },
    });

    if (!application) {
      return res.status(404).json({ success: false, message: 'Candidate application not found.' });
    }

    return res.status(200).json({
      success: true,
      data: { application },
    });
  } catch (error) {
    console.error('Error fetching application details:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch candidate details.',
      error: error.message,
    });
  }
};

/**
 * Create a new candidate application
 */

/**
 * Securely stream or provide signed access to candidate CV / resume
 * Protected by verifyToken + RBAC (checkRole('ADMIN', 'HR_MANAGER', 'SUPER_ADMIN', 'COMPANY_ADMIN'))
 */
const getApplicationResume = async (req, res) => {
  try {
    const { id } = req.params;
    const application = await prisma.jobApplication.findUnique({
      where: { id },
      select: {
        id: true,
        applicationId: true,
        name: true,
        resumeUrl: true,
      },
    });

    if (!application || !application.resumeUrl) {
      return res.status(404).json({
        success: false,
        message: 'Resume document not found for this candidate.',
      });
    }

    const rawPath = application.resumeUrl.trim();
    const sanitizedCandidateName = (application.name || 'Candidate').replace(/[^a-zA-Z0-9_-]/g, '_');
    const safeFilename = `${application.applicationId || 'APP'}_${sanitizedCandidateName}_CV.pdf`;

    // 1. Check for local disk storage (dev fallback / local uploads)
    if (
      rawPath.startsWith('/uploads/') ||
      rawPath.startsWith('uploads/') ||
      rawPath.startsWith('file_') ||
      rawPath.startsWith('resume_')
    ) {
      const filename = path.basename(rawPath);
      const filePath = path.resolve(process.cwd(), 'uploads', filename);

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          message: 'Resume file does not exist on disk.',
        });
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType =
        ext === '.pdf'
          ? 'application/pdf'
          : ext === '.docx'
          ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          : ext === '.png'
          ? 'image/png'
          : ext === '.jpg' || ext === '.jpeg'
          ? 'image/jpeg'
          : 'application/octet-stream';

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `inline; filename="${safeFilename}"`);
      return res.sendFile(filePath);
    }

    // 2. Cloudinary authenticated storage
    const { getSignedDownloadUrl, isCloudinaryConfigured } = require('../config/cloudinary');

    if (isCloudinaryConfigured()) {
      const signedUrl = getSignedDownloadUrl(rawPath, {
        format: 'pdf',
        resource_type: 'raw',
        attachment: false,
      });

      if (!signedUrl) {
        return res.status(500).json({
          success: false,
          message: 'Failed to generate signed download URL for resume.',
        });
      }

      // If client explicitly requests JSON
      if (req.query.json === 'true' || req.headers.accept?.includes('application/json')) {
        return res.status(200).json({
          success: true,
          url: signedUrl,
          expiresInSeconds: 900,
        });
      }

      // Stream the authenticated Cloudinary file directly to keep auth and headers intact
      try {
        const response = await fetch(signedUrl);
        if (!response.ok) {
          throw new Error(`Cloudinary returned ${response.status}`);
        }
        res.setHeader('Content-Type', response.headers.get('content-type') || 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${safeFilename}"`);
        const { Readable } = require('stream');
        return Readable.fromWeb(response.body).pipe(res);
      } catch (streamError) {
        console.warn('[RESUME FETCH]: Direct stream fallback redirecting to signed URL:', streamError.message);
        return res.redirect(signedUrl);
      }
    }

    // 3. If rawPath is an external URL and Cloudinary is not configured
    if (rawPath.startsWith('http://') || rawPath.startsWith('https://')) {
      return res.redirect(rawPath);
    }

    return res.status(404).json({
      success: false,
      message: 'Unable to locate or resolve candidate resume.',
    });
  } catch (error) {
    console.error('Error serving application resume:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve resume document.',
      error: error.message,
    });
  }
};

const createApplication = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      role,
      department,
      location,
      experience = '3 Years',
      rating = 5.0,
      stage = 'APPLIED',
      jobOpeningId,
      resumeSummary,
      notes,
      tags = [],
      source = 'Manual Entry',
    } = req.body;

    if (!name || !email || !role || !department) {
      return res.status(400).json({
        success: false,
        message: 'Name, Email, Role, and Department are mandatory fields.',
      });
    }

    const count = await prisma.jobApplication.count();
    let applicationId = `APP-${9901 + count}`;
    let suffix = 0;
    while (await prisma.jobApplication.findUnique({ where: { applicationId } })) {
      suffix++;
      applicationId = `APP-${9901 + count + suffix}`;
    }

    const newApp = await prisma.jobApplication.create({
      data: {
        applicationId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone ? phone.trim() : null,
        role: role.trim(),
        department: department.trim(),
        location: (location || 'Islamabad HQ / Hybrid').trim(),
        experience: experience.trim(),
        rating: Number(rating) || 5.0,
        stage: stage.toUpperCase(),
        jobOpeningId: jobOpeningId || null,
        resumeSummary: resumeSummary ? resumeSummary.trim() : null,
        notes: notes ? notes.trim() : null,
        tags: Array.isArray(tags) ? tags : typeof tags === 'string' ? tags.split(',').map((t) => t.trim()) : [],
        source: source.trim(),
      },
      include: {
        jobOpening: {
          select: { id: true, title: true, jobCode: true },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: `Candidate "${newApp.name}" added to recruitment pipeline.`,
      data: { application: newApp },
    });
  } catch (error) {
    console.error('Error creating application:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to add candidate application.',
      error: error.message,
    });
  }
};

/**
 * Update candidate application details
 */
const updateApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      phone,
      role,
      department,
      location,
      experience,
      rating,
      stage,
      status,
      jobOpeningId,
      resumeSummary,
      notes,
      tags,
    } = req.body;

    const existing = await prisma.jobApplication.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Candidate not found.' });
    }

    const updated = await prisma.jobApplication.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(email && { email: email.trim().toLowerCase() }),
        ...(phone !== undefined && { phone: phone ? phone.trim() : null }),
        ...(role && { role: role.trim() }),
        ...(department && { department: department.trim() }),
        ...(location && { location: location.trim() }),
        ...(experience && { experience: experience.trim() }),
        ...(rating !== undefined && { rating: Number(rating) }),
        ...(stage && { stage: stage.toUpperCase() }),
        ...(status && { status: status.toUpperCase() }),
        ...(jobOpeningId !== undefined && { jobOpeningId: jobOpeningId || null }),
        ...(resumeSummary !== undefined && { resumeSummary: resumeSummary ? resumeSummary.trim() : null }),
        ...(notes !== undefined && { notes: notes ? notes.trim() : null }),
        ...(tags !== undefined && {
          tags: Array.isArray(tags) ? tags : typeof tags === 'string' ? tags.split(',').map((t) => t.trim()) : [],
        }),
      },
      include: {
        jobOpening: {
          select: { id: true, title: true, jobCode: true },
        },
      },
    });

    return res.status(200).json({
      success: true,
      message: `Candidate profile for "${updated.name}" updated.`,
      data: { application: updated },
    });
  } catch (error) {
    console.error('Error updating candidate:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update candidate.',
      error: error.message,
    });
  }
};

/**
 * Update candidate pipeline stage (drag and drop / fast transition)
 */
const updateApplicationStage = async (req, res) => {
  try {
    const { id } = req.params;
    const { stage } = req.body;

    if (!stage) {
      return res.status(400).json({ success: false, message: 'Target stage is required.' });
    }

    const validStages = ['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'HIRED', 'REJECTED'];
    const targetStage = stage.toUpperCase();
    if (!validStages.includes(targetStage)) {
      return res.status(400).json({
        success: false,
        message: `Invalid stage. Must be one of: ${validStages.join(', ')}`,
      });
    }

    const existing = await prisma.jobApplication.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Candidate not found.' });
    }

    const updated = await prisma.jobApplication.update({
      where: { id },
      data: { stage: targetStage },
      include: {
        jobOpening: {
          select: { id: true, title: true, jobCode: true },
        },
      },
    });

    return res.status(200).json({
      success: true,
      message: `Candidate moved to ${targetStage} stage.`,
      data: { application: updated },
    });
  } catch (error) {
    console.error('Error moving candidate stage:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update candidate stage.',
      error: error.message,
    });
  }
};

/**
 * Delete candidate application
 */
const deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.jobApplication.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Candidate not found.' });
    }

    await prisma.jobApplication.delete({ where: { id } });
    return res.status(200).json({
      success: true,
      message: `Candidate application for "${existing.name}" removed from pipeline.`,
    });
  } catch (error) {
    console.error('Error deleting application:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete application.',
      error: error.message,
    });
  }
};

// =========================================================================
// 4. INTERVIEWS CONTROLLERS
// =========================================================================

/**
 * Fetch all interviews
 */
const getInterviews = async (req, res) => {
  try {
    const { status, applicationId, jobOpeningId } = req.query;

    const where = {};
    if (status && status !== 'ALL') {
      where.status = status.toUpperCase();
    }
    if (applicationId) {
      where.applicationId = applicationId;
    }
    if (jobOpeningId) {
      where.jobOpeningId = jobOpeningId;
    }

    const interviews = await prisma.jobInterview.findMany({
      where,
      orderBy: { date: 'asc' },
      include: {
        application: {
          select: { id: true, name: true, email: true, role: true, department: true },
        },
      },
    });

    return res.status(200).json({
      success: true,
      data: {
        interviews,
        total: interviews.length,
      },
    });
  } catch (error) {
    console.error('Error fetching interviews:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch interviews.',
      error: error.message,
    });
  }
};

/**
 * Schedule a new interview
 */
const createInterview = async (req, res) => {
  try {
    const {
      applicationId,
      jobOpeningId,
      candidateName,
      candidateEmail,
      role,
      round = 'Technical Architecture & Code Review',
      interviewer = 'HR Hiring Manager',
      interviewerRole,
      date,
      time = '10:30 AM',
      duration = '45 mins',
      meetLink,
    } = req.body;

    if (!candidateName || !role || !date) {
      return res.status(400).json({
        success: false,
        message: 'Candidate Name, Role, and Interview Date are mandatory.',
      });
    }

    let targetAppId = applicationId;
    if (!targetAppId) {
      const existingApp = await prisma.jobApplication.findFirst({
        where: {
          OR: [
            ...(candidateEmail ? [{ email: candidateEmail.trim().toLowerCase() }] : []),
            { name: candidateName.trim() },
          ],
        },
      });

      if (existingApp) {
        targetAppId = existingApp.id;
      } else {
        const appCount = await prisma.jobApplication.count();
        let appIdCode = `APP-${9901 + appCount}`;
        let s = 0;
        while (await prisma.jobApplication.findUnique({ where: { applicationId: appIdCode } })) {
          s++;
          appIdCode = `APP-${9901 + appCount + s}`;
        }
        const createdApp = await prisma.jobApplication.create({
          data: {
            applicationId: appIdCode,
            name: candidateName.trim(),
            email: candidateEmail ? candidateEmail.trim().toLowerCase() : `${candidateName.toLowerCase().replace(/\s+/g, '.')}@talent.org`,
            role: role.trim(),
            department: 'Engineering & DevOps',
            location: 'Islamabad HQ / Hybrid',
            stage: 'INTERVIEW',
          },
        });
        targetAppId = createdApp.id;
      }
    }

    const count = await prisma.jobInterview.count();
    let interviewCode = `IV-${4011 + count}`;
    let suffix = 0;
    while (await prisma.jobInterview.findUnique({ where: { interviewCode } })) {
      suffix++;
      interviewCode = `IV-${4011 + count + suffix}`;
    }

    const newInterview = await prisma.jobInterview.create({
      data: {
        interviewCode,
        applicationId: targetAppId,
        jobOpeningId: jobOpeningId || null,
        candidateName: candidateName.trim(),
        candidateEmail: candidateEmail ? candidateEmail.trim().toLowerCase() : null,
        role: role.trim(),
        round: round.trim(),
        interviewer: interviewer.trim(),
        interviewerRole: interviewerRole ? interviewerRole.trim() : null,
        date: new Date(date),
        time: time.trim(),
        duration: duration.trim(),
        meetLink: meetLink ? meetLink.trim() : `https://meet.google.com/nexa-${interviewCode.toLowerCase()}`,
        status: 'SCHEDULED',
      },
      include: {
        application: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: `Interview scheduled with ${newInterview.candidateName}.`,
      data: { interview: newInterview },
    });
  } catch (error) {
    console.error('Error scheduling interview:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to schedule interview.',
      error: error.message,
    });
  }
};

/**
 * Update interview status or details
 */
const updateInterview = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, feedback, score, date, time, duration, meetLink, round, interviewer } = req.body;

    const existing = await prisma.jobInterview.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Interview not found.' });
    }

    const updated = await prisma.jobInterview.update({
      where: { id },
      data: {
        ...(status && { status: status.toUpperCase() }),
        ...(feedback !== undefined && { feedback: feedback ? feedback.trim() : null }),
        ...(score !== undefined && { score: Number(score) }),
        ...(date && { date: new Date(date) }),
        ...(time && { time: time.trim() }),
        ...(duration && { duration: duration.trim() }),
        ...(meetLink !== undefined && { meetLink: meetLink ? meetLink.trim() : null }),
        ...(round && { round: round.trim() }),
        ...(interviewer && { interviewer: interviewer.trim() }),
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Interview updated.',
      data: { interview: updated },
    });
  } catch (error) {
    console.error('Error updating interview:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update interview.',
      error: error.message,
    });
  }
};

/**
 * Delete interview
 */
const deleteInterview = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.jobInterview.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Interview not found.' });
    }

    await prisma.jobInterview.delete({ where: { id } });
    return res.status(200).json({
      success: true,
      message: 'Interview cancelled & removed.',
    });
  } catch (error) {
    console.error('Error deleting interview:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete interview.',
      error: error.message,
    });
  }
};

// =========================================================================
// 5. RECRUITMENT TAXONOMY / SETTINGS CONTROLLERS
// =========================================================================

/**
 * Get all taxonomy items (or filtered by type)
 */
const getTaxonomies = async (req, res) => {
  try {
    const { type } = req.query;

    const where = {};
    if (type && type !== 'ALL') {
      where.type = type.toUpperCase();
    }

    const items = await prisma.recruitmentTaxonomy.findMany({
      where,
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });

    // Parse extra JSON if present
    const formatted = items.map((item) => {
      let parsedExtra = {};
      if (item.extra) {
        try {
          parsedExtra = JSON.parse(item.extra);
        } catch {
          parsedExtra = {};
        }
      }
      return {
        ...item,
        ...parsedExtra,
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        items: formatted,
        total: formatted.length,
      },
    });
  } catch (error) {
    console.error('Error fetching taxonomies:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch recruitment settings.',
      error: error.message,
    });
  }
};

/**
 * Create a new taxonomy entry
 */
const createTaxonomy = async (req, res) => {
  try {
    const { type, name, code, description, active = true, ...extraFields } = req.body;

    if (!type || !name) {
      return res.status(400).json({
        success: false,
        message: 'Taxonomy Type and Name are mandatory.',
      });
    }

    const count = await prisma.recruitmentTaxonomy.count({ where: { type: type.toUpperCase() } });

    const newItem = await prisma.recruitmentTaxonomy.create({
      data: {
        type: type.toUpperCase(),
        name: name.trim(),
        code: code ? code.trim() : null,
        description: description ? description.trim() : null,
        extra: Object.keys(extraFields).length > 0 ? JSON.stringify(extraFields) : null,
        active: Boolean(active),
        order: count,
      },
    });

    let extraParsed = {};
    if (newItem.extra) {
      try {
        extraParsed = JSON.parse(newItem.extra);
      } catch {}
    }

    return res.status(201).json({
      success: true,
      message: `Registered "${newItem.name}" into recruitment configuration.`,
      data: {
        item: {
          ...newItem,
          ...extraParsed,
        },
      },
    });
  } catch (error) {
    console.error('Error creating taxonomy item:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create settings entry.',
      error: error.message,
    });
  }
};

/**
 * Update taxonomy item
 */
const updateTaxonomy = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, description, active, ...extraFields } = req.body;

    const existing = await prisma.recruitmentTaxonomy.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Entry not found.' });
    }

    let mergedExtra = {};
    if (existing.extra) {
      try {
        mergedExtra = JSON.parse(existing.extra);
      } catch {}
    }
    Object.assign(mergedExtra, extraFields);

    const updated = await prisma.recruitmentTaxonomy.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(code !== undefined && { code: code ? code.trim() : null }),
        ...(description !== undefined && { description: description ? description.trim() : null }),
        ...(active !== undefined && { active: Boolean(active) }),
        extra: Object.keys(mergedExtra).length > 0 ? JSON.stringify(mergedExtra) : null,
      },
    });

    return res.status(200).json({
      success: true,
      message: `Updated "${updated.name}".`,
      data: {
        item: {
          ...updated,
          ...mergedExtra,
        },
      },
    });
  } catch (error) {
    console.error('Error updating taxonomy:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update entry.',
      error: error.message,
    });
  }
};

/**
 * Toggle active status of a taxonomy item
 */
const toggleTaxonomyActive = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.recruitmentTaxonomy.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Entry not found.' });
    }

    const updated = await prisma.recruitmentTaxonomy.update({
      where: { id },
      data: { active: !existing.active },
    });

    let extraParsed = {};
    if (updated.extra) {
      try {
        extraParsed = JSON.parse(updated.extra);
      } catch {}
    }

    return res.status(200).json({
      success: true,
      message: `Entry ${updated.active ? 'activated' : 'deactivated'}.`,
      data: {
        item: {
          ...updated,
          ...extraParsed,
        },
      },
    });
  } catch (error) {
    console.error('Error toggling taxonomy:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to toggle entry status.',
      error: error.message,
    });
  }
};

/**
 * Delete a taxonomy item
 */
const deleteTaxonomy = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.recruitmentTaxonomy.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Entry not found.' });
    }

    await prisma.recruitmentTaxonomy.delete({ where: { id } });
    return res.status(200).json({
      success: true,
      message: `Removed "${existing.name}" from recruitment configuration.`,
    });
  } catch (error) {
    console.error('Error deleting taxonomy:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete entry.',
      error: error.message,
    });
  }
};

// =========================================================================
// 6. INITIAL RECRUITMENT SEEDING (FOR INSTANT RICH ENTERPRISE EXPERIENCE)
// =========================================================================

/**
 * Seed recruitment initial enterprise data if empty
 */
const seedRecruitmentData = async (req, res) => {
  try {
    const force = req.query.force === 'true';
    const jobCount = await prisma.jobOpening.count();

    if (jobCount > 0 && !force) {
      return res.status(200).json({
        success: true,
        message: 'Recruitment data already exists. Use ?force=true to re-seed.',
      });
    }

    if (force) {
      await prisma.jobInterview.deleteMany();
      await prisma.jobApplication.deleteMany();
      await prisma.jobOpening.deleteMany();
      await prisma.recruitmentTaxonomy.deleteMany();
    }

    // 1. Seed Taxonomies (5 Categories)
    const initialTaxonomies = [
      // Categories
      { type: 'CATEGORY', name: 'Software Engineering', description: 'Frontend, backend, mobile, architecture, and devops requisitions.', extra: { openPositions: 8 } },
      { type: 'CATEGORY', name: 'Product & Design', description: 'UI/UX design systems, user research, product management.', extra: { openPositions: 4 } },
      { type: 'CATEGORY', name: 'People Operations & HR', description: 'Talent acquisition, employee experience, compensation, and culture.', extra: { openPositions: 2 } },
      { type: 'CATEGORY', name: 'Finance & Accounts', description: 'Corporate auditing, financial telemetry, controller, and payroll management.', extra: { openPositions: 2 } },
      // Types
      { type: 'TYPE', name: 'Full-Time Regular', description: 'Standard corporate FTE with comprehensive healthcare and 401(k) benefits.', extra: { hoursPerWeek: '40 hrs/wk', type: 'FTE' } },
      { type: 'TYPE', name: 'Contract / Independent', description: 'Project-based direct engagement or advisory consultancy.', extra: { hoursPerWeek: 'Flexible / Statement of Work', type: 'Contract' } },
      { type: 'TYPE', name: 'Remote / Distributed', description: 'Fully asynchronous telecommuting position across global timezones.', extra: { hoursPerWeek: '40 hrs/wk (Async)', type: 'Remote' } },
      // Locations
      { type: 'LOCATION', name: 'Islamabad HQ & Innovation Lab', description: 'Main campus, engineering center of excellence, biometric security.', extra: { city: 'Islamabad', country: 'Pakistan', capacity: '250 seats', timezone: 'UTC+5' } },
      { type: 'LOCATION', name: 'Karachi Regional Hub', description: 'Commercial business operations and corporate financial division.', extra: { city: 'Karachi', country: 'Pakistan', capacity: '120 seats', timezone: 'UTC+5' } },
      { type: 'LOCATION', name: 'Remote & Distributed Worldwide', description: 'Global async talent pool spanning Americas, EMEA, and APAC.', extra: { city: 'Global', country: 'Worldwide', capacity: 'Unlimited', timezone: 'Flexible' } },
      // Skills
      { type: 'SKILL', name: 'React.js & Tailwind CSS', description: 'Modern client architectures, server components, and responsive design systems.', extra: { category: 'Frontend', proficiency: 'Advanced', weight: 'Mandatory' } },
      { type: 'SKILL', name: 'Node.js & Express Architecture', description: 'REST APIs, middleware security, auth tokens, and concurrency.', extra: { category: 'Backend', proficiency: 'Advanced', weight: 'Mandatory' } },
      { type: 'SKILL', name: 'PostgreSQL & Prisma Relational Modeling', description: 'ACID transactions, indexed querying, pooling, and schema migrations.', extra: { category: 'Database', proficiency: 'Intermediate', weight: 'Preferred' } },
      { type: 'SKILL', name: 'Docker & Kubernetes Microservices', description: 'Containerized deployments, healthchecks, and CI/CD pipelines.', extra: { category: 'DevOps', proficiency: 'Intermediate', weight: 'Preferred' } },
      // Experiences
      { type: 'EXPERIENCE', name: 'Senior Staff / Lead (5+ Years)', description: 'Proven track record of designing large-scale fault-tolerant platforms.', extra: { range: '5 to 8 Years', minYears: 5, tier: 'Senior' } },
      { type: 'EXPERIENCE', name: 'Mid-Level Specialist (3-5 Years)', description: 'Autonomous execution of product features and quality unit tests.', extra: { range: '3 to 5 Years', minYears: 3, tier: 'Mid' } },
      { type: 'EXPERIENCE', name: 'Executive Leadership (8+ Years)', description: 'Departmental leadership, strategic hiring plans, and cross-functional mentorship.', extra: { range: '8+ Years', minYears: 8, tier: 'Executive' } },
    ];

    for (const tax of initialTaxonomies) {
      await prisma.recruitmentTaxonomy.create({
        data: {
          type: tax.type,
          name: tax.name,
          description: tax.description,
          extra: JSON.stringify(tax.extra),
          active: true,
        },
      });
    }

    // 2. Seed Job Openings
    const job1 = await prisma.jobOpening.create({
      data: {
        jobCode: 'JOB-101',
        title: 'Senior Full Stack Engineer (React/Node)',
        department: 'Engineering & DevOps',
        location: 'Islamabad HQ / Hybrid',
        type: 'Full Time',
        experience: '5+ Years',
        salary: 'PKR 130,000 - PKR 160,000',
        status: 'ACTIVE',
        description: 'Lead next-generation distributed HRM and payroll telemetry platforms across multi-region deployments.',
        requirements: 'Expert in React 19, Node.js, PostgreSQL, Prisma, Docker, and enterprise API security architectures.',
        skills: ['React', 'Node.js', 'PostgreSQL', 'Docker', 'AWS'],
        urgent: true,
        postedDate: new Date('2026-10-12'),
      },
    });

    const job2 = await prisma.jobOpening.create({
      data: {
        jobCode: 'JOB-102',
        title: 'Lead Product Designer (UI/UX Systems)',
        department: 'Product & Design',
        location: 'Karachi Regional Hub',
        type: 'Full Time',
        experience: '4+ Years',
        salary: 'PKR 110,000 - PKR 135,000',
        status: 'ACTIVE',
        description: 'Spearhead our core enterprise design system with refined luxury glassmorphism, micro-interactions, and accessibility standards.',
        requirements: 'Mastery in Figma tokens, design systems, interactive prototypes, user journey telemetry, and developer handoffs.',
        skills: ['Figma', 'Design Systems', 'Micro-Interactions', 'User Testing'],
        urgent: false,
        postedDate: new Date('2026-10-14'),
      },
    });

    const job3 = await prisma.jobOpening.create({
      data: {
        jobCode: 'JOB-103',
        title: 'Cloud DevOps & Site Reliability Architect',
        department: 'Engineering & DevOps',
        location: 'Remote & Distributed',
        type: 'Remote',
        experience: '5+ Years',
        salary: 'PKR 140,000 - PKR 175,000',
        status: 'ACTIVE',
        description: 'Orchestrate zero-downtime CI/CD delivery pipelines, Kubernetes clusters, DDoS telemetry, and infrastructure-as-code.',
        requirements: 'Deep knowledge of AWS, Terraform, Docker, Kubernetes, Prometheus monitoring, and database clustering.',
        skills: ['Terraform', 'Kubernetes', 'AWS', 'CI/CD', 'Prometheus'],
        urgent: true,
        postedDate: new Date('2026-10-15'),
      },
    });

    const job4 = await prisma.jobOpening.create({
      data: {
        jobCode: 'JOB-104',
        title: 'Senior Talent Acquisition & People Ops Specialist',
        department: 'People Operations & HR',
        location: 'Islamabad HQ / Hybrid',
        type: 'Full Time',
        experience: '3+ Years',
        salary: 'PKR 80,000 - PKR 95,000',
        status: 'ACTIVE',
        description: 'Scale our engineering and corporate departments through active headhunting, ATS workflow automation, and candidate engagement.',
        requirements: 'Demonstrated experience in technical headhunting, pipeline velocity tracking, structured interviewing, and employer branding.',
        skills: ['ATS Pipeline', 'Technical Sourcing', 'Employer Brand', 'Onboarding'],
        urgent: false,
        postedDate: new Date('2026-10-16'),
      },
    });

    const job5 = await prisma.jobOpening.create({
      data: {
        jobCode: 'JOB-105',
        title: 'Enterprise Financial Controller & Tax Auditor',
        department: 'Finance & Accounts',
        location: 'Karachi Regional Hub',
        type: 'Full Time',
        experience: '6+ Years',
        salary: 'PKR 115,000 - PKR 145,000',
        status: 'PAUSED',
        description: 'Direct multi-entity accounting audits, corporate ledger reconciliation, tax structuring, and executive financial reporting.',
        requirements: 'Chartered Accountant (CA/CPA), extensive experience with payroll telemetry, statutory compliance, and corporate governance.',
        skills: ['Financial Auditing', 'Tax Compliance', 'Ledger', 'Payroll Accounting'],
        urgent: false,
        postedDate: new Date('2026-10-10'),
      },
    });

    // 3. Seed Candidates / Applications across pipeline stages
    const app1 = await prisma.jobApplication.create({
      data: {
        applicationId: 'APP-9901',
        jobOpeningId: job1.id,
        name: 'David K. Vance',
        email: 'david.vance@techlead.io',
        phone: '+92 300 1234567',
        role: 'Senior Full Stack Engineer (React/Node)',
        department: 'Engineering & DevOps',
        location: 'Islamabad HQ / Hybrid',
        experience: '6.5 Years',
        rating: 4.9,
        stage: 'INTERVIEW',
        resumeSummary: 'Expert in full-stack JavaScript architectures, PostgreSQL, microservices, and React performance optimization.',
        notes: 'Outstanding technical assessment. Recommended for final technical architecture presentation.',
        tags: ['Top Candidate', 'System Design'],
        appliedDate: new Date('2026-10-15'),
      },
    });

    const app2 = await prisma.jobApplication.create({
      data: {
        applicationId: 'APP-9902',
        jobOpeningId: job2.id,
        name: 'Ayesha Tariq',
        email: 'ayesha.tariq@designcraft.com',
        phone: '+92 321 9876543',
        role: 'Lead Product Designer (UI/UX Systems)',
        department: 'Product & Design',
        location: 'Karachi Regional Hub',
        experience: '5.0 Years',
        rating: 4.8,
        stage: 'OFFER',
        resumeSummary: 'Proven track record designing enterprise SaaS platforms, design systems, and conducting customer research.',
        notes: 'Offer letter prepared at upper salary band (PKR 130,000). Pending candidate signature.',
        tags: ['Design System', 'Figma Pro'],
        appliedDate: new Date('2026-10-14'),
      },
    });

    const app3 = await prisma.jobApplication.create({
      data: {
        applicationId: 'APP-9903',
        jobOpeningId: job3.id,
        name: 'Michael Zhang',
        email: 'michael.zhang@cloudops.net',
        phone: '+1 415 889 2031',
        role: 'Cloud DevOps & Site Reliability Architect',
        department: 'Engineering & DevOps',
        location: 'Remote & Distributed',
        experience: '8.0 Years',
        rating: 4.7,
        stage: 'SCREENING',
        resumeSummary: 'CI/CD pipeline automation, Terraform infrastructure-as-code, AWS/GCP high availability clusters.',
        notes: 'Initial phone screen passed with HR. Scheduled for technical interview.',
        tags: ['DevOps', 'AWS Certified'],
        appliedDate: new Date('2026-10-18'),
      },
    });

    const app4 = await prisma.jobApplication.create({
      data: {
        applicationId: 'APP-9904',
        jobOpeningId: job4.id,
        name: 'Fatima Noor',
        email: 'fatima.noor@hrnetwork.org',
        phone: '+92 333 4567890',
        role: 'Senior Talent Acquisition & People Ops Specialist',
        department: 'People Operations & HR',
        location: 'Islamabad HQ / Hybrid',
        experience: '4.5 Years',
        rating: 4.6,
        stage: 'APPLIED',
        resumeSummary: 'Technical recruiting specialist with deep expertise in sourcing high-impact senior engineering talent.',
        notes: 'Resume submitted via career portal. Awaiting hiring manager review.',
        tags: ['Recruiter', 'Direct Source'],
        appliedDate: new Date('2026-10-19'),
      },
    });

    const app5 = await prisma.jobApplication.create({
      data: {
        applicationId: 'APP-9905',
        jobOpeningId: job1.id,
        name: 'Tariq Mahmood',
        email: 'tariq.mahmood@devstack.pk',
        phone: '+92 301 7766554',
        role: 'Senior Full Stack Engineer (React/Node)',
        department: 'Engineering & DevOps',
        location: 'Islamabad HQ / Hybrid',
        experience: '7.0 Years',
        rating: 5.0,
        stage: 'HIRED',
        resumeSummary: 'Seasoned engineer with strong background in FinTech, payment gateways, and high-concurrency systems.',
        notes: 'Offer signed and accepted. Joining date set for first Monday of upcoming month.',
        tags: ['Hired', 'FinTech'],
        appliedDate: new Date('2026-10-01'),
      },
    });

    // 4. Seed Interviews
    await prisma.jobInterview.create({
      data: {
        interviewCode: 'IV-4011',
        applicationId: app1.id,
        jobOpeningId: job1.id,
        candidateName: app1.name,
        candidateEmail: app1.email,
        role: app1.role,
        round: 'Technical Architecture & Code Review',
        interviewer: 'Dr. Sarah Jenkins',
        interviewerRole: 'Chief Architect',
        date: new Date('2026-10-24'),
        time: '10:30 AM',
        duration: '45 mins',
        meetLink: 'https://meet.google.com/nexa-iv-9901',
        status: 'SCHEDULED',
      },
    });

    await prisma.jobInterview.create({
      data: {
        interviewCode: 'IV-4012',
        applicationId: app3.id,
        jobOpeningId: job3.id,
        candidateName: app3.name,
        candidateEmail: app3.email,
        role: app3.role,
        round: 'Infrastructure Deep-Dive & Live Troubleshooting',
        interviewer: 'Alexandre Dubois',
        interviewerRole: 'Lead Cloud Architect',
        date: new Date('2026-10-25'),
        time: '02:00 PM',
        duration: '60 mins',
        meetLink: 'https://meet.google.com/nexa-iv-9903',
        status: 'SCHEDULED',
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Recruitment enterprise database successfully initialized with jobs, candidates, interviews, and taxonomies!',
    });
  } catch (error) {
    console.error('Error seeding recruitment data:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to seed recruitment data.',
      error: error.message,
    });
  }
};

/**
 * Wipe / Delete all recruitment data (interviews, applications, openings, taxonomies)
 */
const clearAllRecruitmentData = async (req, res) => {
  try {
    const [ivs, apps, jobs, tax] = await Promise.all([
      prisma.jobInterview.deleteMany({}),
      prisma.jobApplication.deleteMany({}),
      prisma.jobOpening.deleteMany({}),
      prisma.recruitmentTaxonomy.deleteMany({}),
    ]);

    return res.status(200).json({
      success: true,
      message: 'All recruitment data deleted successfully.',
      deleted: {
        interviews: ivs.count,
        applications: apps.count,
        openings: jobs.count,
        taxonomies: tax.count,
      },
    });
  } catch (error) {
    console.error('Error clearing recruitment data:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to clear recruitment data.',
      error: error.message,
    });
  }
};

// =========================================================================
// 8. AI-POWERED ATS GMAIL AUTO-SCREENING CONTROLLERS
// =========================================================================

/**
 * Manually trigger a Gmail fetch and AI ATS screening batch
 */
let isSyncInProgress = false;

const syncGmailScreening = async (req, res) => {
  try {
    if (!isGmailConfigured()) {
      return res.status(400).json({
        success: false,
        message: 'Gmail credentials not configured. Please set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GMAIL_REFRESH_TOKEN.',
      });
    }

    if (isSyncInProgress) {
      return res.status(200).json({
        success: true,
        message: 'Sync is already running in background.',
        data: {
          status: { ...getSyncStatus(), isSyncing: true },
        },
      });
    }

    isSyncInProgress = true;
    console.log('[AI ATS CONTROLLER] Non-blocking Gmail sync initiated by user:', req.user?.email || req.user?.id);

    // Non-blocking background worker
    setImmediate(async () => {
      try {
        const emails = await fetchApplicationEmails({ maxResults: 15 });
        if (emails.length > 0) {
          const batchSummary = await processEmailBatch(emails);
          if (batchSummary && batchSummary.processed > 0) {
            console.log(`[AI ATS CONTROLLER] Background sync processed ${batchSummary.processed} candidates. Invalidating caches.`);
            cacheService.invalidateTags(['recruitment', 'recruitment-apps', 'recruitment-stats', 'dashboard']);
          }
        }
      } catch (bgErr) {
        console.error('[AI ATS CONTROLLER BG ERROR] Background Gmail sync error:', bgErr.message);
      } finally {
        isSyncInProgress = false;
      }
    });

    // Return 202 Accepted immediately so the frontend skeleton or button does not hang
    return res.status(202).json({
      success: true,
      message: 'Gmail ATS background sync started successfully.',
      data: {
        status: { ...getSyncStatus(), isSyncing: true },
      },
    });
  } catch (error) {
    console.error('[AI ATS CONTROLLER] Error during manual Gmail sync:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to complete Gmail ATS sync.',
      error: error.message,
    });
  }
};

/**
 * Get AI screening telemetry status (last sync time, counts, pass threshold)
 */
const getAiScreeningStatus = async (req, res) => {
  try {
    const status = getSyncStatus();
    return res.status(200).json({
      success: true,
      data: status,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch AI screening status.',
      error: error.message,
    });
  }
};

/**
 * List all low-score, unmatched, or error applications stored for audit & manual review
 */
const getScreenedOutApplications = async (req, res) => {
  try {
    const applications = await prisma.jobApplication.findMany({
      where: {
        aiStatus: { in: ['SCREENED_OUT', 'UNMATCHED', 'ERROR'] },
      },
      select: {
        id: true,
        applicationId: true,
        jobOpeningId: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        department: true,
        location: true,
        stage: true,
        status: true,
        source: true,
        aiScore: true,
        aiStatus: true,
        aiSummary: true,
        createdAt: true,
        jobOpening: {
          select: { id: true, title: true, jobCode: true, department: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({
      success: true,
      data: {
        applications,
        total: applications.length,
      },
    });
  } catch (error) {
    console.error('[AI ATS CONTROLLER] Error fetching screened-out applications:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch screened-out applications.',
      error: error.message,
    });
  }
};

/**
 * HR manual override: Promotes a screened-out/unmatched/error candidate into the APPLIED stage
 */
const aiOverrideApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await atsOverrideApplication(id, req.user);

    return res.status(200).json({
      success: true,
      message: `Candidate ${updated.name} successfully promoted to Sourced & Applied stage.`,
      data: { application: updated },
    });
  } catch (error) {
    console.error('[AI ATS CONTROLLER] Error overriding application:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to override application.',
      error: error.message,
    });
  }
};

/**
 * Re-scan candidate CV with AI
 */
const aiRescanApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await atsRescanApplication(id);

    return res.status(200).json({
      success: true,
      message: `Candidate ${updated.name} successfully rescanned with AI.`,
      data: { application: updated },
    });
  } catch (error) {
    console.error('[AI ATS CONTROLLER] Error rescanning application:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to rescan application.',
      error: error.message,
    });
  }
};

module.exports = {
  getRecruitmentStats,
  // Jobs
  getJobOpenings,
  getJobOpeningById,
  createJobOpening,
  updateJobOpening,
  toggleJobStatus,
  deleteJobOpening,
  // Applications
  getApplications,
  getApplicationById,
  getApplicationResume,
  createApplication,
  updateApplication,
  updateApplicationStage,
  deleteApplication,
  // AI ATS Screening
  syncGmailScreening,
  getAiScreeningStatus,
  getScreenedOutApplications,
  aiOverrideApplication,
  aiRescanApplication,
  // Interviews
  getInterviews,
  createInterview,
  updateInterview,
  deleteInterview,
  // Taxonomies
  getTaxonomies,
  createTaxonomy,
  updateTaxonomy,
  toggleTaxonomyActive,
  deleteTaxonomy,
  // Seeding & Wiping
  seedRecruitmentData,
  clearAllRecruitmentData,
};
