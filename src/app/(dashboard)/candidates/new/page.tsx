import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CandidateForm } from "./candidate-form";

export default function NewCandidatePage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">New candidate</h1>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Candidate details</CardTitle>
        </CardHeader>
        <CardContent>
          <CandidateForm />
        </CardContent>
      </Card>
    </div>
  );
}
