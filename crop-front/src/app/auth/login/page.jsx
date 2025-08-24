'use client';
import ImagemFundo from "@/components/auth/ImagemFundo";
import LoginForm from "@/components/auth/LoginForm";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const supabase = createClient();

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error("Erro no login com Google:", error);
    }
  };

  return (
    <div className="relative w-screen h-screen">
      <ImagemFundo />
      <LoginForm onGoogleLogin={handleGoogleLogin}/>
    </div>
  );
};