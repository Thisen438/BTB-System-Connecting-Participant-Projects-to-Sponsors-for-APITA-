import "server-only";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { createClient } from "@/lib/supabase/server";

export const getUser = cache(async () => {
  // Supabase reads the clock to check session expiry, so this must run per request, never at prerender.
  await connection();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

export const getProfile = cache(async () => {
  const user = await getUser();
  if (!user) return null;
  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, user.id));
  return profile ?? null;
});

// For pages and actions only one role may use; everyone else goes back to the dashboard.
export async function requireRole(role: "participant" | "investor") {
  const profile = await getProfile();
  if (profile?.role !== role) redirect("/dashboard");
  return profile;
}
