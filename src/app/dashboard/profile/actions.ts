"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { investorInterests, profiles } from "@/db/schema";
import { requireRole } from "@/lib/auth";
import { deleteStoredImage } from "@/lib/supabase/server";
import { investorProfileSchema } from "@/lib/validation";

// Returns an error message, or null when saved.
export async function saveInvestorProfile(
  formData: FormData,
): Promise<string | null> {
  const profile = await requireRole("investor");

  const parsed = investorProfileSchema.safeParse({
    displayName: formData.get("displayName"),
    title: formData.get("title"),
    organisation: formData.get("organisation"),
    bio: formData.get("bio"),
    imagePath: formData.get("imagePath") ?? "",
    linkUrl: formData.get("linkUrl"),
    tagIds: formData.getAll("tagIds"),
  });
  if (!parsed.success) return parsed.error.issues[0].message;
  const { tagIds, ...values } = parsed.data;

  // Uploads land in the user's own folder; reject paths pointing at anyone else's files.
  if (values.imagePath && !values.imagePath.startsWith(`${profile.id}/`))
    return "Invalid image.";

  await db.transaction(async (tx) => {
    await tx.update(profiles).set(values).where(eq(profiles.id, profile.id));
    await tx
      .delete(investorInterests)
      .where(eq(investorInterests.investorId, profile.id));
    await tx.insert(investorInterests).values(
      [...new Set(tagIds)].map((tagId) => ({
        investorId: profile.id,
        tagId,
      })),
    );
  });
  if (profile.imagePath !== values.imagePath)
    await deleteStoredImage(profile.imagePath);

  // The header's "complete your profile" hint lives in the dashboard layout.
  revalidatePath("/dashboard", "layout");
  return null;
}
