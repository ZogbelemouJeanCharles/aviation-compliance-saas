"use client";

import { useActionState } from "react";
import { addCertificationAction } from "../../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CERTIFICATION_TYPE_LABELS, ISSUING_AUTHORITY_LABELS } from "@/lib/labels";

const TYPE_VALUES = Object.keys(CERTIFICATION_TYPE_LABELS) as Array<
  keyof typeof CERTIFICATION_TYPE_LABELS
>;
const AUTHORITY_VALUES = Object.keys(ISSUING_AUTHORITY_LABELS) as Array<
  keyof typeof ISSUING_AUTHORITY_LABELS
>;

export function CertificationForm({ candidateId }: { candidateId: string }) {
  const [state, action, pending] = useActionState(addCertificationAction, undefined);

  return (
    <form action={action} encType="multipart/form-data" className="flex flex-col gap-4">
      <input type="hidden" name="candidateId" value={candidateId} />

      <div className="flex flex-col gap-2">
        <Label htmlFor="type">Certification type</Label>
        <Select name="type" defaultValue="PILOT_LICENSE">
          <SelectTrigger id="type" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TYPE_VALUES.map((value) => (
              <SelectItem key={value} value={value}>
                {CERTIFICATION_TYPE_LABELS[value]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="certificateNumber">Certificate number</Label>
          <Input id="certificateNumber" name="certificateNumber" required />
          {state?.errors?.certificateNumber && (
            <p className="text-sm text-destructive">{state.errors.certificateNumber[0]}</p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="issuingAuthority">Issuing authority</Label>
          <Select name="issuingAuthority" defaultValue="FAA">
            <SelectTrigger id="issuingAuthority" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {AUTHORITY_VALUES.map((value) => (
                <SelectItem key={value} value={value}>
                  {ISSUING_AUTHORITY_LABELS[value]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="ratingsOrTypes">Ratings / type ratings</Label>
        <Input id="ratingsOrTypes" name="ratingsOrTypes" placeholder="Optional, e.g. B737, ATP" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="issueDate">Issue date</Label>
          <Input id="issueDate" name="issueDate" type="date" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="expirationDate">Expiration date</Label>
          <Input id="expirationDate" name="expirationDate" type="date" />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="document">Certificate document</Label>
        <Input id="document" name="document" type="file" accept=".pdf,image/*" />
        <p className="text-xs text-muted-foreground">
          Optional — a photo or PDF of the candidate&apos;s certificate. Recommended: this is what a
          recruiter cross-checks against the FAA registry during review.
        </p>
      </div>

      {state?.message && <p className="text-sm text-destructive">{state.message}</p>}

      <Button type="submit" disabled={pending} className="mt-2 self-start">
        {pending ? "Adding…" : "Add certification"}
      </Button>
    </form>
  );
}
