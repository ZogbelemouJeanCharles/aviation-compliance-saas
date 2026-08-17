-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'RECRUITER');

-- CreateEnum
CREATE TYPE "WorkAuthorizationStatus" AS ENUM ('US_CITIZEN', 'PERMANENT_RESIDENT', 'VISA_HOLDER', 'SPONSORSHIP_REQUIRED', 'OTHER');

-- CreateEnum
CREATE TYPE "CertificationType" AS ENUM ('PILOT_LICENSE', 'AP_MECHANIC', 'TYPE_RATING', 'MEDICAL_CERTIFICATE', 'OTHER');

-- CreateEnum
CREATE TYPE "IssuingAuthority" AS ENUM ('FAA', 'EASA', 'OTHER');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'NOT_FOUND', 'MANUAL_REVIEW_REQUIRED', 'MANUALLY_VERIFIED', 'MANUALLY_REJECTED');

-- CreateEnum
CREATE TYPE "ClearanceLevel" AS ENUM ('CONFIDENTIAL', 'SECRET', 'TOP_SECRET', 'TOP_SECRET_SCI', 'OTHER');

-- CreateEnum
CREATE TYPE "AuditEntityType" AS ENUM ('CANDIDATE', 'CERTIFICATION', 'SECURITY_CLEARANCE');

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'RECRUITER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Candidate" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "workAuthorizationStatus" "WorkAuthorizationStatus" NOT NULL DEFAULT 'OTHER',
    "workAuthorizationNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "Candidate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Certification" (
    "id" TEXT NOT NULL,
    "type" "CertificationType" NOT NULL,
    "certificateNumber" TEXT NOT NULL,
    "issuingAuthority" "IssuingAuthority" NOT NULL,
    "ratingsOrTypes" TEXT,
    "issueDate" TIMESTAMP(3),
    "expirationDate" TIMESTAMP(3),
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "verifiedAt" TIMESTAMP(3),
    "verificationNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "candidateId" TEXT NOT NULL,

    CONSTRAINT "Certification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SecurityClearance" (
    "id" TEXT NOT NULL,
    "level" "ClearanceLevel" NOT NULL,
    "grantedDate" TIMESTAMP(3),
    "expirationOrReinvestigationDate" TIMESTAMP(3),
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "verifiedAt" TIMESTAMP(3),
    "verificationNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "candidateId" TEXT NOT NULL,

    CONSTRAINT "SecurityClearance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FlightHoursEntry" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "hours" DOUBLE PRECISION NOT NULL,
    "candidateId" TEXT NOT NULL,

    CONSTRAINT "FlightHoursEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FaaAirmenRecord" (
    "id" TEXT NOT NULL,
    "certificateNumber" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "certificationType" TEXT NOT NULL,
    "ingestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FaaAirmenRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLogEntry" (
    "id" TEXT NOT NULL,
    "entityType" "AuditEntityType" NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "companyId" TEXT NOT NULL,
    "actorUserId" TEXT,

    CONSTRAINT "AuditLogEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_companyId_idx" ON "User"("companyId");

-- CreateIndex
CREATE INDEX "Candidate_companyId_idx" ON "Candidate"("companyId");

-- CreateIndex
CREATE INDEX "Candidate_companyId_lastName_firstName_idx" ON "Candidate"("companyId", "lastName", "firstName");

-- CreateIndex
CREATE INDEX "Certification_candidateId_idx" ON "Certification"("candidateId");

-- CreateIndex
CREATE INDEX "Certification_certificateNumber_idx" ON "Certification"("certificateNumber");

-- CreateIndex
CREATE INDEX "SecurityClearance_candidateId_idx" ON "SecurityClearance"("candidateId");

-- CreateIndex
CREATE INDEX "FlightHoursEntry_candidateId_idx" ON "FlightHoursEntry"("candidateId");

-- CreateIndex
CREATE INDEX "FaaAirmenRecord_certificateNumber_idx" ON "FaaAirmenRecord"("certificateNumber");

-- CreateIndex
CREATE INDEX "FaaAirmenRecord_lastName_firstName_idx" ON "FaaAirmenRecord"("lastName", "firstName");

-- CreateIndex
CREATE INDEX "AuditLogEntry_companyId_createdAt_idx" ON "AuditLogEntry"("companyId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLogEntry_entityType_entityId_idx" ON "AuditLogEntry"("entityType", "entityId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Candidate" ADD CONSTRAINT "Candidate_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certification" ADD CONSTRAINT "Certification_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecurityClearance" ADD CONSTRAINT "SecurityClearance_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlightHoursEntry" ADD CONSTRAINT "FlightHoursEntry_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLogEntry" ADD CONSTRAINT "AuditLogEntry_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLogEntry" ADD CONSTRAINT "AuditLogEntry_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
