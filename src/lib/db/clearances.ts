import "server-only";
import { prisma } from "./client";
import type { ClearanceLevel, VerificationStatus } from "@prisma/client";
import { assertCandidateBelongsToCompany } from "./candidates";
import { logAuditEntry } from "./audit";

export type SecurityClearanceInput = {
  level: ClearanceLevel;
  grantedDate?: Date | null;
  expirationOrReinvestigationDate?: Date | null;
};

export async function createSecurityClearance(
  companyId: string,
  candidateId: string,
  actorUserId: string,
  data: SecurityClearanceInput
) {
  await assertCandidateBelongsToCompany(companyId, candidateId);

  // No public registry to check a clearance against — every clearance starts
  // out requiring a manual review, unlike certifications which may resolve
  // automatically against the FAA data (see src/lib/faa).
  const clearance = await prisma.securityClearance.create({
    data: { ...data, candidateId, verificationStatus: "MANUAL_REVIEW_REQUIRED" },
  });

  await logAuditEntry({
    companyId,
    actorUserId,
    entityType: "SECURITY_CLEARANCE",
    entityId: clearance.id,
    action: "SECURITY_CLEARANCE_CREATED",
    details: { level: data.level },
  });

  return clearance;
}

export async function getClearanceForReview(companyId: string, clearanceId: string) {
  return prisma.securityClearance.findFirst({
    where: { id: clearanceId, candidate: { companyId } },
    include: { candidate: { select: { id: true, firstName: true, lastName: true } } },
  });
}

export async function recordClearanceVerification(params: {
  companyId: string;
  actorUserId: string;
  clearanceId: string;
  status: VerificationStatus;
  notes?: string | null;
}) {
  const clearance = await prisma.securityClearance.findFirst({
    where: { id: params.clearanceId, candidate: { companyId: params.companyId } },
  });
  if (!clearance) {
    throw new Error("Security clearance not found in this company");
  }

  const updated = await prisma.securityClearance.update({
    where: { id: params.clearanceId },
    data: {
      verificationStatus: params.status,
      verifiedAt: new Date(),
      verificationNotes: params.notes ?? null,
    },
  });

  await logAuditEntry({
    companyId: params.companyId,
    actorUserId: params.actorUserId,
    entityType: "SECURITY_CLEARANCE",
    entityId: updated.id,
    action: "SECURITY_CLEARANCE_VERIFICATION_UPDATED",
    details: { status: params.status, notes: params.notes },
  });

  return updated;
}
