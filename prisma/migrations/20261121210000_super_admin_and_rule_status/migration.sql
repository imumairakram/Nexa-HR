-- Alter Role Enum to add SUPER_ADMIN
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'SUPER_ADMIN';

-- Create RuleStatus Enum safely
DO $$ BEGIN
  CREATE TYPE "RuleStatus" AS ENUM ('DRAFT', 'VERIFIED', 'RETIRED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Alter tax_rule_sets
ALTER TABLE "tax_rule_sets" ADD COLUMN IF NOT EXISTS "status" "RuleStatus" NOT NULL DEFAULT 'DRAFT';
ALTER TABLE "tax_rule_sets" ADD COLUMN IF NOT EXISTS "source_reference" TEXT;
ALTER TABLE "tax_rule_sets" ADD COLUMN IF NOT EXISTS "verified_by_id" TEXT;
ALTER TABLE "tax_rule_sets" ADD COLUMN IF NOT EXISTS "verified_at" TIMESTAMP(3);

-- Add index on tax_rule_sets(status)
CREATE INDEX IF NOT EXISTS "tax_rule_sets_status_idx" ON "tax_rule_sets"("status");

-- Add foreign key constraint for tax_rule_sets.verified_by_id
DO $$ BEGIN
  ALTER TABLE "tax_rule_sets" ADD CONSTRAINT "tax_rule_sets_verified_by_id_fkey" FOREIGN KEY ("verified_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Alter contribution_rules
ALTER TABLE "contribution_rules" ADD COLUMN IF NOT EXISTS "status" "RuleStatus" NOT NULL DEFAULT 'DRAFT';
ALTER TABLE "contribution_rules" ADD COLUMN IF NOT EXISTS "source_reference" TEXT;
ALTER TABLE "contribution_rules" ADD COLUMN IF NOT EXISTS "verified_by_id" TEXT;
ALTER TABLE "contribution_rules" ADD COLUMN IF NOT EXISTS "verified_at" TIMESTAMP(3);

-- Add index on contribution_rules(status)
CREATE INDEX IF NOT EXISTS "contribution_rules_status_idx" ON "contribution_rules"("status");

-- Add foreign key constraint for contribution_rules.verified_by_id
DO $$ BEGIN
  ALTER TABLE "contribution_rules" ADD CONSTRAINT "contribution_rules_verified_by_id_fkey" FOREIGN KEY ("verified_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;
