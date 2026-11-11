import {
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { authUsers } from "drizzle-orm/supabase";

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
