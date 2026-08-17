"use server";

import * as z from "zod";
import { redirect } from "next/navigation";
import { CertificationType, IssuingAuthority, ClearanceLevel } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth/dal";
import { createCertification, recordCertificationVerification } from "@/lib/db/certifications";
import { createSecurityClearance, recordClearanceVerification } from "@/lib/db/clearances";

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

const MAX_DOCUMENT_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ACCEPTED_DOCUMENT_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"];

async function extractDocument(formData: FormData) {
  const file = formData.get("document");
  if (!(file instanceof File) || file.size === 0) return {};

  if (file.size > MAX_DOCUMENT_SIZE_BYTES) {
    throw new Error("The document must be smaller than 10MB.");
  }
  if (!ACCEPTED_DOCUMENT_TYPES.includes(file.type)) {
    throw new Error("The document must be a PDF, JPEG, PNG, or WEBP file.");
  }

  return {
    documentFileName: file.name,
    documentMimeType: file.type,
    // `.slice()` gives a plain `Uint8Array<ArrayBuffer>` — the exact type
    // Prisma's `Bytes` scalar expects (TS otherwise infers the wider
    // `ArrayBufferLike` from the Uint8Array constructor).
    documentData: new Uint8Array(await file.arrayBuffer()).slice(),
  };
}

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

  let document: Awaited<ReturnType<typeof extractDocument>>;
  try {
    document = await extractDocument(formData);
  } catch (error) {
    return { message: error instanceof Error ? error.message : "Invalid document." };
  }

  try {
    await createCertification(user.companyId, candidateId, user.id, {
      ...rest,
      ratingsOrTypes: ratingsOrTypes || null,
      issueDate: issueDate ? new Date(issueDate) : null,
      expirationDate: expirationDate ? new Date(expirationDate) : null,
      ...document,
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

// --- Manual review (certifications & clearances) ---------------------------
//
// There is no automatic FAA verification step: the FAA's public bulk file
// has no certificate number field, and the only tool that accepts a
// certificate number (the official Airmen Inquiry search) has no API — see
// src/lib/faa/check-name-in-registry.ts. A recruiter checks name + cert
// number there themselves, then records the outcome below.

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
