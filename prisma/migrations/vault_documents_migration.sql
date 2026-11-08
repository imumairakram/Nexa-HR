-- Migration: Add VaultDocument table for persistent document/policy storage
-- Run with: npx prisma migrate deploy  (after creating a named migration)
-- DO NOT run this file directly against the DB without a Prisma migration wrapper.

-- Create enum for document kind
DO $$ BEGIN
  CREATE TYPE "VaultDocumentKind" AS ENUM ('ISSUED', 'POLICY');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create vault_documents table
CREATE TABLE IF NOT EXISTS "vault_documents" (
  "id"              TEXT NOT NULL,
  "kind"            "VaultDocumentKind" NOT NULL,
  "referenceNumber" TEXT NOT NULL,
  "title"           TEXT NOT NULL,
  "type"            TEXT NOT NULL,
  "typeLabel"       TEXT,
  "description"     TEXT,
  "version"         TEXT,
  "department"      TEXT,
  "issuer"          TEXT,
  "status"          TEXT NOT NULL DEFAULT 'VERIFIED',
  "size"            TEXT,
  "fileUrl"         TEXT,
  "cloudinaryId"    TEXT,
  "mimeType"        TEXT,

  -- ISSUED doc fields
  "employeeId"      TEXT,
  "employeeName"    TEXT,
  "employeeCode"    TEXT,
  "employeeEmail"   TEXT,
  "designation"     TEXT,
  "expiryDate"      TIMESTAMPTZ,
  "notifyEmployee"  BOOLEAN NOT NULL DEFAULT true,
  "uploadedBy"      TEXT,

  -- Audit
  "uploadedById"    TEXT NOT NULL,
  "createdAt"       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT "vault_documents_pkey" PRIMARY KEY ("id")
);

-- Unique constraint on referenceNumber
CREATE UNIQUE INDEX IF NOT EXISTS "vault_documents_referenceNumber_key"
  ON "vault_documents"("referenceNumber");

-- Indexes
CREATE INDEX IF NOT EXISTS "vault_documents_kind_idx"        ON "vault_documents"("kind");
CREATE INDEX IF NOT EXISTS "vault_documents_employeeId_idx"  ON "vault_documents"("employeeId");
CREATE INDEX IF NOT EXISTS "vault_documents_uploadedById_idx" ON "vault_documents"("uploadedById");
CREATE INDEX IF NOT EXISTS "vault_documents_createdAt_idx"   ON "vault_documents"("createdAt");

-- Foreign keys
ALTER TABLE "vault_documents"
  ADD CONSTRAINT "vault_documents_uploadedById_fkey"
    FOREIGN KEY ("uploadedById") REFERENCES "users"("id") ON DELETE CASCADE;

ALTER TABLE "vault_documents"
  ADD CONSTRAINT "vault_documents_employeeId_fkey"
    FOREIGN KEY ("employeeId") REFERENCES "users"("id") ON DELETE SET NULL;

