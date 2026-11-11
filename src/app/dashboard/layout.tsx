import { eq } from "drizzle-orm";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { Button, buttonVariants } from "@/components/ui/button";
import { db } from "@/db";
import { teamMembers } from "@/db/schema";
import { getProfile } from "@/lib/auth";
import { signOut } from "./actions";
import { TeamHint } from "./team-hint";

const navLink = buttonVariants({ variant: "ghost", size: "lg" });

// Shared header for every signed-in page under /dashboard.
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getProfile();
  const isParticipant = profile?.role === "participant";
  const needsTeam =
    isParticipant &&
    (await db.$count(teamMembers, eq(teamMembers.ownerId, profile.id))) === 0;

  return (
    <>
      <SiteHeader>
        {profile && (
          <Link href="/dashboard" className={navLink}>
            Dashboard
          </Link>
        )}
        {isParticipant && (
          <span className="relative">
            <Link href="/dashboard/team" className={navLink}>
              Team
            </Link>
            {needsTeam && <TeamHint />}
          </span>
        )}
        <form action={signOut}>
          <Button variant="ghost" size="lg" type="submit">
            Sign out
          </Button>
        </form>
      </SiteHeader>
      {children}
    </>
  );
}
