"use client";

import { useActionState } from "react";
import type { CandidateFormState } from "../actions";
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
import { WORK_AUTHORIZATION_LABELS } from "@/lib/labels";
import type { WorkAuthorizationStatus } from "@prisma/client";

const WORK_AUTH_VALUES = Object.keys(WORK_AUTHORIZATION_LABELS) as Array<
  keyof typeof WORK_AUTHORIZATION_LABELS
>;

export type CandidateFormDefaultValues = {
  candidateId?: string;
  firstName?: string;
  lastName?: string;
  email?: string | null;
  phone?: string | null;
  workAuthorizationStatus?: WorkAuthorizationStatus;
  workAuthorizationNotes?: string | null;
};

export function CandidateForm({
  action,
  defaultValues,
  submitLabel,
  pendingLabel,
}: {
  action: (state: CandidateFormState, formData: FormData) => Promise<CandidateFormState>;
  defaultValues?: CandidateFormDefaultValues;
  submitLabel: string;
  pendingLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {defaultValues?.candidateId && (
        <input type="hidden" name="candidateId" value={defaultValues.candidateId} />
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="firstName">First name</Label>
          <Input id="firstName" name="firstName" defaultValue={defaultValues?.firstName} required />
          {state?.errors?.firstName && (
            <p className="text-sm text-destructive">{state.errors.firstName[0]}</p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="lastName">Last name</Label>
          <Input id="lastName" name="lastName" defaultValue={defaultValues?.lastName} required />
          {state?.errors?.lastName && (
            <p className="text-sm text-destructive">{state.errors.lastName[0]}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" defaultValue={defaultValues?.email ?? ""} />
          {state?.errors?.email && (
            <p className="text-sm text-destructive">{state.errors.email[0]}</p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" type="tel" defaultValue={defaultValues?.phone ?? ""} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="workAuthorizationStatus">Work authorization</Label>
        <Select
          name="workAuthorizationStatus"
          defaultValue={defaultValues?.workAuthorizationStatus ?? "OTHER"}
        >
          <SelectTrigger id="workAuthorizationStatus" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {WORK_AUTH_VALUES.map((value) => (
              <SelectItem key={value} value={value}>
                {WORK_AUTHORIZATION_LABELS[value]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="workAuthorizationNotes">Work authorization notes</Label>
        <Input
          id="workAuthorizationNotes"
          name="workAuthorizationNotes"
          placeholder="Optional"
          defaultValue={defaultValues?.workAuthorizationNotes ?? ""}
        />
      </div>

      {state?.message && <p className="text-sm text-destructive">{state.message}</p>}

      <Button type="submit" disabled={pending} className="mt-2 self-start">
        {pending ? pendingLabel : submitLabel}
      </Button>
    </form>
  );
}
