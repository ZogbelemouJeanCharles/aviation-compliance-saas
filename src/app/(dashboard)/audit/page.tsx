import { ClipboardList, Download } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/dal";
import { listAuditLog } from "@/lib/db/audit";
import { Badge } from "@/components/ui/badge";
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
          <h1 className="text-3xl font-bold tracking-tight">Audit trail</h1>
          <p className="text-muted-foreground">
            Every verification and status change, timestamped — exportable for a compliance
            review.
          </p>
        </div>
        <Button variant="outline" render={<a href="/api/audit/export" />} nativeButton={false}>
          <Download />
          Export CSV
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border">
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
                <TableCell colSpan={4} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <ClipboardList className="size-6" />
                    <span>No audit entries yet.</span>
                  </div>
                </TableCell>
              </TableRow>
            )}
            {entries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="whitespace-nowrap text-muted-foreground">
                  {dateFormatter.format(entry.createdAt)}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="font-normal">
                    {entry.entityType} · {entry.entityId.slice(0, 8)}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-xs">{entry.action}</TableCell>
                <TableCell>{entry.actorUser ? entry.actorUser.name : "System"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
