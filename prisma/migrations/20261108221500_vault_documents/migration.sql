-- CreateEnum
CREATE TYPE "VaultDocumentKind" AS ENUM ('ISSUED', 'POLICY');

-- CreateTable
CREATE TABLE "vault_documents" (
    "id" TEXT NOT NULL,
    "kind" "VaultDocumentKind" NOT NULL,
    "referenceNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "typeLabel" TEXT,
    "description" TEXT,
    "version" TEXT,
    "department" TEXT,
    "issuer" TEXT,
    "status" TEXT NOT NULL DEFAULT 'VERIFIED',
    "size" TEXT,
    "fileUrl" TEXT,
    "cloudinaryId" TEXT,
    "mimeType" TEXT,
    "employeeId" TEXT,
    "employeeName" TEXT,
    "employeeCode" TEXT,
    "employeeEmail" TEXT,
    "designation" TEXT,
    "expiryDate" TIMESTAMP(3),
    "notifyEmployee" BOOLEAN NOT NULL DEFAULT true,
    "uploadedBy" TEXT,
    "uploadedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vault_documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "vault_documents_referenceNumber_key" ON "vault_documents"("referenceNumber");

-- CreateIndex
CREATE INDEX "vault_documents_kind_idx" ON "vault_documents"("kind");

-- CreateIndex
CREATE INDEX "vault_documents_employeeId_idx" ON "vault_documents"("employeeId");

-- CreateIndex
CREATE INDEX "vault_documents_uploadedById_idx" ON "vault_documents"("uploadedById");

-- CreateIndex
CREATE INDEX "vault_documents_createdAt_idx" ON "vault_documents"("createdAt");

-- AddForeignKey
ALTER TABLE "vault_documents" ADD CONSTRAINT "vault_documents_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vault_documents" ADD CONSTRAINT "vault_documents_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

