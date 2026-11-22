const fs = require('fs');
const crypto = require('crypto');

// 1. Restore 20261031211000
const p1031 = 'prisma/migrations/20261031211000_add_job_application_status_aistatus_idx/migration.sql';
const content1031 = '-- CreateIndex\nCREATE INDEX IF NOT EXISTS "job_applications_status_aiStatus_idx" ON "job_applications"("status", "aiStatus");\n';
fs.writeFileSync(p1031, content1031, 'utf8');

// 2. Restore 20261121213000
const p1121 = 'prisma/migrations/20261121213000_sync_schema_drift/migration.sql';
const content1121 = fs.readFileSync('temp_step11282.sql', 'utf8').replace(/\r\n/g, '\n');
fs.writeFileSync(p1121, content1121, 'utf8');

const h1031 = crypto.createHash('sha256').update(fs.readFileSync(p1031)).digest('hex');
const h1121 = crypto.createHash('sha256').update(fs.readFileSync(p1121)).digest('hex');

const exp1031 = '24339110f1671dd4fd70393c863a7843678e00e766a01f66b377aaa8478f4443';
const exp1121 = '611318dd7fde3f03958716998acbd6f7ffe781ea3fc5c09c757522e05068f272';

console.log('20261031211000 Hash:', h1031);
console.log('20261031211000 Expected:', exp1031);
console.log('20261031211000 Match:', h1031 === exp1031);

console.log('20261121213000 Hash:', h1121);
console.log('20261121213000 Expected:', exp1121);
console.log('20261121213000 Match:', h1121 === exp1121);
