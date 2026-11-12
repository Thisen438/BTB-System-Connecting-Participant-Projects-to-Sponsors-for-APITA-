import Image from "next/image";
import Link from "next/link";
import { TeamRail } from "@/components/team-rail";
import { buttonVariants } from "@/components/ui/button";
import { requireRole } from "@/lib/auth";
import { projectImageUrl } from "@/lib/images";
import { getTeamMembers } from "@/lib/team";
import { MAX_TEAM_MEMBERS } from "@/lib/validation";
import { MemberForm } from "./member-form";
import { RemoveMemberButton, TeamNameForm } from "./team-controls";

export const metadata = { title: "Team profile | APITA Marketplace" };

// shortcut: this page waits for the session check on the server instead of showing an instant shell; move the session read into a <Suspense> section if navigation here feels slow.
export const instant = false;

export default async function TeamPage({
  searchParams,
}: PageProps<"/dashboard/team">) {
  const profile = await requireRole("participant");
  const [members, { edit }] = await Promise.all([
    getTeamMembers(profile.id),
    searchParams,
  ]);
  const editing = members.find((m) => m.id === edit);

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Team profile</h1>
        <p className="text-muted-foreground">
          The people behind your project. Investors see this team on your
          project page.
        </p>
      </div>

      <TeamNameForm teamName={profile.teamName} />

      {members.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="font-semibold">How investors see your team</h2>
          <TeamRail
            members={members}
            teamName={profile.teamName}
            className="rounded-2xl border"
          />
        </section>
      )}

      {members.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="font-semibold">
            Members ({members.length} of {MAX_TEAM_MEMBERS})
          </h2>
          <ul className="flex flex-col gap-2">
            {members.map((m) => (
              <li key={m.id} className="surface flex items-center gap-4 p-3">
                <div className="relative size-12 shrink-0 overflow-hidden rounded-full bg-muted">
                  {m.imagePath && (
                    <Image
                      src={projectImageUrl(m.imagePath)}
                      alt=""
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{m.name}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {m.role}
                  </p>
                </div>
                <Link
                  href={`/dashboard/team?edit=${m.id}#member-form`}
                  aria-label={`Edit ${m.name}`}
                  className={buttonVariants({ variant: "outline", size: "lg" })}
                >
                  Edit
                </Link>
                <RemoveMemberButton id={m.id} name={m.name} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {(editing || members.length < MAX_TEAM_MEMBERS) && (
        // The key gives each member (and "new") its own fresh form.
        <MemberForm
          key={editing?.id ?? "new"}
          userId={profile.id}
          member={editing}
        />
      )}
    </main>
  );
}
