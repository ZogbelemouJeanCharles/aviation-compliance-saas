"use client";

import { useActionState } from "react";
import { addClearanceAction } from "../../actions";
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
import { CLEARANCE_LEVEL_LABELS } from "@/lib/labels";

const LEVEL_VALUES = Object.keys(CLEARANCE_LEVEL_LABELS) as Array<
  keyof typeof CLEARANCE_LEVEL_LABELS
>;

export function ClearanceForm({ candidateId }: { candidateId: string }) {
  const [state, action, pending] = useActionState(addClearanceAction, undefined);

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="candidateId" value={candidateId} />

      <div className="flex flex-col gap-2">
        <Label htmlFor="level">Clearance level</Label>
        <Select name="level" defaultValue="SECRET">
          <SelectTrigger id="level" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LEVEL_VALUES.map((value) => (
              <SelectItem key={value} value={value}>
                {CLEARANCE_LEVEL_LABELS[value]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="grantedDate">Granted date</Label>
          <Input id="grantedDate" name="grantedDate" type="date" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="expirationOrReinvestigationDate">Expiration / reinvestigation date</Label>
          <Input
            id="expirationOrReinvestigationDate"
            name="expirationOrReinvestigationDate"
            type="date"
          />
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        There is no public registry to check a clearance against — every new clearance starts as
        &quot;Manual review required&quot; until a recruiter confirms it.
      </p>

      {state?.message && <p className="text-sm text-destructive">{state.message}</p>}

      <Button type="submit" disabled={pending} className="mt-2 self-start">
        {pending ? "Adding…" : "Add clearance"}
      </Button>
    </form>
  );
}
