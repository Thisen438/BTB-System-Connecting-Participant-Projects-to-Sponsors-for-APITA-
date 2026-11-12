"use client";

import { motion } from "motion/react";
import { usePathname } from "next/navigation";

// First-run pointer under a header link ("set up your team profile here"). The layout decides when to show it.
export function NavHint({
  hideOn,
  children,
}: {
  // The page the hint points at: no need to show it there.
  hideOn: string;
  children: React.ReactNode;
}) {
  if (usePathname().startsWith(hideOn)) return null;

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
      {children}
    </motion.span>
  );
}
