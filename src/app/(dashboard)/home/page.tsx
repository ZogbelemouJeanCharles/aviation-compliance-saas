import Link from "next/link";
import { CheckCircle2, ClipboardList, PlusIcon, ShieldAlert, Users, UsersRound } from "lucide-react";
import { getCurrentUser, getCurrentUserProfile } from "@/lib/auth/dal";
import { getCandidateStats } from "@/lib/db/candidates";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/stat-card";

export default async function HomePage() {
  const [currentUser, user] = await Promise.all([getCurrentUser(), getCurrentUserProfile()]);
  const stats = await getCandidateStats(currentUser.companyId);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-medium tracking-tight">Welcome back, {user.name.split(" ")[0]}</h1>
        <p className="text-muted-foreground">{user.company.name}</p>
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex flex-col gap-3 p-5">
            <PlusIcon className="size-5 text-muted-foreground" />
            <div>
              <p className="font-medium">New candidate</p>
              <p className="text-sm text-muted-foreground">Add someone to your pipeline.</p>
            </div>
            <Button variant="outline" size="sm" render={<Link href="/candidates/new" />} nativeButton={false}>
              Add candidate
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-3 p-5">
            <ClipboardList className="size-5 text-muted-foreground" />
            <div>
              <p className="font-medium">Audit trail</p>
              <p className="text-sm text-muted-foreground">Review every verification and change.</p>
            </div>
            <Button variant="outline" size="sm" render={<Link href="/audit" />} nativeButton={false}>
              View audit trail
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-3 p-5">
            <UsersRound className="size-5 text-muted-foreground" />
            <div>
              <p className="font-medium">Team</p>
              <p className="text-sm text-muted-foreground">Manage who has access.</p>
            </div>
            <Button variant="outline" size="sm" render={<Link href="/team" />} nativeButton={false}>
              View team
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
