// Simulação de fetch de dados - em produção seria uma API real
import { mapMarkers } from '@/data/map'
import { precipitationData, temperatureData, weatherInfo } from '@/data/chartData'
import { recentActions } from '@/data/actionsData'
import { alerts } from '@/data/alertsData'

export async function getMapData() {
  // Simula delay de API
  await new Promise(resolve => setTimeout(resolve, 100))
  return mapMarkers
}

export async function getChartData() {
  await new Promise(resolve => setTimeout(resolve, 100))
  return {
    precipitation: precipitationData,
    temperature: temperatureData,
    weather: weatherInfo
  }
}

export async function getRecentActions() {
  await new Promise(resolve => setTimeout(resolve, 100))
  return recentActions
}

export async function getAlerts() {
  await new Promise(resolve => setTimeout(resolve, 100))
  return alerts
}

