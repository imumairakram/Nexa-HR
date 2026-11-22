-- ====================================================
-- NEXAHR: BASELINE CORE MODULES (ATS, TICKETS, ANNOUNCEMENTS, NOTIFICATIONS, AUTH TOKENS)
-- Pre-dated before 20261029205000_ai_ats_screening
-- Creates tables initially introduced via db push so that prisma migrate deploy functions from zero.
-- All DDL uses IF NOT EXISTS so this migration is a safe no-op on existing databases.
-- ====================================================

-- 1. Job Openings
CREATE TABLE IF NOT EXISTS "job_openings" (
    "id" TEXT NOT NULL,
    "jobCode" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'Full Time',
    "experience" TEXT NOT NULL DEFAULT '3+ Years',
    "salary" TEXT DEFAULT '$100k - $140k',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "description" TEXT,
    "requirements" TEXT,
    "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "urgent" BOOLEAN NOT NULL DEFAULT false,
    "postedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closingDate" TIMESTAMP(3),
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "job_openings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "job_openings_jobCode_key" ON "job_openings"("jobCode");
CREATE INDEX IF NOT EXISTS "job_openings_status_idx" ON "job_openings"("status");
CREATE INDEX IF NOT EXISTS "job_openings_department_idx" ON "job_openings"("department");
CREATE INDEX IF NOT EXISTS "job_openings_createdAt_idx" ON "job_openings"("createdAt");

-- 2. Job Applications (Base columns before AI screening extension)
CREATE TABLE IF NOT EXISTS "job_applications" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "jobOpeningId" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "role" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "experience" TEXT NOT NULL DEFAULT '3 Years',
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
    "stage" TEXT NOT NULL DEFAULT 'APPLIED',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "resumeSummary" TEXT,
    "notes" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "source" TEXT NOT NULL DEFAULT 'MANUAL',
    "appliedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "job_applications_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "job_applications_applicationId_key" ON "job_applications"("applicationId");
CREATE INDEX IF NOT EXISTS "job_applications_stage_idx" ON "job_applications"("stage");
CREATE INDEX IF NOT EXISTS "job_applications_jobOpeningId_idx" ON "job_applications"("jobOpeningId");
CREATE INDEX IF NOT EXISTS "job_applications_email_idx" ON "job_applications"("email");
CREATE INDEX IF NOT EXISTS "job_applications_createdAt_idx" ON "job_applications"("createdAt");

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'job_applications_jobOpeningId_fkey'
  ) THEN
    ALTER TABLE "job_applications" 
      ADD CONSTRAINT "job_applications_jobOpeningId_fkey" 
      FOREIGN KEY ("jobOpeningId") REFERENCES "job_openings"("id") 
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- 3. Job Interviews
CREATE TABLE IF NOT EXISTS "job_interviews" (
    "id" TEXT NOT NULL,
    "interviewCode" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "jobOpeningId" TEXT,
    "candidateName" TEXT NOT NULL,
    "candidateEmail" TEXT,
    "role" TEXT NOT NULL,
    "round" TEXT NOT NULL DEFAULT 'Technical Round',
    "interviewer" TEXT NOT NULL DEFAULT 'HR Hiring Manager',
    "interviewerRole" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "time" TEXT NOT NULL DEFAULT '10:00 AM',
    "duration" TEXT NOT NULL DEFAULT '45 mins',
    "meetLink" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "feedback" TEXT,
    "score" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "job_interviews_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "job_interviews_interviewCode_key" ON "job_interviews"("interviewCode");
CREATE INDEX IF NOT EXISTS "job_interviews_applicationId_idx" ON "job_interviews"("applicationId");
CREATE INDEX IF NOT EXISTS "job_interviews_jobOpeningId_idx" ON "job_interviews"("jobOpeningId");
CREATE INDEX IF NOT EXISTS "job_interviews_date_idx" ON "job_interviews"("date");
CREATE INDEX IF NOT EXISTS "job_interviews_status_idx" ON "job_interviews"("status");

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'job_interviews_applicationId_fkey') THEN
    ALTER TABLE "job_interviews" 
      ADD CONSTRAINT "job_interviews_applicationId_fkey" 
      FOREIGN KEY ("applicationId") REFERENCES "job_applications"("id") 
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'job_interviews_jobOpeningId_fkey') THEN
    ALTER TABLE "job_interviews" 
      ADD CONSTRAINT "job_interviews_jobOpeningId_fkey" 
      FOREIGN KEY ("jobOpeningId") REFERENCES "job_openings"("id") 
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- 4. Recruitment Taxonomies
CREATE TABLE IF NOT EXISTS "recruitment_taxonomies" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "description" TEXT,
    "extra" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recruitment_taxonomies_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "recruitment_taxonomies_type_idx" ON "recruitment_taxonomies"("type");
CREATE INDEX IF NOT EXISTS "recruitment_taxonomies_active_idx" ON "recruitment_taxonomies"("active");

-- 5. Notifications
CREATE TABLE IF NOT EXISTS "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'info',
    "category" TEXT NOT NULL DEFAULT 'GENERAL',
    "link" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "notifications_userId_idx" ON "notifications"("userId");
CREATE INDEX IF NOT EXISTS "notifications_createdAt_idx" ON "notifications"("createdAt");

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'notifications_userId_fkey') THEN
    ALTER TABLE "notifications" 
      ADD CONSTRAINT "notifications_userId_fkey" 
      FOREIGN KEY ("userId") REFERENCES "users"("id") 
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- 6. Announcements
CREATE TABLE IF NOT EXISTS "announcements" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'EVENTS',
    "priority" TEXT NOT NULL DEFAULT 'HIGH',
    "department" TEXT DEFAULT 'Company-Wide (All Offices)',
    "summary" TEXT,
    "content" TEXT NOT NULL,
    "author" TEXT NOT NULL DEFAULT 'People Operations & HR',
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "announcements_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "announcements_createdAt_idx" ON "announcements"("createdAt");

-- 7. Announcement Acknowledgments
CREATE TABLE IF NOT EXISTS "announcement_acknowledgments" (
    "id" TEXT NOT NULL,
    "announcementId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "acknowledgedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "announcement_acknowledgments_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'announcement_acknowledgments' AND indexname = 'announcement_acknowledgments_announcementId_userId_key') THEN
    CREATE UNIQUE INDEX "announcement_acknowledgments_announcementId_userId_key" ON "announcement_acknowledgments"("announcementId", "userId");
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "announcement_acknowledgments_announcementId_idx" ON "announcement_acknowledgments"("announcementId");
CREATE INDEX IF NOT EXISTS "announcement_acknowledgments_userId_idx" ON "announcement_acknowledgments"("userId");

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'announcement_acknowledgments_announcementId_fkey') THEN
    ALTER TABLE "announcement_acknowledgments" 
      ADD CONSTRAINT "announcement_acknowledgments_announcementId_fkey" 
      FOREIGN KEY ("announcementId") REFERENCES "announcements"("id") 
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'announcement_acknowledgments_userId_fkey') THEN
    ALTER TABLE "announcement_acknowledgments" 
      ADD CONSTRAINT "announcement_acknowledgments_userId_fkey" 
      FOREIGN KEY ("userId") REFERENCES "users"("id") 
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- 8. Tickets
CREATE TABLE IF NOT EXISTS "tickets" (
    "id" TEXT NOT NULL,
    "ticketNumber" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'GENERAL_HR',
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    "assignedTo" TEXT DEFAULT 'NexaHR Support Team',
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "tickets_ticketNumber_key" ON "tickets"("ticketNumber");
CREATE INDEX IF NOT EXISTS "tickets_userId_idx" ON "tickets"("userId");
CREATE INDEX IF NOT EXISTS "tickets_status_idx" ON "tickets"("status");
CREATE INDEX IF NOT EXISTS "tickets_createdAt_idx" ON "tickets"("createdAt");

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'tickets_userId_fkey') THEN
    ALTER TABLE "tickets" 
      ADD CONSTRAINT "tickets_userId_fkey" 
      FOREIGN KEY ("userId") REFERENCES "users"("id") 
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- 9. Ticket Replies
CREATE TABLE IF NOT EXISTS "ticket_replies" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ticket_replies_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ticket_replies_ticketId_idx" ON "ticket_replies"("ticketId");
CREATE INDEX IF NOT EXISTS "ticket_replies_userId_idx" ON "ticket_replies"("userId");
CREATE INDEX IF NOT EXISTS "ticket_replies_createdAt_idx" ON "ticket_replies"("createdAt");

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ticket_replies_ticketId_fkey') THEN
    ALTER TABLE "ticket_replies" 
      ADD CONSTRAINT "ticket_replies_ticketId_fkey" 
      FOREIGN KEY ("ticketId") REFERENCES "tickets"("id") 
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ticket_replies_userId_fkey') THEN
    ALTER TABLE "ticket_replies" 
      ADD CONSTRAINT "ticket_replies_userId_fkey" 
      FOREIGN KEY ("userId") REFERENCES "users"("id") 
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- 10. Password Reset Tokens
CREATE TABLE IF NOT EXISTS "password_reset_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "usedAt" TIMESTAMP(3),
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "password_reset_tokens_tokenHash_key" ON "password_reset_tokens"("tokenHash");
CREATE INDEX IF NOT EXISTS "password_reset_tokens_tokenHash_idx" ON "password_reset_tokens"("tokenHash");
CREATE INDEX IF NOT EXISTS "password_reset_tokens_userId_idx" ON "password_reset_tokens"("userId");

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'password_reset_tokens_userId_fkey') THEN
    ALTER TABLE "password_reset_tokens" 
      ADD CONSTRAINT "password_reset_tokens_userId_fkey" 
      FOREIGN KEY ("userId") REFERENCES "users"("id") 
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- 11. Password Reset OTPs
CREATE TABLE IF NOT EXISTS "password_reset_otps" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "otpHash" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_otps_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "password_reset_otps_userId_idx" ON "password_reset_otps"("userId");
CREATE INDEX IF NOT EXISTS "password_reset_otps_email_idx" ON "password_reset_otps"("email");

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'password_reset_otps_userId_fkey') THEN
    ALTER TABLE "password_reset_otps" 
      ADD CONSTRAINT "password_reset_otps_userId_fkey" 
      FOREIGN KEY ("userId") REFERENCES "users"("id") 
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
