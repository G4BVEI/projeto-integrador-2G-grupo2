export const dynamic = "force-dynamic";
import AllLavourasMap from "@/components/maps/AllLavourasMap";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/auth/LogoutButton";
import DashboardGraphs from "@/components/graphs/DashboardGraphs";

export default async function DashboardPage() {
  const supabase = await createClient(); // make sure this is async
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect("/auth/login");
  }
  
  const { data: lavouras } = await supabase
    .from("lavouras")
    .select("*")
    .eq("user_id", session.user.id)
    .order("criado_em", { ascending: false });

return (
  <div className="p-4 space-y-6">
    <div className="flex justify-between items-center flex-col sm:flex-row gap-2 sm:gap-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
        <p className="text-gray-600 text-sm sm:text-base break-words max-w-[250px] sm:max-w-none">
          Bem-vindo, <span className="font-medium">{session.user.email}</span>!
        </p>
      </div>
    </div>

    <AllLavourasMap lavouras={lavouras || []} />
    <DashboardGraphs lavouras={lavouras || []} />
  </div>
);

}
