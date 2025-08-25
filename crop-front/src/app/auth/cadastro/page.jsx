export const dynamic = "force-dynamic";
import ImagemFundo from "@/components/auth/ImagemFundo";
import RegisterForm from "@/components/auth/RegisterForm";

export default function Register(){
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <ImagemFundo />
      <RegisterForm onGoogleLogin={handleGoogleLogin}/>
    </div>
  );
}}