import "server-only";
import { prisma } from "./client";
import type { AuditEntityType, Prisma } from "@prisma/client";

export async function logAuditEntry(params: {
  companyId: string;
  actorUserId: string | null;
  entityType: AuditEntityType;
  entityId: string;
  action: string;
  details?: Prisma.InputJsonValue;
}) {
  return prisma.auditLogEntry.create({
    data: {
      companyId: params.companyId,
      actorUserId: params.actorUserId,
      entityType: params.entityType,
      entityId: params.entityId,
      action: params.action,
      details: params.details,
    },
  });
}

export async function listAuditLog(companyId: string) {
  return prisma.auditLogEntry.findMany({
    where: { companyId },
    include: { actorUser: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });
}
