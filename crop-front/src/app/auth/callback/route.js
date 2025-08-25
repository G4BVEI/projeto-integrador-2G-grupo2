// app/auth/callback/route.js
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");
    
    console.log('📞 Callback received with code:', code);

    if (!code) {
      console.log('❌ No code provided');
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    // Cookies devem ser await
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error('❌ Auth error:', error);
      return NextResponse.redirect(
        new URL(`/auth/login?error=auth_failed`, request.url)
      );
    }

    console.log('✅ Auth successful, redirecting to dashboard');
    
    // URL correta - use request.url como base
    const perfilUrl = new URL("/logged/perfil", request.url);
    return NextResponse.redirect(perfilUrl);

  } catch (error) {
    console.error('❌ Callback error:', error);
    
    // URL correta para erro também
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("error", "server_error");
    
    return NextResponse.redirect(loginUrl);
  }
}