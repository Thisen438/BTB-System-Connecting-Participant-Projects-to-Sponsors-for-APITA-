import { redirect } from "next/navigation";
import { db } from "@/db";
import { tags } from "@/db/schema";
import { getProfile } from "@/lib/auth";
import { ProjectForm } from "../project-form";

export const metadata = { title: "New project | APITA Marketplace" };

// shortcut: this page waits for the session check on the server instead of showing an instant shell; move the session read into a <Suspense> section if navigation here feels slow.
export const instant = false;

export default async function NewProjectPage() {
  const profile = await getProfile();
  if (profile?.role !== "participant") redirect("/dashboard");

  const allTags = await db.select().from(tags).orderBy(tags.name);

  return (
    <>
      <h1 className="text-3xl font-semibold tracking-tight">New project</h1>
      <ProjectForm userId={profile.id} tags={allTags} />
    </>
  );
}
