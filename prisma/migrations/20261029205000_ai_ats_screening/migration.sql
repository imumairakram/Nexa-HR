-- AlterTable
CREATE TYPE "ApplicationSource" AS ENUM ('MANUAL', 'GMAIL', 'CAREER_PORTAL', 'LINKEDIN', 'OTHER');
CREATE TYPE "AiScreeningStatus" AS ENUM ('PENDING', 'CONFIRMED', 'SCREENED_OUT', 'UNMATCHED', 'ERROR');

ALTER TABLE "job_applications"
  DROP COLUMN IF EXISTS "source",
  ADD COLUMN "source" "ApplicationSource" NOT NULL DEFAULT 'MANUAL',
  ADD COLUMN "gmailMessageId" TEXT,
  ADD COLUMN "aiScore" INTEGER,
  ADD COLUMN "aiBreakdown" JSONB,
  ADD COLUMN "aiSummary" TEXT,
  ADD COLUMN "aiStrengths" JSONB,
  ADD COLUMN "aiGaps" JSONB,
  ADD COLUMN "aiStatus" "AiScreeningStatus" DEFAULT 'PENDING',
  ADD COLUMN "aiScreenedAt" TIMESTAMP(3),
  ADD COLUMN "resumeUrl" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "job_applications_gmailMessageId_key" ON "job_applications"("gmailMessageId");
CREATE INDEX "job_applications_aiStatus_idx" ON "job_applications"("aiStatus");
CREATE INDEX "job_applications_jobOpeningId_email_idx" ON "job_applications"("jobOpeningId", "email");

