import { Check, Users } from "lucide-react";
import Link from "next/link";
import { TeamRail } from "@/components/team-rail";
import { buttonVariants } from "@/components/ui/button";
import { getTeamMembers } from "@/lib/team";
import { getMyProjects, MyProjects } from "./my-projects";

// The participant's dashboard: what is left to do, their project, and their team.
export async function ParticipantHome({
  profile,
}: {
  profile: { id: string; teamName: string };
}) {
  const [mine, members] = await Promise.all([
    getMyProjects(profile.id),
    getTeamMembers(profile.id),
  ]);

  const steps = [
    {
      done: members.length > 0,
      title: "Set up your team profile",
      text:
        members.length > 0
          ? `${members.length} ${members.length === 1 ? "member" : "members"} added.`
          : "Add the people behind your project.",
      href: "/dashboard/team",
    },
    {
      done: mine.length > 0,
      title: "Create your project",
      text: "Name, summary, tags and images.",
      href: mine[0]
        ? `/dashboard/projects/${mine[0].id}/edit`
        : "/dashboard/projects/new",
    },
    {
      done: mine.some((p) => p.status === "published"),
      title: "Publish it",
      text: "Investors only see published projects.",
      href: mine[0] ? "#projects" : "/dashboard/projects/new",
    },
  ];
  const doneCount = steps.filter((s) => s.done).length;

  return (
    <>
      <section className="surface flex flex-col gap-4 p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-lg font-semibold">
            {doneCount === steps.length
              ? "You are ready for APITA"
              : "Get ready for APITA"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {doneCount} of {steps.length} done
          </p>
        </div>
        <ol className="grid gap-3 md:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s.title}>
              <Link
                href={s.href}
                className="flex h-full items-start gap-3 rounded-xl border p-4 transition-colors outline-none hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <span
                  className={`flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${s.done ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                >
                  {s.done ? <Check aria-hidden className="size-4" /> : i + 1}
                </span>
                <span className="flex flex-col gap-0.5">
                  <span className="font-medium">
                    {s.title}
                    <span className="sr-only">
                      {s.done ? " (done)" : " (to do)"}
                    </span>
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {s.text}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <div id="projects" className="scroll-mt-24">
        <MyProjects mine={mine} />
      </div>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">
            {profile.teamName || "Your team"}
          </h2>
          {members.length > 0 && (
            <Link
              href="/dashboard/team"
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              Edit team
            </Link>
          )}
        </div>
        {members.length > 0 ? (
          <TeamRail
            members={members}
            teamName={profile.teamName}
            className="rounded-2xl border"
          />
        ) : (
          <div className="surface flex flex-col items-center gap-3 border-dashed p-10 text-center shadow-none">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
              <Users aria-hidden className="size-6" />
            </span>
            <h3 className="text-lg font-semibold">Introduce your team</h3>
            <p className="max-w-md text-sm text-muted-foreground">
              Investors back people as much as ideas. Add each member with a
              photo and role, and they appear as badges on your project.
            </p>
            <Link
              href="/dashboard/team"
              className={buttonVariants({ size: "lg" })}
            >
              Set up team profile
            </Link>
          </div>
        )}
      </section>
    </>
  );
}
