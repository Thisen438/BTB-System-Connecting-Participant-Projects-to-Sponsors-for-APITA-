import { desc, eq, sql } from "drizzle-orm";
import { ImageIcon, Plus, Rocket } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { db } from "@/db";
import { projects, projectTags, tags } from "@/db/schema";
import { projectImageUrl } from "@/lib/images";
import { setProjectStatus } from "./projects/actions";

export const getMyProjects = (ownerId: string) =>
  db
    .select({
      id: projects.id,
      title: projects.title,
      summary: projects.summary,
      status: projects.status,
      cover: sql<string | null>`${projects.imagePaths}[1]`,
      tags: sql<
        string[]
      >`coalesce(array_agg(${tags.name} order by ${tags.name}) filter (where ${tags.name} is not null), '{}')`,
    })
    .from(projects)
    .leftJoin(projectTags, eq(projectTags.projectId, projects.id))
    .leftJoin(tags, eq(tags.id, projectTags.tagId))
    .where(eq(projects.ownerId, ownerId))
    .groupBy(projects.id)
    .orderBy(desc(projects.updatedAt));

export function MyProjects({
  mine,
}: {
  mine: Awaited<ReturnType<typeof getMyProjects>>;
}) {
  const newProject = (
    <Link
      href="/dashboard/projects/new"
      className={buttonVariants({ size: "lg" })}
    >
      <Plus aria-hidden />
      New project
    </Link>
  );

  if (!mine.length)
    return (
      <section className="surface flex flex-col items-center gap-3 border-dashed p-10 text-center shadow-none">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
          <Rocket aria-hidden className="size-6" />
        </span>
        <h2 className="text-lg font-semibold">List your project</h2>
        <p className="max-w-md text-sm text-muted-foreground">
          Add your project so investors can find it and request a meeting.
        </p>
        {newProject}
      </section>
    );

  // Most teams have one project, so a single project gets a wide card with a large cover.
  const single = mine.length === 1;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold">
          {single ? "Your project" : "Your projects"}
        </h2>
        {newProject}
      </div>
      <ul className={`grid gap-4 ${single ? "" : "md:grid-cols-2"}`}>
        {mine.map((p) => {
          const published = p.status === "published";
          return (
            <li
              key={p.id}
              className={`surface flex flex-col overflow-hidden ${single ? "md:flex-row" : ""}`}
            >
              <div
                className={`relative flex aspect-video shrink-0 items-center justify-center bg-muted text-muted-foreground ${single ? "md:w-1/2" : ""}`}
              >
                {p.cover ? (
                  <Image
                    src={projectImageUrl(p.cover)}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 560px, 100vw"
                    className="object-cover"
                  />
                ) : (
                  <ImageIcon aria-hidden className="size-8 opacity-50" />
                )}
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-3 p-5 sm:p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="truncate text-lg font-semibold">{p.title}</h3>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${published ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                  >
                    {published ? "Published" : "Draft"}
                  </span>
                </div>
                <p className="line-clamp-3 text-sm text-muted-foreground">
                  {p.summary}
                </p>
                <ul className="flex flex-wrap gap-1.5">
                  {p.tags.map((t) => (
                    <li
                      key={t}
                      className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-foreground"
                    >
                      {t}
                    </li>
                  ))}
                </ul>
                <p className="text-sm text-muted-foreground">
                  {published
                    ? "Live: investors can find this project."
                    : "Draft: only you can see this project."}
                </p>
                <div className="mt-auto flex gap-2 pt-2">
                  <Link
                    href={`/dashboard/projects/${p.id}/edit`}
                    aria-label={`Edit ${p.title}`}
                    className={buttonVariants({
                      variant: "outline",
                      size: "lg",
                    })}
                  >
                    Edit
                  </Link>
                  <form
                    action={setProjectStatus.bind(
                      null,
                      p.id,
                      published ? "draft" : "published",
                    )}
                  >
                    <Button
                      type="submit"
                      variant={published ? "ghost" : "default"}
                      size="lg"
                      aria-label={`${published ? "Unpublish" : "Publish"} ${p.title}`}
                    >
                      {published ? "Unpublish" : "Publish"}
                    </Button>
                  </form>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
