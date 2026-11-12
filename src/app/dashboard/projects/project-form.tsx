"use client";

import { ImagePlus, X } from "lucide-react";
import Image from "next/image";
import { useState, useTransition } from "react";
import { TagChips } from "@/components/tag-chips";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { projectImageUrl } from "@/lib/images";
import { IMAGE_ACCEPT, uploadImage } from "@/lib/upload-image";
import { MAX_PROJECT_IMAGES, MAX_PROJECT_TAGS } from "@/lib/validation";
import { saveProject } from "./actions";

const field = "h-11 rounded-xl px-3.5";
const textarea =
  "w-full rounded-xl border border-input bg-transparent px-3.5 py-2.5 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm";

export type ProjectFormValues = {
  id: string;
  title: string;
  summary: string;
  description: string;
  imagePaths: string[];
  status: "draft" | "published";
  tagIds: number[];
};

export function ProjectForm({
  userId,
  tags,
  project,
}: {
  userId: string;
  tags: { id: number; name: string }[];
  project?: ProjectFormValues;
}) {
  const [error, setError] = useState<string | null>(null);
  const [saving, startSaving] = useTransition();
  const [imagePaths, setImagePaths] = useState(project?.imagePaths ?? []);
  const [uploading, setUploading] = useState(false);
  const wasPublished = project?.status === "published";

  async function addImages(files: File[]) {
    setError(null);
    const room = MAX_PROJECT_IMAGES - imagePaths.length;
    if (files.length > room)
      setError(`You can add up to ${MAX_PROJECT_IMAGES} images.`);
    setUploading(true);
    for (const file of files.slice(0, room)) {
      const result = await uploadImage(userId, file);
      if ("error" in result) setError(result.error);
      else setImagePaths((paths) => [...paths, result.path]);
    }
    setUploading(false);
  }

  const draftButton = (
    <Button
      type="submit"
      name="status"
      value="draft"
      variant="outline"
      size="xl"
      disabled={saving || uploading}
    >
      {wasPublished ? "Unpublish and save" : "Save draft"}
    </Button>
  );
  const publishButton = (
    <Button
      type="submit"
      name="status"
      value="published"
      size="xl"
      disabled={saving || uploading}
    >
      {saving ? "Saving…" : wasPublished ? "Save changes" : "Publish"}
    </Button>
  );

  return (
    <form
      // Submitted by hand instead of `action=` so a rejected save keeps what the user typed.
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(
          e.currentTarget,
          (e.nativeEvent as SubmitEvent).submitter,
        );
        startSaving(async () =>
          setError(await saveProject(project?.id ?? null, data)),
        );
      }}
      className="surface flex w-full flex-col gap-7 p-6 sm:p-8"
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="title">Project name</Label>
        <Input
          id="title"
          name="title"
          required
          minLength={3}
          maxLength={100}
          defaultValue={project?.title}
          className={field}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="summary">One-line summary</Label>
        <Input
          id="summary"
          name="summary"
          required
          minLength={10}
          maxLength={200}
          defaultValue={project?.summary}
          aria-describedby="summary-hint"
          className={field}
        />
        <p id="summary-hint" className="text-sm text-muted-foreground">
          Shown on the project card investors see first.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          name="description"
          rows={8}
          maxLength={5000}
          defaultValue={project?.description}
          placeholder="What it does, who it is for, how far along it is."
          className={textarea}
        />
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-medium">
          Tags (1 to {MAX_PROJECT_TAGS})
        </legend>
        <TagChips tags={tags} checkedIds={project?.tagIds} />
      </fieldset>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">
          Images (up to {MAX_PROJECT_IMAGES})
        </span>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {imagePaths.map((path, i) => (
            <li
              key={path}
              className="relative aspect-video overflow-hidden rounded-xl border bg-muted"
            >
              <input type="hidden" name="imagePaths" value={path} />
              <Image
                src={projectImageUrl(path)}
                alt={`Project image ${i + 1}`}
                fill
                sizes="(min-width: 640px) 200px, 50vw"
                className="object-cover"
              />
              <Button
                type="button"
                variant="secondary"
                size="icon-sm"
                aria-label={`Remove image ${i + 1}`}
                // shortcut: the file stays in storage after removal, clean up orphaned files if storage use matters.
                onClick={() =>
                  setImagePaths((paths) => paths.filter((p) => p !== path))
                }
                className="absolute top-1.5 right-1.5"
              >
                <X aria-hidden />
              </Button>
            </li>
          ))}
          {imagePaths.length < MAX_PROJECT_IMAGES && (
            <li>
              <label className="flex aspect-video cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed text-sm text-muted-foreground transition-colors hover:bg-accent has-focus-visible:ring-3 has-focus-visible:ring-ring/50">
                <ImagePlus aria-hidden className="size-5" />
                {uploading ? "Uploading…" : "Add images"}
                <input
                  type="file"
                  accept={IMAGE_ACCEPT}
                  multiple
                  disabled={uploading}
                  onChange={(e) => {
                    const files = [...(e.target.files ?? [])];
                    e.target.value = "";
                    void addImages(files);
                  }}
                  className="sr-only"
                />
              </label>
            </li>
          )}
        </ul>
        <p className="text-sm text-muted-foreground">
          JPG, PNG or WebP, up to 5 MB each. The first image is the cover.
        </p>
      </div>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      {/* Pressing Enter in a field submits with the first button in the markup, so the button that
          keeps the current status comes first. The classes keep the same look either way:
          draft on the left, publish on the right (publish on top on phones). */}
      <div
        className={`flex gap-3 ${wasPublished ? "flex-col sm:flex-row-reverse sm:justify-start" : "flex-col-reverse sm:flex-row sm:justify-end"}`}
      >
        {wasPublished ? (
          <>
            {publishButton}
            {draftButton}
          </>
        ) : (
          <>
            {draftButton}
            {publishButton}
          </>
        )}
      </div>
    </form>
  );
}
