-- Enable Row Level Security (RLS) across all public tables in Supabase
-- Resolves Supabase Security Advisory: rls_disabled_in_public
-- Note: Prisma ORM connects via direct connection as database owner/superuser, which bypasses RLS by default.

DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', r.tablename);
    END LOOP;
END $$;
