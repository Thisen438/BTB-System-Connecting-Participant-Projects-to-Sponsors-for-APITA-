"use server";

import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { meetings, notifications, projects } from "@/db/schema";
import { getProfile, requireRole } from "@/lib/auth";
import { meetingReplySchema, meetingRequestSchema } from "@/lib/validation";

// The unread badge lives in the dashboard layout, so refresh the layout too.
const refresh = () => revalidatePath("/dashboard", "layout");

// Returns an error message, or null when the request was sent.
export async function requestMeeting(
  projectId: string,
  formData: FormData,
): Promise<string | null> {
  const profile = await requireRole("investor");

  const note = formData.get("note");
  const parsed = meetingRequestSchema.safeParse({
    mode: formData.get("mode"),
    slots: formData.getAll("slots"),
    // Forms send a line break as \r\n but the browser's maxLength counts it as one character.
    note: typeof note === "string" ? note.replaceAll("\r\n", "\n") : note,
  });
  if (!parsed.success) return parsed.error.issues[0].message;
  const { slots, ...values } = parsed.data;

  if (!z.uuid().safeParse(projectId).success) return "Project not found.";
  const [project] = await db
    .select({ ownerId: projects.ownerId, title: projects.title })
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.status, "published")));
  if (!project) return "Project not found.";

  const sent = await db.transaction(async (tx) => {
    const [meeting] = await tx
      .insert(meetings)
      .values({
        ...values,
        projectId,
        investorId: profile.id,
        ownerId: project.ownerId,
        proposedSlots: slots,
      })
      // The database allows one live request per investor and project.
      .onConflictDoNothing()
      .returning({ id: meetings.id });
    if (!meeting) return false;
    await tx.insert(notifications).values({
      userId: project.ownerId,
      meetingId: meeting.id,
      body: `${profile.displayName} asked to meet about “${project.title}”.`,
    });
    return true;
  });
  if (!sent) return "You already have a meeting request for this project.";

  refresh();
  return null;
}

// Accept one of the proposed times, decline, or propose other times.
// Returns an error message, or null when the answer was saved.
export async function replyToMeeting(
  id: string,
  formData: FormData,
): Promise<string | null> {
  const profile = await getProfile();
  if (!profile) return "Sign in again.";

  const parsed = meetingReplySchema.safeParse({
    reply: formData.get("reply"),
    slot: formData.get("slot"),
    slots: formData.getAll("slots"),
    meetingLink: formData.get("meetingLink") ?? "",
  });
  if (!parsed.success) return parsed.error.issues[0].message;
  const reply = parsed.data;

  if (!z.uuid().safeParse(id).success) return "Meeting not found.";
  const isTeam = profile.role === "participant";
  // Only a pending request, only the user's own, and only when it is their turn to answer.
  const myTurn = and(
    eq(meetings.id, id),
    eq(isTeam ? meetings.ownerId : meetings.investorId, profile.id),
    eq(meetings.status, "pending"),
    eq(meetings.awaiting, profile.role),
  );
  const [meeting] = await db
    .select({
      mode: meetings.mode,
      proposedSlots: meetings.proposedSlots,
      meetingLink: meetings.meetingLink,
      investorId: meetings.investorId,
      ownerId: meetings.ownerId,
      title: projects.title,
    })
    .from(meetings)
    .innerJoin(projects, eq(projects.id, meetings.projectId))
    .where(myTurn);
  if (!meeting) return "This request was already answered.";

  // Only the team sets the link; an investor's answer keeps the one the team gave.
  const meetingLink =
    isTeam && reply.reply !== "decline"
      ? reply.meetingLink
      : meeting.meetingLink;
  if (reply.reply !== "decline" && meeting.mode === "online" && !meetingLink)
    return "Add the link for the online meeting.";

  const me = (isTeam && profile.teamName) || profile.displayName;
  let change: Partial<typeof meetings.$inferInsert>;
  let body: string;
  if (reply.reply === "accept") {
    if (!meeting.proposedSlots.includes(reply.slot))
      return "Pick one of the proposed times.";
    if (Date.parse(reply.slot) <= Date.now())
      return "That time has passed. Propose another time.";
    change = {
      status: "accepted",
      scheduledAt: new Date(reply.slot),
      meetingLink,
    };
    body = `${me} accepted the meeting about “${meeting.title}”.`;
  } else if (reply.reply === "decline") {
    change = { status: "declined" };
    body = `${me} declined the meeting about “${meeting.title}”.`;
  } else {
    change = {
      proposedSlots: reply.slots,
      awaiting: isTeam ? "investor" : "participant",
      meetingLink,
    };
    body = `${me} proposed other times for the meeting about “${meeting.title}”.`;
  }

  const saved = await db.transaction(async (tx) => {
    // Checked again here so two answers sent at once cannot both go through.
    const [row] = await tx
      .update(meetings)
      .set(change)
      .where(myTurn)
      .returning({ id: meetings.id });
    if (!row) return false;
    await tx.insert(notifications).values({
      userId: isTeam ? meeting.investorId : meeting.ownerId,
      meetingId: id,
      body,
    });
    return true;
  });
  if (!saved) return "This request was already answered.";

  refresh();
  return null;
}

// Called when the user opens the Meetings page: clears the unread badge.
export async function markNotificationsRead() {
  const profile = await getProfile();
  if (!profile) return;
  await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(
      and(eq(notifications.userId, profile.id), isNull(notifications.readAt)),
    );
  refresh();
}
