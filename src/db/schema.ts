import { sql } from "drizzle-orm";
import {
  index,
  integer,
  pgEnum,
  pgPolicy,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { authenticatedRole, authUsers } from "drizzle-orm/supabase";

// Every table has RLS enabled with no policies: the Supabase API (publishable key)
// can read nothing. All access goes through server code using Drizzle, which checks
// the signed-in user itself. Add policies only when the browser must read a table
// directly (e.g. Realtime notifications in Phase 5).

export const userRole = pgEnum("user_role", ["participant", "investor"]);
export const projectStatus = pgEnum("project_status", ["draft", "published"]);

const createdAt = timestamp("created_at", { withTimezone: true })
  .notNull()
  .defaultNow();

export const profiles = pgTable("profiles", {
  id: uuid("id")
    .primaryKey()
    .references(() => authUsers.id, { onDelete: "cascade" }),
  role: userRole("role").notNull(),
  displayName: text("display_name").notNull(),
  // Participants only: the name shown on the team profile and on member badges.
  teamName: text("team_name").notNull().default(""),
  // Investors only: shown on their badge (My profile).
  title: text("title").notNull().default(""),
  organisation: text("organisation").notNull().default(""),
  bio: text("bio").notNull().default(""),
  // Path in the project-images bucket, or "" for no photo.
  imagePath: text("image_path").notNull().default(""),
  linkUrl: text("link_url").notNull().default(""),
  createdAt,
}).enableRLS();

export const tags = pgTable("tags", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull().unique(),
}).enableRLS();

export const investorInterests = pgTable(
  "investor_interests",
  {
    investorId: uuid("investor_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    tagId: integer("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.investorId, t.tagId] })],
).enableRLS();

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    summary: text("summary").notNull(),
    description: text("description").notNull().default(""),
    imagePaths: text("image_paths").array().notNull().default([]),
    status: projectStatus("status").notNull().default("draft"),
    createdAt,
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [index("projects_owner_idx").on(t.ownerId)],
).enableRLS();

// The people behind a participant account. The team lead fills these in; members do not sign in.
export const teamMembers = pgTable(
  "team_members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    role: text("role").notNull(),
    bio: text("bio").notNull().default(""),
    // Path in the project-images bucket, or "" for no photo.
    imagePath: text("image_path").notNull().default(""),
    linkUrl: text("link_url").notNull().default(""),
    createdAt,
  },
  (t) => [index("team_members_owner_idx").on(t.ownerId)],
).enableRLS();

export const projectTags = pgTable(
  "project_tags",
  {
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    tagId: integer("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (t) => [
    primaryKey({ columns: [t.projectId, t.tagId] }),
    index("project_tags_tag_idx").on(t.tagId),
  ],
).enableRLS();

export const projectViews = pgTable(
  "project_views",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    investorId: uuid("investor_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    viewedAt: timestamp("viewed_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("project_views_investor_idx").on(t.investorId)],
).enableRLS();

export const meetingMode = pgEnum("meeting_mode", ["in_person", "online"]);
export const meetingStatus = pgEnum("meeting_status", [
  "pending",
  "accepted",
  "declined",
]);

// An investor asks a project's team to meet and proposes times. Either side can answer with other times,
// so `awaiting` says whose turn it is while the request is pending.
export const meetings = pgTable(
  "meetings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    investorId: uuid("investor_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    // The project's owner at the time of the request.
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    mode: meetingMode("mode").notNull(),
    note: text("note").notNull().default(""),
    // The times currently on the table, as UTC ISO strings ("2026-12-05T04:30:00.000Z").
    proposedSlots: text("proposed_slots").array().notNull(),
    awaiting: userRole("awaiting").notNull().default("participant"),
    status: meetingStatus("status").notNull().default("pending"),
    // Set when accepted.
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
    // Online meetings only: added by the team.
    meetingLink: text("meeting_link").notNull().default(""),
    createdAt,
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    index("meetings_investor_idx").on(t.investorId),
    index("meetings_owner_idx").on(t.ownerId),
    // One live request per investor and project; a declined one can be followed by a new request.
    uniqueIndex("meetings_open_idx")
      .on(t.projectId, t.investorId)
      .where(sql`${t.status} <> 'declined'`),
  ],
).enableRLS();

// The one table the browser reads directly (live pop-ups over Supabase Realtime),
// so it has a policy: a signed-in user can read their own rows and nothing else.
export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    meetingId: uuid("meeting_id")
      .notNull()
      .references(() => meetings.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt,
  },
  (t) => [
    index("notifications_user_idx").on(t.userId),
    pgPolicy("notifications_select_own", {
      for: "select",
      to: authenticatedRole,
      using: sql`${t.userId} = (select auth.uid())`,
    }),
  ],
).enableRLS();
