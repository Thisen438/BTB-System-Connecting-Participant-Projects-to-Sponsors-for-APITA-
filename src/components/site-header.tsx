import Link from "next/link";

// Shared top bar. Pages pass their own actions (sign in, sign out, ...) as children.
export function SiteHeader({ children }: { children?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-lg font-semibold tracking-tight outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <span
            aria-hidden
            className="flex size-8 items-center justify-center rounded-lg bg-linear-to-br from-primary to-brand-violet text-sm font-bold text-primary-foreground shadow-sm shadow-primary/30"
          >
            A
          </span>
          <span>
            APITA{" "}
            {/* Hidden on phones to leave room for the signed-in navigation. */}
            <span className="hidden text-muted-foreground sm:inline">
              Marketplace
            </span>
          </span>
        </Link>
        <nav className="flex items-center gap-2">{children}</nav>
      </div>
    </header>
  );
}
