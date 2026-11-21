/**
 * scripts/build-migration-sql.js
 *
 * Compiles the exact Phase 2 Prisma migration SQL file.
 */

const fs = require('fs');
const path = require('path');

const migrationSql = `-- ====================================================
-- NEXAHR PHASE 2: INTERNATIONAL PAYROLL ARCHITECTURE MIGRATION
-- ====================================================

-- 1. Install btree_gist extension for temporal exclusion constraints
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- 2. Alter Role Enum to add PAYROLL_ADMIN and PAYROLL_APPROVER
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'PAYROLL_ADMIN';
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'PAYROLL_APPROVER';

-- 3. Create Phase 2 Domain Enums safely
DO $$ BEGIN
  CREATE TYPE "PayPeriodStatus" AS ENUM ('OPEN', 'PROCESSING', 'LOCKED', 'CLOSED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "PayRunType" AS ENUM ('REGULAR', 'OFF_CYCLE', 'CORRECTION');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "PayRunStatus" AS ENUM ('DRAFT', 'CALCULATING', 'CALCULATED', 'IN_REVIEW', 'APPROVED', 'PAID', 'CLOSED', 'VOID', 'REVERSED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "PayComponentType" AS ENUM ('EARNING', 'DEDUCTION', 'EMPLOYER_CONTRIBUTION', 'REIMBURSEMENT');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "ProrationBasis" AS ENUM ('WORKING_DAYS', 'CALENDAR_DAYS', 'FIXED_30');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "ContributionBasis" AS ENUM ('PERCENTAGE_OF_BASIC', 'PERCENTAGE_OF_GROSS', 'FIXED_AMOUNT');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "AdjustmentType" AS ENUM ('BONUS', 'ARREARS', 'LOAN_DEDUCTION', 'ONE_OFF_DEDUCTION', 'EXPENSE_REIMBURSEMENT');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "AdjustmentStatus" AS ENUM ('PENDING', 'APPROVED', 'APPLIED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "PaymentBatchStatus" AS ENUM ('PENDING', 'EXPORTED', 'RECONCILED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "LedgerAccountType" AS ENUM ('ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 4. User Soft Delete Column and Index
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP(3);
CREATE INDEX IF NOT EXISTS "users_deleted_at_idx" ON "users"("deleted_at");

-- 5. Harden AccountTransaction & Legacy Payslips
ALTER TABLE "account_transactions" ALTER COLUMN "amount" TYPE DECIMAL(14,2) USING "amount"::numeric(14,2);
ALTER TABLE "account_transactions" ADD COLUMN IF NOT EXISTS "source" TEXT NOT NULL DEFAULT 'MANUAL';
ALTER TABLE "account_transactions" ADD COLUMN IF NOT EXISTS "journal_entry_id" TEXT;

-- Update createdBy foreign key to Restrict on account_transactions
ALTER TABLE "account_transactions" DROP CONSTRAINT IF EXISTS "account_transactions_createdById_fkey";
ALTER TABLE "account_transactions" ADD CONSTRAINT "account_transactions_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Update legacy payslips foreign key to Restrict on users
ALTER TABLE "payslips" DROP CONSTRAINT IF EXISTS "payslips_userId_fkey";
ALTER TABLE "payslips" ADD CONSTRAINT "payslips_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- 6. Create Phase 2 Tables
CREATE TABLE IF NOT EXISTS "legal_entities" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'PAK',
    "default_currency" TEXT NOT NULL DEFAULT 'PKR',
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Karachi',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "legal_entities_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "pay_groups" (
    "id" TEXT NOT NULL,
    "legal_entity_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'PKR',
    "proration_basis" "ProrationBasis" NOT NULL DEFAULT 'FIXED_30',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "pay_groups_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "pay_periods" (
    "id" TEXT NOT NULL,
    "pay_group_id" TEXT NOT NULL,
    "period_number" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "payment_due_date" TIMESTAMP(3) NOT NULL,
    "status" "PayPeriodStatus" NOT NULL DEFAULT 'OPEN',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "pay_periods_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "pay_runs" (
    "id" TEXT NOT NULL,
    "pay_period_id" TEXT NOT NULL,
    "run_number" TEXT NOT NULL,
    "type" "PayRunType" NOT NULL DEFAULT 'REGULAR',
    "status" "PayRunStatus" NOT NULL DEFAULT 'DRAFT',
    "idempotency_key" TEXT,
    "total_gross" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "total_deductions" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "total_net" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "total_employer_tax" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "calculated_by_id" TEXT,
    "calculated_at" TIMESTAMP(3),
    "submitted_by_id" TEXT,
    "submitted_at" TIMESTAMP(3),
    "approved_by_id" TEXT,
    "approved_at" TIMESTAMP(3),
    "paid_by_id" TEXT,
    "paid_at" TIMESTAMP(3),
    "reversal_reason" TEXT,
    "inputs_snapshot" JSONB,
    "journal_entry_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "pay_runs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "pay_components" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "PayComponentType" NOT NULL,
    "is_taxable" BOOLEAN NOT NULL DEFAULT true,
    "is_statutory" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "pay_components_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "contribution_rules" (
    "id" TEXT NOT NULL,
    "legal_entity_id" TEXT NOT NULL,
    "component_id" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "calculation_basis" "ContributionBasis" NOT NULL DEFAULT 'PERCENTAGE_OF_BASIC',
    "employee_rate" DECIMAL(7,4) NOT NULL DEFAULT 0.0000,
    "employer_rate" DECIMAL(7,4) NOT NULL DEFAULT 0.0000,
    "min_cap" DECIMAL(12,2),
    "max_cap" DECIMAL(12,2),
    "effective_from" TIMESTAMP(3) NOT NULL,
    "effective_to" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "contribution_rules_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "employee_compensations" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "pay_group_id" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'PKR',
    "base_salary" DECIMAL(12,2) NOT NULL,
    "effective_from" TIMESTAMP(3) NOT NULL,
    "effective_to" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "employee_compensations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "employee_compensation_components" (
    "id" TEXT NOT NULL,
    "employee_compensation_id" TEXT NOT NULL,
    "component_id" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "percentage" DECIMAL(7,4),
    "is_deduction" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "employee_compensation_components_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "employee_bank_accounts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "bank_name" TEXT NOT NULL,
    "account_title" TEXT NOT NULL,
    "account_number_masked" TEXT NOT NULL,
    "account_number_encrypted" TEXT NOT NULL,
    "iban" TEXT,
    "branch_code" TEXT,
    "routing_number" TEXT,
    "is_primary" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "employee_bank_accounts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "payslips_v2" (
    "id" TEXT NOT NULL,
    "pay_run_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "period_id" TEXT NOT NULL,
    "payslip_number" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'PKR',
    "status" "PayslipStatus" NOT NULL DEFAULT 'DRAFT',
    "basic_salary" DECIMAL(12,2) NOT NULL,
    "total_gross" DECIMAL(12,2) NOT NULL,
    "total_deductions" DECIMAL(12,2) NOT NULL,
    "net_salary" DECIMAL(12,2) NOT NULL,
    "employer_contributions" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "calendar_days" INTEGER NOT NULL,
    "working_days" INTEGER NOT NULL,
    "days_worked" DECIMAL(5,2) NOT NULL,
    "unpaid_leave_days" DECIMAL(5,2) NOT NULL,
    "is_legacy" BOOLEAN NOT NULL DEFAULT false,
    "legacy_payslip_id" TEXT,
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paid_at" TIMESTAMP(3),
    CONSTRAINT "payslips_v2_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "payslip_lines_v2" (
    "id" TEXT NOT NULL,
    "payslip_id" TEXT NOT NULL,
    "component_id" TEXT,
    "component_code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "PayComponentType" NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "is_taxable" BOOLEAN NOT NULL DEFAULT true,
    "rate" DECIMAL(12,4),
    "quantity" DECIMAL(8,2),
    "is_legacy" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "payslip_lines_v2_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "tax_rule_sets" (
    "id" TEXT NOT NULL,
    "legal_entity_id" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "effective_from" TIMESTAMP(3) NOT NULL,
    "effective_to" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "tax_rule_sets_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "tax_slabs" (
    "id" TEXT NOT NULL,
    "tax_rule_set_id" TEXT NOT NULL,
    "slab_order" INTEGER NOT NULL,
    "min_amount" DECIMAL(12,2) NOT NULL,
    "max_amount" DECIMAL(12,2),
    "base_tax" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "rate_percentage" DECIMAL(7,4) NOT NULL,
    CONSTRAINT "tax_slabs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "adjustments" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "pay_period_id" TEXT,
    "pay_run_id" TEXT,
    "type" "AdjustmentType" NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'PKR',
    "status" "AdjustmentStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "adjustments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "payment_batches" (
    "id" TEXT NOT NULL,
    "pay_run_id" TEXT NOT NULL,
    "batch_number" TEXT NOT NULL,
    "total_amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'PKR',
    "record_count" INTEGER NOT NULL DEFAULT 0,
    "status" "PaymentBatchStatus" NOT NULL DEFAULT 'PENDING',
    "exported_at" TIMESTAMP(3),
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "payment_batches_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "payment_batch_items" (
    "id" TEXT NOT NULL,
    "payment_batch_id" TEXT NOT NULL,
    "payslip_id" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "bank_name_snapshot" TEXT NOT NULL,
    "account_number_snapshot" TEXT NOT NULL,
    "iban_snapshot" TEXT,
    "status" "PaymentBatchStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "payment_batch_items_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ledger_accounts" (
    "id" TEXT NOT NULL,
    "legal_entity_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "LedgerAccountType" NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'PKR',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ledger_accounts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "journal_entries" (
    "id" TEXT NOT NULL,
    "entry_number" TEXT NOT NULL,
    "posting_date" TIMESTAMP(3) NOT NULL,
    "reference" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'PAYROLL',
    "is_balanced" BOOLEAN NOT NULL DEFAULT true,
    "reverses_entry_id" TEXT,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "journal_entries_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "journal_lines" (
    "id" TEXT NOT NULL,
    "journal_entry_id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "debit" DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    "credit" DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "journal_lines_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "payroll_audit_logs" (
    "id" TEXT NOT NULL,
    "actor_id" TEXT NOT NULL,
    "actor_email" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "before_state" JSONB,
    "after_state" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "payroll_audit_logs_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE UNIQUE INDEX IF NOT EXISTS "legal_entities_code_key" ON "legal_entities"("code");
CREATE UNIQUE INDEX IF NOT EXISTS "pay_groups_code_key" ON "pay_groups"("code");
CREATE INDEX IF NOT EXISTS "pay_periods_status_idx" ON "pay_periods"("status");
CREATE UNIQUE INDEX IF NOT EXISTS "pay_periods_pay_group_id_year_period_number_key" ON "pay_periods"("pay_group_id", "year", "period_number");
CREATE UNIQUE INDEX IF NOT EXISTS "pay_runs_run_number_key" ON "pay_runs"("run_number");
CREATE UNIQUE INDEX IF NOT EXISTS "pay_runs_idempotency_key_key" ON "pay_runs"("idempotency_key");
CREATE INDEX IF NOT EXISTS "pay_runs_pay_period_id_idx" ON "pay_runs"("pay_period_id");
CREATE INDEX IF NOT EXISTS "pay_runs_status_idx" ON "pay_runs"("status");
CREATE UNIQUE INDEX IF NOT EXISTS "pay_components_code_key" ON "pay_components"("code");
CREATE UNIQUE INDEX IF NOT EXISTS "contribution_rules_code_key" ON "contribution_rules"("code");
CREATE INDEX IF NOT EXISTS "contribution_rules_country_is_active_idx" ON "contribution_rules"("country", "is_active");
CREATE INDEX IF NOT EXISTS "employee_compensations_user_id_is_active_idx" ON "employee_compensations"("user_id", "is_active");
CREATE INDEX IF NOT EXISTS "employee_compensations_user_id_effective_from_effective_to_idx" ON "employee_compensations"("user_id", "effective_from", "effective_to");
CREATE INDEX IF NOT EXISTS "employee_compensation_components_employee_compensation_id_idx" ON "employee_compensation_components"("employee_compensation_id");
CREATE INDEX IF NOT EXISTS "employee_bank_accounts_user_id_idx" ON "employee_bank_accounts"("user_id");
CREATE UNIQUE INDEX IF NOT EXISTS "payslips_v2_payslip_number_key" ON "payslips_v2"("payslip_number");
CREATE INDEX IF NOT EXISTS "payslips_v2_pay_run_id_idx" ON "payslips_v2"("pay_run_id");
CREATE INDEX IF NOT EXISTS "payslips_v2_user_id_period_id_idx" ON "payslips_v2"("user_id", "period_id");
CREATE INDEX IF NOT EXISTS "payslips_v2_status_idx" ON "payslips_v2"("status");
CREATE UNIQUE INDEX IF NOT EXISTS "payslips_v2_user_id_period_id_pay_run_id_key" ON "payslips_v2"("user_id", "period_id", "pay_run_id");
CREATE INDEX IF NOT EXISTS "payslip_lines_v2_payslip_id_idx" ON "payslip_lines_v2"("payslip_id");
CREATE INDEX IF NOT EXISTS "tax_rule_sets_country_effective_from_idx" ON "tax_rule_sets"("country", "effective_from");
CREATE INDEX IF NOT EXISTS "tax_slabs_tax_rule_set_id_slab_order_idx" ON "tax_slabs"("tax_rule_set_id", "slab_order");
CREATE INDEX IF NOT EXISTS "adjustments_user_id_status_idx" ON "adjustments"("user_id", "status");
CREATE UNIQUE INDEX IF NOT EXISTS "payment_batches_batch_number_key" ON "payment_batches"("batch_number");
CREATE INDEX IF NOT EXISTS "payment_batches_pay_run_id_idx" ON "payment_batches"("pay_run_id");
CREATE INDEX IF NOT EXISTS "payment_batch_items_payment_batch_id_idx" ON "payment_batch_items"("payment_batch_id");
CREATE INDEX IF NOT EXISTS "payment_batch_items_payslip_id_idx" ON "payment_batch_items"("payslip_id");
CREATE UNIQUE INDEX IF NOT EXISTS "ledger_accounts_code_key" ON "ledger_accounts"("code");
CREATE UNIQUE INDEX IF NOT EXISTS "journal_entries_entry_number_key" ON "journal_entries"("entry_number");
CREATE UNIQUE INDEX IF NOT EXISTS "journal_entries_reverses_entry_id_key" ON "journal_entries"("reverses_entry_id");
CREATE INDEX IF NOT EXISTS "journal_entries_posting_date_idx" ON "journal_entries"("posting_date");
CREATE INDEX IF NOT EXISTS "journal_entries_source_idx" ON "journal_entries"("source");
CREATE INDEX IF NOT EXISTS "journal_lines_journal_entry_id_idx" ON "journal_lines"("journal_entry_id");
CREATE INDEX IF NOT EXISTS "journal_lines_account_id_idx" ON "journal_lines"("account_id");
CREATE INDEX IF NOT EXISTS "payroll_audit_logs_entity_entity_id_idx" ON "payroll_audit_logs"("entity", "entity_id");
CREATE INDEX IF NOT EXISTS "payroll_audit_logs_actor_id_idx" ON "payroll_audit_logs"("actor_id");
CREATE INDEX IF NOT EXISTS "payroll_audit_logs_created_at_idx" ON "payroll_audit_logs"("created_at");

-- Foreign Keys
ALTER TABLE "account_transactions" DROP CONSTRAINT IF EXISTS "account_transactions_journal_entry_id_fkey";
ALTER TABLE "account_transactions" ADD CONSTRAINT "account_transactions_journal_entry_id_fkey" FOREIGN KEY ("journal_entry_id") REFERENCES "journal_entries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "pay_groups" DROP CONSTRAINT IF EXISTS "pay_groups_legal_entity_id_fkey";
ALTER TABLE "pay_groups" ADD CONSTRAINT "pay_groups_legal_entity_id_fkey" FOREIGN KEY ("legal_entity_id") REFERENCES "legal_entities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "pay_periods" DROP CONSTRAINT IF EXISTS "pay_periods_pay_group_id_fkey";
ALTER TABLE "pay_periods" ADD CONSTRAINT "pay_periods_pay_group_id_fkey" FOREIGN KEY ("pay_group_id") REFERENCES "pay_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "pay_runs" DROP CONSTRAINT IF EXISTS "pay_runs_pay_period_id_fkey";
ALTER TABLE "pay_runs" ADD CONSTRAINT "pay_runs_pay_period_id_fkey" FOREIGN KEY ("pay_period_id") REFERENCES "pay_periods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "pay_runs" DROP CONSTRAINT IF EXISTS "pay_runs_calculated_by_id_fkey";
ALTER TABLE "pay_runs" ADD CONSTRAINT "pay_runs_calculated_by_id_fkey" FOREIGN KEY ("calculated_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "pay_runs" DROP CONSTRAINT IF EXISTS "pay_runs_approved_by_id_fkey";
ALTER TABLE "pay_runs" ADD CONSTRAINT "pay_runs_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "pay_runs" DROP CONSTRAINT IF EXISTS "pay_runs_journal_entry_id_fkey";
ALTER TABLE "pay_runs" ADD CONSTRAINT "pay_runs_journal_entry_id_fkey" FOREIGN KEY ("journal_entry_id") REFERENCES "journal_entries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "contribution_rules" DROP CONSTRAINT IF EXISTS "contribution_rules_legal_entity_id_fkey";
ALTER TABLE "contribution_rules" ADD CONSTRAINT "contribution_rules_legal_entity_id_fkey" FOREIGN KEY ("legal_entity_id") REFERENCES "legal_entities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "contribution_rules" DROP CONSTRAINT IF EXISTS "contribution_rules_component_id_fkey";
ALTER TABLE "contribution_rules" ADD CONSTRAINT "contribution_rules_component_id_fkey" FOREIGN KEY ("component_id") REFERENCES "pay_components"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "employee_compensations" DROP CONSTRAINT IF EXISTS "employee_compensations_user_id_fkey";
ALTER TABLE "employee_compensations" ADD CONSTRAINT "employee_compensations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "employee_compensations" DROP CONSTRAINT IF EXISTS "employee_compensations_pay_group_id_fkey";
ALTER TABLE "employee_compensations" ADD CONSTRAINT "employee_compensations_pay_group_id_fkey" FOREIGN KEY ("pay_group_id") REFERENCES "pay_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "employee_compensation_components" DROP CONSTRAINT IF EXISTS "employee_compensation_components_employee_compensation_id_fkey";
ALTER TABLE "employee_compensation_components" ADD CONSTRAINT "employee_compensation_components_employee_compensation_id_fkey" FOREIGN KEY ("employee_compensation_id") REFERENCES "employee_compensations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "employee_compensation_components" DROP CONSTRAINT IF EXISTS "employee_compensation_components_component_id_fkey";
ALTER TABLE "employee_compensation_components" ADD CONSTRAINT "employee_compensation_components_component_id_fkey" FOREIGN KEY ("component_id") REFERENCES "pay_components"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "employee_bank_accounts" DROP CONSTRAINT IF EXISTS "employee_bank_accounts_user_id_fkey";
ALTER TABLE "employee_bank_accounts" ADD CONSTRAINT "employee_bank_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "payslips_v2" DROP CONSTRAINT IF EXISTS "payslips_v2_pay_run_id_fkey";
ALTER TABLE "payslips_v2" ADD CONSTRAINT "payslips_v2_pay_run_id_fkey" FOREIGN KEY ("pay_run_id") REFERENCES "pay_runs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "payslips_v2" DROP CONSTRAINT IF EXISTS "payslips_v2_user_id_fkey";
ALTER TABLE "payslips_v2" ADD CONSTRAINT "payslips_v2_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "payslips_v2" DROP CONSTRAINT IF EXISTS "payslips_v2_period_id_fkey";
ALTER TABLE "payslips_v2" ADD CONSTRAINT "payslips_v2_period_id_fkey" FOREIGN KEY ("period_id") REFERENCES "pay_periods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "payslips_v2" DROP CONSTRAINT IF EXISTS "payslips_v2_legacy_payslip_id_fkey";
ALTER TABLE "payslips_v2" ADD CONSTRAINT "payslips_v2_legacy_payslip_id_fkey" FOREIGN KEY ("legacy_payslip_id") REFERENCES "payslips"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "payslip_lines_v2" DROP CONSTRAINT IF EXISTS "payslip_lines_v2_payslip_id_fkey";
ALTER TABLE "payslip_lines_v2" ADD CONSTRAINT "payslip_lines_v2_payslip_id_fkey" FOREIGN KEY ("payslip_id") REFERENCES "payslips_v2"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "payslip_lines_v2" DROP CONSTRAINT IF EXISTS "payslip_lines_v2_component_id_fkey";
ALTER TABLE "payslip_lines_v2" ADD CONSTRAINT "payslip_lines_v2_component_id_fkey" FOREIGN KEY ("component_id") REFERENCES "pay_components"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "tax_rule_sets" DROP CONSTRAINT IF EXISTS "tax_rule_sets_legal_entity_id_fkey";
ALTER TABLE "tax_rule_sets" ADD CONSTRAINT "tax_rule_sets_legal_entity_id_fkey" FOREIGN KEY ("legal_entity_id") REFERENCES "legal_entities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "tax_slabs" DROP CONSTRAINT IF EXISTS "tax_slabs_tax_rule_set_id_fkey";
ALTER TABLE "tax_slabs" ADD CONSTRAINT "tax_slabs_tax_rule_set_id_fkey" FOREIGN KEY ("tax_rule_set_id") REFERENCES "tax_rule_sets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "adjustments" DROP CONSTRAINT IF EXISTS "adjustments_user_id_fkey";
ALTER TABLE "adjustments" ADD CONSTRAINT "adjustments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "adjustments" DROP CONSTRAINT IF EXISTS "adjustments_pay_period_id_fkey";
ALTER TABLE "adjustments" ADD CONSTRAINT "adjustments_pay_period_id_fkey" FOREIGN KEY ("pay_period_id") REFERENCES "pay_periods"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "adjustments" DROP CONSTRAINT IF EXISTS "adjustments_pay_run_id_fkey";
ALTER TABLE "adjustments" ADD CONSTRAINT "adjustments_pay_run_id_fkey" FOREIGN KEY ("pay_run_id") REFERENCES "pay_runs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "payment_batches" DROP CONSTRAINT IF EXISTS "payment_batches_pay_run_id_fkey";
ALTER TABLE "payment_batches" ADD CONSTRAINT "payment_batches_pay_run_id_fkey" FOREIGN KEY ("pay_run_id") REFERENCES "pay_runs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "payment_batch_items" DROP CONSTRAINT IF EXISTS "payment_batch_items_payment_batch_id_fkey";
ALTER TABLE "payment_batch_items" ADD CONSTRAINT "payment_batch_items_payment_batch_id_fkey" FOREIGN KEY ("payment_batch_id") REFERENCES "payment_batches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "payment_batch_items" DROP CONSTRAINT IF EXISTS "payment_batch_items_payslip_id_fkey";
ALTER TABLE "payment_batch_items" ADD CONSTRAINT "payment_batch_items_payslip_id_fkey" FOREIGN KEY ("payslip_id") REFERENCES "payslips_v2"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ledger_accounts" DROP CONSTRAINT IF EXISTS "ledger_accounts_legal_entity_id_fkey";
ALTER TABLE "ledger_accounts" ADD CONSTRAINT "ledger_accounts_legal_entity_id_fkey" FOREIGN KEY ("legal_entity_id") REFERENCES "legal_entities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "journal_entries" DROP CONSTRAINT IF EXISTS "journal_entries_created_by_id_fkey";
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "journal_entries" DROP CONSTRAINT IF EXISTS "journal_entries_reverses_entry_id_fkey";
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_reverses_entry_id_fkey" FOREIGN KEY ("reverses_entry_id") REFERENCES "journal_entries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "journal_lines" DROP CONSTRAINT IF EXISTS "journal_lines_journal_entry_id_fkey";
ALTER TABLE "journal_lines" ADD CONSTRAINT "journal_lines_journal_entry_id_fkey" FOREIGN KEY ("journal_entry_id") REFERENCES "journal_entries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "journal_lines" DROP CONSTRAINT IF EXISTS "journal_lines_account_id_fkey";
ALTER TABLE "journal_lines" ADD CONSTRAINT "journal_lines_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "ledger_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "payroll_audit_logs" DROP CONSTRAINT IF EXISTS "payroll_audit_logs_actor_id_fkey";
ALTER TABLE "payroll_audit_logs" ADD CONSTRAINT "payroll_audit_logs_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ====================================================
-- RAW SQL CONSTRAINTS, INDEXES & TRIGGERS
-- ====================================================

-- 7. Partial unique index on pay_runs: only one active regular run per period
CREATE UNIQUE INDEX IF NOT EXISTS unique_active_regular_pay_run
ON pay_runs (pay_period_id)
WHERE type = 'REGULAR' AND status NOT IN ('VOID', 'REVERSED');

-- 8. Check constraint on journal_lines: non-negative debits/credits & single-sided per line
ALTER TABLE journal_lines
DROP CONSTRAINT IF EXISTS chk_journal_line_debit_credit;

ALTER TABLE journal_lines
ADD CONSTRAINT chk_journal_line_debit_credit
CHECK (debit >= 0 AND credit >= 0 AND (debit = 0 OR credit = 0));

-- 9. Append-only immutability trigger function
CREATE OR REPLACE FUNCTION prevent_modification_and_deletion()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Table % is strictly append-only. UPDATE and DELETE operations are forbidden.', TG_TABLE_NAME;
END;
$$ LANGUAGE plpgsql;

-- 10. Attach BEFORE UPDATE OR DELETE immutability triggers
DROP TRIGGER IF EXISTS trg_immutable_journal_entries ON journal_entries;
CREATE TRIGGER trg_immutable_journal_entries
BEFORE UPDATE OR DELETE ON journal_entries
FOR EACH ROW EXECUTE FUNCTION prevent_modification_and_deletion();

DROP TRIGGER IF EXISTS trg_immutable_journal_lines ON journal_lines;
CREATE TRIGGER trg_immutable_journal_lines
BEFORE UPDATE OR DELETE ON journal_lines
FOR EACH ROW EXECUTE FUNCTION prevent_modification_and_deletion();

DROP TRIGGER IF EXISTS trg_immutable_payroll_audit_logs ON payroll_audit_logs;
CREATE TRIGGER trg_immutable_payroll_audit_logs
BEFORE UPDATE OR DELETE ON payroll_audit_logs
FOR EACH ROW EXECUTE FUNCTION prevent_modification_and_deletion();

-- 11. BEFORE TRUNCATE immutability statement-level triggers
CREATE OR REPLACE FUNCTION prevent_truncate()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Table % is strictly append-only. TRUNCATE operation is forbidden.', TG_TABLE_NAME;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_truncate_journal_entries ON journal_entries;
CREATE TRIGGER trg_prevent_truncate_journal_entries
BEFORE TRUNCATE ON journal_entries
FOR EACH STATEMENT EXECUTE FUNCTION prevent_truncate();

DROP TRIGGER IF EXISTS trg_prevent_truncate_journal_lines ON journal_lines;
CREATE TRIGGER trg_prevent_truncate_journal_lines
BEFORE TRUNCATE ON journal_lines
FOR EACH STATEMENT EXECUTE FUNCTION prevent_truncate();

DROP TRIGGER IF EXISTS trg_prevent_truncate_payroll_audit_logs ON payroll_audit_logs;
CREATE TRIGGER trg_prevent_truncate_payroll_audit_logs
BEFORE TRUNCATE ON payroll_audit_logs
FOR EACH STATEMENT EXECUTE FUNCTION prevent_truncate();

-- 12. Half-open date range EXCLUDE constraint to prevent overlapping employee compensation records
ALTER TABLE employee_compensations
DROP CONSTRAINT IF EXISTS exclude_overlapping_compensations;

ALTER TABLE employee_compensations
ADD CONSTRAINT exclude_overlapping_compensations
EXCLUDE USING gist (
  user_id WITH =,
  tsrange(effective_from, COALESCE(effective_to, 'infinity'::timestamp), '[)') WITH &&
);
`;

const destPath = path.join(__dirname, '..', 'prisma', 'migrations', '20261121180000_phase2_payroll_architecture', 'migration.sql');
fs.writeFileSync(destPath, migrationSql, 'utf8');
console.log('✅ Wrote exact migration.sql to', destPath);
