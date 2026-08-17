"use client";

import { useActionState } from "react";
import { createCandidateAction } from "../actions";
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

const WORK_AUTH_VALUES = Object.keys(WORK_AUTHORIZATION_LABELS) as Array<
  keyof typeof WORK_AUTHORIZATION_LABELS
>;

export function CandidateForm() {
  const [state, action, pending] = useActionState(createCandidateAction, undefined);

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="firstName">First name</Label>
          <Input id="firstName" name="firstName" required />
          {state?.errors?.firstName && (
            <p className="text-sm text-destructive">{state.errors.firstName[0]}</p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="lastName">Last name</Label>
          <Input id="lastName" name="lastName" required />
          {state?.errors?.lastName && (
            <p className="text-sm text-destructive">{state.errors.lastName[0]}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" />
          {state?.errors?.email && (
            <p className="text-sm text-destructive">{state.errors.email[0]}</p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" type="tel" />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="workAuthorizationStatus">Work authorization</Label>
        <Select name="workAuthorizationStatus" defaultValue="OTHER">
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
        <Input id="workAuthorizationNotes" name="workAuthorizationNotes" placeholder="Optional" />
      </div>

      {state?.message && <p className="text-sm text-destructive">{state.message}</p>}

      <Button type="submit" disabled={pending} className="mt-2 self-start">
        {pending ? "Creating…" : "Create candidate"}
      </Button>
    </form>
  );
}
