"use server";

import * as z from "zod";
import { redirect } from "next/navigation";
import { WorkAuthorizationStatus } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth/dal";
import { createCandidate } from "@/lib/db/candidates";

const CandidateSchema = z.object({
  firstName: z.string().min(1, { error: "First name is required." }),
  lastName: z.string().min(1, { error: "Last name is required." }),
  email: z.union([z.email({ error: "Enter a valid email." }), z.literal("")]).optional(),
  phone: z.string().optional(),
  workAuthorizationStatus: z.enum(WorkAuthorizationStatus),
  workAuthorizationNotes: z.string().optional(),
});

export type CandidateFormState =
  | { errors?: Record<string, string[]>; message?: string }
  | undefined;

export async function createCandidateAction(
  _state: CandidateFormState,
  formData: FormData
): Promise<CandidateFormState> {
  const user = await getCurrentUser();

  const validated = CandidateSchema.safeParse(Object.fromEntries(formData));
  if (!validated.success) {
    return { errors: z.flattenError(validated.error).fieldErrors };
  }

  const { email, phone, workAuthorizationNotes, ...rest } = validated.data;

  let candidate;
  try {
    candidate = await createCandidate(user.companyId, user.id, {
      ...rest,
      email: email || null,
      phone: phone || null,
      workAuthorizationNotes: workAuthorizationNotes || null,
    });
  } catch {
    return { message: "Could not create the candidate. Please try again." };
  }

  redirect(`/candidates/${candidate.id}`);
}
