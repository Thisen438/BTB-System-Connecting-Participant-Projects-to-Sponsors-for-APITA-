import { desc, eq } from "drizzle-orm";
import { CalendarClock } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LocalTime } from "@/components/local-time";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { getProfile } from "@/lib/auth";
import { getMeetings } from "@/lib/meetings";
import { ReplyForm } from "./meeting-forms";

export const metadata = { title: "Meetings | APITA Marketplace" };

// shortcut: this page waits for the session check on the server instead of showing an instant shell; move the session read into a <Suspense> section if navigation here feels slow.
export const instant = false;

const statusLabel = {
  pending: "Waiting for an answer",
  accepted: "Confirmed",
  declined: "Declined",
};

// Meeting requests and their updates, for both investors and teams.
export default async function MeetingsPage() {
  const profile = await getProfile();
  if (!profile) redirect("/onboarding");
  const isTeam = profile.role === "participant";

  const [meetings, updates] = await Promise.all([
    getMeetings(profile.id),
    db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, profile.id))
      .orderBy(desc(notifications.createdAt))
      .limit(30),
  ]);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Meetings</h1>

      {meetings.length === 0 ? (
        <div className="surface flex flex-col items-center gap-3 border-dashed p-10 text-center shadow-none">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
            <CalendarClock aria-hidden className="size-6" />
          </span>
          <h2 className="text-lg font-semibold">No meetings yet</h2>
          <p className="max-w-md text-sm text-muted-foreground">
            {isTeam
              ? "When an investor asks to meet about your project, the request shows up here."
              : "Open a project and choose Schedule meeting to ask its team for a meeting."}
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {meetings.map((m) => {
            const myTurn =
              m.status === "pending" && m.awaiting === profile.role;
            const them = isTeam
              ? [m.investorName, m.investorOrganisation]
                  .filter(Boolean)
                  .join(", ")
              : m.teamName || m.ownerName;
            return (
              <li key={m.id} className="surface flex flex-col gap-4 p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-col gap-1">
                    <h2 className="font-semibold">
                      <Link
                        href={`/dashboard/projects/${m.projectId}`}
                        // Opening a project is recorded as a view, so it must not be loaded ahead of a real click.
                        prefetch={false}
                        className="rounded-lg outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
                      >
                        {m.projectTitle}
                      </Link>
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      With {them} ·{" "}
                      {m.mode === "online" ? "Online" : "In person at APITA"}
                    </p>
                  </div>
                  <p className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
                    {myTurn ? "Needs your answer" : statusLabel[m.status]}
                  </p>
                </div>

                {m.note && (
                  <p className="whitespace-pre-line text-sm text-muted-foreground">
                    “{m.note}”
                  </p>
                )}

                {m.status === "accepted" && m.scheduledAt && (
                  <p className="font-medium">
                    <LocalTime iso={m.scheduledAt.toISOString()} />
                    {m.meetingLink && (
                      <>
                        {" · "}
                        <a
                          href={m.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg text-accent-foreground underline outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                        >
                          Join online
                        </a>
                      </>
                    )}
                  </p>
                )}

                {m.status === "pending" &&
                  (myTurn ? (
                    <ReplyForm meeting={m} isTeam={isTeam} />
                  ) : (
                    <div className="text-sm">
                      <p className="text-muted-foreground">
                        You proposed these times. {them} will pick one or
                        suggest others.
                      </p>
                      <ul className="mt-2 flex flex-wrap gap-2">
                        {m.proposedSlots.map((slot) => (
                          <li
                            key={slot}
                            className="rounded-full border px-3 py-1"
                          >
                            <LocalTime iso={slot} />
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
              </li>
            );
          })}
        </ul>
      )}

      {updates.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">Updates</h2>
          <ul className="surface divide-y">
            {updates.map((n) => (
              <li
                key={n.id}
                className="flex flex-wrap justify-between gap-x-4 gap-y-1 px-5 py-3 text-sm"
              >
                <span>{n.body}</span>
                <span className="text-muted-foreground">
                  <LocalTime iso={n.createdAt.toISOString()} />
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
