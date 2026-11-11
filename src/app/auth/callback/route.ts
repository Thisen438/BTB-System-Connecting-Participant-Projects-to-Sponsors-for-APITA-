import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Sign-in links land here.
// - Email links carry `token_hash` + `type`: works in any browser or device.
// - Google sign-in carries `code`: only works in the browser that started it.
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const tokenHash = params.get("token_hash");
  const type = params.get("type") as EmailOtpType | null;
  const code = params.get("code");
  const supabase = await createClient();

  const { error } =
    tokenHash && type
      ? await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
      : code
        ? await supabase.auth.exchangeCodeForSession(code)
        : { error: new Error("No token in sign-in link") };

  if (!error) return NextResponse.redirect(new URL("/dashboard", request.url));

  console.error("Sign-in link failed:", error.message);
  return NextResponse.redirect(new URL("/login?error=link", request.url));
}
