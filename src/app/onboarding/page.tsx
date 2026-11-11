import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { db } from "@/db";
import { tags } from "@/db/schema";
import { getProfile, getUser } from "@/lib/auth";
import { OnboardingForm } from "./onboarding-form";

export const metadata = { title: "Welcome | APITA Marketplace" };

// shortcut: this page waits for the session check on the server instead of showing an instant shell; move the session read into a <Suspense> section if navigation here feels slow.
export const instant = false;

export default async function OnboardingPage() {
  const user = await getUser();
  if (!user) redirect("/login");
  if (await getProfile()) redirect("/dashboard");

  const allTags = await db.select().from(tags).orderBy(tags.name);

  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <OnboardingForm
          tags={allTags}
          defaultName={user.user_metadata?.full_name ?? ""}
        />
      </main>
    </>
  );
}
