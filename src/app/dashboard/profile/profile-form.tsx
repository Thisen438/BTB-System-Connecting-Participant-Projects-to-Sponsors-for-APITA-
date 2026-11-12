"use client";

import { useState, useTransition } from "react";
import { PhotoInput } from "@/components/photo-input";
import { TagChips } from "@/components/tag-chips";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveInvestorProfile } from "./actions";

const field = "h-11 rounded-xl px-3.5";

export function ProfileForm({
  profile,
  tags,
  interestIds,
}: {
  profile: {
    id: string;
    displayName: string;
    title: string;
    organisation: string;
    bio: string;
    imagePath: string;
    linkUrl: string;
  };
  tags: { id: number; name: string }[];
  interestIds: number[];
}) {
  // null = nothing to report, "" = saved, anything else = the error.
  const [result, setResult] = useState<string | null>(null);
  const [saving, startSaving] = useTransition();
  const [uploading, setUploading] = useState(false);

  return (
    <form
      // Submitted by hand instead of `action=` so a rejected save keeps what the user typed.
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startSaving(async () =>
          setResult((await saveInvestorProfile(data)) ?? ""),
        );
      }}
      className="surface flex flex-col gap-7 p-6 sm:p-8"
    >
      <div className="flex flex-col gap-5 sm:flex-row">
        <PhotoInput
          userId={profile.id}
          defaultPath={profile.imagePath}
          onUploading={setUploading}
          onError={setResult}
        />

        <div className="grid flex-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="displayName">Name</Label>
            <Input
              id="displayName"
              name="displayName"
              required
              minLength={2}
              maxLength={80}
              autoComplete="name"
              defaultValue={profile.displayName}
              className={field}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="title">Title (optional)</Label>
            <Input
              id="title"
              name="title"
              maxLength={60}
              autoComplete="organization-title"
              defaultValue={profile.title}
              placeholder="e.g. Partner, Angel investor"
              className={field}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="organisation">Organisation (optional)</Label>
            <Input
              id="organisation"
              name="organisation"
              maxLength={60}
              autoComplete="organization"
              defaultValue={profile.organisation}
              placeholder="e.g. Nova Ventures"
              className={field}
            />
          </div>
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="bio">Short bio (optional)</Label>
            <Input
              id="bio"
              name="bio"
              maxLength={100}
              defaultValue={profile.bio}
              placeholder="One sentence, shown on the back of your badge."
              className={field}
            />
          </div>
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="linkUrl">Link (optional)</Label>
            <Input
              id="linkUrl"
              name="linkUrl"
              type="url"
              maxLength={300}
              defaultValue={profile.linkUrl}
              placeholder="https://linkedin.com/in/…"
              className={field}
            />
          </div>
        </div>
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-medium">
          What are you interested in? Pick at least one.
        </legend>
        <TagChips tags={tags} checkedIds={interestIds} />
      </fieldset>

      <div className="flex items-center justify-end gap-4">
        {result !== null && !saving && (
          <p
            role={result ? "alert" : "status"}
            className={`text-sm ${result ? "text-destructive" : "text-muted-foreground"}`}
          >
            {result || "Saved"}
          </p>
        )}
        <Button type="submit" size="xl" disabled={saving || uploading}>
          {saving ? "Saving…" : "Save profile"}
        </Button>
      </div>
    </form>
  );
}
