import MapWrapper from '@/components/MapWrapper'
import RecentActions from '@/components/RecentActions'
import PrecipitationChart from '@/components/PrecipitationChart'
import TemperatureChart from '@/components/TemperatureChart'
import AlertsCard from '@/components/AlertsCard'
import { getMapData, getChartData, getRecentActions, getAlerts } from '@/lib/fetchData'

export default async function HomePage() {
  // Fetch de dados no servidor para melhor SEO
  const [mapData, chartData, actionsData, alertsData] = await Promise.all([
    getMapData(),
    getChartData(),
    getRecentActions(),
    getAlerts()
  ])

  return (
    <>
      <section className="flex gap-4 p-4 flex-1">
        <MapWrapper markers={mapData} />
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
  )
}

