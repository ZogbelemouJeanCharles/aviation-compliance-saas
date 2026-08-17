import "server-only";
import { prisma } from "@/lib/db/client";
import { recordCertificationVerification } from "@/lib/db/certifications";
import { matchCertification } from "./match";
import type { VerificationStatus } from "@prisma/client";

/**
 * Runs automated FAA verification for one certification and writes the
 * result (+ audit trail entry) via recordCertificationVerification.
 *
 * This is the DB-touching wrapper around the pure matchCertification()
 * function: it loads the candidate rows to compare against (every ingested
 * FAA record sharing the declared certificate number) and the candidate's
 * name, then delegates the actual matching rules.
 */
export async function verifyCertificationAgainstFaa(params: {
  companyId: string;
  actorUserId: string;
  certificationId: string;
}) {
  const certification = await prisma.certification.findFirst({
    where: { id: params.certificationId, candidate: { companyId: params.companyId } },
    include: { candidate: { select: { firstName: true, lastName: true } } },
  });

  if (!certification) {
    throw new Error("Certification not found in this company");
  }

  // Case-insensitive equality as a DB-level pre-filter; matchCertification()
  // still does its own normalization (whitespace, casing) on whatever comes
  // back, so this only needs to avoid missing rows, not be exact.
  const candidateRows = await prisma.faaAirmenRecord.findMany({
    where: {
      certificateNumber: { equals: certification.certificateNumber.trim(), mode: "insensitive" },
    },
    select: { certificateNumber: true, firstName: true, lastName: true },
  });

  const result = matchCertification(
    {
      certificateNumber: certification.certificateNumber,
      firstName: certification.candidate.firstName,
      lastName: certification.candidate.lastName,
      issuingAuthority: certification.issuingAuthority,
    },
    candidateRows
  );

  const status: VerificationStatus = result.status;

  return recordCertificationVerification({
    companyId: params.companyId,
    actorUserId: params.actorUserId,
    certificationId: params.certificationId,
    status,
    notes: result.status === "VERIFIED" ? null : result.reason,
    auditAction: "CERTIFICATION_FAA_VERIFICATION_RUN",
    auditDetails: { matchResult: result },
  });
}
