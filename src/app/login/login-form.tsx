"use client";

import { MailCheck } from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

const googleEnabled = process.env.NEXT_PUBLIC_GOOGLE_LOGIN === "1";
// Local testing only: sign in to test accounts with a password, so no email is sent (Supabase limits sign-in emails per hour).
// Create the accounts in Supabase: Authentication -> Users -> Add user, with "Auto Confirm User" ticked.
const devPasswordLogin = process.env.NODE_ENV === "development";

export function LoginForm({ linkFailed }: { linkFailed: boolean }) {
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState(
    linkFailed ? "That sign-in link did not work. Request a new one." : "",
  );
  const router = useRouter();
  const redirectTo = () => `${window.location.origin}/auth/callback`;

  async function sendLink(formData: FormData) {
    setState("sending");
    setError("");
    const email = String(formData.get("email"));
    const password = String(formData.get("password") ?? "");
    if (devPasswordLogin && password) {
      const { error } = await createClient().auth.signInWithPassword({
        email,
        password,
      });
      if (!error) return router.push("/dashboard");
      setError(error.message);
      return setState("idle");
    }
    const { error } = await createClient().auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo() },
    });
    if (error) setError(error.message);
    setState(error ? "idle" : "sent");
  }

  async function google() {
    const { error } = await createClient().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: redirectTo() },
    });
    if (error) setError(error.message);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="surface flex w-full max-w-sm flex-col gap-6 p-6 sm:p-8"
    >
      <div className="flex flex-col gap-1.5 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Welcome</h1>
        <p className="text-sm text-muted-foreground">
          Sign in or create an account with just your email. No password needed.
        </p>
      </div>

      {state === "sent" ? (
        <div
          role="status"
          className="flex flex-col items-center gap-3 rounded-xl bg-accent p-5 text-center text-sm text-accent-foreground"
        >
          <MailCheck aria-hidden className="size-6" />
          Check your email for a sign-in link.
        </div>
      ) : (
        <form action={sendLink} className="flex flex-col gap-3">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            className="h-11 rounded-xl px-3.5"
          />
          {devPasswordLogin && (
            <>
              <Label htmlFor="password">Test account password (dev only)</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="Leave empty to get an email link"
                className="h-11 rounded-xl px-3.5"
              />
            </>
          )}
          <Button type="submit" size="xl" disabled={state === "sending"}>
            {state === "sending" ? "Sending…" : "Email me a sign-in link"}
          </Button>
        </form>
      )}

      {googleEnabled && state !== "sent" && (
        <Button variant="outline" size="xl" onClick={google}>
          Continue with Google
        </Button>
      )}

      {error && (
        <p role="alert" className="text-center text-sm text-destructive">
          {error}
        </p>
      )}
    </motion.div>
  );
}
