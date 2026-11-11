import { eq } from "drizzle-orm";
import { Compass } from "lucide-react";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { db } from "@/db";
import { investorInterests, tags } from "@/db/schema";
import { getProfile } from "@/lib/auth";
import { signOut } from "./actions";
import { MyProjects } from "./my-projects";

export const metadata = { title: "Dashboard | APITA Marketplace" };

// shortcut: this page waits for the session check on the server instead of showing an instant shell; move the session read into a <Suspense> section if navigation here feels slow.
export const instant = false;

export default async function DashboardPage() {
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
    <>
      <SiteHeader>
        <form action={signOut}>
          <Button variant="ghost" size="lg" type="submit">
            Sign out
          </Button>
        </form>
      </SiteHeader>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-2">
          <p className="w-fit rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
            {isInvestor ? "Investor" : "Participant"}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            Hi, {profile.displayName}
          </h1>
        </div>

        {isInvestor && (
          <section className="surface flex flex-col gap-3 p-6">
            <h2 className="font-semibold">Your interests</h2>
            <ul className="flex flex-wrap gap-2">
              {interests.map((t) => (
                <li
                  key={t.name}
                  className="rounded-full bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground"
                >
                  {t.name}
                </li>
              ))}
            </ul>
          </section>
        )}

        {isInvestor ? (
          <section className="surface flex flex-col items-center gap-3 border-dashed p-10 text-center shadow-none">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
              <Compass aria-hidden className="size-6" />
            </span>
            <h2 className="text-lg font-semibold">Projects are on the way</h2>
            <p className="max-w-md text-sm text-muted-foreground">
              Soon you will browse every APITA project here, with picks matched
              to your interests.
            </p>
          </section>
        ) : (
          <MyProjects ownerId={profile.id} />
        )}
      </main>
    </>
  );
}
