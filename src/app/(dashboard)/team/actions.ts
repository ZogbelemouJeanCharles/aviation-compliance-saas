"use server";

import * as z from "zod";
import { revalidatePath } from "next/cache";
import { UserRole } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth/dal";
import { createTeammate } from "@/lib/db/users";

const AddTeammateSchema = z.object({
  name: z.string().min(1, { error: "Name is required." }),
  email: z.email({ error: "Enter a valid email." }),
  password: z.string().min(8, { error: "Password must be at least 8 characters." }),
  role: z.enum(UserRole),
});

export type AddTeammateFormState =
  | { errors?: Record<string, string[]>; message?: string; success?: boolean }
  | undefined;

export async function addTeammateAction(
  _state: AddTeammateFormState,
  formData: FormData
): Promise<AddTeammateFormState> {
  const user = await getCurrentUser();
  if (user.role !== "ADMIN") {
    return { message: "Only admins can add teammates." };
  }

  const validated = AddTeammateSchema.safeParse(Object.fromEntries(formData));
  if (!validated.success) {
    return { errors: z.flattenError(validated.error).fieldErrors };
  }

  try {
    await createTeammate(user.companyId, user.id, validated.data);
  } catch (error) {
    return { message: error instanceof Error ? error.message : "Could not add teammate." };
  }

  revalidatePath("/team");
  return { success: true };
}
