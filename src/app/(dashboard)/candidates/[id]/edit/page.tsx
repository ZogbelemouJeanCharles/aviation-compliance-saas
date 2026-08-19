import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/dal";
import { getCandidate } from "@/lib/db/candidates";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateCandidateAction } from "../../actions";
import { CandidateForm } from "../../new/candidate-form";

export default async function EditCandidatePage({
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
      <div className="flex flex-col gap-2">
        <Link
          href={`/candidates/${id}`}
          className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          Back to candidate
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">
          Edit {candidate.firstName} {candidate.lastName}
        </h1>
      </div>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Candidate details</CardTitle>
        </CardHeader>
        <CardContent>
          <CandidateForm
            action={updateCandidateAction}
            defaultValues={{
              candidateId: candidate.id,
              firstName: candidate.firstName,
              lastName: candidate.lastName,
              email: candidate.email,
              phone: candidate.phone,
              workAuthorizationStatus: candidate.workAuthorizationStatus,
              workAuthorizationNotes: candidate.workAuthorizationNotes,
            }}
            submitLabel="Save changes"
            pendingLabel="Saving…"
          />
        </CardContent>
      </Card>
    </div>
  );
}
