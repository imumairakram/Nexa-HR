const fs = require('fs');
const path = require('path');

const migrationsDir = path.resolve('prisma/migrations');

function scanMigrations() {
  const folders = fs.readdirSync(migrationsDir).filter(f => {
    return fs.statSync(path.join(migrationsDir, f)).isDirectory() && f !== 'migration_lock.toml';
  }).sort();

  console.log('=====================================================');
  console.log('AUDIT OF DESTRUCTIVE DDL STATEMENTS IN APPLIED MIGRATIONS');
  console.log('=====================================================\n');

  const drops = [];

  for (const folder of folders) {
    const file = path.join(migrationsDir, folder, 'migration.sql');
    if (!fs.existsSync(file)) continue;
    const sql = fs.readFileSync(file, 'utf8');
    const lines = sql.split('\n');

    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (
        /DROP\s+TABLE/i.test(trimmed) ||
        /DROP\s+COLUMN/i.test(trimmed) ||
        /DROP\s+TYPE/i.test(trimmed) ||
        /ALTER\s+TABLE\s+.*DROP\s+/i.test(trimmed) ||
        /DROP\s+INDEX/i.test(trimmed) ||
        /DROP\s+TRIGGER/i.test(trimmed)
      ) {
        drops.push({
          migration: folder,
          line: idx + 1,
          sql: trimmed,
        });
      }
    });
  }

  drops.forEach(d => {
    console.log(`[${d.migration}:${d.line}] ${d.sql}`);
  });

  console.log(`\nTotal destructive statements found: ${drops.length}`);
}

scanMigrations();
