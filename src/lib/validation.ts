import { z } from "zod";

const displayName = z
  .string()
  .trim()
  .min(2, "Enter your name (at least 2 characters).")
  .max(80, "Name is too long.");

export const onboardingSchema = z
  .object({
    role: z.enum(["participant", "investor"]),
    displayName,
    tagIds: z.array(z.coerce.number().int().positive()).max(50),
  })
  .refine((v) => v.role !== "investor" || v.tagIds.length > 0, {
    path: ["tagIds"],
    message: "Pick at least one interest.",
  });

// "<user id>/<file id>.<ext>", as written by uploadImage.
const imagePath = z
  .string()
  .regex(/^[0-9a-f-]{36}\/[0-9a-f-]{36}\.(jpg|png|webp)$/, "Invalid image.");

export const MAX_PROJECT_IMAGES = 5;
export const MAX_PROJECT_TAGS = 5;

export const projectSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title needs at least 3 characters.")
    .max(100, "Title is too long."),
  summary: z
    .string()
    .trim()
    .min(10, "Summary needs at least 10 characters.")
    .max(200, "Summary is too long."),
  description: z.string().trim().max(5000, "Description is too long."),
  tagIds: z
    .array(z.coerce.number().int().positive())
    .min(1, "Pick at least one tag.")
    .max(MAX_PROJECT_TAGS, `Pick at most ${MAX_PROJECT_TAGS} tags.`),
  imagePaths: z
    .array(imagePath)
    .max(MAX_PROJECT_IMAGES, `Add at most ${MAX_PROJECT_IMAGES} images.`),
  status: z.enum(["draft", "published"]),
});

export const MAX_TEAM_MEMBERS = 10;

export const teamNameSchema = z
  .string()
  .trim()
  .max(60, "Team name is too long.");

export const teamMemberSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name needs at least 2 characters.")
    .max(60, "Name is too long."),
  role: z
    .string()
    .trim()
    .min(2, "Role needs at least 2 characters.")
    .max(60, "Role is too long."),
  // About what fits on the back of a badge.
  bio: z.string().trim().max(100, "Bio is too long."),
  imagePath: imagePath.or(z.literal("")),
  // Shown as a clickable link, so only web addresses: never javascript: or data: links.
  linkUrl: z
    .string()
    .trim()
    .max(300, "Link is too long.")
    .regex(/^(https?:\/\/\S+)?$/i, "Link must start with https://"),
});

// An investor's own badge: same bio, photo and link rules as a team member.
export const investorProfileSchema = teamMemberSchema
  .pick({ bio: true, imagePath: true, linkUrl: true })
  .extend({
    displayName,
    title: z.string().trim().max(60, "Title is too long."),
    organisation: z.string().trim().max(60, "Organisation is too long."),
    tagIds: z
      .array(z.coerce.number().int().positive())
      .min(1, "Pick at least one interest.")
      .max(50),
  });

export const MAX_MEETING_SLOTS = 3;

// Times arrive as UTC ISO strings: the browser converts the user's local time before sending.
const meetingSlots = z
  .array(z.iso.datetime("Invalid time."))
  .min(1, "Propose at least one time.")
  .max(MAX_MEETING_SLOTS, `Propose at most ${MAX_MEETING_SLOTS} times.`)
  .refine((slots) => slots.every((s) => Date.parse(s) > Date.now()), {
    message: "Times must be in the future.",
  });

// Shown as a clickable link, so only web addresses: never javascript: or data: links.
const meetingLink = z
  .string()
  .trim()
  .max(300, "Link is too long.")
  .regex(/^(https?:\/\/\S+)?$/i, "Link must start with https://");

export const meetingRequestSchema = z.object({
  mode: z.enum(["in_person", "online"], "Choose in person or online."),
  slots: meetingSlots,
  note: z.string().trim().max(500, "Note is too long."),
});

// The answer to a pending request: take one of the proposed times, say no, or suggest other times.
export const meetingReplySchema = z.discriminatedUnion("reply", [
  z.object({
    reply: z.literal("accept"),
    slot: z.iso.datetime("Pick one of the times."),
    meetingLink,
  }),
  z.object({ reply: z.literal("decline") }),
  z.object({ reply: z.literal("propose"), slots: meetingSlots, meetingLink }),
]);
