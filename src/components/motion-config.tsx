"use client";

import { MotionConfig } from "motion/react";

// Turns off movement for people who ask their device for reduced motion.
export function AppMotionConfig({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
