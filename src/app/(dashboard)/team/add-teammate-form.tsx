"use client";

import { useActionState, useEffect, useRef } from "react";
import { addTeammateAction } from "./actions";
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

export function AddTeammateForm() {
  const [state, action, pending] = useActionState(addTeammateAction, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={action} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required />
          {state?.errors?.name && (
            <p className="text-sm text-destructive">{state.errors.name[0]}</p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required />
          {state?.errors?.email && (
            <p className="text-sm text-destructive">{state.errors.email[0]}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="password">Temporary password</Label>
          <Input id="password" name="password" type="text" required minLength={8} />
          {state?.errors?.password && (
            <p className="text-sm text-destructive">{state.errors.password[0]}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Share this with them directly — there&apos;s no invite email yet.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="role">Role</Label>
          <Select name="role" defaultValue="RECRUITER">
            <SelectTrigger id="role" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="RECRUITER">Recruiter</SelectItem>
              <SelectItem value="ADMIN">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {state?.message && <p className="text-sm text-destructive">{state.message}</p>}
      {state?.success && (
        <p className="text-sm text-emerald-700 dark:text-emerald-400">Teammate added.</p>
      )}

      <Button type="submit" disabled={pending} className="mt-2 self-start">
        {pending ? "Adding…" : "Add teammate"}
      </Button>
    </form>
  );
}
