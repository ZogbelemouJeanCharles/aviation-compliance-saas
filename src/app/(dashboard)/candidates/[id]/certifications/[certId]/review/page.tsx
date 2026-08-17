import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ExternalLink, FileText } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/dal";
import { getCertificationForReview } from "@/lib/db/certifications";
import { checkNameInFaaRegistry } from "@/lib/faa/check-name-in-registry";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { CERTIFICATION_TYPE_LABELS, ISSUING_AUTHORITY_LABELS } from "@/lib/labels";
import { reviewCertificationAction } from "../../../actions";

const FAA_AIRMEN_INQUIRY_URL = "https://amsrvs.registry.faa.gov/airmeninquiry/";

export default async function ReviewCertificationPage({
  params,
}: {
  params: Promise<{ id: string; certId: string }>;
}) {
  const { id, certId } = await params;
  const user = await getCurrentUser();
  const certification = await getCertificationForReview(user.companyId, certId);

  if (!certification || certification.candidateId !== id) notFound();

  const isFaa = certification.issuingAuthority === "FAA";
  const nameCheck = isFaa
    ? await checkNameInFaaRegistry(certification.candidate.firstName, certification.candidate.lastName)
    : null;

  const approve = reviewCertificationAction.bind(null, certId, id, "MANUALLY_VERIFIED");
  const reject = reviewCertificationAction.bind(null, certId, id, "MANUALLY_REJECTED");

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
          Review certification — {certification.candidate.firstName}{" "}
          {certification.candidate.lastName}
        </h1>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>
            {CERTIFICATION_TYPE_LABELS[certification.type]} · {certification.certificateNumber} (
            {ISSUING_AUTHORITY_LABELS[certification.issuingAuthority]})
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          {certification.documentFileName ? (
            <Button
              variant="outline"
              size="sm"
              className="self-start"
              render={<a href={`/api/certifications/${certId}/document`} target="_blank" />}
              nativeButton={false}
            >
              <FileText />
              View uploaded document
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground">
              No document was uploaded for this certification.
            </p>
          )}

          {isFaa ? (
            <div className="flex flex-col gap-3 rounded-xl border bg-muted/30 p-4">
              <div>
                <p className="text-sm font-medium">Check against the FAA registry</p>
                <p className="text-sm text-muted-foreground">
                  The FAA has no public API for this — open the official lookup and search{" "}
                  <span className="font-medium text-foreground">
                    Last name: {certification.candidate.lastName}
                  </span>{" "}
                  with{" "}
                  <span className="font-medium text-foreground">
                    Certificate #: {certification.certificateNumber}
                  </span>
                  . If a result comes back, the pairing is valid.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="self-start"
                render={<a href={FAA_AIRMEN_INQUIRY_URL} target="_blank" rel="noopener noreferrer" />}
                nativeButton={false}
              >
                <ExternalLink />
                Open FAA Airmen Inquiry
              </Button>
              <Separator />
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Name-only snapshot check:</span>
                {nameCheck?.found ? (
                  <Badge className="rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                    Name found in registry snapshot
                  </Badge>
                ) : (
                  <Badge variant="outline" className="rounded-full">
                    No name match in snapshot
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                This only checks the candidate&apos;s name against our monthly FAA snapshot — it
                cannot confirm the certificate number. Use it as a hint, not a verification.
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No public registry exists for {ISSUING_AUTHORITY_LABELS[certification.issuingAuthority]}
              . Verify against the uploaded document and any other evidence the candidate has
              provided.
            </p>
          )}

          <Separator />

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
