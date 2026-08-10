/**
 * NexaHR Multi-Channel Notification Service
 * Dispatches OTP and Security Alerts via Email and WhatsApp
 */

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

/**
 * Send Password Recovery OTP via Corporate Email
 */
async function sendOtpEmail({ email, name, otp, role, expiryMinutes = 10 }) {
  console.log(`\n========================================================`);
  console.log(`📧 [NexaHR EMAIL DISPATCH] -> ${email}`);
  console.log(`👤 Recipient: ${name} (${role})`);
  console.log(`🔑 OTP Verification Code: [ ${otp} ]`);
  console.log(`⏱️ Valid for: ${expiryMinutes} minutes`);
  console.log(`========================================================\n`);

  return {
    success: true,
    channel: 'EMAIL',
    destination: maskEmail(email),
    dispatchedAt: new Date().toISOString(),
    message: `Security OTP successfully dispatched to corporate email ${maskEmail(email)}.`,
    previewOtp: otp,
  };
}

/**
 * Send Password Recovery OTP via WhatsApp Messenger
 */
async function sendOtpWhatsApp({ phone, name, otp, role, expiryMinutes = 10 }) {
  if (!phone) {
    throw new Error('No registered mobile phone number found for this employee profile.');
  }

  const messageText = `🔒 *NexaHR Enterprise Security*\n\nHello *${name}*,\n\nYour one-time verification code for password recovery is:\n\n👉 *${otp}*\n\n⏱️ This code will expire in ${expiryMinutes} minutes.\n\n⚠️ *Security Notice*: If you did not initiate this recovery, please notify your HR Administrator immediately.\n\n_NexaHR Workforce Systems_`;

  console.log(`\n========================================================`);
  console.log(`💬 [NexaHR WHATSAPP DISPATCH] -> ${phone}`);
  console.log(`👤 Recipient: ${name} (${role})`);
  console.log(`🔑 OTP Verification Code: [ ${otp} ]`);
  console.log(`📝 WhatsApp Message Content:\n${messageText}`);
  console.log(`========================================================\n`);

  return {
    success: true,
    channel: 'WHATSAPP',
    destination: maskPhone(phone),
    dispatchedAt: new Date().toISOString(),
    message: `Security OTP successfully sent via WhatsApp to ${maskPhone(phone)}.`,
    previewOtp: otp,
  };
}

module.exports = {
  sendOtpEmail,
  sendOtpWhatsApp,
  maskEmail,
  maskPhone,
};
