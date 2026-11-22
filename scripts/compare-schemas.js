const fs = require('fs');
const path = require('path');

function parseSql(sql) {
  const lines = sql.split('\n');
  const tables = new Set();
  const views = new Set();
  const triggers = new Set();
  const functions = new Set();
  const types = new Set();
  const indexes = new Set();
  const constraints = new Set();

  for (const line of lines) {
    const trimmed = line.trim();
    // Tables
    const tableMatch = trimmed.match(/^CREATE TABLE (?:public\.)?("?[a-zA-Z0-9_]+"?) /i);
    if (tableMatch) tables.add(tableMatch[1].replace(/"/g, ''));

    // Types / Enums
    const typeMatch = trimmed.match(/^CREATE TYPE (?:public\.)?("?[a-zA-Z0-9_]+"?) /i);
    if (typeMatch) types.add(typeMatch[1].replace(/"/g, ''));

    // Triggers
    const triggerMatch = trimmed.match(/^CREATE TRIGGER ("?[a-zA-Z0-9_]+"?) /i);
    if (triggerMatch) triggers.add(triggerMatch[1].replace(/"/g, ''));

    // Functions
    const funcMatch = trimmed.match(/^CREATE FUNCTION (?:public\.)?("?[a-zA-Z0-9_]+"?) /i);
    if (funcMatch) functions.add(funcMatch[1].replace(/"/g, ''));

    // Indexes
    const idxMatch = trimmed.match(/^CREATE (?:UNIQUE )?INDEX ("?[a-zA-Z0-9_]+"?) /i);
    if (idxMatch) indexes.add(idxMatch[1].replace(/"/g, ''));

    // Constraints
    const constrMatch = trimmed.match(/ADD CONSTRAINT ("?[a-zA-Z0-9_]+"?) /i);
    if (constrMatch) constraints.add(constrMatch[1].replace(/"/g, ''));
  }

  return { tables, views, triggers, functions, types, indexes, constraints };
}

function diffSets(name, setA, setB, labelA = 'Scratch', labelB = 'Live') {
  const onlyInA = [...setA].filter(x => !setB.has(x)).sort();
  const onlyInB = [...setB].filter(x => !setA.has(x)).sort();
  console.log(`\n--- ${name} Comparison ---`);
  console.log(`Total in ${labelA}: ${setA.size}, Total in ${labelB}: ${setB.size}`);
  if (onlyInA.length === 0 && onlyInB.length === 0) {
    console.log(`[PERFECT MATCH] All ${setA.size} ${name.toLowerCase()} are identical.`);
  } else {
    if (onlyInA.length > 0) console.log(`Only in ${labelA} (${onlyInA.length}):`, onlyInA.join(', '));
    if (onlyInB.length > 0) console.log(`Only in ${labelB} (${onlyInB.length}):`, onlyInB.join(', '));
  }
  return { onlyInA, onlyInB };
}

function run() {
  if (!fs.existsSync('scratch_schema.sql') || !fs.existsSync('live_schema.sql')) {
    console.log('Schema files not ready yet.');
    return;
  }
  const scratchSql = fs.readFileSync('scratch_schema.sql', 'utf8');
  const liveSql = fs.readFileSync('live_schema.sql', 'utf8');

  const scratch = parseSql(scratchSql);
  const live = parseSql(liveSql);

  console.log('=====================================================');
  console.log('DETAILED SCHEMA EQUIVALENCE COMPARISON (SCRATCH VS LIVE)');
  console.log('=====================================================');

  diffSets('Tables', scratch.tables, live.tables);
  diffSets('Types/Enums', scratch.types, live.types);
  diffSets('Triggers', scratch.triggers, live.triggers);
  diffSets('Functions', scratch.functions, live.functions);
  diffSets('Indexes', scratch.indexes, live.indexes);
  diffSets('Constraints', scratch.constraints, live.constraints);
}

run();
