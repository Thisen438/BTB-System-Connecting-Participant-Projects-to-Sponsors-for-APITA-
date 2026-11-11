"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { projects, projectTags } from "@/db/schema";
import { getProfile } from "@/lib/auth";
import { projectSchema } from "@/lib/validation";

async function requireParticipant() {
  const profile = await getProfile();
  if (profile?.role !== "participant") redirect("/dashboard");
  return profile;
}

// Forms send a line break as two characters (\r\n) but the browser's maxLength counts it as one;
// without this a long text with line breaks passes in the browser and fails the length check here.
const unixNewlines = (v: FormDataEntryValue | null) =>
  typeof v === "string" ? v.replaceAll("\r\n", "\n") : v;

// id = null creates a project. Returns an error message, or redirects on success.
export async function saveProject(
  id: string | null,
  formData: FormData,
): Promise<string | null> {
  const profile = await requireParticipant();

  const parsed = projectSchema.safeParse({
    title: formData.get("title"),
    summary: formData.get("summary"),
    description: unixNewlines(formData.get("description")),
    team: unixNewlines(formData.get("team")),
    tagIds: formData.getAll("tagIds"),
    imagePaths: formData.getAll("imagePaths"),
    status: formData.get("status"),
  });
  if (!parsed.success) return parsed.error.issues[0].message;
  const { tagIds, ...values } = parsed.data;

  if (id !== null && !z.uuid().safeParse(id).success)
    return "Project not found.";
  // Uploads land in the user's own folder; reject paths pointing at anyone else's files.
  if (values.imagePaths.some((p) => !p.startsWith(`${profile.id}/`)))
    return "Invalid image.";

  const saved = await db.transaction(async (tx) => {
    const [row] = id
      ? await tx
          .update(projects)
          .set(values)
          .where(and(eq(projects.id, id), eq(projects.ownerId, profile.id)))
          .returning({ id: projects.id })
      : await tx
          .insert(projects)
          .values({ ...values, ownerId: profile.id })
          .returning({ id: projects.id });
    if (!row) return false;
    await tx.delete(projectTags).where(eq(projectTags.projectId, row.id));
    await tx
      .insert(projectTags)
      .values(
        [...new Set(tagIds)].map((tagId) => ({ projectId: row.id, tagId })),
      );
    return true;
  });
  if (!saved) return "Project not found.";

  redirect("/dashboard");
}

export async function setProjectStatus(
  id: string,
  status: "draft" | "published",
) {
  const profile = await requireParticipant();
  if (
    !z.uuid().safeParse(id).success ||
    !z.enum(["draft", "published"]).safeParse(status).success
  )
    return;
  await db
    .update(projects)
    .set({ status })
    .where(and(eq(projects.id, id), eq(projects.ownerId, profile.id)));
  revalidatePath("/dashboard");
}
