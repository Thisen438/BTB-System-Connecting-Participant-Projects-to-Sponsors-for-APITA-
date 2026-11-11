"use server";

import { redirect } from "next/navigation";
import { db } from "@/db";
import { investorInterests, profiles } from "@/db/schema";
import { getUser } from "@/lib/auth";
import { onboardingSchema } from "@/lib/validation";

export async function completeOnboarding(
  _prev: string | null,
  formData: FormData,
): Promise<string | null> {
  const user = await getUser();
  if (!user) redirect("/login");

  const parsed = onboardingSchema.safeParse({
    role: formData.get("role"),
    displayName: formData.get("displayName"),
    tagIds: formData.getAll("tagIds"),
  });
  if (!parsed.success) return parsed.error.issues[0].message;
  const { role, displayName, tagIds } = parsed.data;

  await db.transaction(async (tx) => {
    // A profile is created once; a repeat submit must not change the role.
    const created = await tx
      .insert(profiles)
      .values({ id: user.id, role, displayName })
      .onConflictDoNothing()
      .returning({ id: profiles.id });
    if (created.length && role === "investor")
      await tx
        .insert(investorInterests)
        .values(tagIds.map((tagId) => ({ investorId: user.id, tagId })));
  });

  redirect("/dashboard");
}
