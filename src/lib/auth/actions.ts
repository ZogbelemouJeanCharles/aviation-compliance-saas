"use server";

import * as z from "zod";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/client";
import { verifyPassword } from "./password";
import { createSession, deleteSession } from "./session";

const LoginSchema = z.object({
  email: z.email({ error: "Enter a valid email address." }),
  password: z.string().min(1, { error: "Password is required." }),
});

export type LoginState =
  | { errors?: { email?: string[]; password?: string[] }; message?: string }
  | undefined;

export async function login(_state: LoginState, formData: FormData): Promise<LoginState> {
  const validated = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validated.success) {
    return { errors: z.flattenError(validated.error).fieldErrors };
  }

  const { email, password } = validated.data;

  const user = await prisma.user.findUnique({ where: { email } });

  // Same generic error whether the email doesn't exist or the password is
  // wrong — avoids confirming to an attacker that an email is registered.
  const invalidCredentials = { message: "Invalid email or password." };

  if (!user) return invalidCredentials;

  const passwordMatches = await verifyPassword(password, user.passwordHash);
  if (!passwordMatches) return invalidCredentials;

  await createSession({ id: user.id, companyId: user.companyId, role: user.role });
  redirect("/candidates");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
