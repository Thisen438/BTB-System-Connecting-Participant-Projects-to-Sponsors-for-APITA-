"use client";

import { Rocket, TrendingUp } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { completeOnboarding } from "./actions";

const roles = [
  {
    value: "investor",
    title: "Investor",
    text: "I am looking for projects.",
    icon: TrendingUp,
  },
  {
    value: "participant",
    title: "Participant",
    text: "I am presenting a project.",
    icon: Rocket,
  },
] as const;

// A styled label around a visually hidden native input, so keyboard and screen readers work.
const choice =
  "cursor-pointer border transition-colors hover:bg-accent has-focus-visible:ring-3 has-focus-visible:ring-ring/50";

export function OnboardingForm({
  tags,
  defaultName,
}: {
  tags: { id: number; name: string }[];
  defaultName: string;
}) {
  const [error, action, pending] = useActionState(completeOnboarding, null);
  const [role, setRole] = useState<string>("investor");

  return (
    <motion.form
      action={action}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="surface flex w-full max-w-lg flex-col gap-7 p-6 sm:p-8"
    >
      <div className="flex flex-col gap-1.5 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome to APITA
        </h1>
        <p className="text-sm text-muted-foreground">
          One quick step and you are in.
        </p>
      </div>

      <fieldset className="grid grid-cols-2 gap-3">
        <legend className="mb-2 text-sm font-medium">I am joining as</legend>
        {roles.map((r) => (
          <label
            key={r.value}
            className={`${choice} flex flex-col gap-2 rounded-xl p-4 has-checked:border-primary has-checked:bg-accent has-checked:ring-1 has-checked:ring-primary`}
          >
            <input
              type="radio"
              name="role"
              value={r.value}
              checked={role === r.value}
              onChange={() => setRole(r.value)}
              className="sr-only"
            />
            <r.icon aria-hidden className="size-5 text-primary" />
            <span className="font-medium">{r.title}</span>
            <span className="text-sm text-muted-foreground">{r.text}</span>
          </label>
        ))}
      </fieldset>

      <div className="flex flex-col gap-2">
        <Label htmlFor="displayName">Your name</Label>
        <Input
          id="displayName"
          name="displayName"
          required
          minLength={2}
          maxLength={80}
          autoComplete="name"
          defaultValue={defaultName}
          className="h-11 rounded-xl px-3.5"
        />
      </div>

      <AnimatePresence initial={false}>
        {role === "investor" && (
          <motion.fieldset
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <legend className="mb-2 text-sm font-medium">
              What are you interested in? Pick at least one.
            </legend>
            <div className="flex flex-wrap gap-2 p-1">
              {tags.map((t) => (
                <label
                  key={t.id}
                  className={`${choice} rounded-full px-3.5 py-1.5 text-sm has-checked:border-primary has-checked:bg-primary has-checked:text-primary-foreground`}
                >
                  <input
                    type="checkbox"
                    name="tagIds"
                    value={t.id}
                    className="sr-only"
                  />
                  {t.name}
                </label>
              ))}
            </div>
          </motion.fieldset>
        )}
      </AnimatePresence>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <Button type="submit" size="xl" disabled={pending}>
        {pending ? "Saving…" : "Continue"}
      </Button>
    </motion.form>
  );
}
