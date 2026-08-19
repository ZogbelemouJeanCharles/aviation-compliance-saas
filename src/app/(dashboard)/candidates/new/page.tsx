import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createCandidateAction } from "../actions";
import { CandidateForm } from "./candidate-form";

export default function NewCandidatePage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link
          href="/candidates"
          className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          Candidates
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">New candidate</h1>
      </div>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Candidate details</CardTitle>
        </CardHeader>
        <CardContent>
          <CandidateForm
            action={createCandidateAction}
            submitLabel="Create candidate"
            pendingLabel="Creating…"
          />
        </CardContent>
      </Card>
    </div>
  );
}
