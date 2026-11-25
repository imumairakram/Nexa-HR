-- ====================================================
-- NEXAHR: ENABLE ROW LEVEL SECURITY ON ALL PHASE 2 PAYROLL & LEDGER TABLES
-- Resolves Supabase Security Advisory: rls_disabled_in_public for new tables.
-- Prisma connects directly as database owner/superuser, which bypasses RLS by default.
-- ====================================================

ALTER TABLE "legal_entities" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "pay_groups" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "pay_periods" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "pay_runs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "pay_components" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "contribution_rules" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "employee_compensations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "employee_compensation_components" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "employee_bank_accounts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "payslips_v2" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "payslip_lines_v2" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tax_rule_sets" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tax_slabs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "adjustments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "payment_batches" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "payment_batch_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ledger_accounts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "journal_entries" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "journal_lines" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "payroll_audit_logs" ENABLE ROW LEVEL SECURITY;
