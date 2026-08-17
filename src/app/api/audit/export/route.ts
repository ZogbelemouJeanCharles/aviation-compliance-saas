import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { listAuditLog } from "@/lib/db/audit";

function csvEscape(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return new NextResponse(null, { status: 401 });
  }

  const entries = await listAuditLog(session.companyId);

  const header = ["Timestamp", "Entity Type", "Entity ID", "Action", "Actor", "Details"].join(",");
  const rows = entries.map((entry) => {
    const actor = entry.actorUser ? `${entry.actorUser.name} <${entry.actorUser.email}>` : "System";
    const details = entry.details ? JSON.stringify(entry.details) : "";
    return [
      entry.createdAt.toISOString(),
      entry.entityType,
      entry.entityId,
      entry.action,
      actor,
      details,
    ]
      .map(csvEscape)
      .join(",");
  });

  const csv = [header, ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="audit-trail-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
