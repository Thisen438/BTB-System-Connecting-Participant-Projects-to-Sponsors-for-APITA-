import { and, eq, ne } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { meetings, projectViews } from "@/db/schema";
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

  const isInvestor = profile.role === "investor";
  const [members, [openMeeting]] = await Promise.all([
    getTeamMembers(project.ownerId),
    // The investor's live request for this project, if any (a declined one does not count).
    isInvestor
      ? db
          .select({ status: meetings.status })
          .from(meetings)
          .where(
            and(
              eq(meetings.projectId, project.id),
              eq(meetings.investorId, profile.id),
              ne(meetings.status, "declined"),
            ),
          )
      : [],
    // Each visit by an investor is recorded and feeds their recommendations.
    isInvestor &&
      db
        .insert(projectViews)
        .values({ investorId: profile.id, projectId: project.id }),
  ]);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6">
      <ProjectView
        project={project}
        members={members}
        isOwner={isOwner}
        // Only investors can ask for a meeting; "requested" once they have a live request.
        meeting={
          !isInvestor ? "unavailable" : openMeeting ? "requested" : "available"
        }
      />
    </main>
  );
}
