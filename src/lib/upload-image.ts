import { PROJECT_IMAGES_BUCKET } from "@/lib/images";
import { createClient } from "@/lib/supabase/client";

const extensions: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const MAX_BYTES = 5 * 1024 * 1024; // same limit as the storage bucket

export const IMAGE_ACCEPT = Object.keys(extensions).join(",");

// Browser only. Uploads into the signed-in user's own folder and returns the stored path.
export async function uploadImage(
  userId: string,
  file: File,
): Promise<{ path: string } | { error: string }> {
  const ext = extensions[file.type];
  if (!ext || file.size > MAX_BYTES)
    return { error: `${file.name}: use a JPG, PNG or WebP image up to 5 MB.` };
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await createClient()
    .storage.from(PROJECT_IMAGES_BUCKET)
    .upload(path, file);
  return error
    ? { error: `${file.name}: upload failed. Try again.` }
    : { path };
}
