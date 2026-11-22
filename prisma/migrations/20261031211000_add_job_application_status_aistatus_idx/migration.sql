-- CreateIndex
CREATE INDEX IF NOT EXISTS "job_applications_status_aiStatus_idx" ON "job_applications"("status", "aiStatus");
