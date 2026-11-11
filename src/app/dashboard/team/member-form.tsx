"use client";

import { Camera } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { projectImageUrl } from "@/lib/images";
import type { TeamMember } from "@/lib/team";
import { IMAGE_ACCEPT, uploadImage } from "@/lib/upload-image";
import { saveTeamMember } from "./actions";

const field = "h-11 rounded-xl px-3.5";

export function MemberForm({
  userId,
  member,
}: {
  userId: string;
  member?: TeamMember;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saving, startSaving] = useTransition();
  const [imagePath, setImagePath] = useState(member?.imagePath ?? "");
  const [uploading, setUploading] = useState(false);

  async function addPhoto(file: File) {
    setError(null);
    setUploading(true);
    const result = await uploadImage(userId, file);
    if ("error" in result) setError(result.error);
    else setImagePath(result.path);
    setUploading(false);
  }

  return (
    <form
      // Submitted by hand instead of `action=` so a rejected save keeps what the user typed.
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        startSaving(async () => {
          const failed = await saveTeamMember(
            member?.id ?? null,
            new FormData(form),
          );
          setError(failed);
          if (failed) return;
          form.reset();
          setImagePath("");
          if (member) router.push("/dashboard/team");
        });
      }}
      // The Edit links on the page jump here.
      id="member-form"
      className="surface flex scroll-mt-24 flex-col gap-5 p-6"
    >
      <h2 className="font-semibold">
        {member ? `Edit ${member.name}` : "Add a team member"}
      </h2>

      <div className="flex flex-col gap-5 sm:flex-row">
        <div className="flex shrink-0 flex-col items-center gap-2">
          <input type="hidden" name="imagePath" value={imagePath} />
          <label className="relative flex size-24 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-dashed bg-muted text-muted-foreground transition-colors hover:bg-accent has-focus-visible:ring-3 has-focus-visible:ring-ring/50">
            {imagePath ? (
              <Image
                src={projectImageUrl(imagePath)}
                alt=""
                fill
                sizes="96px"
                className="object-cover"
              />
            ) : (
              <Camera aria-hidden className="size-6" />
            )}
            <span className="sr-only">
              {imagePath ? "Change photo" : "Add photo"}
            </span>
            <input
              type="file"
              accept={IMAGE_ACCEPT}
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (file) void addPhoto(file);
              }}
              className="sr-only"
            />
          </label>
          <span className="text-xs text-muted-foreground">
            {uploading
              ? "Uploading…"
              : imagePath
                ? "Change photo"
                : "Add photo"}
          </span>
        </div>

        <div className="grid flex-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="member-name">Name</Label>
            <Input
              id="member-name"
              name="name"
              required
              minLength={2}
              maxLength={60}
              defaultValue={member?.name}
              className={field}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="member-role">Role</Label>
            <Input
              id="member-role"
              name="role"
              required
              minLength={2}
              maxLength={60}
              defaultValue={member?.role}
              placeholder="e.g. Team lead, Backend developer"
              className={field}
            />
          </div>
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="member-bio">Short bio (optional)</Label>
            <Input
              id="member-bio"
              name="bio"
              maxLength={100}
              defaultValue={member?.bio}
              placeholder="One sentence, shown on the back of the badge."
              className={field}
            />
          </div>
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="member-link">Link (optional)</Label>
            <Input
              id="member-link"
              name="linkUrl"
              type="url"
              maxLength={300}
              defaultValue={member?.linkUrl}
              placeholder="https://linkedin.com/in/…"
              className={field}
            />
          </div>
        </div>
      </div>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-3">
        {member && (
          <Link
            href="/dashboard/team"
            className={buttonVariants({ variant: "ghost", size: "xl" })}
          >
            Cancel
          </Link>
        )}
        <Button type="submit" size="xl" disabled={saving || uploading}>
          {saving ? "Saving…" : member ? "Save changes" : "Add member"}
        </Button>
      </div>
    </form>
  );
}
