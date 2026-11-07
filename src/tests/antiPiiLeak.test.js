const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

// Enforce zero external network calls
const { installNetworkGuard } = require('./helpers/networkGuard');
installNetworkGuard();

function getAllFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== 'dist') {
        getAllFiles(fullPath, fileList);
      }
    } else {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

test('Anti-PII Leak Guard - Zero real personal emails in code or client', async () => {
  const forbiddenPatterns = [
    'umairdevelop',
    'umaaiirakram',
    'muhammadum9ir',
    'mumairakramaptech',
  ];
  const rootDir = path.resolve(__dirname, '../..');
  const targetDirs = [
    path.join(rootDir, 'src'),
    path.join(rootDir, 'client', 'src'),
    path.join(rootDir, 'scripts'),
    path.join(rootDir, 'prisma'),
  ];

  const violations = [];

  for (const targetDir of targetDirs) {
    const files = getAllFiles(targetDir);
    for (const filePath of files) {
      // Exclude this test file itself
      if (path.resolve(filePath) === path.resolve(__filename)) {
        continue;
      }

      const content = fs.readFileSync(filePath, 'utf8');
      for (const pattern of forbiddenPatterns) {
        if (content.toLowerCase().includes(pattern.toLowerCase())) {
          violations.push({
            file: path.relative(rootDir, filePath),
            pattern,
          });
        }
      }
    }
  }

  assert.equal(
    violations.length,
    0,
    `Found forbidden personal email patterns in codebase: ${JSON.stringify(violations, null, 2)}`
  );
});

