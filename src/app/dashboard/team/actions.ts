"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { profiles, teamMembers } from "@/db/schema";
import { requireParticipant } from "@/lib/auth";
import { PROJECT_IMAGES_BUCKET } from "@/lib/images";
import { createClient } from "@/lib/supabase/server";
import {
  MAX_TEAM_MEMBERS,
  teamMemberSchema,
  teamNameSchema,
} from "@/lib/validation";

// The header's "set up your team" hint lives in the dashboard layout, so refresh the layout too.
const refresh = () => revalidatePath("/dashboard", "layout");

// A person's photo must not stay online after they are removed or the photo is replaced.
// The database change has already happened, so a failed file delete is ignored rather than failing the save.
async function deletePhoto(path: string) {
  if (!path) return;
  const supabase = await createClient();
  await supabase.storage.from(PROJECT_IMAGES_BUCKET).remove([path]);
}

// Returns the message to show next to the button.
export async function saveTeamName(
  _prev: string | null,
  formData: FormData,
): Promise<string> {
  const profile = await requireParticipant();
  const parsed = teamNameSchema.safeParse(formData.get("teamName"));
  if (!parsed.success) return parsed.error.issues[0].message;
  await db
    .update(profiles)
    .set({ teamName: parsed.data })
    .where(eq(profiles.id, profile.id));
  refresh();
  return "Saved";
}

// id = null adds a member. Returns an error message, or null when saved.
export async function saveTeamMember(
  id: string | null,
  formData: FormData,
): Promise<string | null> {
  const profile = await requireParticipant();

  const parsed = teamMemberSchema.safeParse({
    name: formData.get("name"),
    role: formData.get("role"),
    bio: formData.get("bio"),
    imagePath: formData.get("imagePath") ?? "",
    linkUrl: formData.get("linkUrl"),
  });
  if (!parsed.success) return parsed.error.issues[0].message;
  const values = parsed.data;

  // Uploads land in the user's own folder; reject paths pointing at anyone else's files.
  if (values.imagePath && !values.imagePath.startsWith(`${profile.id}/`))
    return "Invalid image.";

  if (id === null) {
    const count = await db.$count(
      teamMembers,
      eq(teamMembers.ownerId, profile.id),
    );
    if (count >= MAX_TEAM_MEMBERS)
      return `A team can have up to ${MAX_TEAM_MEMBERS} members.`;
    await db.insert(teamMembers).values({ ...values, ownerId: profile.id });
  } else {
    if (!z.uuid().safeParse(id).success) return "Team member not found.";
    const mine = and(
      eq(teamMembers.id, id),
      eq(teamMembers.ownerId, profile.id),
    );
    const [old] = await db
      .select({ imagePath: teamMembers.imagePath })
      .from(teamMembers)
      .where(mine);
    if (!old) return "Team member not found.";
    await db.update(teamMembers).set(values).where(mine);
    if (old.imagePath !== values.imagePath) await deletePhoto(old.imagePath);
  }

  refresh();
  return null;
}

export async function removeTeamMember(id: string) {
  const profile = await requireParticipant();
  if (!z.uuid().safeParse(id).success) return;
  const [removed] = await db
    .delete(teamMembers)
    .where(and(eq(teamMembers.id, id), eq(teamMembers.ownerId, profile.id)))
    .returning({ imagePath: teamMembers.imagePath });
  if (removed) await deletePhoto(removed.imagePath);
  refresh();
}
