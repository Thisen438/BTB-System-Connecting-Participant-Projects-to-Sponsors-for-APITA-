import "server-only";
import {
  and,
  desc,
  eq,
  getTableColumns,
  ilike,
  inArray,
  or,
  sql,
} from "drizzle-orm";
import { db } from "@/db";
import { profiles, projects, projectTags, tags } from "@/db/schema";

// Shared by every project list: first image, tag names in A-Z order.
const cover = sql<string | null>`${projects.imagePaths}[1]`;
const tagNames = sql<
  string[]
>`coalesce(array_agg(${tags.name} order by ${tags.name}) filter (where ${tags.name} is not null), '{}')`;

const card = {
  id: projects.id,
  title: projects.title,
  summary: projects.summary,
  status: projects.status,
  cover,
  tags: tagNames,
};

// A participant's own projects, drafts included.
export const getMyProjects = (ownerId: string) =>
  db
    .select(card)
    .from(projects)
    .leftJoin(projectTags, eq(projectTags.projectId, projects.id))
    .leftJoin(tags, eq(tags.id, projectTags.tagId))
    .where(eq(projects.ownerId, ownerId))
    .groupBy(projects.id)
    .orderBy(desc(projects.updatedAt));

// The catalog investors browse: published projects, optionally matching a text and any of the given tags.
export function getPublishedProjects(q: string, tagIds: number[]) {
  const pattern = `%${q}%`;
  return (
    db
      .select({ ...card, teamName: profiles.teamName })
      .from(projects)
      .innerJoin(profiles, eq(profiles.id, projects.ownerId))
      .leftJoin(projectTags, eq(projectTags.projectId, projects.id))
      .leftJoin(tags, eq(tags.id, projectTags.tagId))
      .where(
        and(
          eq(projects.status, "published"),
          q
            ? or(
                ilike(projects.title, pattern),
                ilike(projects.summary, pattern),
                ilike(projects.description, pattern),
              )
            : undefined,
          tagIds.length
            ? inArray(
                projects.id,
                db
                  .select({ id: projectTags.projectId })
                  .from(projectTags)
                  .where(inArray(projectTags.tagId, tagIds)),
              )
            : undefined,
        ),
      )
      .groupBy(projects.id, profiles.teamName)
      .orderBy(desc(projects.updatedAt))
      // shortcut: no paging, the newest 100 matches are shown; add paging if the event lists more projects than that.
      .limit(100)
  );
}

// One project with everything its page shows. Callers decide who may see it.
export async function getProject(id: string) {
  const [project] = await db
    .select({
      ...getTableColumns(projects),
      teamName: profiles.teamName,
      tags: tagNames,
    })
    .from(projects)
    .innerJoin(profiles, eq(profiles.id, projects.ownerId))
    .leftJoin(projectTags, eq(projectTags.projectId, projects.id))
    .leftJoin(tags, eq(tags.id, projectTags.tagId))
    .where(eq(projects.id, id))
    .groupBy(projects.id, profiles.teamName);
  return project;
}
