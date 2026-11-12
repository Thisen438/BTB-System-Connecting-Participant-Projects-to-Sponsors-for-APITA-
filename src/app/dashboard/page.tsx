import { eq } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { db } from "@/db";
import { investorInterests, tags } from "@/db/schema";
import { getProfile } from "@/lib/auth";
import { BrowseProjects } from "./browse-projects";
import { ParticipantHome } from "./participant-home";
import { ProfileCard } from "./profile/profile-card";

export const metadata = { title: "Dashboard | APITA Marketplace" };

// shortcut: this page waits for the session check on the server instead of showing an instant shell; move the session read into a <Suspense> section if navigation here feels slow.
export const instant = false;

export default async function DashboardPage({
  searchParams,
}: PageProps<"/dashboard">) {
  const profile = await getProfile();
  if (!profile) redirect("/onboarding");
  const isInvestor = profile.role === "investor";

  const interests = isInvestor
    ? await db
        .select({ name: tags.name })
        .from(investorInterests)
        .innerJoin(tags, eq(tags.id, investorInterests.tagId))
        .where(eq(investorInterests.investorId, profile.id))
        .orderBy(tags.name)
    : [];

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-2">
        <p className="w-fit rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
          {isInvestor ? "Investor" : "Participant"}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Hi, {profile.displayName}
        </h1>
      </div>

      {isInvestor ? (
        <>
          <ProfileCard
            profile={profile}
            interests={interests.map((t) => t.name)}
            action={
              <Link
                href="/dashboard/profile"
                className={buttonVariants({ variant: "outline", size: "lg" })}
              >
                Edit profile
              </Link>
            }
          />
          <BrowseProjects searchParams={await searchParams} />
        </>
      ) : (
        <ParticipantHome profile={profile} />
      )}
    </main>
  );
}
