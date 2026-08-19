import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, FileText, PencilIcon, PlusIcon } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/dal";
import { getCandidate } from "@/lib/db/candidates";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { VerificationStatusBadge } from "@/components/verification-status-badge";
import {
  CERTIFICATION_TYPE_LABELS,
  CLEARANCE_LEVEL_LABELS,
  ISSUING_AUTHORITY_LABELS,
  WORK_AUTHORIZATION_LABELS,
} from "@/lib/labels";

const NON_TERMINAL_STATUSES = new Set(["PENDING", "NOT_FOUND", "MANUAL_REVIEW_REQUIRED"]);

function formatDate(date: Date | null) {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(date);
}

function initialsFor(firstName: string, lastName: string) {
  return `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();
}

export default async function CandidateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  const candidate = await getCandidate(user.companyId, id);

  if (!candidate) notFound();

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/candidates"
        className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        Candidates
      </Link>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="size-12">
            <AvatarFallback className="text-base font-semibold">
              {initialsFor(candidate.firstName, candidate.lastName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {candidate.firstName} {candidate.lastName}
            </h1>
            <p className="text-muted-foreground">
              {candidate.email ?? "No email on file"}
              {candidate.phone ? ` · ${candidate.phone}` : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs font-medium">
            {WORK_AUTHORIZATION_LABELS[candidate.workAuthorizationStatus]}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            render={<Link href={`/candidates/${candidate.id}/edit`} />}
            nativeButton={false}
          >
            <PencilIcon />
            Edit
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Certifications</CardTitle>
          <Button
            variant="outline"
            size="sm"
            render={<Link href={`/candidates/${candidate.id}/certifications/new`} />}
            nativeButton={false}
          >
            <PlusIcon />
            Add certification
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Certificate #</TableHead>
                  <TableHead>Authority</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {candidate.certifications.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      No certifications on file.
                    </TableCell>
                  </TableRow>
                )}
                {candidate.certifications.map((cert) => (
                  <TableRow key={cert.id}>
                    <TableCell>{CERTIFICATION_TYPE_LABELS[cert.type]}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {cert.certificateNumber}
                        {cert.documentFileName && (
                          <FileText
                            className="size-3.5 text-muted-foreground"
                            aria-label="Document attached"
                          />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{ISSUING_AUTHORITY_LABELS[cert.issuingAuthority]}</TableCell>
                    <TableCell>{formatDate(cert.expirationDate)}</TableCell>
                    <TableCell>
                      <VerificationStatusBadge status={cert.verificationStatus} />
                    </TableCell>
                    <TableCell className="text-right">
                      {NON_TERMINAL_STATUSES.has(cert.verificationStatus) && (
                        <Button
                          size="sm"
                          variant="outline"
                          render={
                            <Link
                              href={`/candidates/${candidate.id}/certifications/${cert.id}/review`}
                            />
                          }
                          nativeButton={false}
                        >
                          Review
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Security clearances</CardTitle>
          <Button
            variant="outline"
            size="sm"
            render={<Link href={`/candidates/${candidate.id}/clearances/new`} />}
            nativeButton={false}
          >
            <PlusIcon />
            Add clearance
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Level</TableHead>
                  <TableHead>Granted</TableHead>
                  <TableHead>Expires / reinvestigation</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {candidate.securityClearances.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      No security clearances on file.
                    </TableCell>
                  </TableRow>
                )}
                {candidate.securityClearances.map((clearance) => (
                  <TableRow key={clearance.id}>
                    <TableCell>{CLEARANCE_LEVEL_LABELS[clearance.level]}</TableCell>
                    <TableCell>{formatDate(clearance.grantedDate)}</TableCell>
                    <TableCell>{formatDate(clearance.expirationOrReinvestigationDate)}</TableCell>
                    <TableCell>
                      <VerificationStatusBadge status={clearance.verificationStatus} />
                    </TableCell>
                    <TableCell className="text-right">
                      {clearance.verificationStatus === "MANUAL_REVIEW_REQUIRED" && (
                        <Button
                          size="sm"
                          variant="outline"
                          render={
                            <Link
                              href={`/candidates/${candidate.id}/clearances/${clearance.id}/review`}
                            />
                          }
                          nativeButton={false}
                        >
                          Review
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
