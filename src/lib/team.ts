import "server-only";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { teamMembers } from "@/db/schema";

export type TeamMember = typeof teamMembers.$inferSelect;

export const getTeamMembers = (ownerId: string) =>
  db
    .select()
    .from(teamMembers)
    .where(eq(teamMembers.ownerId, ownerId))
    .orderBy(asc(teamMembers.createdAt));
