import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { buttonVariants } from "@/components/ui/button";

// Shared frame for the new-project and edit-project pages.
export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader>
        <Link
          href="/dashboard"
          className={buttonVariants({ variant: "ghost", size: "lg" })}
        >
          Back to dashboard
        </Link>
      </SiteHeader>
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-10 sm:px-6">
        {children}
      </main>
    </>
  );
}
