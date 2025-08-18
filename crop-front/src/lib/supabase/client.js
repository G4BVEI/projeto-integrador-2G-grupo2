import { createBrowserClient } from "@supabase/ssr";
import { hasEnvVars } from "@/lib/util";
export const createClient = () => {
  if (!hasEnvVars()) {
    throw new Error("Variáveis de ambiente do Supabase não configuradas!");
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}