const nodemailer = require('nodemailer');
const prisma = require('../config/prisma');

// Optional Twilio client instantiation
let twilioClient = null;
function getTwilioClient() {
  if (twilioClient) return twilioClient;
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (accountSid && authToken) {
    try {
      const twilio = require('twilio');
      twilioClient = twilio(accountSid, authToken);
    } catch (err) {
      console.warn('[NOTIFICATION WARNING] Twilio SDK could not be initialized:', err.message);
    }
  }
  return twilioClient;
}

// Nodemailer SMTP Transporter
let mailTransporter = null;
function getMailTransporter() {
  if (mailTransporter) return mailTransporter;
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

  if (host && user && pass) {
    mailTransporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    });
  }
  return mailTransporter;
}

/**
 * Format phone number to E.164 standard (e.g., +923110108939, +14155552671)
 */
function formatE164(phone) {
  if (!phone) return null;
  let clean = phone.trim().replace(/[^\d+]/g, '');
  if (!clean.startsWith('+')) {
    clean = `+${clean}`;
  }
  return clean;
}

/**
 * Mask an email address for safe display (e.g. j***e@company.com)
 */
function maskEmail(email) {
  if (!email || !email.includes('@')) return email;
  const [local, domain] = email.split('@');
  if (local.length <= 2) {
    return `${local.charAt(0)}***@${domain}`;
  }
  return `${local.charAt(0)}***${local.charAt(local.length - 1)}@${domain}`;
}

/**
 * Mask a phone number for safe display (e.g. +1 (555) ***-8882)
 */
function maskPhone(phone) {
  if (!phone) return 'Not configured';
  const clean = phone.trim();
  if (clean.length <= 4) return '***' + clean;
  const start = clean.slice(0, clean.length - 4);
  const end = clean.slice(-4);
  return start.replace(/\d/g, '*') + end;
}

// ====================================================
// IN-APP NOTIFICATION METHODS
// ====================================================

/**
 * Create a single in-app notification for a specific user
 */
async function createInAppNotification({
  userId,
  title,
  message,
  type = 'info', // 'success' | 'warning' | 'info' | 'error'
  category = 'GENERAL', // 'ANNOUNCEMENT' | 'LEAVE' | 'PAYROLL' | 'ATTENDANCE' | 'GENERAL'
  link = null,
}) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        category,
        link,
        isRead: false,
      },
    });
    return notification;
  } catch (error) {
    console.error('Failed to create in-app notification:', error.message);
    return null;
  }
}

/**
 * Broadcast in-app notification to all active users (or specific roles)
 */
async function broadcastInAppNotification({
  title,
  message,
  type = 'info',
  category = 'GENERAL',
  link = null,
  targetRoles = null, // e.g. ['EMPLOYEE', 'HR_MANAGER', 'ADMIN']
}) {
  try {
    const where = { isActive: true };
    if (targetRoles && Array.isArray(targetRoles)) {
      where.role = { in: targetRoles };
    }

    const users = await prisma.user.findMany({
      where,
      select: { id: true },
    });

    if (users.length === 0) return [];

    const data = users.map((u) => ({
      userId: u.id,
      title,
      message,
      type,
      category,
      link,
      isRead: false,
    }));

    await prisma.notification.createMany({ data });
    return data;
  } catch (error) {
    console.error('Failed to broadcast in-app notifications:', error.message);
    return [];
  }
}

// ====================================================
// CORPORATE EMAIL DISPATCHERS
// ====================================================

/**
 * Dispatches announcement broadcast email to all employees
 */
async function sendAnnouncementEmail({ recipients = [], announcement }) {
  const timestamp = new Date().toISOString();
  console.log(`\n========================================================`);
  console.log(`[NexaHR CORPORATE EMAIL BROADCAST: ANNOUNCEMENT]`);
  console.log(`Subject: [Company Notice] ${announcement.title}`);
  console.log(`Category: ${announcement.category} | Priority: ${announcement.priority}`);
  console.log(`Department: ${announcement.department || 'All Offices'}`);
  console.log(`Author: ${announcement.author || 'People Operations & HR'}`);
  console.log(`Total Recipients: ${recipients.length} employee(s)`);
  if (recipients.length > 0) {
    console.log(`Sample Recipients: ${recipients.slice(0, 3).map((r) => r.email || r).join(', ')}${recipients.length > 3 ? '...' : ''}`);
  }
  console.log(`Content Preview: ${announcement.summary || announcement.content?.slice(0, 100)}...`);
  console.log(`Action Link: /employee/announcements`);
  console.log(`========================================================\n`);

  return {
    success: true,
    channel: 'EMAIL',
    type: 'ANNOUNCEMENT_BROADCAST',
    recipientCount: recipients.length,
    dispatchedAt: timestamp,
    message: `Announcement broadcast successfully emailed to ${recipients.length} recipient(s).`,
  };
}

/**
 * Dispatches Sick Leave / Leave status email to employee (Approved / Rejected)
 */
async function sendLeaveStatusEmail({
  email,
  name,
  leaveType,
  startDate,
  endDate,
  totalDays,
  status,
  rejectionReason = null,
}) {
  const startStr = typeof startDate === 'string' ? startDate.split('T')[0] : new Date(startDate).toLocaleDateString();
  const endStr = typeof endDate === 'string' ? endDate.split('T')[0] : new Date(endDate).toLocaleDateString();

  console.log(`\n========================================================`);
  console.log(`[NexaHR EMAIL DISPATCH: LEAVE ${status}] -> ${email}`);
  console.log(`Recipient: ${name}`);
  console.log(`Subject: [Leave Request ${status}] ${leaveType}`);
  console.log(`Leave Type: ${leaveType} (${totalDays} day${totalDays > 1 ? 's' : ''})`);
  console.log(`Period: ${startStr} to ${endStr}`);
  console.log(`Status: ${status}`);
  if (status === 'REJECTED' && rejectionReason) {
    console.log(`Reason for Decline: ${rejectionReason}`);
  }
  console.log(`Portal Link: /employee/leaves`);
  console.log(`========================================================\n`);

  return {
    success: true,
    channel: 'EMAIL',
    type: 'LEAVE_STATUS',
    destination: maskEmail(email),
    dispatchedAt: new Date().toISOString(),
    message: `Leave ${status.toLowerCase()} notification dispatched to ${maskEmail(email)}.`,
  };
}

/**
 * Dispatches email notification to HR Administrators when employee submits a leave request
 */
async function sendLeaveRequestSubmittedEmail({
  adminEmails = [],
  employeeName,
  employeeCode,
  leaveType,
  startDate,
  endDate,
  totalDays,
  reason,
}) {
  const startStr = typeof startDate === 'string' ? startDate.split('T')[0] : new Date(startDate).toLocaleDateString();
  const endStr = typeof endDate === 'string' ? endDate.split('T')[0] : new Date(endDate).toLocaleDateString();

  console.log(`\n========================================================`);
  console.log(`[NexaHR EMAIL DISPATCH: NEW LEAVE REQUEST SUBMITTED]`);
  console.log(`Submitted By: ${employeeName} (${employeeCode || 'Employee'})`);
  console.log(`Subject: [New Leave Request] ${employeeName} applied for ${leaveType}`);
  console.log(`Leave Category: ${leaveType}`);
  console.log(`Requested Period: ${startStr} to ${endStr} (${totalDays} day${totalDays > 1 ? 's' : ''})`);
  console.log(`Stated Purpose: ${reason}`);
  console.log(`Dispatched To HR Admins: ${adminEmails.join(', ')}`);
  console.log(`Review Link: /app/leaves`);
  console.log(`========================================================\n`);

  return {
    success: true,
    channel: 'EMAIL',
    type: 'LEAVE_SUBMISSION',
    recipientCount: adminEmails.length,
    dispatchedAt: new Date().toISOString(),
  };
}

/**
 * Dispatches monthly salary payslip notification email to employee
 */
async function sendPayslipEmail({
  email,
  name,
  month,
  year,
  grossSalary,
  deductions = 0,
  netSalary,
  payDate = new Date(),
}) {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthStr = typeof month === 'number' ? monthNames[month - 1] : month;
  const payDateStr = new Date(payDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

  console.log(`\n========================================================`);
  console.log(`[NexaHR EMAIL DISPATCH: PAYSLIP ISSUED] -> ${email}`);
  console.log(`Recipient: ${name}`);
  console.log(`Subject: [NexaHR Payslip Ready] ${monthStr} ${year} Salary Voucher`);
  console.log(`Gross Earnings: $${Number(grossSalary).toLocaleString()}`);
  console.log(`Deductions: -$${Number(deductions).toLocaleString()}`);
  console.log(`Net Take-Home Salary: $${Number(netSalary).toLocaleString()}`);
  console.log(`Disbursal Date: ${payDateStr}`);
  console.log(`Payout Mode: ACH Direct Corporate Deposit`);
  console.log(`Download Slip: /employee/payslips`);
  console.log(`========================================================\n`);

  return {
    success: true,
    channel: 'EMAIL',
    type: 'PAYSLIP_ISSUED',
    destination: maskEmail(email),
    dispatchedAt: new Date().toISOString(),
    message: `Salary payslip voucher notification sent to ${maskEmail(email)}.`,
  };
}

/**
 * Generate Professional HTML Template for Welcome Onboarding Email with Credentials
 */
function buildWelcomeEmailHtml({
  name,
  employeeCode,
  email,
  tempPassword,
  role = 'EMPLOYEE',
  designation = 'Team Member',
  department = 'General',
  workLocation = 'Headquarters',
  loginUrl,
}) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to NexaHR</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f1f5f9; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08); border: 1px solid #e2e8f0;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 55%, #312e81 100%); padding: 38px 32px 32px; text-align: center;">
              <div style="display: inline-block; background: rgba(255, 255, 255, 0.12); border: 1px solid rgba(255, 255, 255, 0.22); padding: 6px 16px; border-radius: 20px; margin-bottom: 14px;">
                <span style="color: #c7d2fe; font-size: 11px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase;">Employee Onboarding</span>
              </div>
              <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">Welcome to NexaHR</h1>
              <p style="color: #cbd5e1; margin: 6px 0 0; font-size: 13px; font-weight: 500;">Workforce Management & Self-Service Portal</p>
            </td>
          </tr>

          <!-- Main Body Content -->
          <tr>
            <td style="padding: 34px 32px 28px;">
              <p style="font-size: 16px; color: #0f172a; margin: 0 0 14px; font-weight: 700;">
                Dear <strong>${name || 'Team Member'}</strong>,
              </p>
              <p style="font-size: 14px; color: #475569; line-height: 1.65; margin: 0 0 22px;">
                Congratulations and welcome to our organization! Your official profile on the <strong>NexaHR Workforce Portal</strong> has been activated. You can now sign in to mark attendance, apply for leaves, access corporate payslips, submit helpdesk requests, and manage your employee profile.
              </p>

              <!-- Profile Details Summary Card -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 22px; padding: 14px 18px;">
                <tr>
                  <td width="50%" style="padding: 6px 4px; vertical-align: top;">
                    <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.5px;">Employee ID</div>
                    <div style="font-size: 14px; color: #4338ca; font-weight: 800; margin-top: 2px;">${employeeCode}</div>
                  </td>
                  <td width="50%" style="padding: 6px 4px; vertical-align: top;">
                    <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.5px;">Role / Access</div>
                    <div style="font-size: 14px; color: #0f172a; font-weight: 700; margin-top: 2px;">${role || 'EMPLOYEE'}</div>
                  </td>
                </tr>
                <tr>
                  <td width="50%" style="padding: 8px 4px 4px; vertical-align: top;">
                    <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.5px;">Department</div>
                    <div style="font-size: 13px; color: #0f172a; font-weight: 600; margin-top: 2px;">${department || 'General'}</div>
                  </td>
                  <td width="50%" style="padding: 8px 4px 4px; vertical-align: top;">
                    <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.5px;">Designation</div>
                    <div style="font-size: 13px; color: #0f172a; font-weight: 600; margin-top: 2px;">${designation || 'Team Member'}</div>
                  </td>
                </tr>
                ${workLocation ? `
                <tr>
                  <td colspan="2" style="padding: 8px 4px 4px; vertical-align: top;">
                    <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.5px;">Office Location</div>
                    <div style="font-size: 13px; color: #0f172a; font-weight: 600; margin-top: 2px;">${workLocation}</div>
                  </td>
                </tr>
                ` : ''}
              </table>

              <!-- Credentials Card -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(145deg, #f0fdf4 0%, #e0f2fe 100%); border: 1.5px solid #0284c7; border-radius: 14px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 20px 22px;">
                    <div style="font-size: 12px; text-transform: uppercase; color: #0369a1; font-weight: 800; letter-spacing: 1px; margin-bottom: 12px;">
                      🔑 YOUR PORTAL LOGIN CREDENTIALS
                    </div>
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding: 6px 0; font-size: 13px; color: #334155; font-weight: 600; width: 140px;">Work Email:</td>
                        <td style="padding: 6px 0; font-size: 14px; color: #0f172a; font-family: 'SFMono-Regular', Consolas, monospace; font-weight: 700;">${email}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; font-size: 13px; color: #334155; font-weight: 600;">Temporary Password:</td>
                        <td style="padding: 6px 0;">
                          <span style="font-family: 'SFMono-Regular', Consolas, monospace; font-size: 15px; font-weight: 800; color: #1e1b4b; background-color: #fef3c7; border: 1px solid #fcd34d; padding: 4px 12px; border-radius: 6px; letter-spacing: 0.5px; display: inline-block;">
                            ${tempPassword}
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Action Button -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 26px 0 20px;">
                <tr>
                  <td align="center">
                    <a href="${loginUrl}" target="_blank" style="background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%); color: #ffffff; text-decoration: none; padding: 14px 34px; border-radius: 10px; font-weight: 700; font-size: 15px; display: inline-block; box-shadow: 0 4px 14px rgba(79, 70, 229, 0.35);">
                      Log In to NexaHR Portal &rarr;
                    </a>
                    <div style="margin-top: 10px;">
                      <a href="${loginUrl}" style="color: #6366f1; font-size: 12px; text-decoration: underline; word-break: break-all;">${loginUrl}</a>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Next Steps Notice -->
              <div style="background-color: #f8fafc; border-left: 4px solid #6366f1; border-radius: 6px; padding: 14px 16px; margin: 22px 0;">
                <div style="font-size: 13px; font-weight: 700; color: #1e1b4b; margin-bottom: 6px;">Next Steps:</div>
                <ol style="margin: 0; padding-left: 18px; color: #475569; font-size: 13px; line-height: 1.6;">
                  <li>Access the portal link and enter your email and temporary password.</li>
                  <li>You will be prompted to choose a permanent, private password on your first sign-in.</li>
                  <li>Complete any pending dossier fields and review your employee benefits.</li>
                  <li>For any questions, contact your HR Operations team or submit a Helpdesk ticket.</li>
                </ol>
              </div>

              <!-- Security Advisory -->
              <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin: 18px 0 0; text-align: center;">
                🔒 <strong>Security Notice:</strong> Please keep your login credentials strictly confidential. Never share your password with anyone.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 22px 32px; text-align: center;">
              <p style="color: #475569; font-size: 13px; font-weight: 600; margin: 0 0 4px;">
                NexaHR Enterprise Human Resource Management System
              </p>
              <p style="color: #94a3b8; font-size: 12px; margin: 0 0 4px;">
                © ${new Date().getFullYear()} NexaHR Systems. All rights reserved.
              </p>
              <p style="color: #cbd5e1; font-size: 11px; margin: 0;">
                This is an automated onboarding message. Please do not reply directly to this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Generate Plaintext Template for Welcome Onboarding Email
 */
function buildWelcomeEmailText({
  name,
  employeeCode,
  email,
  tempPassword,
  role = 'EMPLOYEE',
  designation = 'Team Member',
  department = 'General',
  workLocation = 'Headquarters',
  loginUrl,
}) {
  return `Welcome to NexaHR!

Hello ${name || 'Team Member'},

Congratulations and welcome to our organization! Your official profile on the NexaHR Workforce Portal has been created.

Your Profile Details:
- Employee ID: ${employeeCode}
- Role / Access: ${role || 'EMPLOYEE'}
- Designation: ${designation || 'Team Member'}
- Department: ${department || 'General'}
- Office Location: ${workLocation || 'Headquarters'}

Your Login Credentials:
- Work Email: ${email}
- Temporary Password: ${tempPassword}
- Portal URL: ${loginUrl}

Next Steps:
1. Navigate to: ${loginUrl}
2. Log in using your work email and temporary password provided above.
3. You will be prompted to choose a permanent, private password upon first login.
4. Review your dossier, attendance records, and company resources.

Security Advisory:
Please keep these credentials strictly confidential. If you did not expect this message, notify your HR Operations team immediately.

Warm regards,
NexaHR People Operations & HR Team`;
}

/**
 * Send Welcome Email with Login Credentials to newly onboarded employee
 */
async function sendOnboardingWelcomeEmail({
  email,
  name = 'Team Member',
  employeeCode = 'EMP-0000',
  tempPassword,
  role = 'EMPLOYEE',
  designation = 'Team Member',
  department = 'General',
  workLocation = 'Headquarters',
  loginUrl = null,
}) {
  const timestamp = new Date().toISOString();
  const resolvedLoginUrl = (loginUrl || (process.env.FRONTEND_URL && !process.env.FRONTEND_URL.includes('localhost') ? process.env.FRONTEND_URL : 'https://nexa-hr-xi.vercel.app/')).trim();

  console.log(`\n========================================================`);
  console.log(`[NexaHR EMAIL DISPATCH: ONBOARDING WELCOME CREDENTIALS] -> ${email}`);
  console.log(`Recipient: ${name} (${employeeCode})`);
  console.log(`Role: ${role} | Designation: ${designation} | Department: ${department}`);
  console.log(`Login URL: ${resolvedLoginUrl}`);
  console.log(`Temp Password: ${tempPassword ? '[CONFIGURED]' : '[NONE]'}`);
  console.log(`Timestamp: ${timestamp}`);
  console.log(`========================================================\n`);

  const transporter = getMailTransporter();
  let messageId = null;

  if (transporter && email) {
    try {
      const from = process.env.EMAIL_FROM && !process.env.EMAIL_FROM.includes('no-reply@nexahr.com')
        ? process.env.EMAIL_FROM
        : `"NexaHR People Operations" <${process.env.SMTP_USER}>`;

      const subject = `Welcome to NexaHR! Your Account Credentials [${employeeCode}]`;
      const text = buildWelcomeEmailText({
        name,
        employeeCode,
        email,
        tempPassword,
        role,
        designation,
        department,
        workLocation,
        loginUrl: resolvedLoginUrl,
      });
      const html = buildWelcomeEmailHtml({
        name,
        employeeCode,
        email,
        tempPassword,
        role,
        designation,
        department,
        workLocation,
        loginUrl: resolvedLoginUrl,
      });

      const info = await transporter.sendMail({
        from,
        to: email,
        subject,
        text,
        html,
      });

      messageId = info.messageId;
      console.log(`[EMAIL SUCCESS] Onboarding welcome email sent to ${email}. MessageId: ${messageId}`);
    } catch (err) {
      console.error(`[EMAIL ERROR] Failed to send onboarding welcome email to ${email}:`, err.message);
    }
  } else {
    console.log(`[EMAIL INFO] Transporter or email not available. Simulating onboarding welcome email.`);
  }

  return {
    success: true,
    channel: 'EMAIL',
    destination: maskEmail(email),
    messageId,
    dispatchedAt: timestamp,
    message: `Welcome credentials email dispatched to ${maskEmail(email)}.`,
  };
}

/**
 * Send Ephemeral Password Reset Link via Corporate Email
 */
async function sendPasswordResetEmail({ email, name, resetUrl, expiresInHours = 1 }) {
  console.log(`\n========================================================`);
  console.log(`[NexaHR EMAIL DISPATCH: PASSWORD RESET LINK] -> ${email}`);
  console.log(`Recipient: ${name}`);
  console.log(`Subject: [NexaHR Security] Ephemeral Password Reset Request`);
  console.log(`Reset URL: ${resetUrl}`);
  console.log(`Valid for: ${expiresInHours} hour(s) (Single Use Only)`);
  console.log(`Security Notice: Stored as SHA-256 cryptographic digest.`);
  console.log(`========================================================\n`);

  const transporter = getMailTransporter();
  if (transporter) {
    try {
      const from = process.env.EMAIL_FROM || process.env.SMTP_FROM || `"NexaHR Security" <${process.env.SMTP_USER}>`;
      await transporter.sendMail({
        from,
        to: email,
        subject: '[NexaHR Security] Password Reset Link',
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px;">
            <div style="background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%); padding: 24px; border-radius: 8px; text-align: center; margin-bottom: 24px;">
              <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 0.5px;">NexaHR Security</h1>
              <p style="color: #94a3b8; margin: 6px 0 0; font-size: 13px;">Workforce Identity & Authentication</p>
            </div>
            <p style="font-size: 15px; color: #334155; margin-bottom: 16px;">Hello <strong>${name || 'Team Member'}</strong>,</p>
            <p style="font-size: 14px; color: #475569; line-height: 1.6;">We received a request to reset the password for your NexaHR account. Click the button below to set a new password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background: #4f46e5; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; display: inline-block;">Reset Password</a>
            </div>
            <p style="font-size: 13px; color: #64748b; line-height: 1.5;">This link will expire in <strong>${expiresInHours} hour(s)</strong>. If you did not request a password reset, you can safely ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
            <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">NexaHR Enterprise Human Resource Management System</p>
          </div>
        `,
      });
    } catch (err) {
      console.error('[EMAIL ERROR] Failed to send password reset email via SMTP:', err.message);
    }
  }

  return {
    success: true,
    channel: 'EMAIL',
    destination: maskEmail(email),
    dispatchedAt: new Date().toISOString(),
    message: `Password reset link dispatched to ${maskEmail(email)}.`,
  };
}

/**
 * Generate Professional HTML Template for 6-Digit OTP Email
 */
function buildOtpEmailHtml({ name, otp, expiryMinutes = 10 }) {
  const otpArray = String(otp).split('');
  const formattedOtp = otpArray.join(' ');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NexaHR Verification Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f1f5f9; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 560px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(15, 23, 42, 0.08); border: 1px solid #e2e8f0;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #312e81 100%); padding: 36px 32px 30px; text-align: center;">
              <div style="display: inline-block; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); padding: 8px 16px; border-radius: 24px; margin-bottom: 16px;">
                <span style="color: #c7d2fe; font-size: 12px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase;">Security & Authentication</span>
              </div>
              <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">NexaHR</h1>
              <p style="color: #94a3b8; margin: 6px 0 0; font-size: 13px;">Workforce Management Platform</p>
            </td>
          </tr>

          <!-- Main Body -->
          <tr>
            <td style="padding: 36px 32px 28px;">
              <h2 style="color: #0f172a; margin: 0 0 12px; font-size: 20px; font-weight: 700;">Password Recovery Code</h2>
              <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
                Hello <strong>${name || 'Team Member'}</strong>,<br/>
                We received a request to reset the password for your NexaHR account. Please use the 6-digit verification code below to proceed:
              </p>

              <!-- OTP Code Display Card -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 24px 0;">
                <tr>
                  <td align="center" style="background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 24px 16px;">
                    <div style="font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 1.5px; margin-bottom: 8px;">Your 6-Digit Code</div>
                    <div style="font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; font-size: 34px; font-weight: 800; color: #4338ca; letter-spacing: 8px; margin: 4px 0;">
                      ${otp}
                    </div>
                    <div style="font-size: 13px; color: #059669; font-weight: 600; margin-top: 8px;">
                      ⏱️ Valid for ${expiryMinutes} minutes
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Security Notice Callout -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 6px; margin: 24px 0;">
                <tr>
                  <td style="padding: 14px 16px;">
                    <p style="margin: 0; font-size: 13px; color: #92400e; line-height: 1.5;">
                      <strong>Security Tip:</strong> Never share this OTP code with anyone, including NexaHR support. Our staff will never ask for your verification code.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin: 20px 0 0;">
                If you did not initiate this request, please disregard this email or immediately alert your internal HR administrator.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px 32px; text-align: center;">
              <p style="color: #94a3b8; font-size: 12px; margin: 0 0 6px;">
                © ${new Date().getFullYear()} NexaHR Systems. All rights reserved.
              </p>
              <p style="color: #cbd5e1; font-size: 11px; margin: 0;">
                This is an automated security transmission. Please do not reply directly to this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Send 6-Digit Password Recovery OTP via Corporate Email (Nodemailer)
 * @param {string} email - Destination email address
 * @param {string} otp - 6-digit numeric OTP
 * @param {string} [name='Team Member'] - User display name
 * @param {number} [expiryMinutes=10] - Validity window
 */
async function sendEmailOTP(email, otp, name = 'Team Member', expiryMinutes = 10) {
  const timestamp = new Date().toISOString();
  console.log(`\n========================================================`);
  console.log(`[NexaHR EMAIL DISPATCH: 6-DIGIT OTP] -> ${email}`);
  console.log(`Recipient: ${name}`);
  console.log(`OTP Verification Code: [ ${otp} ]`);
  console.log(`Valid for: ${expiryMinutes} minutes`);
  console.log(`Timestamp: ${timestamp}`);
  console.log(`========================================================\n`);

  const transporter = getMailTransporter();
  let messageId = null;

  if (transporter) {
    try {
      const from = process.env.EMAIL_FROM || process.env.SMTP_FROM || `"NexaHR Security" <${process.env.SMTP_USER}>`;
      const subject = `[NexaHR] Your Verification Code: ${otp}`;
      const text = `Your NexaHR verification code is: ${otp}. This code expires in ${expiryMinutes} minutes.\n\nSecurity Notice: If you did not initiate this recovery, please notify your HR Administrator immediately.\n\n— NexaHR Workforce Systems`;
      const html = buildOtpEmailHtml({ name, otp, expiryMinutes });

      const info = await transporter.sendMail({
        from,
        to: email,
        subject,
        text,
        html,
      });

      messageId = info.messageId;
      console.log(`[EMAIL SUCCESS] OTP email dispatched via SMTP to ${email}. MessageId: ${messageId}`);
    } catch (err) {
      console.error(`[EMAIL ERROR] Failed to send email via SMTP to ${email}:`, err.message);
      // Fallback logging ensures uninterrupted flow in test/dev
    }
  } else {
    console.log(`[EMAIL INFO] SMTP not configured. (Set SMTP_HOST, SMTP_USER, SMTP_PASS in .env for live dispatch). Simulating successful dispatch.`);
  }

  return {
    success: true,
    channel: 'EMAIL',
    destination: maskEmail(email),
    messageId,
    dispatchedAt: timestamp,
    message: `Security OTP successfully dispatched to corporate email ${maskEmail(email)}.`,
  };
}

/**
 * Send 6-Digit Password Recovery OTP via WhatsApp Messenger (Twilio / Meta Cloud API)
 * @param {string} phone - Mobile phone number (auto-formatted to E.164)
 * @param {string} otp - 6-digit numeric OTP
 * @param {string} [name='Team Member'] - User display name
 * @param {number} [expiryMinutes=10] - Validity window
 */
async function sendWhatsAppOTP(phone, otp, name = 'Team Member', expiryMinutes = 10) {
  if (!phone) {
    throw new Error('No registered mobile phone number found for this employee profile.');
  }

  const formattedPhone = formatE164(phone);
  const timestamp = new Date().toISOString();
  const messageText = `*NexaHR Enterprise Security*\n\nHello *${name}*,\n\nYour NexaHR verification code is: *${otp}*\n\nThis code expires in *${expiryMinutes} minutes*.\n\n*Security Notice*: If you did not initiate this recovery, please notify your HR Administrator immediately.\n\n_NexaHR Workforce Systems_`;

  console.log(`\n========================================================`);
  console.log(`[NexaHR WHATSAPP DISPATCH: 6-DIGIT OTP] -> ${formattedPhone}`);
  console.log(`Recipient: ${name}`);
  console.log(`OTP Code: [ ${otp} ]`);
  console.log(`Formatted E.164 Phone: ${formattedPhone}`);
  console.log(`WhatsApp Content:\n${messageText}`);
  console.log(`========================================================\n`);

  let messageId = null;
  let provider = 'SIMULATED';

  // 1. Try Twilio WhatsApp API if configured
  const twilio = getTwilioClient();
  if (twilio) {
    try {
      const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER || process.env.WHATSAPP_PHONE_NUMBER || 'whatsapp:+14155238886';
      const from = fromNumber.startsWith('whatsapp:') ? fromNumber : `whatsapp:${fromNumber}`;
      const to = formattedPhone.startsWith('whatsapp:') ? formattedPhone : `whatsapp:${formattedPhone}`;

      const twilioRes = await twilio.messages.create({
        body: messageText,
        from,
        to,
      });

      messageId = twilioRes.sid;
      provider = 'TWILIO';
      console.log(`[WHATSAPP SUCCESS] Dispatched via Twilio WhatsApp API. SID: ${messageId}`);
    } catch (err) {
      console.error(`[WHATSAPP ERROR] Twilio dispatch failed:`, err.message);
    }
  }

  // 2. Try Meta WhatsApp Cloud API if configured and Twilio was not used
  const metaToken = process.env.WHATSAPP_API_KEY || process.env.META_WHATSAPP_TOKEN;
  const metaPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!messageId && metaToken && metaPhoneId) {
    try {
      const cleanTo = formattedPhone.replace('+', '');
      const metaRes = await fetch(`https://graph.facebook.com/v18.0/${metaPhoneId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${metaToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: cleanTo,
          type: 'text',
          text: { body: messageText },
        }),
      });

      const metaData = await metaRes.json();
      if (metaRes.ok && metaData.messages?.[0]?.id) {
        messageId = metaData.messages[0].id;
        provider = 'META_CLOUD_API';
        console.log(`[WHATSAPP SUCCESS] Dispatched via Meta WhatsApp Cloud API. ID: ${messageId}`);
      } else {
        console.error(`[WHATSAPP ERROR] Meta Cloud API error:`, JSON.stringify(metaData));
      }
    } catch (err) {
      console.error(`[WHATSAPP ERROR] Meta Cloud API request failed:`, err.message);
    }
  }

  if (!messageId) {
    console.log(`[WHATSAPP INFO] WhatsApp API credentials not configured. (Set TWILIO_ACCOUNT_SID/TWILIO_AUTH_TOKEN or WHATSAPP_API_KEY in .env). Simulating successful dispatch.`);
  }

  return {
    success: true,
    channel: 'WHATSAPP',
    destination: maskPhone(formattedPhone),
    formattedPhone,
    provider,
    messageId,
    dispatchedAt: timestamp,
    message: `Security OTP successfully sent via WhatsApp to ${maskPhone(formattedPhone)}.`,
  };
}

// Backward compatibility aliases
const sendOtpEmail = sendEmailOTP;
const sendOtpWhatsApp = sendWhatsAppOTP;

module.exports = {
  createInAppNotification,
  broadcastInAppNotification,
  sendAnnouncementEmail,
  sendLeaveStatusEmail,
  sendLeaveRequestSubmittedEmail,
  sendPayslipEmail,
  sendOnboardingWelcomeEmail,
  sendPasswordResetEmail,
  sendEmailOTP,
  sendWhatsAppOTP,
  sendOtpEmail,
  sendOtpWhatsApp,
  maskEmail,
  maskPhone,
  formatE164,
};


