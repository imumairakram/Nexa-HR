const crypto = require('crypto');
const fs = require('fs');

const target1031 = '24339110f1671dd4fd70393c863a7843678e00e766a01f66b377aaa8478f4443';
const target1121 = '611318dd7fde3f03958716998acbd6f7ffe781ea3fc5c09c757522e05068f272';

// 1. Let's find 20261031211000 content
const p1031 = 'prisma/migrations/20261031211000_add_job_application_status_aistatus_idx/migration.sql';
const orig1031 = fs.readFileSync(p1031, 'utf8');

// Variations of 1031
const var1031 = [
  '-- CreateIndex\nCREATE INDEX "job_applications_status_aiStatus_idx" ON "job_applications"("status", "aiStatus");\n',
  '-- CreateIndex\r\nCREATE INDEX "job_applications_status_aiStatus_idx" ON "job_applications"("status", "aiStatus");\r\n',
  '-- CreateIndex\nCREATE INDEX "job_applications_status_aiStatus_idx" ON "job_applications"("status", "aiStatus");',
  '-- CreateIndex\r\nCREATE INDEX "job_applications_status_aiStatus_idx" ON "job_applications"("status", "aiStatus");',
  'CREATE INDEX "job_applications_status_aiStatus_idx" ON "job_applications"("status", "aiStatus");\n',
  'CREATE INDEX "job_applications_status_aiStatus_idx" ON "job_applications"("status", "aiStatus");\r\n',
  '-- CreateIndex\nCREATE INDEX IF NOT EXISTS "job_applications_status_aiStatus_idx" ON "job_applications"("status", "aiStatus");\n',
  '-- CreateIndex\r\nCREATE INDEX IF NOT EXISTS "job_applications_status_aiStatus_idx" ON "job_applications"("status", "aiStatus");\r\n',
  '-- CreateIndex\nCREATE INDEX IF NOT EXISTS "job_applications_status_aiStatus_idx" ON "job_applications"("status", "aiStatus");',
  '-- CreateIndex\r\nCREATE INDEX IF NOT EXISTS "job_applications_status_aiStatus_idx" ON "job_applications"("status", "aiStatus");',
  '-- CreateIndex\nCREATE INDEX IF NOT EXISTS job_applications_status_aiStatus_idx ON job_applications(status, aiStatus);\n',
];

let match1031 = null;
for (const v of var1031) {
  const h = crypto.createHash('sha256').update(v).digest('hex');
  console.log('Testing v hash:', h, 'target:', target1031, 'match:', h === target1031);
  if (h === target1031) {
    console.log('FOUND MATCH FOR 20261031211000!');
    console.log('Matched content:', JSON.stringify(v));
    match1031 = v;
    break;
  }
}

// 2. Let's inspect git commits for 20261121213000
const { execSync } = require('child_process');
const commits = execSync('git log --format="%H" prisma/migrations/20261121213000_sync_schema_drift/migration.sql', { encoding: 'utf8' }).trim().split('\n');

console.log('Checking git history for 20261121213000 across', commits.length, 'commits...');
let match1121 = null;
for (const c of commits) {
  try {
    const raw = execSync(`git show ${c}:prisma/migrations/20261121213000_sync_schema_drift/migration.sql`, { encoding: 'utf8' });
    const hLf = crypto.createHash('sha256').update(raw.replace(/\r\n/g, '\n')).digest('hex');
    const hCrlf = crypto.createHash('sha256').update(raw.replace(/\r\n/g, '\n').replace(/\n/g, '\r\n')).digest('hex');
    const hRaw = crypto.createHash('sha256').update(raw).digest('hex');

    if (hLf === target1121) {
      console.log('FOUND MATCH FOR 20261121213000 with LF at commit', c);
      match1121 = raw.replace(/\r\n/g, '\n');
      break;
    }
    if (hCrlf === target1121) {
      console.log('FOUND MATCH FOR 20261121213000 with CRLF at commit', c);
      match1121 = raw.replace(/\r\n/g, '\n').replace(/\n/g, '\r\n');
      break;
    }
    if (hRaw === target1121) {
      console.log('FOUND MATCH FOR 20261121213000 RAW at commit', c);
      match1121 = raw;
      break;
    }
  } catch(e) {}
}

console.log('Summary:');
console.log('20261031211000 matched:', !!match1031);
console.log('20261121213000 matched:', !!match1121);
