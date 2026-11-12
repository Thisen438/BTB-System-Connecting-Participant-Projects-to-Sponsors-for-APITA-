import { ImageIcon, SearchX } from "lucide-react";
import Form from "next/form";
import Image from "next/image";
import Link from "next/link";
import { z } from "zod";
import { TagChips } from "@/components/tag-chips";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { db } from "@/db";
import { tags } from "@/db/schema";
import { projectImageUrl } from "@/lib/images";
import { getPublishedProjects } from "@/lib/projects";

// The filters live in the page address (?q=erp&tagIds=3&tagIds=5), so a search can be shared or reloaded.
// Anything malformed is treated as "no filter".
const filtersSchema = z.object({
  q: z.string().trim().max(100).catch(""),
  tagIds: z
    .preprocess(
      (v) => (v === undefined ? [] : Array.isArray(v) ? v : [v]),
      z.array(z.coerce.number().int().positive()).max(50),
    )
    .catch([]),
});

// The project catalog investors browse.
export async function BrowseProjects({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const { q, tagIds } = filtersSchema.parse(searchParams);
  const [allTags, found] = await Promise.all([
    db.select().from(tags).orderBy(tags.name),
    getPublishedProjects(q, tagIds),
  ]);
  const filtered = q !== "" || tagIds.length > 0;

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">Projects</h2>

      <Form
        // A new key per search resets the fields, so "Clear filters" really clears them.
        key={JSON.stringify([q, tagIds])}
        action="/dashboard"
        scroll={false}
        className="surface flex flex-col gap-4 p-5"
      >
        <div className="flex gap-3">
          <Input
            name="q"
            type="search"
            defaultValue={q}
            maxLength={100}
            placeholder="Search projects"
            aria-label="Search projects"
            className="h-11 rounded-xl px-3.5"
          />
          <Button type="submit" size="xl">
            Search
          </Button>
        </div>
        <fieldset>
          <legend className="mb-2 text-sm font-medium">
            Show projects tagged
          </legend>
          <TagChips tags={allTags} checkedIds={tagIds} />
        </fieldset>
      </Form>

      <div className="flex items-center justify-between gap-4">
        <p role="status" className="text-sm text-muted-foreground">
          {found.length} {found.length === 1 ? "project" : "projects"}
          {filtered && " match your search"}
        </p>
        {filtered && (
          <Link
            href="/dashboard"
            scroll={false}
            className={buttonVariants({ variant: "ghost", size: "lg" })}
          >
            Clear filters
          </Link>
        )}
      </div>

      {found.length === 0 ? (
        <div className="surface flex flex-col items-center gap-3 border-dashed p-10 text-center shadow-none">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
            <SearchX aria-hidden className="size-6" />
          </span>
          <h3 className="text-lg font-semibold">
            {filtered ? "No projects match" : "No projects yet"}
          </h3>
          <p className="max-w-md text-sm text-muted-foreground">
            {filtered
              ? "Try a different word or fewer tags."
              : "Teams are still adding their projects. Check back soon."}
          </p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {found.map((p) => (
            <li key={p.id}>
              <Link
                href={`/dashboard/projects/${p.id}`}
                // Opening a project is recorded as a view, so it must not be loaded ahead of a real click.
                prefetch={false}
                className="surface flex h-full flex-col overflow-hidden transition-shadow outline-none hover:shadow-2xl hover:shadow-primary/10 focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <div className="relative flex aspect-video items-center justify-center bg-muted text-muted-foreground">
                  {p.cover ? (
                    <Image
                      src={projectImageUrl(p.cover)}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
                      className="object-cover"
                    />
                  ) : (
                    <ImageIcon aria-hidden className="size-8 opacity-50" />
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-2 p-5">
                  <h3 className="truncate text-lg font-semibold">{p.title}</h3>
                  {p.teamName && (
                    <p className="truncate text-sm font-medium text-accent-foreground">
                      {p.teamName}
                    </p>
                  )}
                  <p className="line-clamp-3 text-sm text-muted-foreground">
                    {p.summary}
                  </p>
                  <ul className="mt-auto flex flex-wrap gap-1.5 pt-2">
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
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
