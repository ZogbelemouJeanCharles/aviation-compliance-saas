import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/client";
import { getSession } from "./session";

// The Data Access Layer is the *real* authorization gate — proxy.ts only does
// a cheap optimistic redirect. Every Server Component, Server Action, and
// Route Handler that touches tenant data should go through verifySession()
// (or getCurrentUser()) rather than trusting proxy.ts alone.
export const verifySession = cache(async () => {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  return session;
});

export const getCurrentUser = cache(async () => {
  const session = await verifySession();
  return {
    id: session.userId,
    companyId: session.companyId,
    role: session.role,
  };
});

// Fetches display info (name, email, company name) for the signed-in user.
// Kept out of the session payload/JWT on purpose — see session.ts.
export const getCurrentUserProfile = cache(async () => {
  const session = await verifySession();
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { name: true, email: true, company: { select: { name: true } } },
  });
  if (!user) redirect("/login");
  return user;
});
