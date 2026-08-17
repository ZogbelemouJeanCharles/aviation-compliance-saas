import "server-only";
import { prisma } from "@/lib/db/client";

/**
 * The FAA's public bulk file (see ./ingest.ts) has no certificate number —
 * it only supports a weak "does this name appear in the registry at all"
 * signal, never a real match against a declared certificate number. This is
 * why certification verification is a *guided manual* step (see the review
 * page) rather than automatic: a recruiter checks name + certificate number
 * against the FAA's official Airmen Inquiry tool themselves. This function
 * only powers the supporting "name found in our last snapshot" hint shown
 * on that page — it must never be used to set a verification status.
 */
export async function checkNameInFaaRegistry(firstName: string, lastName: string) {
  const matches = await prisma.faaAirmenRecord.findMany({
    where: {
      firstName: { equals: firstName.trim(), mode: "insensitive" },
      lastName: { equals: lastName.trim(), mode: "insensitive" },
    },
    select: { certificationType: true, ingestedAt: true },
    take: 5,
  });

  return { found: matches.length > 0, matches };
}
