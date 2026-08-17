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
      <h1 className="text-2xl font-semibold">Add security clearance</h1>
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
