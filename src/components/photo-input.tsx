"use client";

import { Camera } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { projectImageUrl } from "@/lib/images";
import { IMAGE_ACCEPT, uploadImage } from "@/lib/upload-image";

// Round photo picker for a form. Uploads straight away and submits the stored path as "imagePath".
// To clear it after a save, give it a new `key`.
export function PhotoInput({
  userId,
  defaultPath = "",
  onUploading,
  onError,
}: {
  userId: string;
  defaultPath?: string;
  onUploading: (uploading: boolean) => void;
  onError: (message: string | null) => void;
}) {
  const [path, setPath] = useState(defaultPath);
  const [uploading, setUploading] = useState(false);

  async function addPhoto(file: File) {
    onError(null);
    setUploading(true);
    onUploading(true);
    const result = await uploadImage(userId, file);
    if ("error" in result) onError(result.error);
    else setPath(result.path);
    setUploading(false);
    onUploading(false);
  }

  return (
    <div className="flex shrink-0 flex-col items-center gap-2">
      <input type="hidden" name="imagePath" value={path} />
      <label className="relative flex size-24 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-dashed bg-muted text-muted-foreground transition-colors hover:bg-accent has-focus-visible:ring-3 has-focus-visible:ring-ring/50">
        {path ? (
          <Image
            src={projectImageUrl(path)}
            alt=""
            fill
            sizes="96px"
            className="object-cover"
          />
        ) : (
          <Camera aria-hidden className="size-6" />
        )}
        <span className="sr-only">{path ? "Change photo" : "Add photo"}</span>
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
        {uploading ? "Uploading…" : path ? "Change photo" : "Add photo"}
      </span>
    </div>
  );
}
