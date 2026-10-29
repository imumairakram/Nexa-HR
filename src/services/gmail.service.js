const { google } = require('googleapis');
const cron = require('node-cron');

const GMAIL_SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.modify',
];

const PROCESSED_LABEL_NAME = 'NexaHR-Processed';
const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024; // 10 MB

let cronTask = null;
let cachedLabelId = null;

/**
 * Checks if all required Gmail credentials are set
 */
function isGmailConfigured() {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GMAIL_REFRESH_TOKEN
  );
}

/**
 * Creates an authorized OAuth2 client using the refresh token
 */
function getOAuth2Client() {
  if (!isGmailConfigured()) return null;

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/oauth2callback'
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.GMAIL_REFRESH_TOKEN,
  });

  return oauth2Client;
}

/**
 * Returns an authenticated Gmail API client
 */
function getGmailClient() {
  const auth = getOAuth2Client();
  if (!auth) return null;
  return google.gmail({ version: 'v1', auth });
}

/**
 * Ensures the NexaHR-Processed label exists on the mailbox and returns its ID
 */
async function getOrCreateProcessedLabel(gmail, userId = 'me') {
  if (cachedLabelId) return cachedLabelId;

  try {
    const res = await gmail.users.labels.list({ userId });
    const labels = res.data.labels || [];
    const existing = labels.find((l) => l.name.toLowerCase() === PROCESSED_LABEL_NAME.toLowerCase());

    if (existing) {
      cachedLabelId = existing.id;
      return existing.id;
    }

    const created = await gmail.users.labels.create({
      userId,
      requestBody: {
        name: PROCESSED_LABEL_NAME,
        labelListVisibility: 'labelShow',
        messageListVisibility: 'show',
      },
    });

    cachedLabelId = created.data.id;
    return cachedLabelId;
  } catch (error) {
    console.error('[GMAIL SERVICE] Failed to get or create NexaHR-Processed label:', error.message);
    throw error;
  }
}

/**
 * Parses email "From" header into name and clean email address
 * e.g. "Jane Doe <jane.doe@example.com>" -> { name: "Jane Doe", email: "jane.doe@example.com" }
 */
function parseSender(fromHeader = '') {
  if (!fromHeader) return { name: 'Unknown Candidate', email: 'unknown@talent.org' };

  const match = fromHeader.match(/^(?:["']?([^"']+)["']?\s*)?<([^>]+)>$/);
  if (match) {
    const name = (match[1] || '').trim();
    const email = (match[2] || '').trim().toLowerCase();
    return { name: name || email.split('@')[0], email };
  }

  const clean = fromHeader.trim().replace(/[<>]/g, '');
  return { name: clean.split('@')[0], email: clean.toLowerCase() };
}

/**
 * Recursively extracts plain text body from Gmail message payload parts
 */
function extractBodyText(payload) {
  if (!payload) return '';

  if (payload.mimeType === 'text/plain' && payload.body?.data) {
    return Buffer.from(payload.body.data, 'base64url').toString('utf8');
  }

  let text = '';
  if (payload.parts && Array.isArray(payload.parts)) {
    for (const part of payload.parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        text += Buffer.from(part.body.data, 'base64url').toString('utf8') + '\n';
      } else if (part.parts) {
        text += extractBodyText(part) + '\n';
      }
    }
  }

  // Fallback to HTML if plain text empty
  if (!text.trim() && payload.mimeType === 'text/html' && payload.body?.data) {
    const html = Buffer.from(payload.body.data, 'base64url').toString('utf8');
    text = html.replace(/<[^>]+>/g, ' '); // Strip HTML tags
  }

  return text.trim();
}

/**
 * Recursively locates PDF and DOCX attachments from Gmail message payload parts
 */
function findCvAttachments(payload, messageId) {
  const attachments = [];
  if (!payload) return attachments;

  function traverse(part) {
    const filename = part.filename || '';
    const lower = filename.toLowerCase();
    const isDoc = lower.endsWith('.pdf') || lower.endsWith('.docx');

    if (isDoc && part.body?.attachmentId) {
      const size = part.body.size || 0;
      if (size <= MAX_ATTACHMENT_BYTES) {
        attachments.push({
          messageId,
          attachmentId: part.body.attachmentId,
          filename,
          mimeType: part.mimeType,
          size,
        });
      } else {
        console.warn(`[GMAIL SERVICE] Attachment "${filename}" exceeds 10MB limit (${size} bytes). Skipping.`);
      }
    }

    if (part.parts && Array.isArray(part.parts)) {
      for (const subPart of part.parts) {
        traverse(subPart);
      }
    }
  }

  traverse(payload);
  return attachments;
}

/**
 * Downloads a single attachment buffer from Gmail API
 */
async function downloadAttachmentBuffer(gmail, userId, messageId, attachmentId) {
  const res = await gmail.users.messages.attachments.get({
    userId,
    messageId,
    id: attachmentId,
  });

  const rawData = res.data.data;
  if (!rawData) {
    throw new Error(`Empty attachment data received for attachment ID: ${attachmentId}`);
  }

  return Buffer.from(rawData, 'base64url');
}

/**
 * Fetches unread application emails matching query
 * @param {Object} options
 * @param {number} [options.maxResults=10]
 * @returns {Promise<Array<Object>>}
 */
async function fetchApplicationEmails({ maxResults = 10 } = {}) {
  const gmail = getGmailClient();
  if (!gmail) {
    console.warn('[GMAIL SERVICE] Cannot fetch emails: Gmail credentials not configured.');
    return [];
  }

  const userId = process.env.GMAIL_HR_ADDRESS || 'me';
  const query = process.env.GMAIL_SEARCH_QUERY || 'is:unread has:attachment -label:NexaHR-Processed';

  const listRes = await gmail.users.messages.list({
    userId,
    q: query,
    maxResults,
  });

  const messageList = listRes.data.messages || [];
  if (messageList.length === 0) {
    return [];
  }

  const processedLabelId = await getOrCreateProcessedLabel(gmail, userId);
  const emails = [];

  for (const item of messageList) {
    try {
      const msgRes = await gmail.users.messages.get({
        userId,
        id: item.id,
        format: 'full',
      });

      const message = msgRes.data;
      const headers = message.payload?.headers || [];
      const getHeader = (name) => headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value || '';

      const from = getHeader('from');
      const subject = getHeader('subject');
      const date = getHeader('date');
      const { name: senderName, email: senderEmail } = parseSender(from);
      const bodyText = extractBodyText(message.payload);

      const attachmentsMeta = findCvAttachments(message.payload, message.id);

      // Download buffers for valid CV attachments
      const loadedAttachments = [];
      for (const att of attachmentsMeta) {
        try {
          const buffer = await downloadAttachmentBuffer(gmail, userId, message.id, att.attachmentId);
          loadedAttachments.push({
            ...att,
            buffer,
          });
        } catch (downloadErr) {
          console.error(`[GMAIL SERVICE] Failed to download attachment "${att.filename}":`, downloadErr.message);
        }
      }

      // Only include emails that have at least one valid CV attachment
      if (loadedAttachments.length > 0) {
        emails.push({
          messageId: message.id,
          threadId: message.threadId,
          senderName,
          senderEmail,
          subject,
          date,
          bodyText,
          attachments: loadedAttachments,
        });
      } else {
        // If no PDF/DOCX attachment found, mark processed so we don't inspect repeatedly
        console.log(`[GMAIL SERVICE] Email "${subject}" (${message.id}) has no valid PDF/DOCX attachment. Marking processed.`);
        await markEmailAsProcessed(message.id);
      }
    } catch (msgErr) {
      console.error(`[GMAIL SERVICE] Error inspecting email message ${item.id}:`, msgErr.message);
    }
  }

  return emails;
}

/**
 * Marks a Gmail message as processed:
 * 1. Adds label 'NexaHR-Processed'
 * 2. Removes 'UNREAD' label
 */
async function markEmailAsProcessed(messageId) {
  const gmail = getGmailClient();
  if (!gmail) return;

  const userId = process.env.GMAIL_HR_ADDRESS || 'me';
  try {
    const processedLabelId = await getOrCreateProcessedLabel(gmail, userId);
    await gmail.users.messages.modify({
      userId,
      id: messageId,
      requestBody: {
        addLabelIds: [processedLabelId],
        removeLabelIds: ['UNREAD'],
      },
    });
  } catch (error) {
    console.error(`[GMAIL SERVICE] Failed to mark message ${messageId} as processed:`, error.message);
  }
}

/**
 * Initializes background cron polling for incoming Gmail applications
 *
 * @param {Function} onBatchReady - Callback to execute the ATS pipeline on the fetched emails
 */
function startGmailPolling(onBatchReady) {
  if (!isGmailConfigured()) {
    console.log(
      '[GMAIL ATS] Polling inactive: Missing credentials (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, or GMAIL_REFRESH_TOKEN).'
    );
    return null;
  }

  const cronExpr = process.env.GMAIL_POLL_CRON || '*/5 * * * *'; // Default every 5 minutes
  console.log(`[GMAIL ATS] Background polling scheduled with cron "${cronExpr}"`);

  cronTask = cron.schedule(cronExpr, async () => {
    try {
      console.log(`[${new Date().toISOString()}] [GMAIL ATS] Checking HR inbox for new application emails...`);
      const emails = await fetchApplicationEmails({ maxResults: 10 });
      if (emails.length > 0 && typeof onBatchReady === 'function') {
        console.log(`[GMAIL ATS] Found ${emails.length} new application email(s). Triggering ATS pipeline.`);
        await onBatchReady(emails);
      } else {
        console.log('[GMAIL ATS] No new candidate application emails found.');
      }
    } catch (cronErr) {
      console.error('[GMAIL ATS] Error during background polling cycle:', cronErr.message);
    }
  });

  return cronTask;
}

/**
 * Stops active background cron polling
 */
function stopGmailPolling() {
  if (cronTask) {
    cronTask.stop();
    cronTask = null;
    console.log('[GMAIL ATS] Background polling stopped.');
  }
}

module.exports = {
  isGmailConfigured,
  getOAuth2Client,
  getGmailClient,
  fetchApplicationEmails,
  markEmailAsProcessed,
  startGmailPolling,
  stopGmailPolling,
  parseSender,
  extractBodyText,
  GMAIL_SCOPES,
};

