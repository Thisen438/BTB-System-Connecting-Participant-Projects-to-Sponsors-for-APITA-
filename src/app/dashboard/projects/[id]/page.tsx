import { notFound, redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { projectViews } from "@/db/schema";
import { getProfile } from "@/lib/auth";
import { getProject } from "@/lib/projects";
import { getTeamMembers } from "@/lib/team";
import { ProjectView } from "../project-view";

export const metadata = { title: "Project | APITA Marketplace" };

// shortcut: this page waits for the session check on the server instead of showing an instant shell; move the session read into a <Suspense> section if navigation here feels slow.
export const instant = false;

export default async function ProjectPage({
  params,
}: PageProps<"/dashboard/projects/[id]">) {
  const profile = await getProfile();
  if (!profile) redirect("/onboarding");

  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();

  const project = await getProject(id);
  const isOwner = project?.ownerId === profile.id;
  // Drafts are private: only the owner may open one.
  if (!project || (project.status !== "published" && !isOwner)) notFound();

  const [members] = await Promise.all([
    getTeamMembers(project.ownerId),
    // Each visit by an investor is recorded; Phase 4 uses these for recommendations.
    profile.role === "investor" &&
      db
        .insert(projectViews)
        .values({ investorId: profile.id, projectId: project.id }),
  ]);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6">
      <ProjectView project={project} members={members} isOwner={isOwner} />
    </main>
  );
}
