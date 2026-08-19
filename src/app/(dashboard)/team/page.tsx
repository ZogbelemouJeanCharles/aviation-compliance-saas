import { getCurrentUser } from "@/lib/auth/dal";
import { listUsers } from "@/lib/db/users";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AddTeammateForm } from "./add-teammate-form";

const dateFormatter = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });

export default async function TeamPage() {
  const user = await getCurrentUser();

  if (user.role !== "ADMIN") {
    return (
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Team</h1>
        <p className="text-muted-foreground">Only admins can manage the team.</p>
      </div>
    );
  }

  const teammates = await listUsers(user.companyId);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Team</h1>
        <p className="text-muted-foreground">
          Everyone with access to your company&apos;s candidates.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Added</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teammates.map((teammate) => (
              <TableRow key={teammate.id}>
                <TableCell className="font-medium">{teammate.name}</TableCell>
                <TableCell>{teammate.email}</TableCell>
                <TableCell>
                  <Badge variant="outline">{teammate.role}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {dateFormatter.format(teammate.createdAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Add teammate</CardTitle>
        </CardHeader>
        <CardContent>
          <AddTeammateForm />
        </CardContent>
      </Card>
    </div>
  );
}
