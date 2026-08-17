import "server-only";
import { prisma } from "./client";
import type { CertificationType, IssuingAuthority, VerificationStatus } from "@prisma/client";
import { assertCandidateBelongsToCompany } from "./candidates";
import { logAuditEntry } from "./audit";

export type CertificationInput = {
  type: CertificationType;
  certificateNumber: string;
  issuingAuthority: IssuingAuthority;
  ratingsOrTypes?: string | null;
  issueDate?: Date | null;
  expirationDate?: Date | null;
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
    details: { type: data.type, certificateNumber: data.certificateNumber },
  });

  return certification;
}

export async function getCertificationForReview(companyId: string, certificationId: string) {
  return prisma.certification.findFirst({
    where: { id: certificationId, candidate: { companyId } },
    include: { candidate: { select: { id: true, firstName: true, lastName: true } } },
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

// Records the outcome of a verification attempt — whether it came from the
// automatic FAA matcher (src/lib/faa) or a recruiter's manual override.
// Every call is written to the audit trail, since this is the compliance
// record a customer would need to show in a regulatory review.
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
