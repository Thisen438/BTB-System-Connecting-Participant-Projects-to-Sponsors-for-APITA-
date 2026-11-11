import { redirect } from "next/navigation";
import { Suspense } from "react";
import { SiteHeader } from "@/components/site-header";
import { getUser } from "@/lib/auth";
import { LoginForm } from "./login-form";

export const metadata = { title: "Sign in | APITA Marketplace" };

type Props = PageProps<"/login">;

// The session and URL are only known per request, so this part streams in.
async function Login({ searchParams }: Pick<Props, "searchParams">) {
  if (await getUser()) redirect("/dashboard");
  const { error } = await searchParams;
  return <LoginForm linkFailed={error === "link"} />;
}

export default function LoginPage({ searchParams }: Props) {
  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <Suspense>
          <Login searchParams={searchParams} />
        </Suspense>
      </main>
    </>
  );
}
