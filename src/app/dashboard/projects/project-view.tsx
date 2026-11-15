import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { TeamRail } from "@/components/team-rail";
import { buttonVariants } from "@/components/ui/button";
import { projectImageUrl } from "@/lib/images";
import type { getProject } from "@/lib/projects";
import type { TeamMember } from "@/lib/team";
import { RequestMeeting } from "../meetings/meeting-forms";

// What an investor sees after clicking a project. The owner sees the same page as a preview.
export function ProjectView({
  project,
  members,
  isOwner,
  meeting,
}: {
  project: NonNullable<Awaited<ReturnType<typeof getProject>>>;
  members: TeamMember[];
  isOwner: boolean;
  meeting: "available" | "requested" | "unavailable";
}) {
  const [cover, ...moreImages] = project.imagePaths;

  return (
    <>
      <Link
        href="/dashboard"
        className={`${buttonVariants({ variant: "ghost", size: "lg" })} w-fit`}
      >
        <ArrowLeft aria-hidden />
        {isOwner ? "Back to dashboard" : "All projects"}
      </Link>

      {isOwner && (
        <p
          role="status"
          className="rounded-xl bg-accent px-4 py-3 text-sm text-accent-foreground"
        >
          {project.status === "published"
            ? "This is how investors see your project."
            : "Draft preview: investors cannot see this project until you publish it."}
        </p>
      )}

      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-col gap-3">
          <h1 className="text-3xl font-semibold tracking-tight">
            {project.title}
          </h1>
          {project.teamName && (
            <p className="font-medium text-accent-foreground">
              by {project.teamName}
            </p>
          )}
          <ul className="flex flex-wrap gap-2">
            {project.tags.map((t) => (
              <li
                key={t}
                className="rounded-full bg-accent px-3 py-1 text-sm font-medium text-accent-foreground"
              >
                {t}
              </li>
            ))}
          </ul>
        </div>

        {isOwner ? (
          <Link
            href={`/dashboard/projects/${project.id}/edit`}
            className={buttonVariants({ variant: "outline", size: "xl" })}
          >
            Edit project
          </Link>
        ) : meeting === "available" ? (
          <RequestMeeting projectId={project.id} />
        ) : (
          meeting === "requested" && (
            <Link
              href="/dashboard/meetings"
              className={buttonVariants({ variant: "outline", size: "xl" })}
            >
              Meeting requested: view
            </Link>
          )
        )}
      </div>

      {cover && (
        <div className="flex flex-col gap-3">
          <div className="relative aspect-video overflow-hidden rounded-2xl border bg-muted">
            <Image
              src={projectImageUrl(cover)}
              alt={`${project.title}, main image`}
              fill
              priority
              sizes="(min-width: 1024px) 960px, 100vw"
              className="object-cover"
            />
          </div>
          {moreImages.length > 0 && (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {moreImages.map((path, i) => (
                <li
                  key={path}
                  className="relative aspect-video overflow-hidden rounded-xl border bg-muted"
                >
                  <Image
                    src={projectImageUrl(path)}
                    alt={`${project.title}, image ${i + 2}`}
                    fill
                    sizes="(min-width: 640px) 240px, 50vw"
                    className="object-cover"
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <section className="surface flex flex-col gap-4 p-6 sm:p-8">
        <p className="text-lg font-medium">{project.summary}</p>
        {project.description && (
          <p className="whitespace-pre-line text-muted-foreground">
            {project.description}
          </p>
        )}
      </section>

      {members.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">
            {project.teamName ? `Meet ${project.teamName}` : "Meet the team"}
          </h2>
          <TeamRail
            members={members}
            teamName={project.teamName}
            className="rounded-2xl border"
          />
        </section>
      )}
    </>
  );
}
