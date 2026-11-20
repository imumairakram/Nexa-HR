// Enable Row Level Security (RLS) on all tables in public schema
// Resolves Supabase alert: "Table publicly accessible (rls_disabled_in_public)"
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ log: [] });

async function enableRlsOnAllTables() {
  console.log('--- Supabase Security: Enabling RLS on all public tables ---');
  try {
    await prisma.$executeRawUnsafe(`
      DO $$
      DECLARE
          r RECORD;
      BEGIN
          FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
              EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', r.tablename);
          END LOOP;
      END $$;
    `);

    const tables = await prisma.$queryRawUnsafe(
      "SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;"
    );
    console.table(tables);
    const unsecure = tables.filter((t) => !t.rowsecurity);
    if (unsecure.length === 0) {
      console.log('✓ SUCCESS: All', tables.length, 'tables have Row Level Security (RLS) enabled.');
    } else {
      console.warn('⚠ WARNING: Some tables still have RLS disabled:', unsecure);
    }
  } catch (err) {
    console.error('Error enabling RLS:', err);
  } finally {
    await prisma.$disconnect();
  }
}

enableRlsOnAllTables();
