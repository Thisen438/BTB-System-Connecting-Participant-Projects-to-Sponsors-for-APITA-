import { eq } from "drizzle-orm";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { Button, buttonVariants } from "@/components/ui/button";
import { db } from "@/db";
import { teamMembers } from "@/db/schema";
import { getProfile } from "@/lib/auth";
import { signOut } from "./actions";
import { NavHint } from "./nav-hint";

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
            {needsTeam && (
              <NavHint hideOn="/dashboard/team">
                Set up your team profile here
              </NavHint>
            )}
          </span>
        )}
        {profile?.role === "investor" && (
          <span className="relative">
            <Link href="/dashboard/profile" className={navLink}>
              {/* Shorter on phones so the three links fit. */}
              <span className="sm:hidden">Profile</span>
              <span className="max-sm:hidden">My profile</span>
            </Link>
            {/* Shown until the investor has filled in anything beyond their name. */}
            {!(profile.organisation || profile.bio || profile.imagePath) && (
              <NavHint hideOn="/dashboard/profile">
                Complete your profile here
              </NavHint>
            )}
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
