-- ====================================================
-- NEXAHR: SCHEMA ALIGNMENT (COLUMN DEFAULTS & ACCOUNT TRANSACTION INDEXES)
-- Post-migration alignments to strictly match prisma/schema.prisma
-- ====================================================

-- 1. Attendances checkInTime: remove default so it is explicitly managed
ALTER TABLE "attendances" ALTER COLUMN "checkInTime" DROP DEFAULT;

-- 2. Users employeeCode: remove default
ALTER TABLE "users" ALTER COLUMN "employeeCode" DROP DEFAULT;

-- 3. Account Transactions indexes
CREATE INDEX IF NOT EXISTS "account_transactions_status_idx" ON "account_transactions"("status");
CREATE INDEX IF NOT EXISTS "account_transactions_source_idx" ON "account_transactions"("source");
