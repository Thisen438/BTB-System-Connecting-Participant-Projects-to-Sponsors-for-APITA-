"use client";

import { motion } from "motion/react";
import { usePathname } from "next/navigation";

// First-run pointer under the "Team" link in the header. Shown until the team has a member.
export function TeamHint() {
  // No need to point at the page the user is already on.
  if (usePathname().startsWith("/dashboard/team")) return null;

  return (
    <motion.span
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: [0, 4, 0] }}
      transition={{
        opacity: { duration: 0.3, delay: 0.6 },
        y: { duration: 1.8, delay: 0.6, repeat: Infinity, ease: "easeInOut" },
      }}
      className="pointer-events-none absolute top-full left-1/2 z-50 mt-2.5 w-max -translate-x-1/2 rounded-xl bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-lg shadow-primary/30"
    >
      <span
        aria-hidden
        className="absolute -top-1 left-1/2 size-2 -translate-x-1/2 rotate-45 bg-primary"
      />
      Set up your team profile here
    </motion.span>
  );
}
