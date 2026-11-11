import { z } from "zod";

export const onboardingSchema = z
  .object({
    role: z.enum(["participant", "investor"]),
    displayName: z
      .string()
      .trim()
      .min(2, "Enter your name (at least 2 characters).")
      .max(80, "Name is too long."),
    tagIds: z.array(z.coerce.number().int().positive()).max(50),
  })
  .refine((v) => v.role !== "investor" || v.tagIds.length > 0, {
    path: ["tagIds"],
    message: "Pick at least one interest.",
  });

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
  team: z.string().trim().max(500, "Team info is too long."),
  tagIds: z
    .array(z.coerce.number().int().positive())
    .min(1, "Pick at least one tag.")
    .max(MAX_PROJECT_TAGS, `Pick at most ${MAX_PROJECT_TAGS} tags.`),
  // "<user id>/<file id>.<ext>", as written by the upload in the project form.
  imagePaths: z
    .array(
      z
        .string()
        .regex(/^[0-9a-f-]{36}\/[0-9a-f-]{36}\.(jpg|png|webp)$/, "Invalid image."),
    )
    .max(MAX_PROJECT_IMAGES, `Add at most ${MAX_PROJECT_IMAGES} images.`),
  status: z.enum(["draft", "published"]),
});
