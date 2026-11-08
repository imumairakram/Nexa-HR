'use strict';
/**
 * scripts/vault-import.js
 * --dry-run (default): scan the old JSON vault file and report what would be imported.
 * Since the vault was wiped, this will report 0 records to import.
 *
 * Usage:
 *   node scripts/vault-import.js            # dry-run (default, safe)
 *   node scripts/vault-import.js --execute  # NOT IMPLEMENTED — apply via prisma migrate deploy first
 *
 * Rules:
 *  - Never connects to the database in --dry-run mode.
 *  - Never prints file content, passwords, or secrets.
 *  - The vault was wiped on 2026-11-08; the JSON file is expected to be empty or missing.
 */

const fs   = require('fs');
const path = require('path');

const VAULT_FILE_PATH = path.join(__dirname, '../src/data/documents_vault.json');
const isDryRun = !process.argv.includes('--execute');

function maskHost(url = '') {
  try {
    const u = new URL(url);
    return `${u.protocol}//****.${u.hostname.split('.').slice(-2).join('.')}${u.pathname}`;
  } catch {
    return '****';
  }
}

async function main() {
  console.log('\n━━━ NexaHR Vault Import ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Mode: ${isDryRun ? 'DRY-RUN (no changes)' : 'EXECUTE (requires vault_documents table to exist)'}`);
  console.log(`Vault JSON: ${VAULT_FILE_PATH}`);
  console.log('────────────────────────────────────────────────────────────────\n');

  // Read old JSON file
  let vaultData = { documents: [], policies: [] };
  if (fs.existsSync(VAULT_FILE_PATH)) {
    try {
      const raw = fs.readFileSync(VAULT_FILE_PATH, 'utf8');
      const parsed = JSON.parse(raw);
      vaultData.documents = Array.isArray(parsed.documents) ? parsed.documents : [];
      vaultData.policies  = Array.isArray(parsed.policies)  ? parsed.policies  : [];
    } catch (err) {
      console.error('ERROR: Could not parse vault JSON:', err.message);
      process.exit(1);
    }
  } else {
    console.log('INFO: Vault JSON file not found (expected after wipe).\n');
  }

  const docCount    = vaultData.documents.length;
  const policyCount = vaultData.policies.length;

  console.log(`Issued Documents : ${docCount}`);
  console.log(`Company Policies : ${policyCount}`);
  console.log(`Total to import  : ${docCount + policyCount}\n`);

  if (docCount + policyCount === 0) {
    console.log('✅ Vault is empty — nothing to import.');
    console.log('   The database was wiped on 2026-11-08. No orphaned data exists.');
    console.log('   New documents and policies will be persisted directly via the');
    console.log('   updated document.controller.js → vault_documents table.\n');
    return;
  }

  // Report what would be imported (without printing content)
  console.log('Would import the following records:');
  vaultData.documents.forEach((d, i) => {
    console.log(`  [DOC ${i + 1}] id=${d.id} type=${d.type} ref=${d.referenceNumber}`);
  });
  vaultData.policies.forEach((p, i) => {
    console.log(`  [POL ${i + 1}] id=${p.id} category=${p.category} ref=${p.referenceNumber || 'N/A'}`);
  });

  if (isDryRun) {
    console.log('\n⚠️  DRY-RUN: No changes made.');
    console.log('   To import, first run: npx prisma migrate deploy');
    console.log('   Then: node scripts/vault-import.js --execute');
  } else {
    console.error('\nERROR: --execute mode is not yet implemented.');
    console.error('   Please apply the Prisma migration first, then import records manually');
    console.error('   or via a future --execute implementation.');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});

