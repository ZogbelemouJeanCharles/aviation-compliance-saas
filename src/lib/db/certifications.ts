import "server-only";
import { prisma } from "./client";
import type { CertificationType, IssuingAuthority, Prisma, VerificationStatus } from "@prisma/client";
import { assertCandidateBelongsToCompany } from "./candidates";
import { logAuditEntry } from "./audit";

export type CertificationInput = {
  type: CertificationType;
  certificateNumber: string;
  issuingAuthority: IssuingAuthority;
  ratingsOrTypes?: string | null;
  issueDate?: Date | null;
  expirationDate?: Date | null;
  documentFileName?: string | null;
  documentMimeType?: string | null;
  documentData?: Prisma.Bytes | null;
};

export async function createCertification(
  companyId: string,
  candidateId: string,
  actorUserId: string,
  data: CertificationInput
) {
  await assertCandidateBelongsToCompany(companyId, candidateId);

  const certification = await prisma.certification.create({
    data: { ...data, candidateId, verificationStatus: "PENDING" },
  });

  await logAuditEntry({
    companyId,
    actorUserId,
    entityType: "CERTIFICATION",
    entityId: certification.id,
    action: "CERTIFICATION_CREATED",
    details: {
      type: data.type,
      certificateNumber: data.certificateNumber,
      documentAttached: !!data.documentData,
    },
  });

  return certification;
}

export async function getCertificationForReview(companyId: string, certificationId: string) {
  return prisma.certification.findFirst({
    where: { id: certificationId, candidate: { companyId } },
    select: {
      id: true,
      type: true,
      certificateNumber: true,
      issuingAuthority: true,
      ratingsOrTypes: true,
      issueDate: true,
      expirationDate: true,
      verificationStatus: true,
      verifiedAt: true,
      verificationNotes: true,
      documentFileName: true,
      documentMimeType: true,
      candidateId: true,
      candidate: { select: { id: true, firstName: true, lastName: true } },
    },
  });
}

// Only the download route needs the actual file bytes — kept separate from
// getCertificationForReview so the review page never loads a multi-MB blob
// just to render a status form.
export async function getCertificationDocument(companyId: string, certificationId: string) {
  return prisma.certification.findFirst({
    where: { id: certificationId, candidate: { companyId } },
    select: { documentFileName: true, documentMimeType: true, documentData: true },
  });
}

async function assertCertificationBelongsToCompany(companyId: string, certificationId: string) {
  const certification = await prisma.certification.findFirst({
    where: { id: certificationId, candidate: { companyId } },
    select: { id: true },
  });
  if (!certification) {
    throw new Error("Certification not found in this company");
  }
}

// Records the outcome of a recruiter's manual review against the official
// FAA lookup (or, for EASA/other authorities, their own judgment) — see
// src/lib/faa for why this can't be fully automated. Every call is written
// to the audit trail, since this is the compliance record a customer would
// need to show in a regulatory review.
export async function recordCertificationVerification(params: {
  companyId: string;
  actorUserId: string | null;
  certificationId: string;
  status: VerificationStatus;
  notes?: string | null;
  auditAction: string;
  auditDetails?: Record<string, unknown>;
}) {
  await assertCertificationBelongsToCompany(params.companyId, params.certificationId);

  const certification = await prisma.certification.update({
    where: { id: params.certificationId },
    data: {
      verificationStatus: params.status,
      verifiedAt: new Date(),
      verificationNotes: params.notes ?? null,
    },
  });

  await logAuditEntry({
    companyId: params.companyId,
    actorUserId: params.actorUserId,
    entityType: "CERTIFICATION",
    entityId: certification.id,
    action: params.auditAction,
    details: { status: params.status, notes: params.notes, ...params.auditDetails },
  });

  return certification;
}
