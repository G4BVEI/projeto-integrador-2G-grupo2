"use client";
import ImagemFundo from "@/components/auth/ImagemFundo";
import LoginForm from "@/components/auth/LoginForm";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error("Erro no login com Google:", error);
    }
  };
  return (
    <div className="relative w-screen h-screen ">
      <ImagemFundo />
      <LoginForm onGoogleLogin={handleGoogleLogin}/>
    </div>
  );
};
