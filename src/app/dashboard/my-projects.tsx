import { desc, eq, sql } from "drizzle-orm";
import { Plus, Rocket } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { db } from "@/db";
import { projects, projectTags, tags } from "@/db/schema";
import { projectImageUrl } from "@/lib/images";
import { setProjectStatus } from "./projects/actions";

export async function MyProjects({ ownerId }: { ownerId: string }) {
  const mine = await db
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

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold">My projects</h2>
        {newProject}
      </div>
      <ul className="flex flex-col gap-3">
        {mine.map((p) => {
          const published = p.status === "published";
          return (
            <li
              key={p.id}
              className="surface flex flex-col gap-4 p-4 sm:flex-row sm:items-center"
            >
              <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-xl bg-muted sm:w-40">
                {p.cover && (
                  <Image
                    src={projectImageUrl(p.cover)}
                    alt=""
                    fill
                    sizes="(min-width: 640px) 160px, 100vw"
                    className="object-cover"
                  />
                )}
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="truncate font-semibold">{p.title}</h3>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${published ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                  >
                    {published ? "Published" : "Draft"}
                  </span>
                </div>
                <p className="line-clamp-2 text-sm text-muted-foreground">
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
              </div>
              <div className="flex shrink-0 gap-2">
                <Link
                  href={`/dashboard/projects/${p.id}/edit`}
                  aria-label={`Edit ${p.title}`}
                  className={buttonVariants({ variant: "outline", size: "lg" })}
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
            </li>
          );
        })}
      </ul>
    </section>
  );
}
