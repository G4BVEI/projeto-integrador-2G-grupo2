// app/dashboard/page.js
import RecentActions from "@/components/dashboard/RecentActions";
import PrecipitationChart from "@/components/dashboard/PrecipitationChart";
import TemperatureChart from "@/components/dashboard/TemperatureChart";
import AlertsCard from "@/components/dashboard/AlertsCard";
import AllTalhoesMap from "@/components/dashboard/AllTalhoesMap";
import {
  getChartData,
  getRecentActions,
  getAlerts,
} from "@/lib/fetchData";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/auth/LogoutButton";

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

  // Fetch de dados no servidor para melhor SEO
  const [chartData, actionsData, alertsData] = await Promise.all([
    getChartData(),
    getRecentActions(),
    getAlerts(),
  ]);

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

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <PrecipitationChart data={chartData.precipitation} />

        <TemperatureChart
          data={chartData.temperature}
          currentTemp={chartData.weather.currentTemp}
          minTemp={chartData.weather.minTemp}
          location={chartData.weather.location}
        />

        <AlertsCard alerts={alertsData} />
      </section>

      <RecentActions actions={actionsData} />
    </div>
  );
}