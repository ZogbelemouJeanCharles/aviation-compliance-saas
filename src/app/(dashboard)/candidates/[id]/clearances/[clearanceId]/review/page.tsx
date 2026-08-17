import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/dal";
import { getClearanceForReview } from "@/lib/db/clearances";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CLEARANCE_LEVEL_LABELS } from "@/lib/labels";
import { reviewClearanceAction } from "../../../actions";

export default async function ReviewClearancePage({
  params,
}: {
  params: Promise<{ id: string; clearanceId: string }>;
}) {
  const { id, clearanceId } = await params;
  const user = await getCurrentUser();
  const clearance = await getClearanceForReview(user.companyId, clearanceId);

  if (!clearance || clearance.candidateId !== id) notFound();

  const approve = reviewClearanceAction.bind(null, clearanceId, id, "MANUALLY_VERIFIED");
  const reject = reviewClearanceAction.bind(null, clearanceId, id, "MANUALLY_REJECTED");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">
        Review clearance — {clearance.candidate.firstName} {clearance.candidate.lastName}
      </h1>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>{CLEARANCE_LEVEL_LABELS[clearance.level]}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="approve-notes">Notes</Label>
            <form action={approve} className="flex flex-col gap-2">
              <Textarea id="approve-notes" name="notes" placeholder="Optional reviewer notes" />
              <Button type="submit" className="self-start">
                Mark as verified
              </Button>
            </form>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="reject-notes">Notes</Label>
            <form action={reject} className="flex flex-col gap-2">
              <Textarea id="reject-notes" name="notes" placeholder="Reason for rejecting" />
              <Button type="submit" variant="destructive" className="self-start">
                Mark as rejected
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
