/**
 * src/tests/gmailSystemMailFilter.test.js
 *
 * Tests for Gmail ATS Poller system mail / bounce filtering,
 * ignored label handling, attachment requirements, and sync telemetry.
 */

const test = require('node:test');
const assert = require('node:assert/strict');

// Guarantee zero external network calls
const { installNetworkGuard } = require('./helpers/networkGuard');
installNetworkGuard();

const {
  isSystemOrBounceEmail,
  parseSender,
  findCvAttachments,
  getIgnoredCount,
  incrementIgnoredCount,
  resetIgnoredCount,
  DEFAULT_GMAIL_SEARCH_QUERY,
  IGNORED_LABEL_NAME,
  PROCESSED_LABEL_NAME,
} = require('../services/gmail.service');

const { getSyncStatus } = require('../services/atsPipeline.service');
const prisma = require('../config/prisma');

test('Gmail System Mail Filter & Guard Tests', async (t) => {
  // Set up mock HR mailbox address for testing self-sent filters
  const originalHrAddr = process.env.GMAIL_HR_ADDRESS;
  const originalSmtpUser = process.env.SMTP_USER;
  process.env.GMAIL_HR_ADDRESS = 'hr@nexahr.com';
  process.env.SMTP_USER = 'notifications@nexahr.com';

  t.after(async () => {
    process.env.GMAIL_HR_ADDRESS = originalHrAddr;
    process.env.SMTP_USER = originalSmtpUser;
    resetIgnoredCount();
    await prisma.$disconnect().catch(() => {});
  });

  await t.test('passes normal candidate job application email', () => {
    const check = isSystemOrBounceEmail({
      from: 'Jane Doe <jane.doe@example.com>',
      subject: 'Application for Senior Frontend Engineer',
      headers: [
        { name: 'From', value: 'Jane Doe <jane.doe@example.com>' },
        { name: 'Subject', value: 'Application for Senior Frontend Engineer' },
        { name: 'Auto-Submitted', value: 'no' },
      ],
      payload: { mimeType: 'multipart/mixed' },
    });

    assert.equal(check.isBounce, false);
  });

  await t.test('detects mailer-daemon bounce email', () => {
    const check1 = isSystemOrBounceEmail({
      from: 'Mail Delivery Subsystem <mailer-daemon@googlemail.com>',
      subject: 'Delivery Status Notification (Failure)',
      headers: [
        { name: 'From', value: 'Mail Delivery Subsystem <mailer-daemon@googlemail.com>' },
        { name: 'Subject', value: 'Delivery Status Notification (Failure)' },
      ],
    });
    assert.equal(check1.isBounce, true);
    assert.match(check1.reason, /mailer-daemon/i);

    // Return-path mailer-daemon
    const check2 = isSystemOrBounceEmail({
      from: 'unknown@somedomain.com',
      headers: [
        { name: 'Return-Path', value: '<MAILER-DAEMON@mail.server.com>' },
      ],
    });
    assert.equal(check2.isBounce, true);
    assert.match(check2.reason, /mailer-daemon/i);
  });

  await t.test('detects postmaster notification email', () => {
    const check = isSystemOrBounceEmail({
      from: 'Postmaster <postmaster@relay.somedomain.com>',
      subject: 'Undeliverable mail notice',
    });
    assert.equal(check.isBounce, true);
    assert.match(check.reason, /postmaster/i);
  });

  await t.test('detects no-reply and automated sender address', () => {
    const check = isSystemOrBounceEmail({
      from: 'Noreply System <no-reply@service.com>',
      subject: 'Candidate status update',
    });
    assert.equal(check.isBounce, true);
    assert.match(check.reason, /no-reply/i);
  });

  await t.test('detects self-sent email from HR / system mailbox', () => {
    const checkFromHr = isSystemOrBounceEmail({
      from: 'NexaHR Team <hr@nexahr.com>',
      subject: 'Test email from myself',
    });
    assert.equal(checkFromHr.isBounce, true);
    assert.match(checkFromHr.reason, /self-sent/i);

    const checkFromMe = isSystemOrBounceEmail({
      from: 'me',
      subject: 'Draft candidate note',
    });
    assert.equal(checkFromMe.isBounce, true);
    assert.match(checkFromMe.reason, /self-sent/i);
  });

  await t.test('detects Auto-Submitted header when not "no"', () => {
    const check = isSystemOrBounceEmail({
      from: 'Employee <employee@company.com>',
      subject: 'Out of Office reply',
      headers: [
        { name: 'Auto-Submitted', value: 'auto-replied' },
      ],
    });
    assert.equal(check.isBounce, true);
    assert.match(check.reason, /auto-submitted/i);
  });

  await t.test('detects X-Failed-Recipients bounce header', () => {
    const check = isSystemOrBounceEmail({
      from: 'System Mailer <system@domain.com>',
      subject: 'Returned email',
      headers: [
        { name: 'X-Failed-Recipients', value: 'nonexistent-user@invalid.com' },
      ],
    });
    assert.equal(check.isBounce, true);
    assert.match(check.reason, /X-Failed-Recipients/i);
  });

  await t.test('detects Precedence header (bulk, auto_reply, junk, list)', () => {
    for (const prec of ['bulk', 'auto_reply', 'junk', 'list']) {
      const check = isSystemOrBounceEmail({
        from: 'Marketing List <promo@marketing.com>',
        subject: 'Weekly Digest',
        headers: [{ name: 'Precedence', value: prec }],
      });
      assert.equal(check.isBounce, true, `Expected Precedence: ${prec} to be detected as bounce/automated`);
    }
  });

  await t.test('detects Content-Type: multipart/report', () => {
    const check = isSystemOrBounceEmail({
      from: 'Relay Server <relay@mta.com>',
      subject: 'Notice',
      headers: [{ name: 'Content-Type', value: 'multipart/report; report-type=delivery-status' }],
    });
    assert.equal(check.isBounce, true);
    assert.match(check.reason, /multipart\/report/i);
  });

  await t.test('detects common NDR and bounce subject patterns', () => {
    const bounceSubjects = [
      'Delivery Status Notification (Failure)',
      'Undeliverable: Resume Submission',
      'Mail delivery failed: returning message to sender',
      'Returned mail: User unknown',
      'Failure notice',
      'Automatic reply: I am away from desk',
      'Out of Office: Leave notice',
    ];

    for (const subj of bounceSubjects) {
      const check = isSystemOrBounceEmail({
        from: 'sender@randomdomain.com',
        subject: subj,
      });
      assert.equal(check.isBounce, true, `Expected subject "${subj}" to be detected as bounce`);
    }
  });

  await t.test('requires valid PDF or DOCX attachment (<= 10MB)', () => {
    // 1. Email with only an image (e.g. signature logo png)
    const payloadWithJpgOnly = {
      filename: 'logo.png',
      mimeType: 'image/png',
      body: { attachmentId: 'att-1', size: 1024 },
    };
    const cvs1 = findCvAttachments(payloadWithJpgOnly, 'msg-1');
    assert.equal(cvs1.length, 0, 'Image-only email must yield zero CV attachments');

    // 2. Email with valid PDF (2MB)
    const payloadWithPdf = {
      parts: [
        {
          filename: 'Resume_Jane_Doe.pdf',
          mimeType: 'application/pdf',
          body: { attachmentId: 'att-2', size: 2 * 1024 * 1024 },
        },
      ],
    };
    const cvs2 = findCvAttachments(payloadWithPdf, 'msg-2');
    assert.equal(cvs2.length, 1);
    assert.equal(cvs2[0].filename, 'Resume_Jane_Doe.pdf');

    // 3. Email with oversized DOCX (> 10MB)
    const payloadWithOversizedDocx = {
      parts: [
        {
          filename: 'Massive_Portfolio.docx',
          mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          body: { attachmentId: 'att-3', size: 15 * 1024 * 1024 }, // 15MB
        },
      ],
    };
    const cvs3 = findCvAttachments(payloadWithOversizedDocx, 'msg-3');
    assert.equal(cvs3.length, 0, 'Oversized attachment (> 10MB) must be ignored');
  });

  await t.test('default search query excludes system senders and bounce terms', () => {
    assert.match(DEFAULT_GMAIL_SEARCH_QUERY, /-label:NexaHR-Ignored/);
    assert.match(DEFAULT_GMAIL_SEARCH_QUERY, /-from:mailer-daemon/);
    assert.match(DEFAULT_GMAIL_SEARCH_QUERY, /-from:postmaster/);
    assert.match(DEFAULT_GMAIL_SEARCH_QUERY, /-from:me/);
    assert.match(DEFAULT_GMAIL_SEARCH_QUERY, /-subject:\("Delivery Status Notification"\)/);
  });

  await t.test('tracks ignoredCount in sync telemetry status', () => {
    resetIgnoredCount();
    const initialStatus = getSyncStatus();
    const initialIgnored = initialStatus.ignoredCount || 0;

    incrementIgnoredCount(2);

    const updatedStatus = getSyncStatus();
    assert.equal(updatedStatus.ignoredCount, initialIgnored + 2);
  });
});
