import "server-only";
import { desc, eq, getTableColumns, or } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db } from "@/db";
import { meetings, profiles, projects } from "@/db/schema";

const investor = alias(profiles, "investor");
const owner = alias(profiles, "owner");

// Every meeting the user is part of, on either side, latest activity first.
export const getMeetings = (userId: string) =>
  db
    .select({
      ...getTableColumns(meetings),
      projectTitle: projects.title,
      investorName: investor.displayName,
      investorOrganisation: investor.organisation,
      teamName: owner.teamName,
      ownerName: owner.displayName,
    })
    .from(meetings)
    .innerJoin(projects, eq(projects.id, meetings.projectId))
    .innerJoin(investor, eq(investor.id, meetings.investorId))
    .innerJoin(owner, eq(owner.id, meetings.ownerId))
    .where(or(eq(meetings.investorId, userId), eq(meetings.ownerId, userId)))
    .orderBy(desc(meetings.updatedAt));

export type Meeting = Awaited<ReturnType<typeof getMeetings>>[number];
