import Link from "next/link";
import { CheckCircle2, PlusIcon, SearchX, ShieldAlert, Users } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/dal";
import { getCandidateStats, listCandidates } from "@/lib/db/candidates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatCard } from "@/components/stat-card";
import { VerificationStatusBadge } from "@/components/verification-status-badge";
import { VERIFICATION_STATUS_LABELS, WORK_AUTHORIZATION_LABELS } from "@/lib/labels";
import type { VerificationStatus } from "@prisma/client";

const STATUS_VALUES = Object.keys(VERIFICATION_STATUS_LABELS) as VerificationStatus[];

export default async function CandidatesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string }>;
}) {
  const { search, status } = await searchParams;
  const user = await getCurrentUser();

  const [candidates, stats] = await Promise.all([
    listCandidates(user.companyId, {
      search,
      certificationVerificationStatus:
        status && STATUS_VALUES.includes(status as VerificationStatus)
          ? (status as VerificationStatus)
          : undefined,
    }),
    getCandidateStats(user.companyId),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Candidates</h1>
          <p className="text-muted-foreground">
            Track certifications and clearances across your pipeline.
          </p>
        </div>
        <Button render={<Link href="/candidates/new" />} nativeButton={false}>
          <PlusIcon />
          New candidate
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total candidates" value={stats.totalCandidates} icon={<Users className="size-5" />} />
        <StatCard
          label="Needs manual review"
          value={stats.needsManualReview}
          icon={<ShieldAlert className="size-5" />}
          tone="warning"
        />
        <StatCard
          label="Verified certifications"
          value={stats.verifiedCertifications}
          icon={<CheckCircle2 className="size-5" />}
          tone="success"
        />
      </div>

      <form className="flex gap-3" action="/candidates">
        <Input
          name="search"
          placeholder="Search by name or email…"
          defaultValue={search}
          className="max-w-xs"
        />
        <Select name="status" defaultValue={status ?? "any"}>
          <SelectTrigger className="w-56">
            <SelectValue placeholder="Certification status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any certification status</SelectItem>
            {STATUS_VALUES.map((value) => (
              <SelectItem key={value} value={value}>
                {VERIFICATION_STATUS_LABELS[value]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="submit" variant="outline">
          Filter
        </Button>
      </form>

      <div className="overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Work authorization</TableHead>
              <TableHead>Certifications</TableHead>
              <TableHead>Clearance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {candidates.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <SearchX className="size-6" />
                    <span>No candidates match these filters.</span>
                  </div>
                </TableCell>
              </TableRow>
            )}
            {candidates.map((candidate) => (
              <TableRow key={candidate.id}>
                <TableCell>
                  <Link
                    href={`/candidates/${candidate.id}`}
                    className="font-medium hover:underline"
                  >
                    {candidate.firstName} {candidate.lastName}
                  </Link>
                  {candidate.email && (
                    <div className="text-sm text-muted-foreground">{candidate.email}</div>
                  )}
                </TableCell>
                <TableCell>{WORK_AUTHORIZATION_LABELS[candidate.workAuthorizationStatus]}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {candidate.certifications.length === 0 && (
                      <span className="text-sm text-muted-foreground">None on file</span>
                    )}
                    {candidate.certifications.map((cert) => (
                      <VerificationStatusBadge key={cert.id} status={cert.verificationStatus} />
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {candidate.securityClearances.length === 0 && (
                      <span className="text-sm text-muted-foreground">None on file</span>
                    )}
                    {candidate.securityClearances.map((clearance) => (
                      <VerificationStatusBadge key={clearance.id} status={clearance.verificationStatus} />
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
