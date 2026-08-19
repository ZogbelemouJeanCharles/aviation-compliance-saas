import "server-only";
import { prisma } from "./client";
import type { Prisma, VerificationStatus, WorkAuthorizationStatus } from "@prisma/client";
import { logAuditEntry } from "./audit";

// Excludes `documentData` (the uploaded certificate file, stored as bytes in
// the DB) — list/detail views only need to know a document exists
// (`documentFileName`), not load its full contents into memory.
const CERTIFICATION_LIST_SELECT = {
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
  createdAt: true,
  updatedAt: true,
  candidateId: true,
} satisfies Prisma.CertificationSelect;

// Every function here takes `companyId` as its first argument and folds it
// into the query — this is the application-level tenant boundary. There is
// no "list all candidates" helper without a companyId on purpose: a recruiter
// from Company A must never be able to load Company B's data.

export type CandidateListFilters = {
  search?: string;
  certificationVerificationStatus?: VerificationStatus;
};

export async function listCandidates(companyId: string, filters: CandidateListFilters = {}) {
  const where: Prisma.CandidateWhereInput = {
    companyId,
    ...(filters.search && {
      OR: [
        { firstName: { contains: filters.search, mode: "insensitive" } },
        { lastName: { contains: filters.search, mode: "insensitive" } },
        { email: { contains: filters.search, mode: "insensitive" } },
      ],
    }),
    ...(filters.certificationVerificationStatus && {
      certifications: { some: { verificationStatus: filters.certificationVerificationStatus } },
    }),
  };

  return prisma.candidate.findMany({
    where,
    include: {
      certifications: { select: CERTIFICATION_LIST_SELECT },
      securityClearances: true,
    },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });
}

const TERMINAL_STATUSES: VerificationStatus[] = ["MANUALLY_VERIFIED", "MANUALLY_REJECTED"];

export async function getCandidateStats(companyId: string) {
  const [totalCandidates, pendingCertifications, pendingClearances, verifiedCertifications] =
    await Promise.all([
      prisma.candidate.count({ where: { companyId } }),
      prisma.certification.count({
        where: { candidate: { companyId }, verificationStatus: { notIn: TERMINAL_STATUSES } },
      }),
      prisma.securityClearance.count({
        where: { candidate: { companyId }, verificationStatus: { notIn: TERMINAL_STATUSES } },
      }),
      prisma.certification.count({
        where: { candidate: { companyId }, verificationStatus: "MANUALLY_VERIFIED" },
      }),
    ]);

  return {
    totalCandidates,
    needsManualReview: pendingCertifications + pendingClearances,
    verifiedCertifications,
  };
}

export async function getCandidate(companyId: string, candidateId: string) {
  return prisma.candidate.findFirst({
    where: { id: candidateId, companyId },
    include: {
      certifications: { select: CERTIFICATION_LIST_SELECT, orderBy: { createdAt: "desc" } },
      securityClearances: { orderBy: { createdAt: "desc" } },
      flightHours: true,
    },
  });
}

export type CandidateInput = {
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  workAuthorizationStatus: WorkAuthorizationStatus;
  workAuthorizationNotes?: string | null;
};

export async function createCandidate(
  companyId: string,
  actorUserId: string,
  data: CandidateInput
) {
  const candidate = await prisma.candidate.create({ data: { ...data, companyId } });

  await logAuditEntry({
    companyId,
    actorUserId,
    entityType: "CANDIDATE",
    entityId: candidate.id,
    action: "CANDIDATE_CREATED",
    details: { firstName: data.firstName, lastName: data.lastName },
  });

  return candidate;
}

export async function updateCandidate(
  companyId: string,
  actorUserId: string,
  candidateId: string,
  data: Partial<CandidateInput>
) {
  await assertCandidateBelongsToCompany(companyId, candidateId);
  const candidate = await prisma.candidate.update({ where: { id: candidateId }, data });

  await logAuditEntry({
    companyId,
    actorUserId,
    entityType: "CANDIDATE",
    entityId: candidate.id,
    action: "CANDIDATE_UPDATED",
    details: { fields: Object.keys(data) },
  });

  return candidate;
}

// Shared by certifications.ts and clearances.ts before any nested mutation,
// so a candidateId from a form can't be swapped for one in another company.
export async function assertCandidateBelongsToCompany(companyId: string, candidateId: string) {
  const candidate = await prisma.candidate.findFirst({
    where: { id: candidateId, companyId },
    select: { id: true },
  });
  if (!candidate) {
    throw new Error("Candidate not found in this company");
  }
}
