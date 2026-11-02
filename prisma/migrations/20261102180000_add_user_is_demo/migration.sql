-- AlterTable
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "isDemo" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "users_isDemo_idx" ON "users"("isDemo");

