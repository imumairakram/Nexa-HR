const nodemailer = require('nodemailer');
const prisma = require('../config/prisma');
const { nonDemoUsersWhere } = require('../utils/userFilters');

// ====================================================
// IN-MEMORY TEST OUTBOXES (Active when NODE_ENV === 'test')
// Zero network calls, zero production email/SMS dispatches
// ====================================================
const testMailOutbox = [];
const testWhatsAppOutbox = [];

function getTestMailOutbox() {
  return [...testMailOutbox];
}

function getTestWhatsAppOutbox() {
  return [...testWhatsAppOutbox];
}

function clearTestOutboxes() {
  testMailOutbox.length = 0;
  testWhatsAppOutbox.length = 0;
}


// Optional Twilio client instantiation
let twilioClient = null;
function getTwilioClient() {
  if (process.env.NODE_ENV === 'test') return null;
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
  if (process.env.NODE_ENV === 'test' || process.env.EMAIL_DELIVERY_MODE === 'log') {
    if (!mailTransporter || !mailTransporter._isTestStub) {
      const stub = nodemailer.createTransport({
        jsonTransport: true,
      });
      const origSendMail = stub.sendMail.bind(stub);
      stub.sendMail = async (mailOptions) => {
        const info = await origSendMail(mailOptions);
        const record = {
          from: mailOptions.from,
          to: mailOptions.to,
          subject: mailOptions.subject,
          text: mailOptions.text,
          html: mailOptions.html,
          messageId: info.messageId || `<test-${Date.now()}-${Math.random().toString(36).slice(2)}@nexahr.test>`,
          timestamp: new Date().toISOString(),
        };
        testMailOutbox.push(record);
        return {
          ...info,
          messageId: record.messageId,
          response: '250 Test message saved to in-memory test outbox',
        };
      };
      stub._isTestStub = true;
      mailTransporter = stub;
    }
    return mailTransporter;
  }

  if (mailTransporter && !mailTransporter._isTestStub) return mailTransporter;

  const user = (process.env.SMTP_USER || process.env.EMAIL_USER || process.env.GMAIL_USER || '').trim();
  const rawPass = (process.env.SMTP_PASS || process.env.EMAIL_PASS || process.env.GMAIL_PASS || '').trim();
  // Strip spaces from Google App Passwords ('xxxx xxxx xxxx xxxx' -> 'xxxxxxxxxxxxxxxx')
  const pass = rawPass.replace(/\s+/g, '');
  const rawHost = (process.env.SMTP_HOST || (user.toLowerCase().endsWith('@gmail.com') ? 'smtp.gmail.com' : '')).trim();

  if (!user || !pass) {
    return null;
  }

  const isGmail = rawHost.toLowerCase().includes('gmail.com') || user.toLowerCase().endsWith('@gmail.com');

  if (isGmail) {
    mailTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 20000,
    });
  } else if (rawHost) {
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const secure = process.env.SMTP_SECURE === 'true' || port === 465;
    mailTransporter = nodemailer.createTransport({
      host: rawHost,
      port,
      secure,
      auth: { user, pass },
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 20000,
    });
  }

  return mailTransporter;
}

/**
 * Resolve verified sender From address
 * When using Gmail SMTP, envelope sender must strictly match SMTP_USER to avoid silent delivery drops
 */
function getFromAddress(serviceName = 'NexaHR Security') {
  const user = (process.env.SMTP_USER || process.env.EMAIL_USER || process.env.GMAIL_USER || '').trim();
  const host = (process.env.SMTP_HOST || '').trim();
  const emailFrom = (process.env.EMAIL_FROM || process.env.SMTP_FROM || '').trim();

  if (user && (host.toLowerCase().includes('gmail.com') || user.toLowerCase().endsWith('@gmail.com') || emailFrom.includes('no-reply@nexahr.com') || !emailFrom)) {
    return `"${serviceName}" <${user}>`;
  }
  if (emailFrom) {
    return emailFrom;
  }
  if (user) {
    return `"${serviceName}" <${user}>`;
  }
  return `"${serviceName}" <no-reply@nexahr.com>`;
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
    const where = { isActive: true, ...nonDemoUsersWhere };
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
// CORPORATE EMAIL DISPATCHERS & HTML BUILDERS
// ====================================================

const CLIENT_BASE_URL = (process.env.CLIENT_URL || process.env.APP_URL || 'https://nexa-hr-xi.vercel.app').replace(/\/+$/, '');

/**
 * Universal High-Fidelity NexaHR Branded Email Wrapper
 */
function buildEmailWrapperHtml({ title, subtitle, badge, contentHtml, ctaText, ctaUrl }) {
  const portalUrl = ctaUrl ? (ctaUrl.startsWith('http') ? ctaUrl : `${CLIENT_BASE_URL}${ctaUrl}`) : CLIENT_BASE_URL;
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - NexaHR</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f0f9ff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f0f9ff; padding: 36px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 620px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 35px rgba(14, 165, 233, 0.12); border: 1px solid #bae6fd;">
          
          <!-- Header Banner (NexaHR Light Sky Blue Identity) -->
          <tr>
            <td style="background: linear-gradient(135deg, #0284c7 0%, #0ea5e9 60%, #38bdf8 100%); padding: 36px 32px 30px; text-align: center;">
              ${badge ? `
              <div style="display: inline-block; background: rgba(255, 255, 255, 0.22); border: 1px solid rgba(255, 255, 255, 0.4); padding: 5px 16px; border-radius: 9999px; margin-bottom: 12px;">
                <span style="color: #ffffff; font-size: 11px; font-weight: 800; letter-spacing: 1.2px; text-transform: uppercase;">${badge}</span>
              </div>
              ` : ''}
              <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">${title}</h1>
              <p style="color: #f0f9ff; margin: 6px 0 0; font-size: 13px; font-weight: 500;">${subtitle || 'NexaHR Enterprise Human Resource Management'}</p>
            </td>
          </tr>

          <!-- Main Body Content -->
          <tr>
            <td style="padding: 32px 32px 28px;">
              ${contentHtml}

              ${ctaText && portalUrl ? `
              <div style="text-align: center; margin: 30px 0 10px;">
                <a href="${portalUrl}" style="background: linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%); color: #ffffff; padding: 13px 32px; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 14px; display: inline-block; box-shadow: 0 4px 14px rgba(14, 165, 233, 0.35);">
                  ${ctaText} &rarr;
                </a>
              </div>
              ` : ''}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 32px; text-align: center;">
              <p style="font-size: 12px; color: #64748b; margin: 0 0 6px; font-weight: 600;">
                NexaHR Cloud Human Resource Management System
              </p>
              <p style="font-size: 11px; color: #94a3b8; margin: 0;">
                This automated notification was generated by NexaHR. For inquiries, please contact your HR department or raise a ticket on the self-service desk.
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
 * Dispatches announcement broadcast email to all employees
 */
async function sendAnnouncementEmail({ recipients = [], announcement }) {
  const timestamp = new Date().toISOString();
  console.log(`[NexaHR ANNOUNCEMENT EMAIL] Dispatching to ${recipients.length} employees: "${announcement.title}"`);

  const transporter = getMailTransporter();
  let dispatchedCount = 0;

  if (transporter && Array.isArray(recipients) && recipients.length > 0) {
    const from = getFromAddress('NexaHR Announcements');
    const subject = `[Company Notice] ${announcement.title}`;

    const contentHtml = `
      <p style="font-size: 16px; color: #0f172a; margin: 0 0 16px; font-weight: 700;">
        Dear Team Member,
      </p>
      <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 20px;">
        A new corporate announcement has been published by <strong>${announcement.author || 'People Operations & HR'}</strong>.
      </p>

      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 14px; margin-bottom: 24px;">
        <tr>
          <td style="padding: 20px 22px;">
            <div style="margin-bottom: 12px;">
              <span style="background-color: ${announcement.priority === 'HIGH' ? '#fee2e2; color: #b91c1c' : '#e0f2fe; color: #0369a1'}; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 800; text-transform: uppercase;">
                ${announcement.priority || 'NORMAL'} PRIORITY
              </span>
              <span style="background-color: #f1f5f9; color: #475569; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; margin-left: 6px;">
                ${announcement.category || 'General'}
              </span>
            </div>
            <h3 style="margin: 0 0 10px; font-size: 16px; color: #0f172a; font-weight: 800;">
              ${announcement.title}
            </h3>
            <p style="font-size: 13.5px; color: #334155; line-height: 1.65; margin: 0; white-space: pre-wrap;">
              ${announcement.content || announcement.summary || ''}
            </p>
          </td>
        </tr>
      </table>
    `;

    const html = buildEmailWrapperHtml({
      title: 'Company Announcement',
      subtitle: `${announcement.category || 'General Notice'} • People Operations`,
      badge: 'Company Wide Broadcast',
      contentHtml,
      ctaText: 'Open Announcements in Portal',
      ctaUrl: '/employee/announcements',
    });

    for (const r of recipients) {
      const email = typeof r === 'string' ? r : r.email;
      if (email && email.includes('@')) {
        try {
          await transporter.sendMail({
            from,
            to: email,
            subject,
            html,
          });
          dispatchedCount++;
        } catch (err) {
          console.warn(`[EMAIL WARNING] Could not send announcement to ${email}:`, err.message);
        }
      }
    }
  }

  return {
    success: true,
    channel: 'EMAIL',
    type: 'ANNOUNCEMENT_BROADCAST',
    recipientCount: dispatchedCount,
    dispatchedAt: timestamp,
    message: `Announcement broadcast emailed to ${dispatchedCount} recipient(s).`,
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
  const timestamp = new Date().toISOString();

  console.log(`[NexaHR LEAVE STATUS EMAIL] ${status} -> ${email}`);

  const transporter = getMailTransporter();
  let messageId = null;

  if (transporter && email) {
    try {
      const isApproved = status === 'APPROVED';
      const from = getFromAddress('NexaHR People Operations');
      const subject = `[NexaHR] Leave Request ${isApproved ? 'Approved' : 'Declined'}: ${leaveType}`;

      const contentHtml = `
        <p style="font-size: 16px; color: #0f172a; margin: 0 0 16px; font-weight: 700;">
          Dear <strong>${name || 'Team Member'}</strong>,
        </p>
        <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 20px;">
          Your recent leave application has been reviewed and evaluated by management.
        </p>

        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 14px; margin-bottom: 22px;">
          <tr>
            <td style="padding: 20px 22px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600; width: 140px;">Leave Policy:</td>
                  <td style="padding: 6px 0; font-size: 14px; color: #0f172a; font-weight: 800;">${leaveType}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600;">Total Duration:</td>
                  <td style="padding: 6px 0; font-size: 13px; color: #0284c7; font-weight: 700;">${totalDays} Day${totalDays > 1 ? 's' : ''}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600;">Effective Period:</td>
                  <td style="padding: 6px 0; font-size: 13px; color: #334155; font-weight: 600;">${startStr} &rarr; ${endStr}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600;">Decision:</td>
                  <td style="padding: 6px 0;">
                    <span style="background-color: ${isApproved ? '#dcfce7; color: #15803d' : '#fee2e2; color: #b91c1c'}; padding: 4px 12px; border-radius: 6px; font-size: 11px; font-weight: 800; text-transform: uppercase;">
                      ${isApproved ? 'Approved' : 'Declined'}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        ${!isApproved && rejectionReason ? `
        <div style="background-color: #fff1f2; border-left: 4px solid #f43f5e; border-radius: 8px; padding: 14px 18px; margin: 0 0 22px;">
          <p style="font-size: 13px; color: #9f1239; margin: 0; font-weight: 600; line-height: 1.5;">
            <strong>Reason for Decision:</strong> ${rejectionReason}
          </p>
        </div>
        ` : ''}
      `;

      const html = buildEmailWrapperHtml({
        title: `Leave Request ${isApproved ? 'Approved' : 'Declined'}`,
        subtitle: `${leaveType} • ${totalDays} Day(s)`,
        badge: isApproved ? 'Leave Approved' : 'Leave Declined',
        contentHtml,
        ctaText: 'View Leaves in Portal',
        ctaUrl: '/employee/leaves',
      });

      const info = await transporter.sendMail({
        from,
        to: email,
        subject,
        html,
      });
      messageId = info.messageId;
      console.log(`[EMAIL SUCCESS] Leave status email sent to ${email}. MessageId: ${messageId}`);
    } catch (err) {
      console.error(`[EMAIL ERROR] Failed to send leave status email to ${email}:`, err.message);
    }
  }

  return {
    success: true,
    channel: 'EMAIL',
    type: 'LEAVE_STATUS',
    destination: maskEmail(email),
    dispatchedAt: timestamp,
    messageId,
  };
}

/**
 * Dispatches email notification to Employee (and HR Admins) when a leave request is submitted
 */
async function sendLeaveRequestSubmittedEmail({
  adminEmails = [],
  employeeEmail = null,
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
  const timestamp = new Date().toISOString();

  console.log(`[NexaHR LEAVE SUBMITTED EMAIL] Dispatched for ${employeeName}`);

  const transporter = getMailTransporter();

  if (transporter) {
    const from = getFromAddress('NexaHR People Operations');

    // 1. Send confirmation email directly to the Employee
    if (employeeEmail && employeeEmail.includes('@')) {
      try {
        const subject = `[NexaHR] Leave Application Submitted: ${leaveType}`;
        const contentHtml = `
          <p style="font-size: 16px; color: #0f172a; margin: 0 0 16px; font-weight: 700;">
            Dear <strong>${employeeName || 'Team Member'}</strong>,
          </p>
          <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 20px;">
            Your leave request for <strong>${leaveType}</strong> has been successfully submitted and is currently awaiting management evaluation.
          </p>

          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 14px; margin-bottom: 22px;">
            <tr>
              <td style="padding: 20px 22px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600; width: 140px;">Leave Policy:</td>
                    <td style="padding: 6px 0; font-size: 14px; color: #0f172a; font-weight: 800;">${leaveType}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600;">Total Duration:</td>
                    <td style="padding: 6px 0; font-size: 13px; color: #0284c7; font-weight: 700;">${totalDays} Day${totalDays > 1 ? 's' : ''}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600;">Requested Dates:</td>
                    <td style="padding: 6px 0; font-size: 13px; color: #334155; font-weight: 600;">${startStr} &rarr; ${endStr}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600;">Current Status:</td>
                    <td style="padding: 6px 0;">
                      <span style="background-color: #fef3c7; color: #b45309; padding: 4px 12px; border-radius: 6px; font-size: 11px; font-weight: 800; text-transform: uppercase;">
                        Pending Review
                      </span>
                    </td>
                  </tr>
                  ${reason ? `
                  <tr>
                    <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600; vertical-align: top;">Stated Reason:</td>
                    <td style="padding: 6px 0; font-size: 13px; color: #475569; font-style: italic;">"${reason}"</td>
                  </tr>
                  ` : ''}
                </table>
              </td>
            </tr>
          </table>
        `;

        const html = buildEmailWrapperHtml({
          title: 'Leave Application Submitted',
          subtitle: `${leaveType} • ${totalDays} Day(s)`,
          badge: 'Leave Request Logged',
          contentHtml,
          ctaText: 'View Time-Off History',
          ctaUrl: '/employee/leaves',
        });

        await transporter.sendMail({
          from,
          to: employeeEmail,
          subject,
          html,
        });
        console.log(`[EMAIL SUCCESS] Leave submission confirmation sent to employee: ${employeeEmail}`);
      } catch (err) {
        console.warn(`[EMAIL ERROR] Could not send confirmation to employee ${employeeEmail}:`, err.message);
      }
    }

    // 2. Dispatch notice to HR Admins
    if (Array.isArray(adminEmails) && adminEmails.length > 0) {
      const adminSubject = `[New Leave Request] ${employeeName} applied for ${leaveType}`;
      const adminContent = `
        <p style="font-size: 16px; color: #0f172a; margin: 0 0 16px; font-weight: 700;">
          Attention HR Operations,
        </p>
        <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 20px;">
          An employee has submitted a new leave request requiring review and entitlement reconciliation.
        </p>
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 14px; margin-bottom: 22px;">
          <tr>
            <td style="padding: 20px 22px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600; width: 140px;">Applicant:</td>
                  <td style="padding: 6px 0; font-size: 14px; color: #0f172a; font-weight: 800;">${employeeName} (${employeeCode || 'Employee'})</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600;">Leave Policy:</td>
                  <td style="padding: 6px 0; font-size: 13px; color: #0284c7; font-weight: 700;">${leaveType} (${totalDays} day${totalDays > 1 ? 's' : ''})</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600;">Requested Period:</td>
                  <td style="padding: 6px 0; font-size: 13px; color: #334155; font-weight: 600;">${startStr} &rarr; ${endStr}</td>
                </tr>
                ${reason ? `
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600; vertical-align: top;">Purpose:</td>
                  <td style="padding: 6px 0; font-size: 13px; color: #475569; font-style: italic;">"${reason}"</td>
                </tr>
                ` : ''}
              </table>
            </td>
          </tr>
        </table>
      `;

      const adminHtml = buildEmailWrapperHtml({
        title: 'New Leave Request Received',
        subtitle: `${employeeName} • ${leaveType}`,
        badge: 'Action Required',
        contentHtml: adminContent,
        ctaText: 'Review in Admin Portal',
        ctaUrl: '/app/leaves',
      });

      for (const adm of adminEmails) {
        try {
          await transporter.sendMail({
            from,
            to: adm,
            subject: adminSubject,
            html: adminHtml,
          });
        } catch (e) {
          // ignore individual admin email failures
        }
      }
    }
  }

  return {
    success: true,
    channel: 'EMAIL',
    type: 'LEAVE_SUBMISSION',
    dispatchedAt: timestamp,
  };
}

/**
 * Dispatches Support Ticket confirmation email to employee
 */
async function sendTicketCreatedEmail({
  email,
  name,
  ticketNumber,
  subject,
  category,
  priority,
  description,
  assignedTo,
}) {
  const timestamp = new Date().toISOString();
  console.log(`[NexaHR TICKET EMAIL] #${ticketNumber} created for ${email}`);

  const transporter = getMailTransporter();
  let messageId = null;

  if (transporter && email) {
    try {
      const from = getFromAddress('NexaHR Helpdesk & Operations');
      const emailSubject = `[NexaHR Support] Ticket #${ticketNumber} Created: ${subject}`;

      const contentHtml = `
        <p style="font-size: 16px; color: #0f172a; margin: 0 0 16px; font-weight: 700;">
          Dear <strong>${name || 'Team Member'}</strong>,
        </p>
        <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 20px;">
          Your support ticket <strong>#${ticketNumber}</strong> has been registered and routed to our operations specialists.
        </p>

        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 14px; margin-bottom: 22px;">
          <tr>
            <td style="padding: 20px 22px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600; width: 140px;">Ticket ID:</td>
                  <td style="padding: 6px 0; font-size: 14px; color: #0284c7; font-family: monospace; font-weight: 800;">#${ticketNumber}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600;">Subject:</td>
                  <td style="padding: 6px 0; font-size: 14px; color: #0f172a; font-weight: 800;">${subject}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600;">Classification:</td>
                  <td style="padding: 6px 0; font-size: 13px; color: #334155; font-weight: 600;">${category || 'General Operations'}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600;">Urgency / Priority:</td>
                  <td style="padding: 6px 0;">
                    <span style="background-color: ${priority === 'HIGH' ? '#fee2e2; color: #b91c1c' : priority === 'LOW' ? '#f1f5f9; color: #475569' : '#e0f2fe; color: #0369a1'}; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 800; text-transform: uppercase;">
                      ${priority || 'MEDIUM'} PRIORITY
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600;">Assigned Desk:</td>
                  <td style="padding: 6px 0; font-size: 13px; color: #0f172a; font-weight: 700;">${assignedTo || 'NexaHR Support Team'}</td>
                </tr>
                ${description ? `
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600; vertical-align: top;">Description:</td>
                  <td style="padding: 6px 0; font-size: 13px; color: #475569; font-style: italic;">"${description}"</td>
                </tr>
                ` : ''}
              </table>
            </td>
          </tr>
        </table>
      `;

      const html = buildEmailWrapperHtml({
        title: 'Support Ticket Registered',
        subtitle: `Ticket #${ticketNumber} • Operations & IT Desk`,
        badge: 'Ticket Created',
        contentHtml,
        ctaText: 'Open Ticket Conversation',
        ctaUrl: '/employee/helpdesk',
      });

      const info = await transporter.sendMail({
        from,
        to: email,
        subject: emailSubject,
        html,
      });

      messageId = info.messageId;
      console.log(`[EMAIL SUCCESS] Ticket creation email sent to ${email}. MessageId: ${messageId}`);
    } catch (err) {
      console.error(`[EMAIL ERROR] Failed to send ticket creation email to ${email}:`, err.message);
    }
  }

  return {
    success: true,
    channel: 'EMAIL',
    type: 'TICKET_CREATED',
    destination: maskEmail(email),
    dispatchedAt: timestamp,
    messageId,
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
  const timestamp = new Date().toISOString();

  console.log(`[NexaHR PAYSLIP EMAIL] ${monthStr} ${year} -> ${email}`);

  const transporter = getMailTransporter();
  let messageId = null;

  if (transporter && email) {
    try {
      const from = getFromAddress('NexaHR Payroll & Finance');
      const subject = `[NexaHR Payslip Ready] ${monthStr} ${year} Salary Voucher`;

      const contentHtml = `
        <p style="font-size: 16px; color: #0f172a; margin: 0 0 16px; font-weight: 700;">
          Dear <strong>${name || 'Team Member'}</strong>,
        </p>
        <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 20px;">
          Your monthly salary payslip for <strong>${monthStr} ${year}</strong> has been generated and approved for disbursement.
        </p>

        <!-- Salary Breakdown Card -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 14px; margin-bottom: 22px;">
          <tr>
            <td style="padding: 22px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding: 7px 0; font-size: 13px; color: #64748b; font-weight: 600; width: 160px;">Gross Earnings:</td>
                  <td style="padding: 7px 0; font-size: 14px; color: #0f172a; font-weight: 700;">PKR ${Number(grossSalary).toLocaleString()}</td>
                </tr>
                <tr>
                  <td style="padding: 7px 0; font-size: 13px; color: #64748b; font-weight: 600;">Statutory Deductions:</td>
                  <td style="padding: 7px 0; font-size: 13px; color: #e11d48; font-weight: 700;">-PKR ${Number(deductions).toLocaleString()}</td>
                </tr>
                <tr style="border-top: 1px solid #e2e8f0;">
                  <td style="padding: 10px 0 6px; font-size: 14px; color: #0369a1; font-weight: 800;">Net Take-Home Pay:</td>
                  <td style="padding: 10px 0 6px; font-size: 18px; color: #0284c7; font-weight: 800;">PKR ${Number(netSalary).toLocaleString()}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600;">Disbursal Date:</td>
                  <td style="padding: 6px 0; font-size: 13px; color: #334155; font-weight: 600;">${payDateStr}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600;">Payout Mode:</td>
                  <td style="padding: 6px 0; font-size: 13px; color: #16a34a; font-weight: 700;">ACH Direct Corporate Bank Transfer</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      `;

      const html = buildEmailWrapperHtml({
        title: 'Monthly Salary Payslip Ready',
        subtitle: `${monthStr} ${year} • Payroll Disbursement`,
        badge: 'Salary Disbursed',
        contentHtml,
        ctaText: 'Download Salary Voucher',
        ctaUrl: '/employee/payslips',
      });

      const info = await transporter.sendMail({
        from,
        to: email,
        subject,
        html,
      });

      messageId = info.messageId;
      console.log(`[EMAIL SUCCESS] Payslip email sent to ${email}. MessageId: ${messageId}`);
    } catch (err) {
      console.error(`[EMAIL ERROR] Failed to send payslip email to ${email}:`, err.message);
    }
  }

  return {
    success: true,
    channel: 'EMAIL',
    type: 'PAYSLIP_ISSUED',
    destination: maskEmail(email),
    dispatchedAt: timestamp,
    messageId,
  };
}

/**
 * Dispatches daily attendance punch-in confirmation email to employee
 */
async function sendAttendancePunchInEmail({
  email,
  name,
  employeeCode,
  checkInTime,
  date,
  status,
  shift,
  sourceNote,
}) {
  const timestamp = new Date().toISOString();
  const timeDate = checkInTime ? new Date(checkInTime) : new Date();
  const timeStr = timeDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  const dateStr = (date ? new Date(date) : timeDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: '2-digit', year: 'numeric' });

  console.log(`[NexaHR ATTENDANCE EMAIL] Punch-In confirmed for ${email} at ${timeStr}`);

  const transporter = getMailTransporter();
  let messageId = null;

  if (transporter && email) {
    try {
      const isLate = status === 'LATE';
      const from = getFromAddress('NexaHR Attendance Desk');
      const subject = `[NexaHR Attendance] Punch-In Recorded: ${dateStr}`;

      const contentHtml = `
        <p style="font-size: 16px; color: #0f172a; margin: 0 0 16px; font-weight: 700;">
          Dear <strong>${name || 'Team Member'}</strong>,
        </p>
        <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 20px;">
          Your daily attendance check-in for <strong>${dateStr}</strong> has been logged in the biometric enterprise ledger.
        </p>

        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 14px; margin-bottom: 22px;">
          <tr>
            <td style="padding: 20px 22px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600; width: 140px;">Employee:</td>
                  <td style="padding: 6px 0; font-size: 14px; color: #0f172a; font-weight: 800;">${name} (${employeeCode})</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600;">Check-In Time:</td>
                  <td style="padding: 6px 0; font-size: 15px; color: #0284c7; font-weight: 800;">${timeStr}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600;">Punctuality Status:</td>
                  <td style="padding: 6px 0;">
                    <span style="background-color: ${isLate ? '#fef3c7; color: #b45309' : '#dcfce7; color: #15803d'}; padding: 4px 12px; border-radius: 6px; font-size: 11px; font-weight: 800; text-transform: uppercase;">
                      ${isLate ? 'Late Arrival' : 'On-Time (Present)'}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600;">Assigned Shift:</td>
                  <td style="padding: 6px 0; font-size: 13px; color: #334155; font-weight: 600;">${shift || 'General Morning (09:00 - 17:30)'}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600;">Verification Source:</td>
                  <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600;">${sourceNote || 'Biometric Hardware Turnstile'}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      `;

      const html = buildEmailWrapperHtml({
        title: 'Attendance Punch-In Recorded',
        subtitle: `${dateStr} • ${timeStr}`,
        badge: isLate ? 'Late Arrival' : 'On-Time Present',
        contentHtml,
        ctaText: 'View Attendance Timesheet',
        ctaUrl: '/employee/attendance',
      });

      const info = await transporter.sendMail({
        from,
        to: email,
        subject,
        html,
      });

      messageId = info.messageId;
      console.log(`[EMAIL SUCCESS] Attendance punch email sent to ${email}. MessageId: ${messageId}`);
    } catch (err) {
      console.error(`[EMAIL ERROR] Failed to send attendance punch email to ${email}:`, err.message);
    }
  }

  return {
    success: true,
    channel: 'EMAIL',
    type: 'ATTENDANCE_PUNCH_IN',
    destination: maskEmail(email),
    dispatchedAt: timestamp,
    messageId,
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
  <title>Welcome to NexaHR - Your Account Credentials</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f0f9ff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f0f9ff; padding: 36px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 620px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 35px rgba(14, 165, 233, 0.12); border: 1px solid #bae6fd;">
          
          <!-- Header Banner (NexaHR Light Sky Blue Identity) -->
          <tr>
            <td style="background: linear-gradient(135deg, #0284c7 0%, #0ea5e9 60%, #38bdf8 100%); padding: 40px 32px 34px; text-align: center;">
              <div style="display: inline-block; background: rgba(255, 255, 255, 0.22); border: 1px solid rgba(255, 255, 255, 0.4); padding: 5px 16px; border-radius: 9999px; margin-bottom: 14px;">
                <span style="color: #ffffff; font-size: 11px; font-weight: 800; letter-spacing: 1.2px; text-transform: uppercase;">Employee Onboarding &bull; Welcome</span>
              </div>
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">Welcome to NexaHR</h1>
              <p style="color: #f0f9ff; margin: 8px 0 0; font-size: 14px; font-weight: 500;">Workforce Management & Self-Service Portal</p>
            </td>
          </tr>

          <!-- Main Body Content -->
          <tr>
            <td style="padding: 34px 32px 28px;">
              <p style="font-size: 17px; color: #0f172a; margin: 0 0 14px; font-weight: 700;">
                Dear <strong>${name || 'Team Member'}</strong>,
              </p>
              
              <!-- Welcome Note -->
              <div style="background-color: #f0f9ff; border-left: 4px solid #0284c7; border-radius: 8px; padding: 14px 18px; margin: 0 0 22px;">
                <p style="font-size: 14px; color: #0369a1; line-height: 1.65; margin: 0; font-weight: 600;">
                  Welcome to the organization! We are thrilled to welcome you to the team. Your official employee profile on the <strong>NexaHR Workforce Portal</strong> has been activated and is ready for use.
                </p>
              </div>

              <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 22px;">
                You can now log in to review your profile dossier, check your shift timings, mark biometric attendance, request leaves, view payslips, and collaborate with your department.
              </p>

              <!-- Credentials Card -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(145deg, #f0f9ff 0%, #e0f2fe 100%); border: 2px solid #38bdf8; border-radius: 16px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 22px 24px;">
                    <div style="font-size: 12px; text-transform: uppercase; color: #0284c7; font-weight: 800; letter-spacing: 1px; margin-bottom: 14px; display: flex; align-items: center; gap: 6px;">
                      YOUR PORTAL LOGIN CREDENTIALS
                    </div>
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding: 7px 0; font-size: 13px; color: #475569; font-weight: 600; width: 140px;">Work Email:</td>
                        <td style="padding: 7px 0; font-size: 14px; color: #0f172a; font-family: 'SFMono-Regular', Consolas, monospace; font-weight: 700;">
                          ${email}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 7px 0; font-size: 13px; color: #475569; font-weight: 600;">Temporary Password:</td>
                        <td style="padding: 7px 0;">
                          <span style="font-family: 'SFMono-Regular', Consolas, monospace; font-size: 15px; font-weight: 800; color: #0c4a6e; background-color: #fef3c7; border: 1.5px solid #f59e0b; padding: 5px 14px; border-radius: 8px; letter-spacing: 0.5px; display: inline-block;">
                            ${tempPassword}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 7px 0; font-size: 13px; color: #475569; font-weight: 600;">Employee ID / Code:</td>
                        <td style="padding: 7px 0; font-size: 13px; color: #0284c7; font-family: 'SFMono-Regular', Consolas, monospace; font-weight: 700;">
                          ${employeeCode}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 7px 0; font-size: 13px; color: #475569; font-weight: 600;">Role & Access:</td>
                        <td style="padding: 7px 0; font-size: 13px; color: #0f172a; font-weight: 600;">
                          ${designation || 'Team Member'} (${role || 'EMPLOYEE'})
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 7px 0; font-size: 13px; color: #475569; font-weight: 600;">Department:</td>
                        <td style="padding: 7px 0; font-size: 13px; color: #0f172a; font-weight: 600;">
                          ${department || 'General'}
                        </td>
                      </tr>
                      ${workLocation ? `
                      <tr>
                        <td style="padding: 7px 0; font-size: 13px; color: #475569; font-weight: 600;">Office Location:</td>
                        <td style="padding: 7px 0; font-size: 13px; color: #0f172a; font-weight: 600;">
                          ${workLocation}
                        </td>
                      </tr>
                      ` : ''}
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Primary Action Button -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 26px 0 20px;">
                <tr>
                  <td align="center">
                    <a href="${loginUrl}" target="_blank" style="background: linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%); color: #ffffff; text-decoration: none; padding: 15px 36px; border-radius: 12px; font-weight: 800; font-size: 15px; display: inline-block; box-shadow: 0 4px 16px rgba(14, 165, 233, 0.35); letter-spacing: 0.3px;">
                      Log In to NexaHR Portal &rarr;
                    </a>
                    <div style="margin-top: 10px;">
                      <a href="${loginUrl}" style="color: #0284c7; font-size: 12px; text-decoration: underline; word-break: break-all;">${loginUrl}</a>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Next Steps Notice -->
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px 20px; margin: 22px 0;">
                <div style="font-size: 13px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">First-Time Sign-In Instructions:</div>
                <ol style="margin: 0; padding-left: 20px; color: #475569; font-size: 13px; line-height: 1.65;">
                  <li>Click the button above or visit the portal login link.</li>
                  <li>Enter your work email: <strong>${email}</strong> and temporary password.</li>
                  <li>Upon initial sign-in, the system will prompt you to choose a new, private password.</li>
                  <li>Review your personal profile details and contact your HR Manager if you need any assistance.</li>
                </ol>
              </div>

              <!-- Security Advisory -->
              <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin: 18px 0 0; text-align: center;">
                <strong>Security Notice:</strong> Please keep your login credentials strictly confidential. Never share your password with anyone.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 22px 32px; text-align: center;">
              <p style="color: #0369a1; font-size: 13px; font-weight: 700; margin: 0 0 4px;">
                NexaHR Enterprise Human Resource Management System
              </p>
              <p style="color: #94a3b8; font-size: 12px; margin: 0 0 4px;">
                &copy; ${new Date().getFullYear()} NexaHR Systems. All rights reserved.
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

Dear ${name || 'Team Member'},

Welcome to our organization! We are thrilled to welcome you to the team. Your official employee account on the NexaHR Workforce Portal has been created.

--------------------------------------------------
YOUR LOGIN CREDENTIALS
--------------------------------------------------
Work Email         : ${email}
Temporary Password : ${tempPassword}
Employee ID / Code : ${employeeCode}
Role & Designation : ${designation} (${role})
Department         : ${department}
Office Location    : ${workLocation}
Portal Login URL   : ${loginUrl}
--------------------------------------------------

First-Time Sign-In Instructions:
1. Navigate to: ${loginUrl}
2. Enter your work email and temporary password provided above.
3. Upon first login, you will be prompted to choose a permanent, private password.
4. Review your dossier, attendance records, and organization details.

Security Notice:
Please keep these credentials strictly confidential. Never share your password with anyone.

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
  const resolvedLoginUrl = (loginUrl || (process.env.FRONTEND_URL && !process.env.FRONTEND_URL.includes('localhost') ? process.env.FRONTEND_URL : 'https://nexa-hr-xi.vercel.app/login')).trim();

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
  let emailDispatched = false;
  let deliveryError = null;

  if (transporter && email) {
    try {
      const from = getFromAddress('NexaHR People Operations');

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
      emailDispatched = true;
      console.log(`[EMAIL SUCCESS] Onboarding welcome email sent to ${email}. MessageId: ${messageId}`);
    } catch (err) {
      deliveryError = err.message;
      console.error(`[EMAIL ERROR] Failed to send onboarding welcome email to ${email}:`, err.message);
    }
  } else {
    console.log(`[EMAIL INFO] Transporter or email not available. Simulating onboarding welcome email.`);
  }

  return {
    success: emailDispatched,
    channel: 'EMAIL',
    destination: maskEmail(email),
    messageId,
    error: deliveryError,
    dispatchedAt: timestamp,
    message: emailDispatched
      ? `Welcome credentials email dispatched to ${maskEmail(email)}.`
      : `Email dispatch ${deliveryError ? 'failed: ' + deliveryError : 'simulated in dev/test'}.`,
  };
}

/**
 * Dispatches formal notification to employee when an official document is issued by HR
 */
async function sendDocumentIssuedEmail({
  email,
  name,
  documentTitle,
  documentType,
  referenceNumber,
  issuer = 'NexaHR People Operations',
  portalUrl = 'https://nexa-hr-xi.vercel.app/employee/documents',
}) {
  const timestamp = new Date().toISOString();
  console.log(`\n========================================================`);
  console.log(`[NexaHR EMAIL DISPATCH: OFFICIAL DOCUMENT ISSUED] -> ${email}`);
  console.log(`Recipient: ${name}`);
  console.log(`Document: ${documentTitle} (${documentType})`);
  console.log(`Reference No: ${referenceNumber}`);
  console.log(`Issuer: ${issuer}`);
  console.log(`Timestamp: ${timestamp}`);
  console.log(`========================================================\n`);

  const transporter = getMailTransporter();
  let messageId = null;

  if (transporter && email) {
    try {
      const from = getFromAddress('NexaHR People Operations');

      const subject = `[Official Document Issued] ${documentTitle} - Ref: ${referenceNumber}`;
      const html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px;">
          <div style="background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #312e81 100%); padding: 32px 24px; border-radius: 10px; text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; background: rgba(255, 255, 255, 0.12); padding: 4px 14px; border-radius: 20px; color: #c7d2fe; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px;">Official Document Notification</div>
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800;">NexaHR Document Vault</h1>
            <p style="color: #94a3b8; margin: 6px 0 0; font-size: 13px;">People Operations & Compliance Repository</p>
          </div>
          <p style="font-size: 15px; color: #1e293b; margin-bottom: 14px;">Dear <strong>${name || 'Team Member'}</strong>,</p>
          <p style="font-size: 14px; color: #475569; line-height: 1.6;">An official corporate document has been generated and issued to your employee profile by <strong>${issuer}</strong>.</p>
          
          <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 18px 20px; margin: 20px 0;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 13px;">
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: 600; width: 140px;">Document Title:</td>
                <td style="padding: 6px 0; color: #0f172a; font-weight: 800;">${documentTitle}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Classification:</td>
                <td style="padding: 6px 0; color: #4338ca; font-weight: 700;">${documentType}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Reference Code:</td>
                <td style="padding: 6px 0; font-family: monospace; font-weight: 700; color: #0f172a;">${referenceNumber}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Issuing Authority:</td>
                <td style="padding: 6px 0; color: #334155; font-weight: 600;">${issuer}</td>
              </tr>
            </table>
          </div>

          <p style="font-size: 13px; color: #475569; line-height: 1.5;">You can preview, review details, and download an encrypted certified copy directly from your <strong>Documents & Policies Hub</strong> on the NexaHR Portal.</p>
          
          <div style="text-align: center; margin: 28px 0 20px;">
            <a href="${portalUrl}" style="background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%); color: #ffffff; padding: 13px 30px; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 14px; display: inline-block; box-shadow: 0 4px 12px rgba(13, 148, 136, 0.3);">Access Documents Hub &rarr;</a>
          </div>

          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0 16px;" />
          <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">NexaHR Enterprise Human Resource Management System • Confidential & Proprietary</p>
        </div>
      `;

      const text = `Official Document Issued: ${documentTitle}\n\nDear ${name},\n\nAn official corporate document (${documentType}) has been issued to your profile by ${issuer}.\n\nReference: ${referenceNumber}\nAccess your document: ${portalUrl}\n\nNexaHR People Operations`;

      const info = await transporter.sendMail({
        from,
        to: email,
        subject,
        text,
        html,
      });

      messageId = info.messageId;
      console.log(`[EMAIL SUCCESS] Document issued email sent to ${email}. MessageId: ${messageId}`);
    } catch (err) {
      console.error(`[EMAIL ERROR] Failed to send document issued email to ${email}:`, err.message);
    }
  }

  return {
    success: true,
    channel: 'EMAIL',
    destination: maskEmail(email),
    messageId,
    dispatchedAt: timestamp,
  };
}

/**
 * Send Ephemeral Password Reset Link via Corporate Email
 */
async function sendPasswordResetEmail({ email, name, resetUrl, expiresInHours = 1 }) {
  console.log(`[NexaHR NOTIFICATION] Password reset link event dispatched to ${maskEmail(email)}.`);

  const transporter = getMailTransporter();
  let messageId = null;

  if (!transporter) {
    console.error(`[EMAIL ERROR] SMTP transporter not configured on server (SMTP_USER/SMTP_PASS missing). Cannot dispatch reset link to ${maskEmail(email)}.`);
    return {
      success: false,
      channel: 'EMAIL',
      destination: maskEmail(email),
      error: 'SMTP_NOT_CONFIGURED',
      message: 'Email service is not configured on the server. Please verify SMTP credentials in server environment variables.',
    };
  }

  try {
    const from = getFromAddress('NexaHR Security');
    const info = await transporter.sendMail({
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

    messageId = info?.messageId || null;
    return {
      success: true,
      channel: 'EMAIL',
      destination: maskEmail(email),
      messageId,
      dispatchedAt: new Date().toISOString(),
      message: `Password reset link dispatched to ${maskEmail(email)}.`,
    };
  } catch (err) {
    console.error('[EMAIL ERROR] Failed to send password reset email via SMTP:', err.message);
    return {
      success: false,
      channel: 'EMAIL',
      destination: maskEmail(email),
      error: 'SMTP_DISPATCH_FAILED',
      errorMessage: err.message,
      message: `Failed to deliver password reset email: ${err.message}`,
    };
  }
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
                      Valid for ${expiryMinutes} minutes
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
  console.log(`[NexaHR NOTIFICATION] 6-digit OTP verification code event dispatched to ${maskEmail(email)}.`);

  const transporter = getMailTransporter();
  let messageId = null;

  if (!transporter) {
    console.error(`[EMAIL ERROR] SMTP transporter not configured on server (SMTP_USER/SMTP_PASS missing). Cannot dispatch OTP to ${maskEmail(email)}.`);
    return {
      success: false,
      channel: 'EMAIL',
      destination: maskEmail(email),
      error: 'SMTP_NOT_CONFIGURED',
      message: 'Email service is not configured on the server. Please verify SMTP credentials in server environment variables.',
    };
  }

  try {
    const from = getFromAddress('NexaHR Security');
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

    messageId = info?.messageId || null;
    console.log(`[EMAIL SUCCESS] OTP email dispatched via SMTP to ${maskEmail(email)}. MessageId: ${messageId}`);

    return {
      success: true,
      channel: 'EMAIL',
      destination: maskEmail(email),
      messageId,
      dispatchedAt: timestamp,
      message: `Security OTP successfully dispatched to corporate email ${maskEmail(email)}.`,
    };
  } catch (err) {
    console.error(`[EMAIL ERROR] Failed to send email via SMTP to ${maskEmail(email)}:`, err.message);
    return {
      success: false,
      channel: 'EMAIL',
      destination: maskEmail(email),
      error: 'SMTP_DISPATCH_FAILED',
      errorMessage: err.message,
      message: `Failed to deliver verification email via SMTP: ${err.message}`,
    };
  }
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

  console.log(`[NexaHR NOTIFICATION] WhatsApp OTP verification code event dispatched to ${maskPhone(formattedPhone)}.`);

  if (process.env.NODE_ENV === 'test' || process.env.EMAIL_DELIVERY_MODE === 'log') {
    const record = {
      phone: formattedPhone,
      otp,
      name,
      expiryMinutes,
      messageText,
      timestamp,
      messageId: `SM_TEST_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    };
    testWhatsAppOutbox.push(record);
    console.log(`[TEST STUB] WhatsApp OTP event for ${maskPhone(formattedPhone)} recorded to test outbox.`);
    return {
      success: true,
      provider: 'TEST_STUB',
      messageId: record.messageId,
    };
  }

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
  sendTicketCreatedEmail,
  sendPayslipEmail,
  sendAttendancePunchInEmail,
  sendOnboardingWelcomeEmail,
  sendDocumentIssuedEmail,
  sendPasswordResetEmail,
  sendEmailOTP,
  sendWhatsAppOTP,
  sendOtpEmail,
  sendOtpWhatsApp,
  maskEmail,
  maskPhone,
  formatE164,
  getTestMailOutbox,
  getTestWhatsAppOutbox,
  clearTestOutboxes,
};


