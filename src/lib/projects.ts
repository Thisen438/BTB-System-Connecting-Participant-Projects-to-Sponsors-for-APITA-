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

// How well a project fits one investor: per project tag, 3 if it is one of their interests,
// plus 1 for each project they opened carrying that tag (at most 3 per tag).
const affinityFor = (investorId: string) =>
  sql<number>`(
    select coalesce(sum(
      case when ii.tag_id is null then 0 else 3 end + least(coalesce(v.n, 0), 3)
    ), 0)::int
    from project_tags pt
    left join investor_interests ii
      on ii.tag_id = pt.tag_id and ii.investor_id = ${investorId}
    left join (
      select pt2.tag_id, count(distinct pv.project_id) as n
      from project_views pv
      join project_tags pt2 on pt2.project_id = pv.project_id
      where pv.investor_id = ${investorId}
      group by pt2.tag_id
    ) v on v.tag_id = pt.tag_id
    where pt.project_id = ${projects.id}
  )`;

// Small boost for fresh listings: 1 when just updated, fading to 0 over two weeks. It only breaks near-ties.
const recency = sql`greatest(0, 1 - extract(epoch from now() - ${projects.updatedAt}) / 1209600)`;

// The catalog one investor browses: published projects, optionally matching a text and any of the given tags,
// best fit for that investor first.
export function getPublishedProjects(
  q: string,
  tagIds: number[],
  investorId: string,
) {
  const pattern = `%${q}%`;
  const affinity = affinityFor(investorId);
  return (
    db
      .select({ ...card, teamName: profiles.teamName, affinity })
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
      .orderBy(desc(sql`${affinity} + ${recency}`), desc(projects.updatedAt))
      // shortcut: no paging, the best 100 matches are shown; add paging if the event lists more projects than that.
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
