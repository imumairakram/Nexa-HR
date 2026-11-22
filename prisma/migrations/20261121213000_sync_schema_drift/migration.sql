-- ====================================================
-- NEXAHR: SYNC SCHEMA DRIFT & PURGE LEGACY MULTI-TENANCY ARTIFACTS
-- ====================================================

-- 1. Align Role Enum (purge COMPANY_ADMIN, ensure ADMIN and SUPER_ADMIN exist)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'COMPANY_ADMIN' AND enumtypid = '"Role"'::regtype) THEN
    ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;
    CREATE TYPE "Role_new" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'HR_MANAGER', 'EMPLOYEE', 'PAYROLL_ADMIN', 'PAYROLL_APPROVER');
    ALTER TABLE "users" ALTER COLUMN "role" TYPE "Role_new" USING (
      CASE WHEN "role"::text = 'COMPANY_ADMIN' THEN 'ADMIN'::text ELSE "role"::text END
    )::"Role_new";
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'role_permissions') THEN
      ALTER TABLE "role_permissions" ALTER COLUMN "role" TYPE "Role_new" USING (
        CASE WHEN "role"::text = 'COMPANY_ADMIN' THEN 'ADMIN'::text ELSE "role"::text END
      )::"Role_new";
    END IF;
    ALTER TYPE "Role" RENAME TO "Role_old";
    ALTER TYPE "Role_new" RENAME TO "Role";
    DROP TYPE "Role_old";
    ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'EMPLOYEE';
  END IF;
END $$;

-- 2. Drop legacy multi-tenant foreign keys
ALTER TABLE "attendances" DROP CONSTRAINT IF EXISTS "attendances_tenantId_fkey";
ALTER TABLE "departments" DROP CONSTRAINT IF EXISTS "departments_tenantId_fkey";
ALTER TABLE "designations" DROP CONSTRAINT IF EXISTS "designations_tenantId_fkey";
ALTER TABLE "employee_profiles" DROP CONSTRAINT IF EXISTS "employee_profiles_tenantId_fkey";
ALTER TABLE "leave_requests" DROP CONSTRAINT IF EXISTS "leave_requests_tenantId_fkey";
ALTER TABLE "leave_types" DROP CONSTRAINT IF EXISTS "leave_types_tenantId_fkey";
ALTER TABLE "payslips" DROP CONSTRAINT IF EXISTS "payslips_tenantId_fkey";
ALTER TABLE "salary_structures" DROP CONSTRAINT IF EXISTS "salary_structures_tenantId_fkey";
ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_tenantId_fkey";

-- 3. Drop legacy multi-tenant indexes
DROP INDEX IF EXISTS "attendances_tenantId_date_idx";
DROP INDEX IF EXISTS "attendances_tenantId_userId_date_key";
DROP INDEX IF EXISTS "departments_tenantId_code_key";
DROP INDEX IF EXISTS "departments_tenantId_idx";
DROP INDEX IF EXISTS "designations_tenantId_idx";
DROP INDEX IF EXISTS "designations_tenantId_title_key";
DROP INDEX IF EXISTS "employee_profiles_tenantId_employeeCode_key";
DROP INDEX IF EXISTS "employee_profiles_tenantId_idx";
DROP INDEX IF EXISTS "leave_requests_tenantId_idx";
DROP INDEX IF EXISTS "leave_types_tenantId_code_key";
DROP INDEX IF EXISTS "leave_types_tenantId_idx";
DROP INDEX IF EXISTS "payslips_tenantId_userId_month_year_key";
DROP INDEX IF EXISTS "payslips_tenantId_year_month_idx";
DROP INDEX IF EXISTS "salary_structures_tenantId_idx";
DROP INDEX IF EXISTS "salary_structures_tenantId_userId_key";
DROP INDEX IF EXISTS "users_isDemo_idx";
DROP INDEX IF EXISTS "users_tenantId_email_key";
DROP INDEX IF EXISTS "users_tenantId_idx";

-- 4. Alter attendances
ALTER TABLE "attendances" DROP COLUMN IF EXISTS "checkIn";
ALTER TABLE "attendances" DROP COLUMN IF EXISTS "checkOut";
ALTER TABLE "attendances" DROP COLUMN IF EXISTS "tenantId";
ALTER TABLE "attendances" DROP COLUMN IF EXISTS "workHours";
ALTER TABLE "attendances" ADD COLUMN IF NOT EXISTS "checkInTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "attendances" ADD COLUMN IF NOT EXISTS "checkOutTime" TIMESTAMP(3);
ALTER TABLE "attendances" ADD COLUMN IF NOT EXISTS "totalHours" DOUBLE PRECISION;
CREATE INDEX IF NOT EXISTS "attendances_date_idx" ON "attendances"("date");
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'attendances' AND indexname = 'attendances_userId_date_key') THEN
    CREATE UNIQUE INDEX "attendances_userId_date_key" ON "attendances"("userId", "date");
  END IF;
END $$;

-- 5. Alter departments
ALTER TABLE "departments" DROP COLUMN IF EXISTS "tenantId";
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'departments' AND indexname = 'departments_code_key') THEN
    CREATE UNIQUE INDEX "departments_code_key" ON "departments"("code");
  END IF;
END $$;

-- 6. Alter designations
ALTER TABLE "designations" DROP COLUMN IF EXISTS "tenantId";
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'designations' AND indexname = 'designations_title_key') THEN
    CREATE UNIQUE INDEX "designations_title_key" ON "designations"("title");
  END IF;
END $$;

-- 7. Alter employee_profiles
ALTER TABLE "employee_profiles" DROP COLUMN IF EXISTS "employeeCode";
ALTER TABLE "employee_profiles" DROP COLUMN IF EXISTS "tenantId";
ALTER TABLE "employee_profiles" ADD COLUMN IF NOT EXISTS "accountNumber" TEXT;
ALTER TABLE "employee_profiles" ADD COLUMN IF NOT EXISTS "accountTitle" TEXT;
ALTER TABLE "employee_profiles" ADD COLUMN IF NOT EXISTS "avatarUrl" TEXT;
ALTER TABLE "employee_profiles" ADD COLUMN IF NOT EXISTS "bankName" TEXT DEFAULT 'Standard Chartered Bank';
ALTER TABLE "employee_profiles" ADD COLUMN IF NOT EXISTS "branchCode" TEXT;
ALTER TABLE "employee_profiles" ADD COLUMN IF NOT EXISTS "employmentType" TEXT DEFAULT 'FULL_TIME';
ALTER TABLE "employee_profiles" ADD COLUMN IF NOT EXISTS "ntnNumber" TEXT;
ALTER TABLE "employee_profiles" ADD COLUMN IF NOT EXISTS "payoutMethod" TEXT DEFAULT 'Direct Bank Transfer';
ALTER TABLE "employee_profiles" ADD COLUMN IF NOT EXISTS "shift" TEXT DEFAULT 'General Morning (09:00 - 17:30)';
ALTER TABLE "employee_profiles" ADD COLUMN IF NOT EXISTS "taxStatus" TEXT DEFAULT 'Active Filer';
ALTER TABLE "employee_profiles" ADD COLUMN IF NOT EXISTS "workLocation" TEXT DEFAULT 'Islamabad HQ & Innovation Lab';

-- 8. Alter leave_requests
ALTER TABLE "leave_requests" DROP COLUMN IF EXISTS "tenantId";

-- 9. Alter leave_types
ALTER TABLE "leave_types" DROP COLUMN IF EXISTS "tenantId";
ALTER TABLE "leave_types" ADD COLUMN IF NOT EXISTS "description" TEXT;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'leave_types' AND indexname = 'leave_types_code_key') THEN
    CREATE UNIQUE INDEX "leave_types_code_key" ON "leave_types"("code");
  END IF;
END $$;

-- 10. Alter legacy payslips
ALTER TABLE "payslips" DROP COLUMN IF EXISTS "tenantId";
CREATE INDEX IF NOT EXISTS "payslips_year_month_idx" ON "payslips"("year", "month");
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'payslips' AND indexname = 'payslips_userId_month_year_key') THEN
    CREATE UNIQUE INDEX "payslips_userId_month_year_key" ON "payslips"("userId", "month", "year");
  END IF;
END $$;

-- 11. Alter salary_structures
ALTER TABLE "salary_structures" DROP COLUMN IF EXISTS "tenantId";

-- 12. Alter users
ALTER TABLE "users" DROP COLUMN IF EXISTS "tenantId";
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "employeeCode" TEXT NOT NULL DEFAULT 'EMP-0001';
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "mustChangePassword" BOOLEAN NOT NULL DEFAULT true;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'users' AND indexname = 'users_employeeCode_key') THEN
    CREATE UNIQUE INDEX "users_employeeCode_key" ON "users"("employeeCode");
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'users' AND indexname = 'users_email_key') THEN
    CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
  END IF;
END $$;

-- 13. Drop tenants table & TenantStatus enum
DROP TABLE IF EXISTS "tenants" CASCADE;
DROP TYPE IF EXISTS "TenantStatus";
