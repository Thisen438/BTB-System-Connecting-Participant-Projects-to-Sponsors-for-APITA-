"use client";

import { CalendarClock } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { markNotificationsRead } from "./meetings/actions";

// The "Meetings" header link with its unread badge, plus the live pop-up for new notifications.
export function NotificationBell({
  userId,
  unread,
}: {
  userId: string;
  unread: number;
}) {
  const router = useRouter();
  const onMeetings = usePathname().startsWith("/dashboard/meetings");
  const [popup, setPopup] = useState<string | null>(null);

  // Supabase pushes each new notification row for this user (the database only lets them read their own).
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (change) => {
          setPopup(String(change.new.body));
          // Reload the badge count and whatever meeting list is on screen.
          router.refresh();
        },
      )
      .subscribe();
    return () => void supabase.removeChannel(channel);
  }, [userId, router]);

  useEffect(() => {
    if (!popup) return;
    const timer = setTimeout(() => setPopup(null), 8000);
    return () => clearTimeout(timer);
  }, [popup]);

  // Seeing the Meetings page counts as reading everything.
  useEffect(() => {
    if (onMeetings && unread > 0) void markNotificationsRead();
  }, [onMeetings, unread]);

  return (
    <>
      <Link
        href="/dashboard/meetings"
        className={`${buttonVariants({ variant: "ghost", size: "lg" })} relative`}
      >
        {/* Icon only on phones so the header links fit. */}
        <CalendarClock aria-hidden className="sm:hidden" />
        <span className="max-sm:sr-only">Meetings</span>
        {unread > 0 && !onMeetings && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-semibold text-primary-foreground">
            {unread}
            <span className="sr-only"> unread</span>
          </span>
        )}
      </Link>

      {/* Always in the page so screen readers announce a pop-up when it appears. */}
      <div role="status" className="fixed right-4 bottom-4 z-50 max-w-sm">
        <AnimatePresence>
          {popup && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <Link
                href="/dashboard/meetings"
                onClick={() => setPopup(null)}
                className="surface flex items-start gap-3 p-4 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <CalendarClock
                  aria-hidden
                  className="mt-0.5 size-5 shrink-0 text-primary"
                />
                <span>
                  {popup}{" "}
                  <span className="font-medium text-accent-foreground">
                    View
                  </span>
                </span>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
