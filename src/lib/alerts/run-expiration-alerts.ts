import "server-only";
import { prisma } from "@/lib/db/client";
import { logAuditEntry } from "@/lib/db/audit";
import { findExpiringCertifications, findExpiringClearances } from "./expiring-items";
import { sendExpirationAlertEmail } from "./email";

const ALERT_WINDOW_DAYS = 30;
// Once an alert has gone out for a given certification/clearance, don't send
// another one for the same item until this many days have passed — the cron
// runs daily, but nobody wants a fresh email every day for the same item.
const RE_ALERT_SUPPRESSION_DAYS = 7;

async function wasRecentlyAlerted(
  companyId: string,
  entityType: "CERTIFICATION" | "SECURITY_CLEARANCE",
  entityId: string
) {
  const since = new Date();
  since.setDate(since.getDate() - RE_ALERT_SUPPRESSION_DAYS);

  const existing = await prisma.auditLogEntry.findFirst({
    where: {
      companyId,
      entityType,
      entityId,
      action: "EXPIRATION_ALERT_SENT",
      createdAt: { gte: since },
    },
    select: { id: true },
  });
  return !!existing;
}

export async function runExpirationAlerts() {
  const [certifications, clearances] = await Promise.all([
    findExpiringCertifications(ALERT_WINDOW_DAYS),
    findExpiringClearances(ALERT_WINDOW_DAYS),
  ]);

  const companyIds = new Set([
    ...certifications.map((c) => c.candidate.companyId),
    ...clearances.map((c) => c.candidate.companyId),
  ]);

  let companiesAlerted = 0;
  let companiesFailedToAlert = 0;

  for (const companyId of companyIds) {
    const companyCertifications = certifications.filter((c) => c.candidate.companyId === companyId);
    const companyClearances = clearances.filter((c) => c.candidate.companyId === companyId);

    const freshCertifications = [];
    for (const cert of companyCertifications) {
      if (!(await wasRecentlyAlerted(companyId, "CERTIFICATION", cert.id))) {
        freshCertifications.push(cert);
      }
    }

    const freshClearances = [];
    for (const clearance of companyClearances) {
      if (!(await wasRecentlyAlerted(companyId, "SECURITY_CLEARANCE", clearance.id))) {
        freshClearances.push(clearance);
      }
    }

    if (freshCertifications.length === 0 && freshClearances.length === 0) continue;

    const [company, recipients] = await Promise.all([
      prisma.company.findUnique({ where: { id: companyId }, select: { name: true } }),
      prisma.user.findMany({ where: { companyId }, select: { email: true } }),
    ]);
    if (!company || recipients.length === 0) continue;

    try {
      await sendExpirationAlertEmail({
        to: recipients.map((r) => r.email),
        companyName: company.name,
        certifications: freshCertifications.map((c) => ({
          candidateName: `${c.candidate.firstName} ${c.candidate.lastName}`,
          type: c.type,
          certificateNumber: c.certificateNumber,
          expirationDate: c.expirationDate as Date,
        })),
        clearances: freshClearances.map((c) => ({
          candidateName: `${c.candidate.firstName} ${c.candidate.lastName}`,
          level: c.level,
          expirationDate: c.expirationOrReinvestigationDate as Date,
        })),
      });
    } catch (error) {
      // Don't let one company's send failure (bad recipient, provider
      // outage, sandbox restrictions...) abort the whole run, and — since
      // nothing was actually delivered — don't log EXPIRATION_ALERT_SENT.
      // Log the failure itself, per item, so it's visible in the audit
      // trail rather than silently missing.
      companiesFailedToAlert++;
      const message = error instanceof Error ? error.message : String(error);
      await Promise.all([
        ...freshCertifications.map((c) =>
          logAuditEntry({
            companyId,
            actorUserId: null,
            entityType: "CERTIFICATION",
            entityId: c.id,
            action: "EXPIRATION_ALERT_FAILED",
            details: { error: message },
          })
        ),
        ...freshClearances.map((c) =>
          logAuditEntry({
            companyId,
            actorUserId: null,
            entityType: "SECURITY_CLEARANCE",
            entityId: c.id,
            action: "EXPIRATION_ALERT_FAILED",
            details: { error: message },
          })
        ),
      ]);
      continue;
    }

    companiesAlerted++;

    await Promise.all([
      ...freshCertifications.map((c) =>
        logAuditEntry({
          companyId,
          actorUserId: null,
          entityType: "CERTIFICATION",
          entityId: c.id,
          action: "EXPIRATION_ALERT_SENT",
          details: { expirationDate: c.expirationDate },
        })
      ),
      ...freshClearances.map((c) =>
        logAuditEntry({
          companyId,
          actorUserId: null,
          entityType: "SECURITY_CLEARANCE",
          entityId: c.id,
          action: "EXPIRATION_ALERT_SENT",
          details: { expirationDate: c.expirationOrReinvestigationDate },
        })
      ),
    ]);
  }

  return {
    companiesConsidered: companyIds.size,
    companiesAlerted,
    companiesFailedToAlert,
    certificationsFound: certifications.length,
    clearancesFound: clearances.length,
  };
}
