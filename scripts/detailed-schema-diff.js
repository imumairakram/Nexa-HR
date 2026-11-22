const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const liveUrl = process.env.LIVE_DIRECT_URL || process.env.DIRECT_URL;
const scratchUrl = process.env.DIRECT_URL;

async function extractSchema(url, label) {
  const prisma = new PrismaClient({ datasources: { db: { url } } });
  try {
    // 1. Tables
    const tables = await prisma.$queryRawUnsafe(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    // 2. Columns
    const columns = await prisma.$queryRawUnsafe(`
      SELECT table_name, column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public'
      ORDER BY table_name, column_name;
    `);

    // 3. Enums
    const enums = await prisma.$queryRawUnsafe(`
      SELECT t.typname as enum_name, e.enumlabel as label, e.enumsortorder as sort_order
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      JOIN pg_namespace n ON t.typnamespace = n.oid
      WHERE n.nspname = 'public'
      ORDER BY t.typname, e.enumsortorder;
    `);

    // 4. Triggers
    const triggers = await prisma.$queryRawUnsafe(`
      SELECT event_object_table as table_name, trigger_name, action_timing, event_manipulation, action_statement
      FROM information_schema.triggers
      WHERE trigger_schema = 'public'
      ORDER BY event_object_table, trigger_name;
    `);

    // 5. Constraints
    const constraints = await prisma.$queryRawUnsafe(`
      SELECT tc.table_name, tc.constraint_name, tc.constraint_type
      FROM information_schema.table_constraints tc
      WHERE tc.table_schema = 'public'
      ORDER BY tc.table_name, tc.constraint_name;
    `);

    // 6. Indexes
    const indexes = await prisma.$queryRawUnsafe(`
      SELECT tablename as table_name, indexname as index_name, indexdef
      FROM pg_indexes
      WHERE schemaname = 'public'
      ORDER BY tablename, indexname;
    `);

    return {
      label,
      tables: tables.map(t => t.table_name),
      columns,
      enums,
      triggers,
      constraints,
      indexes,
    };
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  console.log('Extracting Live DB schema (read-only)...');
  const live = await extractSchema(process.env.LIVE_DIRECT_URL, 'Live');

  console.log('Extracting Scratch DB schema...');
  const scratch = await extractSchema(scratchUrl, 'Scratch');

  console.log('\n=====================================================');
  console.log('SCHEMA EQUIVALENCE REPORT (LIVE vs SCRATCH)');
  console.log('=====================================================');

  // Compare Tables
  compareArrays(live.tables, scratch.tables, 'Tables');

  // Compare Enums
  const liveEnums = groupEnums(live.enums);
  const scratchEnums = groupEnums(scratch.enums);
  compareEnumGroups(liveEnums, scratchEnums);

  // Compare Triggers
  const liveTriggers = live.triggers.map(t => `${t.table_name}.${t.trigger_name}`);
  const scratchTriggers = scratch.triggers.map(t => `${t.table_name}.${t.trigger_name}`);
  compareArrays(liveTriggers, scratchTriggers, 'Triggers');

  // Compare Indexes
  const liveIndexes = live.indexes.map(i => `${i.table_name}.${i.index_name}`);
  const scratchIndexes = scratch.indexes.map(i => `${i.table_name}.${i.index_name}`);
  compareArrays(liveIndexes, scratchIndexes, 'Indexes');

  // Compare Columns summary
  console.log(`\nLive Total Columns: ${live.columns.length}, Scratch Total Columns: ${scratch.columns.length}`);

  // Find column differences
  const colMapLive = new Map(live.columns.map(c => [`${c.table_name}.${c.column_name}`, c]));
  const colMapScratch = new Map(scratch.columns.map(c => [`${c.table_name}.${c.column_name}`, c]));

  const colsOnlyInLive = [];
  const colsOnlyInScratch = [];
  const colTypeMismatches = [];

  for (const [k, c] of colMapLive.entries()) {
    if (!colMapScratch.has(k)) {
      colsOnlyInLive.push(k);
    } else {
      const sc = colMapScratch.get(k);
      if (sc.data_type !== c.data_type) {
        colTypeMismatches.push(`${k}: Live=${c.data_type} vs Scratch=${sc.data_type}`);
      }
    }
  }
  for (const [k, c] of colMapScratch.entries()) {
    if (!colMapLive.has(k)) {
      colsOnlyInScratch.push(k);
    }
  }

  console.log('\n--- Columns Comparison ---');
  if (colsOnlyInLive.length) console.log('Columns only in Live:', colsOnlyInLive);
  if (colsOnlyInScratch.length) console.log('Columns only in Scratch:', colsOnlyInScratch);
  if (colTypeMismatches.length) console.log('Column Type Mismatches:', colTypeMismatches);
  if (!colsOnlyInLive.length && !colsOnlyInScratch.length && !colTypeMismatches.length) {
    console.log('[PERFECT COLUMN MATCH] All columns exist and have identical types.');
  }
}

function compareArrays(arrA, arrB, name) {
  const setA = new Set(arrA);
  const setB = new Set(arrB);
  const onlyInA = [...setA].filter(x => !setB.has(x)).sort();
  const onlyInB = [...setB].filter(x => !setA.has(x)).sort();
  console.log(`\n--- ${name} ---`);
  console.log(`Live: ${setA.size}, Scratch: ${setB.size}`);
  if (onlyInA.length === 0 && onlyInB.length === 0) {
    console.log(`[IDENTICAL] All ${setA.size} ${name.toLowerCase()} match perfectly.`);
  } else {
    if (onlyInA.length) console.log(`Only in Live (${onlyInA.length}):`, onlyInA.join(', '));
    if (onlyInB.length) console.log(`Only in Scratch (${onlyInB.length}):`, onlyInB.join(', '));
  }
  return { onlyInA, onlyInB };
}

function groupEnums(enumsList) {
  const g = {};
  for (const e of enumsList) {
    if (!g[e.enum_name]) g[e.enum_name] = [];
    g[e.enum_name].push(e.label);
  }
  return g;
}

function compareEnumGroups(gA, gB) {
  console.log(`\n--- Enums & Enum Values ---`);
  const keysA = Object.keys(gA).sort();
  const keysB = Object.keys(gB).sort();
  for (const k of keysA) {
    if (!gB[k]) {
      console.log(`Enum ${k} only in Live`);
    } else {
      const valsA = gA[k].join(', ');
      const valsB = gB[k].join(', ');
      if (valsA !== valsB) {
        console.log(`Enum ${k} mismatch: Live=[${valsA}] vs Scratch=[${valsB}]`);
      } else {
        console.log(`Enum ${k}: MATCH (${valsA})`);
      }
    }
  }
  for (const k of keysB) {
    if (!gA[k]) console.log(`Enum ${k} only in Scratch`);
  }
}

main().catch(console.error);
