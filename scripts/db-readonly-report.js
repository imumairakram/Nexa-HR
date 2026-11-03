require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runReport() {
  console.log('=== READ-ONLY DATABASE AUDIT REPORT ===');
  console.log('Target DATABASE_URL host:', process.env.DATABASE_URL ? process.env.DATABASE_URL.split('@')[1] : 'NOT SET');

  // 1. Audit Users
  const users = await prisma.user.findMany({
    select: {
      id: true,
      employeeCode: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
      isDemo: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  console.log(`\n--- ALL USERS IN DATABASE (Total: ${users.length}) ---`);
  for (const u of users) {
    console.log(`ID: ${u.id} | Code: ${u.employeeCode} | Email: ${u.email} | Name: ${u.firstName} ${u.lastName} | Role: ${u.role} | Active: ${u.isActive} | isDemo: ${u.isDemo} | Created: ${u.createdAt.toISOString()}`);
  }

  // Suspicious/test users
  const testUsers = users.filter((u) => {
    const e = u.email.toLowerCase();
    return e.includes('testcorp') || e.includes('example.com') || e.includes('ghost') || e.includes('cooldown') || e.includes('test') || u.employeeCode.startsWith('TEST-') || u.isDemo;
  });
  console.log(`\n--- SUSPICIOUS / TEST USERS (${testUsers.length}) ---`);
  for (const u of testUsers) {
    console.log(`  -> ${u.id} | ${u.employeeCode} | ${u.email} | ${u.firstName} ${u.lastName}`);
  }

  // 2. Audit Job Applications
  const applications = await prisma.jobApplication.findMany({
    select: {
      id: true,
      applicationId: true,
      name: true,
      email: true,
      role: true,
      stage: true,
      status: true,
      source: true,
      gmailMessageId: true,
      aiStatus: true,
      aiScore: true,
      createdAt: true,
      notes: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  console.log(`\n--- ALL JOB APPLICATIONS IN DATABASE (Total: ${applications.length}) ---`);
  for (const a of applications) {
    console.log(`ID: ${a.id} | AppID: ${a.applicationId} | Name: "${a.name}" | Email: ${a.email} | Role: "${a.role}" | Stage: ${a.stage} | AI Status: ${a.aiStatus} (Score: ${a.aiScore}) | Source: ${a.source} | MsgID: ${a.gmailMessageId} | Created: ${a.createdAt.toISOString()}`);
  }

  // Suspicious/bounce/test applications
  const testOrBounceApps = applications.filter((a) => {
    const e = a.email.toLowerCase();
    const n = a.name.toLowerCase();
    const r = (a.role || '').toLowerCase();
    return (
      e.includes('mailer-daemon') ||
      e.includes('postmaster') ||
      e.includes('testcorp') ||
      e.includes('example.com') ||
      e.includes('test') ||
      e.includes('noreply') ||
      e.includes('no-reply') ||
      e.includes('googlemail.com') ||
      n.includes('mail delivery') ||
      n.includes('mailer-daemon') ||
      n.includes('postmaster') ||
      n.includes('subsystem') ||
      n.includes('test') ||
      r.includes('delivery status') ||
      r.includes('undeliverable') ||
      r.includes('failed') ||
      a.source === 'GMAIL'
    );
  });

  console.log(`\n--- SUSPICIOUS / TEST / BOUNCE JOB APPLICATIONS (${testOrBounceApps.length}) ---`);
  for (const a of testOrBounceApps) {
    console.log(`  -> ID: ${a.id} | AppID: ${a.applicationId} | Name: "${a.name}" | Email: ${a.email} | Role: "${a.role}" | Stage: ${a.stage} | AI Status: ${a.aiStatus} | MsgID: ${a.gmailMessageId} | Created: ${a.createdAt.toISOString()}`);
  }

  // 3. Password Reset Tokens & OTPs
  const resetTokens = await prisma.passwordResetToken.findMany({
    include: { user: { select: { email: true, employeeCode: true } } },
    orderBy: { createdAt: 'desc' },
  });
  console.log(`\n--- PASSWORD RESET TOKENS (Total: ${resetTokens.length}) ---`);
  for (const t of resetTokens) {
    console.log(`ID: ${t.id} | User: ${t.user?.email} (${t.user?.employeeCode}) | Used: ${t.used} | Expires: ${t.expiresAt.toISOString()} | Created: ${t.createdAt.toISOString()}`);
  }

  const resetOtps = await prisma.passwordResetOtp.findMany({
    include: { user: { select: { email: true, employeeCode: true } } },
    orderBy: { createdAt: 'desc' },
  });
  console.log(`\n--- PASSWORD RESET OTPS (Total: ${resetOtps.length}) ---`);
  for (const o of resetOtps) {
    console.log(`ID: ${o.id} | User: ${o.user?.email} (${o.user?.employeeCode}) | Channel: ${o.channel} | Verified: ${o.verified} | Attempts: ${o.attempts} | Expires: ${o.expiresAt.toISOString()} | Created: ${o.createdAt.toISOString()}`);
  }

  // 4. Job Interviews
  const interviews = await prisma.jobInterview.findMany({
    orderBy: { createdAt: 'desc' },
  });
  console.log(`\n--- ALL JOB INTERVIEWS (Total: ${interviews.length}) ---`);
  for (const iv of interviews) {
    console.log(`ID: ${iv.id} | Candidate: "${iv.candidateName}" | Email: ${iv.candidateEmail} | AppId: ${iv.applicationId} | Status: ${iv.status} | Created: ${iv.createdAt.toISOString()}`);
  }

  await prisma.$disconnect();
}

runReport().catch((err) => {
  console.error('Error running report:', err);
  process.exit(1);
});

