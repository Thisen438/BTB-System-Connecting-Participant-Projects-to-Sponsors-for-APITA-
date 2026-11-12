import { ArrowRight, CalendarCheck, Search, Sparkles } from "lucide-react";
import * as motion from "motion/react-client";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { buttonVariants } from "@/components/ui/button";

const fadeUp = (delay = 0) =>
  ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: "easeOut", delay },
  }) as const;

const steps = [
  {
    icon: Search,
    title: "Browse",
    text: "Every APITA project in one place, filtered by the areas you care about.",
  },
  {
    icon: Sparkles,
    title: "Match",
    text: "Recommendations that follow your interests and what you look at.",
  },
  {
    icon: CalendarCheck,
    title: "Meet",
    text: "Request a 1-to-1 meeting with the team in a couple of clicks.",
  },
];

// Illustrative cards only: real listings arrive with the project catalog.
const examples = [
  {
    title: "StockSense",
    summary: "Inventory ERP for small retailers",
    tags: ["ERP", "SaaS"],
    className: "-rotate-3",
  },
  {
    title: "MediBot",
    summary: "Symptom triage assistant for clinics",
    tags: ["Chat Bot", "HealthTech"],
    className: "translate-x-10 rotate-2",
  },
  {
    title: "AgriLens",
    summary: "Crop disease detection from phone photos",
    tags: ["AI Integration", "AgriTech"],
    className: "-rotate-1",
  },
];

export default function Home() {
  return (
    <>
      <SiteHeader>
        <Link
          href="/login"
          className={buttonVariants({ variant: "ghost", size: "lg" })}
        >
          Sign in
        </Link>
      </SiteHeader>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-20 px-4 py-14 sm:px-6 sm:py-20">
        <section className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-col items-start gap-6">
            <motion.p
              {...fadeUp()}
              className="rounded-full border border-brand-warm/50 bg-brand-warm/15 px-3 py-1 text-sm font-medium"
            >
              APITA · Investor matching
            </motion.p>
            <motion.h1
              {...fadeUp(0.05)}
              className="text-4xl font-semibold tracking-tight text-balance sm:text-6xl"
            >
              Find the project{" "}
              <span className="text-brand-gradient">worth backing.</span>
            </motion.h1>
            <motion.p
              {...fadeUp(0.1)}
              className="max-w-xl text-lg text-pretty text-muted-foreground"
            >
              APITA Marketplace connects the teams building at APITA with the
              investors looking for them. Browse by interest, then book a 1-to-1
              meeting.
            </motion.p>
            <motion.div
              {...fadeUp(0.15)}
              className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row"
            >
              <Link href="/login" className={buttonVariants({ size: "xl" })}>
                I&apos;m an investor
                <ArrowRight aria-hidden />
              </Link>
              <Link
                href="/login"
                className={buttonVariants({ variant: "outline", size: "xl" })}
              >
                I&apos;m presenting a project
              </Link>
            </motion.div>
          </div>

          <div aria-hidden className="hidden flex-col gap-4 pr-10 lg:flex">
            {examples.map((p, i) => (
              <motion.div
                key={p.title}
                {...fadeUp(0.2 + i * 0.1)}
                className={`surface flex flex-col gap-3 p-5 ${p.className}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-lg font-semibold">{p.title}</p>
                  <span className="text-xs text-muted-foreground">
                    Example listing
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{p.summary}</p>
                <div className="flex gap-2">
                  {p.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <section aria-labelledby="how" className="flex flex-col gap-6">
          <h2 id="how" className="text-2xl font-semibold tracking-tight">
            How it works
          </h2>
          <ol className="grid gap-4 sm:grid-cols-3">
            {steps.map((s, i) => (
              <motion.li
                key={s.title}
                {...fadeUp(0.3 + i * 0.08)}
                className="surface flex flex-col gap-3 p-6"
              >
                <span className="flex size-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                  <s.icon aria-hidden className="size-5" />
                </span>
                <h3 className="text-lg font-semibold">
                  {i + 1}. {s.title}
                </h3>
                <p className="text-sm text-muted-foreground">{s.text}</p>
              </motion.li>
            ))}
          </ol>
        </section>
      </main>
    </>
  );
}
