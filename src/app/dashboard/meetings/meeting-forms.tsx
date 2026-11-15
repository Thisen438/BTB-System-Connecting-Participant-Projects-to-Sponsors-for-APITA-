"use client";

import { useRef, useState, useTransition } from "react";
import { LocalTime } from "@/components/local-time";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { replyToMeeting, requestMeeting } from "./actions";

const field = "h-11 rounded-xl px-3.5";
const textarea =
  "w-full rounded-xl border border-input bg-transparent px-3.5 py-2.5 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm";
// Same look as the tag chips: a styled label around a visually hidden native radio.
const choice =
  "cursor-pointer rounded-full border px-3.5 py-1.5 text-sm transition-colors hover:bg-accent has-checked:border-primary has-checked:bg-primary has-checked:text-primary-foreground has-focus-visible:ring-3 has-focus-visible:ring-ring/50";

// The date pickers give local time with no zone ("2026-12-05T10:00"); only the browser knows the zone,
// so it converts each filled-in time to UTC before sending.
function formData(form: HTMLFormElement, reply?: string) {
  const data = new FormData(form);
  const slots = data.getAll("slots").filter(Boolean);
  data.delete("slots");
  for (const s of slots)
    data.append("slots", new Date(String(s)).toISOString());
  if (reply) data.set("reply", reply);
  return data;
}

function SlotFields() {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 text-sm font-medium">
        Propose up to 3 times
      </legend>
      {[1, 2, 3].map((n) => (
        <Input
          key={n}
          type="datetime-local"
          name="slots"
          required={n === 1}
          aria-label={n === 1 ? "Time option 1" : `Time option ${n} (optional)`}
          className={field}
        />
      ))}
      <p className="text-xs text-muted-foreground">
        Enter times in your own time zone. Everyone sees them in theirs.
      </p>
    </fieldset>
  );
}

function LinkField({ id, defaultValue }: { id: string; defaultValue: string }) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>Link for the online meeting</Label>
      <Input
        id={id}
        name="meetingLink"
        type="url"
        required
        maxLength={300}
        defaultValue={defaultValue}
        placeholder="https://meet.google.com/…"
        className={field}
      />
    </div>
  );
}

// The main button on a project page: opens a small form to ask the team for a meeting.
export function RequestMeeting({ projectId }: { projectId: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [sending, startSending] = useTransition();

  return (
    <>
      <Button size="xl" onClick={() => dialog.current?.showModal()}>
        Schedule meeting
      </Button>
      <dialog
        ref={dialog}
        aria-labelledby="request-meeting-title"
        className="m-auto w-[min(32rem,calc(100vw-2rem))] rounded-2xl border bg-background p-6 text-foreground shadow-2xl backdrop:bg-black/40"
      >
        <form
          // Submitted by hand instead of `action=` so a rejected request keeps what the user typed.
          onSubmit={(e) => {
            e.preventDefault();
            const data = formData(e.currentTarget);
            startSending(async () => {
              const failed = await requestMeeting(projectId, data);
              setError(failed);
              // On success the page reloads with "Meeting requested" in place of this button.
              if (!failed) dialog.current?.close();
            });
          }}
          className="flex flex-col gap-5"
        >
          <h2 id="request-meeting-title" className="text-lg font-semibold">
            Request a meeting
          </h2>

          <fieldset>
            <legend className="mb-2 text-sm font-medium">
              How do you want to meet?
            </legend>
            <div className="flex flex-wrap gap-2">
              <label className={choice}>
                <input
                  type="radio"
                  name="mode"
                  value="in_person"
                  required
                  defaultChecked
                  className="sr-only"
                />
                In person at APITA
              </label>
              <label className={choice}>
                <input
                  type="radio"
                  name="mode"
                  value="online"
                  className="sr-only"
                />
                Online
              </label>
            </div>
          </fieldset>

          <SlotFields />

          <div className="flex flex-col gap-2">
            <Label htmlFor="meeting-note">Note to the team (optional)</Label>
            <textarea
              id="meeting-note"
              name="note"
              rows={3}
              maxLength={500}
              placeholder="What you would like to talk about."
              className={textarea}
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              size="xl"
              onClick={() => dialog.current?.close()}
            >
              Cancel
            </Button>
            <Button type="submit" size="xl" disabled={sending}>
              {sending ? "Sending…" : "Send request"}
            </Button>
          </div>
        </form>
      </dialog>
    </>
  );
}

// Shown on a pending meeting to the side whose turn it is to answer.
export function ReplyForm({
  meeting,
  isTeam,
}: {
  meeting: {
    id: string;
    mode: "in_person" | "online";
    proposedSlots: string[];
    meetingLink: string;
  };
  isTeam: boolean;
}) {
  const [error, setError] = useState<string | null>(null);
  const [sending, startSending] = useTransition();
  // Only the team gives the link, and only for an online meeting.
  const needsLink = isTeam && meeting.mode === "online";

  const send = (data: FormData) =>
    startSending(async () => setError(await replyToMeeting(meeting.id, data)));

  return (
    <div className="flex flex-col gap-4 border-t pt-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(formData(e.currentTarget, "accept"));
        }}
        className="flex flex-col gap-4"
      >
        <fieldset>
          <legend className="mb-2 text-sm font-medium">Pick a time</legend>
          <div className="flex flex-wrap gap-2">
            {meeting.proposedSlots.map((slot, i) => (
              <label key={slot} className={choice}>
                <input
                  type="radio"
                  name="slot"
                  value={slot}
                  required
                  defaultChecked={i === 0}
                  className="sr-only"
                />
                <LocalTime iso={slot} />
              </label>
            ))}
          </div>
        </fieldset>
        {needsLink && (
          <LinkField
            id={`link-accept-${meeting.id}`}
            defaultValue={meeting.meetingLink}
          />
        )}
        <div className="flex flex-wrap gap-3">
          <Button type="submit" size="lg" disabled={sending}>
            Accept this time
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            disabled={sending}
            onClick={() => {
              const data = new FormData();
              data.set("reply", "decline");
              send(data);
            }}
          >
            Decline
          </Button>
        </div>
      </form>

      <details>
        <summary className="w-fit cursor-pointer rounded-lg text-sm font-medium text-accent-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
          None of these work? Propose other times
        </summary>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(formData(e.currentTarget, "propose"));
          }}
          className="mt-4 flex flex-col gap-4"
        >
          <SlotFields />
          {needsLink && (
            <LinkField
              id={`link-propose-${meeting.id}`}
              defaultValue={meeting.meetingLink}
            />
          )}
          <Button
            type="submit"
            variant="outline"
            size="lg"
            disabled={sending}
            className="w-fit"
          >
            Send new times
          </Button>
        </form>
      </details>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
