import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClearanceForm } from "./clearance-form";

export default async function NewClearancePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

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
        <h1 className="text-2xl font-bold tracking-tight">Add security clearance</h1>
      </div>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Clearance details</CardTitle>
        </CardHeader>
        <CardContent>
          <ClearanceForm candidateId={id} />
        </CardContent>
      </Card>
    </div>
  );
}
