'use client'

import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend, BarChart, Bar } from 'recharts'
import { Thermometer, Droplets, CloudRain, Wind, Gauge, Eye, Calendar } from 'lucide-react'

const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY

export default function DedicatedGraph({ lavoura }) {
  const [weatherData, setWeatherData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('current')

  useEffect(() => {
    async function fetchWeatherData() {
      if (!lavoura) return

      setLoading(true)
      try {
        const lat = lavoura.localizacao_json?.coordinates?.[0]?.[0]?.[1] || lavoura.latitude
        const lon = lavoura.localizacao_json?.coordinates?.[0]?.[0]?.[0] || lavoura.longitude
        
        if (!lat || !lon) {
          throw new Error('Coordenadas da lavoura não disponíveis')
        }

        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&lang=pt_br&appid=${API_KEY}`
        )
        
        if (!response.ok) {
          throw new Error('Erro ao buscar dados meteorológicos')
        }

        const data = await response.json()
        setWeatherData(data)
      } catch (err) {
        console.error('Erro ao buscar dados:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchWeatherData()
  }, [lavoura])

  if (!lavoura) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="text-center text-gray-500">
          Nenhuma lavoura selecionado
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="text-center text-red-500">
          <p>Erro: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    )
  }

  if (!weatherData) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="text-center text-gray-500">
          Dados meteorológicos não disponíveis
        </div>
      </div>
    )
  }

  // Processar dados para os gráficos
  const processChartData = () => {
    const hourlyData = weatherData.list.slice(0, 8).map(item => ({
      time: new Date(item.dt * 1000).getHours().toString().padStart(2, '0') + 'H',
      temperature: Math.round(item.main.temp),
      humidity: item.main.humidity,
      rain: item.rain ? item.rain['3h'] || 0 : 0,
      wind: Math.round(item.wind.speed * 3.6), // Convert m/s to km/h
      pressure: item.main.pressure
    }))

    const dailyData = {}
    weatherData.list.forEach(item => {
      const date = new Date(item.dt * 1000).toLocaleDateString('pt-BR')
      if (!dailyData[date]) {
        dailyData[date] = {
          date,
          minTemp: item.main.temp_min,
          maxTemp: item.main.temp_max,
          rain: 0,
          humidity: item.main.humidity
        }
      } else {
        dailyData[date].minTemp = Math.min(dailyData[date].minTemp, item.main.temp_min)
        dailyData[date].maxTemp = Math.max(dailyData[date].maxTemp, item.main.temp_max)
        dailyData[date].humidity = Math.round((dailyData[date].humidity + item.main.humidity) / 2)
      }

      if (item.rain) {
        dailyData[date].rain += item.rain['3h'] || 0
      }
    })

    return { hourlyData, dailyData: Object.values(dailyData) }
  }

  const { hourlyData, dailyData } = processChartData()
  const currentWeather = weatherData.list[0]

  const renderCurrentWeather = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-blue-50 p-4 rounded-lg text-center">
        <Thermometer className="h-8 w-8 text-blue-600 mx-auto mb-2" />
        <div className="text-2xl font-bold">{Math.round(currentWeather.main.temp)}°C</div>
        <div className="text-sm text-blue-600">Temperatura do Ar</div>
      </div>

      <div className="bg-green-50 p-4 rounded-lg text-center">
        <Droplets className="h-8 w-8 text-green-600 mx-auto mb-2" />
        <div className="text-2xl font-bold">{currentWeather.main.humidity}%</div>
        <div className="text-sm text-green-600">Umidade do Ar</div>
      </div>

      <div className="bg-purple-50 p-4 rounded-lg text-center">
        <CloudRain className="h-8 w-8 text-purple-600 mx-auto mb-2" />
        <div className="text-2xl font-bold">
          {currentWeather.rain ? (currentWeather.rain['3h'] || 0) + 'mm' : '0mm'}
        </div>
        <div className="text-sm text-purple-600">Precipitação</div>
      </div>

      <div className="bg-orange-50 p-4 rounded-lg text-center">
        <Wind className="h-8 w-8 text-orange-600 mx-auto mb-2" />
        <div className="text-2xl font-bold">{Math.round(currentWeather.wind.speed * 3.6)}km/h</div>
        <div className="text-sm text-orange-600">Vento</div>
      </div>
    </div>
  )

  const renderCharts = () => {
    switch (activeTab) {
      case 'temperature':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis label={{ value: '°C', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="temperature" 
                stroke="#22c55e" 
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Temperatura do Ar"
              />
            </LineChart>
          </ResponsiveContainer>
        )

      case 'humidity':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis label={{ value: '%', angle: -90, position: 'insideLeft' }} domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="humidity" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Umidade do Ar"
              />
            </LineChart>
          </ResponsiveContainer>
        )

      case 'rain':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis label={{ value: 'mm', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Bar 
                dataKey="rain" 
                fill="#8b5cf6" 
                name="Precipitação"
              />
            </BarChart>
          </ResponsiveContainer>
        )

case "forecast":
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border border-gray-200 rounded-lg shadow-sm">
        <thead>
          <tr className="bg-gray-100 text-gray-700">
            <th className="px-4 py-2 text-left font-medium">Data</th>
            <th className="px-4 py-2 text-left font-medium">Mín / Máx</th>
            <th className="px-4 py-2 text-left font-medium">Chuva</th>
            <th className="px-4 py-2 text-left font-medium">Umidade</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {dailyData.map((day, index) => (
            <tr
              key={index}
              className="hover:bg-gray-50 transition-colors"
            >
              <td className="px-4 py-2">{day.date}</td>
              <td className="px-4 py-2">
                <span className="text-blue-600">{Math.round(day.minTemp)}°</span>{" "}
                /{" "}
                <span className="text-red-600">{Math.round(day.maxTemp)}°</span>
              </td>
              <td className="px-4 py-2">{day.rain.toFixed(1)} mm</td>
              <td className="px-4 py-2">{day.humidity}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}}


  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">Condições Meteorológicas</h2>
          <p className="text-gray-500">Previsão do clima</p>
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <Calendar className="h-4 w-4 mr-1" />
          Atualizado agora
        </div>
      </div>

      {renderCurrentWeather()}

      {/* Tabs de navegação */}
      <div className="flex mb-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('current')}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'current'
              ? 'text-green-600 border-b-2 border-green-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Gauge className="h-4 w-4 inline mr-1" />
          Atual
        </button>
        <button
          onClick={() => setActiveTab('temperature')}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'temperature'
              ? 'text-green-600 border-b-2 border-green-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Thermometer className="h-4 w-4 inline mr-1" />
          Temperatura do Ar
        </button>
        <button
          onClick={() => setActiveTab('humidity')}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'humidity'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Droplets className="h-4 w-4 inline mr-1" />
          Umidade do Ar
        </button>
        <button
          onClick={() => setActiveTab('rain')}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'rain'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <CloudRain className="h-4 w-4 inline mr-1" />
          Chuva
        </button>
        <button
          onClick={() => setActiveTab('forecast')}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'forecast'
              ? 'text-orange-600 border-b-2 border-orange-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Eye className="h-4 w-4 inline mr-1" />
          Previsão
        </button>
      </div>

      {activeTab === 'current' ? (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-3">Condições Atuais</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p><strong>Temperatura do Ar:</strong> {Math.round(currentWeather.main.temp)}°C</p>
              <p><strong>Sensação Térmica:</strong> {Math.round(currentWeather.main.feels_like)}°C</p>
              <p><strong>Umidade do Ar:</strong> {currentWeather.main.humidity}%</p>
            </div>
            <div>
              <p><strong>Pressão:</strong> {currentWeather.main.pressure}hPa</p>
              <p><strong>Vento:</strong> {Math.round(currentWeather.wind.speed * 3.6)}km/h</p>
              <p><strong>Condição:</strong> {currentWeather.weather[0].description}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="h-80">
          {renderCharts()}
        </div>
      )}
    </div>
  )
}