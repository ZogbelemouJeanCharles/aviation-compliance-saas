import type {
  CertificationType,
  ClearanceLevel,
  IssuingAuthority,
  VerificationStatus,
  WorkAuthorizationStatus,
} from "@prisma/client";

export const WORK_AUTHORIZATION_LABELS: Record<WorkAuthorizationStatus, string> = {
  US_CITIZEN: "U.S. Citizen",
  PERMANENT_RESIDENT: "Permanent Resident",
  VISA_HOLDER: "Visa Holder",
  SPONSORSHIP_REQUIRED: "Sponsorship Required",
  OTHER: "Other",
};

export const CERTIFICATION_TYPE_LABELS: Record<CertificationType, string> = {
  PILOT_LICENSE: "Pilot License",
  AP_MECHANIC: "A&P Mechanic",
  TYPE_RATING: "Type Rating",
  MEDICAL_CERTIFICATE: "Medical Certificate",
  OTHER: "Other",
};

export const ISSUING_AUTHORITY_LABELS: Record<IssuingAuthority, string> = {
  FAA: "FAA",
  EASA: "EASA",
  OTHER: "Other",
};

export const CLEARANCE_LEVEL_LABELS: Record<ClearanceLevel, string> = {
  CONFIDENTIAL: "Confidential",
  SECRET: "Secret",
  TOP_SECRET: "Top Secret",
  TOP_SECRET_SCI: "Top Secret/SCI",
  OTHER: "Other",
};

export const VERIFICATION_STATUS_LABELS: Record<VerificationStatus, string> = {
  PENDING: "Pending",
  VERIFIED: "Verified",
  NOT_FOUND: "Not Found",
  MANUAL_REVIEW_REQUIRED: "Manual Review Required",
  MANUALLY_VERIFIED: "Manually Verified",
  MANUALLY_REJECTED: "Manually Rejected",
};

export const VERIFICATION_STATUS_STYLES: Record<VerificationStatus, string> = {
  PENDING: "bg-muted text-muted-foreground",
  VERIFIED: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  NOT_FOUND: "bg-destructive/10 text-destructive",
  MANUAL_REVIEW_REQUIRED: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  MANUALLY_VERIFIED: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  MANUALLY_REJECTED: "bg-destructive/10 text-destructive",
};
