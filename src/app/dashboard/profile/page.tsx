import { eq } from "drizzle-orm";
import { db } from "@/db";
import { investorInterests, tags } from "@/db/schema";
import { requireRole } from "@/lib/auth";
import { ProfileCard } from "./profile-card";
import { ProfileForm } from "./profile-form";

export const metadata = { title: "My profile | APITA Marketplace" };

// shortcut: this page waits for the session check on the server instead of showing an instant shell; move the session read into a <Suspense> section if navigation here feels slow.
export const instant = false;

export default async function ProfilePage() {
  const profile = await requireRole("investor");
  const [allTags, interests] = await Promise.all([
    db.select().from(tags).orderBy(tags.name),
    db
      .select({ tagId: investorInterests.tagId })
      .from(investorInterests)
      .where(eq(investorInterests.investorId, profile.id)),
  ]);
  const interestIds = interests.map((i) => i.tagId);

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">My profile</h1>
        <p className="text-muted-foreground">
          Who you are and what you are looking for. Teams see this when you
          request a meeting.
        </p>
      </div>

      <ProfileCard
        profile={profile}
        interests={allTags
          .filter((t) => interestIds.includes(t.id))
          .map((t) => t.name)}
      />

      <section className="flex flex-col gap-3">
        <h2 className="font-semibold">Edit profile</h2>
        <ProfileForm
          profile={profile}
          tags={allTags}
          interestIds={interestIds}
        />
      </section>
    </main>
  );
}
