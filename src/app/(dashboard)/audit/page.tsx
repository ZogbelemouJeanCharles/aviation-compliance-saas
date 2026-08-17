import { getCurrentUser } from "@/lib/auth/dal";
import { listAuditLog } from "@/lib/db/audit";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const dateFormatter = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" });

export default async function AuditPage() {
  const user = await getCurrentUser();
  const entries = await listAuditLog(user.companyId);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Audit trail</h1>
          <p className="text-muted-foreground">
            Every verification and status change, timestamped — exportable for a compliance
            review.
          </p>
        </div>
        <Button variant="outline" render={<a href="/api/audit/export" />}>
          Export CSV
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Entity</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Actor</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground">
                No audit entries yet.
              </TableCell>
            </TableRow>
          )}
          {entries.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell className="whitespace-nowrap">
                {dateFormatter.format(entry.createdAt)}
              </TableCell>
              <TableCell>
                {entry.entityType} · {entry.entityId.slice(0, 8)}
              </TableCell>
              <TableCell>{entry.action}</TableCell>
              <TableCell>{entry.actorUser ? entry.actorUser.name : "System"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
