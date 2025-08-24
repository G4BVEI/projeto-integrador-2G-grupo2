// app/dashboard/page.js
import RecentActions from "@/components/dashboard/RecentActions";
import PrecipitationChart from "@/components/graphs/PrecipitationChart";
import TemperatureChart from "@/components/graphs/TemperatureChart";
import AlertsCard from "@/components/dashboard/AlertsCard";
import AllTalhoesMap from "@/components/maps/AllTalhoesMap";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/auth/LogoutButton";
import DashboardGraphs from "@/components/graphs/DashboardGraphs";

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect("/auth/login");
  }
  
  // Buscar os talhões do usuário na tabela CORRETA (talhoes)
  const { data: talhoes } = await supabase
    .from('talhoes') // ← CORRIGIDO: usar 'talhoes'
    .select('*')
    .eq('user_id', session.user.id)
    .order('criado_em', { ascending: false }); // ← CORRIGIDO: usar 'criado_em'


  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-4">
          <p className="text-gray-600">Bem-vindo, {session.user.email}!</p>
          <LogoutButton />
        </div>
      </div>

      {/* Mapa com todos os talhões */}
      <AllTalhoesMap talhoes={talhoes || []} />

      <DashboardGraphs talhoes={talhoes || []} />
    </div>
  );
}