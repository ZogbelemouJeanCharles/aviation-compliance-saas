import "server-only";
import { prisma } from "@/lib/db/client";

// These queries are intentionally NOT scoped to a single companyId — this
// is a system job that needs visibility across every tenant so it can send
// one alert email per company. It's the one place in the codebase where
// that's correct; everything reachable from a request (pages, actions,
// route handlers) should go through the tenant-scoped helpers instead.

export async function findExpiringCertifications(daysAhead: number) {
  const now = new Date();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() + daysAhead);

  return prisma.certification.findMany({
    where: { expirationDate: { not: null, gte: now, lte: cutoff } },
    include: {
      candidate: { select: { id: true, firstName: true, lastName: true, companyId: true } },
    },
  });
}

export async function findExpiringClearances(daysAhead: number) {
  const now = new Date();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() + daysAhead);

  return prisma.securityClearance.findMany({
    where: { expirationOrReinvestigationDate: { not: null, gte: now, lte: cutoff } },
    include: {
      candidate: { select: { id: true, firstName: true, lastName: true, companyId: true } },
    },
  });
}
