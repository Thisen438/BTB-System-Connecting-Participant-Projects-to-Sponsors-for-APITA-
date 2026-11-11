"use client";

import { AlertDialog } from "@base-ui/react/alert-dialog";
import { useActionState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { removeTeamMember, saveTeamName } from "./actions";

export function TeamNameForm({ teamName }: { teamName: string }) {
  const [message, action, pending] = useActionState(saveTeamName, null);

  return (
    <form
      action={action}
      className="surface flex flex-col gap-3 p-6 sm:flex-row sm:items-end"
    >
      <div className="flex flex-1 flex-col gap-2">
        <Label htmlFor="teamName">Team name</Label>
        <Input
          id="teamName"
          name="teamName"
          maxLength={60}
          defaultValue={teamName}
          placeholder="e.g. Team Nova"
          className="h-11 rounded-xl px-3.5"
        />
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit" variant="outline" size="xl" disabled={pending}>
          {pending ? "Saving…" : "Save name"}
        </Button>
        <p role="status" className="text-sm text-muted-foreground">
          {!pending && message}
        </p>
      </div>
    </form>
  );
}

// Asks before removing, in a dialog styled like the rest of the app.
export function RemoveMemberButton({ id, name }: { id: string; name: string }) {
  const [removing, startRemoving] = useTransition();

  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger
        render={
          <Button variant="ghost" size="lg" aria-label={`Remove ${name}`} />
        }
      >
        Remove
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0 motion-reduce:transition-none" />
        <AlertDialog.Popup className="surface fixed top-1/2 left-1/2 z-50 flex w-[calc(100vw-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 flex-col gap-5 p-6 transition-all duration-200 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0 motion-reduce:transition-none">
          <div className="flex flex-col gap-1.5">
            <AlertDialog.Title className="text-lg font-semibold">
              Remove {name}?
            </AlertDialog.Title>
            <AlertDialog.Description className="text-sm text-muted-foreground">
              They will no longer appear on your team and their photo is
              deleted. You can add them again later.
            </AlertDialog.Description>
          </div>
          <div className="flex justify-end gap-3">
            <AlertDialog.Close render={<Button variant="ghost" size="xl" />}>
              Cancel
            </AlertDialog.Close>
            <Button
              variant="destructive"
              size="xl"
              disabled={removing}
              onClick={() => startRemoving(() => removeTeamMember(id))}
            >
              {removing ? "Removing…" : "Remove"}
            </Button>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
