import { and, eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { projects, projectTags, tags } from "@/db/schema";
import { getProfile } from "@/lib/auth";
import { ProjectForm } from "../../project-form";

export const metadata = { title: "Edit project | APITA Marketplace" };

// shortcut: this page waits for the session check on the server instead of showing an instant shell; move the session read into a <Suspense> section if navigation here feels slow.
export const instant = false;

export default async function EditProjectPage({
  params,
}: PageProps<"/dashboard/projects/[id]/edit">) {
  const profile = await getProfile();
  if (profile?.role !== "participant") redirect("/dashboard");

  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();

  const [[project], allTags, chosen] = await Promise.all([
    db
      .select()
      .from(projects)
      .where(and(eq(projects.id, id), eq(projects.ownerId, profile.id))),
    db.select().from(tags).orderBy(tags.name),
    db
      .select({ tagId: projectTags.tagId })
      .from(projectTags)
      .where(eq(projectTags.projectId, id)),
  ]);
  if (!project) notFound();

  return (
    <>
      <h1 className="text-3xl font-semibold tracking-tight">Edit project</h1>
      <ProjectForm
        userId={profile.id}
        tags={allTags}
        project={{ ...project, tagIds: chosen.map((c) => c.tagId) }}
      />
    </>
  );
}
