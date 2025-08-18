// app/auth/callback/route.js
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  
  if (code) {
    const cookieStore = cookies(); // Get cookies
    const supabase = createClient(cookieStore); // Pass cookies to client
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(new URL("/logged/dashboard", request.url));
}