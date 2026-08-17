"use server";

import * as z from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { CertificationType, IssuingAuthority, ClearanceLevel } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth/dal";
import { createCertification, recordCertificationVerification } from "@/lib/db/certifications";
import { createSecurityClearance, recordClearanceVerification } from "@/lib/db/clearances";
import { verifyCertificationAgainstFaa } from "@/lib/faa/verify-certification";

// --- Add certification ---------------------------------------------------

const CertificationSchema = z.object({
  candidateId: z.string().min(1),
  type: z.enum(CertificationType),
  certificateNumber: z.string().min(1, { error: "Certificate number is required." }),
  issuingAuthority: z.enum(IssuingAuthority),
  ratingsOrTypes: z.string().optional(),
  issueDate: z.string().optional(),
  expirationDate: z.string().optional(),
});

export type CertificationFormState =
  | { errors?: Record<string, string[]>; message?: string }
  | undefined;

export async function addCertificationAction(
  _state: CertificationFormState,
  formData: FormData
): Promise<CertificationFormState> {
  const user = await getCurrentUser();
  const validated = CertificationSchema.safeParse(Object.fromEntries(formData));
  if (!validated.success) {
    return { errors: z.flattenError(validated.error).fieldErrors };
  }

  const { candidateId, issueDate, expirationDate, ratingsOrTypes, ...rest } = validated.data;

  try {
    await createCertification(user.companyId, candidateId, user.id, {
      ...rest,
      ratingsOrTypes: ratingsOrTypes || null,
      issueDate: issueDate ? new Date(issueDate) : null,
      expirationDate: expirationDate ? new Date(expirationDate) : null,
    });
  } catch {
    return { message: "Could not add the certification. Please try again." };
  }

  redirect(`/candidates/${candidateId}`);
}

// --- Add security clearance ------------------------------------------------

const ClearanceSchema = z.object({
  candidateId: z.string().min(1),
  level: z.enum(ClearanceLevel),
  grantedDate: z.string().optional(),
  expirationOrReinvestigationDate: z.string().optional(),
});

export type ClearanceFormState =
  | { errors?: Record<string, string[]>; message?: string }
  | undefined;

export async function addClearanceAction(
  _state: ClearanceFormState,
  formData: FormData
): Promise<ClearanceFormState> {
  const user = await getCurrentUser();
  const validated = ClearanceSchema.safeParse(Object.fromEntries(formData));
  if (!validated.success) {
    return { errors: z.flattenError(validated.error).fieldErrors };
  }

  const { candidateId, grantedDate, expirationOrReinvestigationDate, ...rest } = validated.data;

  try {
    await createSecurityClearance(user.companyId, candidateId, user.id, {
      ...rest,
      grantedDate: grantedDate ? new Date(grantedDate) : null,
      expirationOrReinvestigationDate: expirationOrReinvestigationDate
        ? new Date(expirationOrReinvestigationDate)
        : null,
    });
  } catch {
    return { message: "Could not add the security clearance. Please try again." };
  }

  redirect(`/candidates/${candidateId}`);
}

// --- Verify a certification against the FAA snapshot ----------------------

export async function verifyCertificationAction(certificationId: string, candidateId: string) {
  const user = await getCurrentUser();
  await verifyCertificationAgainstFaa({
    companyId: user.companyId,
    actorUserId: user.id,
    certificationId,
  });
  revalidatePath(`/candidates/${candidateId}`);
}

// --- Manual review (certifications & clearances) ---------------------------

export async function reviewCertificationAction(
  certificationId: string,
  candidateId: string,
  status: "MANUALLY_VERIFIED" | "MANUALLY_REJECTED",
  formData: FormData
) {
  const user = await getCurrentUser();
  const notes = formData.get("notes")?.toString() || null;

  await recordCertificationVerification({
    companyId: user.companyId,
    actorUserId: user.id,
    certificationId,
    status,
    notes,
    auditAction: "CERTIFICATION_MANUAL_REVIEW",
  });

  redirect(`/candidates/${candidateId}`);
}

export async function reviewClearanceAction(
  clearanceId: string,
  candidateId: string,
  status: "MANUALLY_VERIFIED" | "MANUALLY_REJECTED",
  formData: FormData
) {
  const user = await getCurrentUser();
  const notes = formData.get("notes")?.toString() || null;

  await recordClearanceVerification({
    companyId: user.companyId,
    actorUserId: user.id,
    clearanceId,
    status,
    notes,
  });

  redirect(`/candidates/${candidateId}`);
}
