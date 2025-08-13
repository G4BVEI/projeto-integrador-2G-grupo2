import RecentActions from "@/components/dashboard/RecentActions";
import PrecipitationChart from "@/components/dashboard/PrecipitationChart";
import TemperatureChart from "@/components/dashboard/TemperatureChart";
import AlertsCard from "@/components/dashboard/AlertsCard";
import MapSquare from "@/components/dashboard/MapSquare";
import {
  getMapData,
  getChartData,
  getRecentActions,
  getAlerts,
} from "@/lib/fetchData";
import { mapMarkers, mapCenter, mapZoom } from "@/data/map";

export default async function HomePage() {
  // Fetch de dados no servidor para melhor SEO
  const [mapData, chartData, actionsData, alertsData] = await Promise.all([
    getMapData(),
    getChartData(),
    getRecentActions(),
    getAlerts(),
  ]);

  return (
    <>
      <section className="flex gap-4 p-4 flex-1">
        <MapSquare markers={mapMarkers} center={mapCenter} zoom={mapZoom} />
        <RecentActions actions={actionsData} />
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
        <PrecipitationChart data={chartData.precipitation} />

        <TemperatureChart
          data={chartData.temperature}
          currentTemp={chartData.weather.currentTemp}
          minTemp={chartData.weather.minTemp}
          location={chartData.weather.location}
        />

        <AlertsCard alerts={alertsData} />
      </section>
    </>
  );
}
