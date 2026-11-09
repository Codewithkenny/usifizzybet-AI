import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeReturnToPath } from "@/lib/authReturnTo";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const nextPath = safeReturnToPath(
    request.nextUrl.searchParams.get("next") ??
      request.nextUrl.searchParams.get("returnTo"),
  );

  if (!code) {
    return NextResponse.redirect(new URL("/auth/login?error=callback", request.url));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(new URL("/auth/login?error=callback", request.url));
  }

  return NextResponse.redirect(new URL(nextPath, request.url));
}
