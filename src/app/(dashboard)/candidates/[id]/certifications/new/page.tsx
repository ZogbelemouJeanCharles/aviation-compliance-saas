import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CertificationForm } from "./certification-form";

export default async function NewCertificationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Add certification</h1>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Certification details</CardTitle>
        </CardHeader>
        <CardContent>
          <CertificationForm candidateId={id} />
        </CardContent>
      </Card>
    </div>
  );
}
