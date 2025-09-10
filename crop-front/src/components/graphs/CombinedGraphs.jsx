'use client'

import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts'
import { Thermometer, Droplets, CloudRain, Wind, Gauge, Eye, Calendar, Zap, Sun, Square, Cpu, Plus, Settings, MapPin, TestTube} from 'lucide-react'
import Link from 'next/link'

const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY

export default function CombinedGraphs({ lavoura, sensores }) {
  const [activeMainTab, setActiveMainTab] = useState('sensores')
  const [activeSensorTab, setActiveSensorTab] = useState('Temperatura')
  const [activeWeatherTab, setActiveWeatherTab] = useState('current')
  const [weatherData, setWeatherData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch weather data
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

    if (activeMainTab === 'previsao') {
      fetchWeatherData()
    }
  }, [lavoura, activeMainTab])

  // Tipos de sensor e agrupamento
  const tiposSensorPresentes = [...new Set(sensores.map(s => s.tipo || 'pH'))]
  const sensoresPorTipo = sensores.reduce((acc, sensor) => {
    const tipo = sensor.tipo || 'pH'
    if (!acc[tipo]) acc[tipo] = []
    acc[tipo].push(sensor)
    return acc
  }, {})

  // Cores e ícones
  const tipoColors = {
    "Temperatura": "#ef4444", "Umidade": "#3b82f6", "Pluviometro": "#1d4ed8",
    "Pressao": "#eab308", "Luminosidade": "#f97316", "pH": "#a855f7"
  }

  const tipoIcons = {
    "Temperatura": <Thermometer className="h-4 w-4" />,
    "Umidade": <Droplets className="h-4 w-4" />,
    "Pluviometro": <CloudRain className="h-4 w-4" />,
    "Pressao": <Zap className="h-4 w-4" />,
    "Luminosidade": <Sun className="h-4 w-4" />,
    "pH": <TestTube className="h-4 w-4" />
  }

  const tipoBgMap = {
    "Temperatura": "bg-gradient-to-br from-red-50 to-red-100 border-l-4 border-red-400",
    "Umidade": "bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-blue-400",
    "Pluviometro": "bg-gradient-to-br from-blue-100 to-blue-200 border-l-4 border-blue-600",
    "Pressao": "bg-gradient-to-br from-yellow-50 to-yellow-100 border-l-4 border-yellow-400",
    "Luminosidade": "bg-gradient-to-br from-orange-50 to-orange-100 border-l-4 border-orange-400",
    "pH": "bg-gradient-to-br from-purple-50 to-purple-100 border-l-4 border-purple-400"
  }

  const tipoValueColorMap = {
    "Temperatura": "text-red-600", "Umidade": "text-blue-600", "Pluviometro": "text-blue-700",
    "Pressao": "text-yellow-600", "Luminosidade": "text-orange-600", "pH": "text-purple-600"
  }

  const formatDate = (dateString) => {
    if (!dateString) return "Nunca"
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
    })
  }

  // Processar dados meteorológicos
  const processWeatherData = () => {
    if (!weatherData) return { hourlyData: [], dailyData: [] }

    const hourlyData = weatherData.list.slice(0, 8).map(item => ({
      time: new Date(item.dt * 1000).getHours().toString().padStart(2, '0') + 'H',
      temperature: Math.round(item.main.temp),
      humidity: item.main.humidity,
      rain: item.rain ? item.rain['3h'] || 0 : 0,
      wind: Math.round(item.wind.speed * 3.6),
      pressure: item.main.pressure
    }))

    const dailyData = {}
    weatherData.list.forEach(item => {
      const date = new Date(item.dt * 1000).toLocaleDateString('pt-BR')
      if (!dailyData[date]) {
        dailyData[date] = { date, minTemp: item.main.temp_min, maxTemp: item.main.temp_max, rain: 0, humidity: item.main.humidity }
      } else {
        dailyData[date].minTemp = Math.min(dailyData[date].minTemp, item.main.temp_min)
        dailyData[date].maxTemp = Math.max(dailyData[date].maxTemp, item.main.temp_max)
        dailyData[date].humidity = Math.round((dailyData[date].humidity + item.main.humidity) / 2)
      }
      if (item.rain) dailyData[date].rain += item.rain['3h'] || 0
    })

    return { hourlyData, dailyData: Object.values(dailyData) }
  }

  const { hourlyData, dailyData } = processWeatherData()
  const currentWeather = weatherData?.list?.[0]

  // Renderizar gráficos dos sensores
  const renderSensorGraphs = () => {
    const sensoresDoTipo = sensoresPorTipo[activeSensorTab] || []
    if (sensoresDoTipo.length === 0) {
      return <div className="text-center text-gray-500 py-8">Nenhum sensor do tipo {activeSensorTab} disponível</div>
    }

    const data = sensoresDoTipo.map(sensor => ({
      nome: sensor.nome,
      valor: sensor.ultima_leitura?.valor || 0,
      unidade: sensor.unidade || ''
    }))

    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="nome" angle={-45} textAnchor="end" height={80} />
          <YAxis label={{ value: data[0]?.unidade || 'Valor', angle: -90, position: 'insideLeft' }} />
          <Tooltip formatter={(value) => [`${value} ${data[0]?.unidade || ''}`, 'Valor']} labelFormatter={(value) => `Sensor: ${value}`} />
          <Legend />
          <Bar dataKey="valor" fill={tipoColors[activeSensorTab] || tipoColors["pH"]} name="Valor" />
        </BarChart>
      </ResponsiveContainer>
    )
  }

  // Renderizar gráficos meteorológicos
  const renderWeatherCharts = () => {
    switch (activeWeatherTab) {
      case 'temperature':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis label={{ value: '°C', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="temperature" stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} name="Temperatura" />
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
              <Line type="monotone" dataKey="humidity" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} name="Umidade" />
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
              <Bar dataKey="rain" fill="#8b5cf6" name="Precipitação" />
            </BarChart>
          </ResponsiveContainer>
        )
      case 'forecast':
        return (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50">
                <th className="px-4 py-2 text-left">Data</th><th className="px-4 py-2 text-left">Mín/Máx</th>
                <th className="px-4 py-2 text-left">Chuva</th><th className="px-4 py-2 text-left">Umidade</th>
              </tr></thead>
              <tbody>
                {dailyData.map((day, index) => (
                  <tr key={index} className="border-b">
                    <td className="px-4 py-2">{day.date}</td>
                    <td className="px-4 py-2">{Math.round(day.minTemp)}° / {Math.round(day.maxTemp)}°</td>
                    <td className="px-4 py-2">{day.rain.toFixed(1)}mm</td>
                    <td className="px-4 py-2">{day.humidity}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      default:
        return null
    }
  }

  const renderCurrentWeather = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {currentWeather && [
        { icon: <Thermometer className="h-8 w-8 text-blue-600 mx-auto mb-2" />, value: `${Math.round(currentWeather.main.temp)}°C`, label: 'Temperatura', bg: 'bg-blue-50', text: 'text-blue-600' },
        { icon: <Droplets className="h-8 w-8 text-green-600 mx-auto mb-2" />, value: `${currentWeather.main.humidity}%`, label: 'Umidade', bg: 'bg-green-50', text: 'text-green-600' },
        { icon: <CloudRain className="h-8 w-8 text-purple-600 mx-auto mb-2" />, value: currentWeather.rain ? `${currentWeather.rain['3h'] || 0}mm` : '0mm', label: 'Precipitação', bg: 'bg-purple-50', text: 'text-purple-600' },
        { icon: <Wind className="h-8 w-8 text-orange-600 mx-auto mb-2" />, value: `${Math.round(currentWeather.wind.speed * 3.6)}km/h`, label: 'Vento', bg: 'bg-orange-50', text: 'text-orange-600' }
      ].map((item, index) => (
        <div key={index} className={`${item.bg} p-4 rounded-lg text-center`}>
          {item.icon}
          <div className="text-2xl font-bold">{item.value}</div>
          <div className={`text-sm ${item.text}`}>{item.label}</div>
        </div>
      ))}
    </div>
  )

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Seletor Principal */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveMainTab('sensores')}
          className={`flex-1 px-6 py-4 text-sm font-medium text-center ${
            activeMainTab === 'sensores'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-gray-50'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Cpu className="h-5 w-5 inline mr-2 mb-1" />
          Sensores ({sensores.length})
        </button>
        <button
          onClick={() => setActiveMainTab('previsao')}
          className={`flex-1 px-6 py-4 text-sm font-medium text-center ${
            activeMainTab === 'previsao'
              ? 'text-green-600 border-b-2 border-green-600 bg-gray-50'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Eye className="h-5 w-5 inline mr-2 mb-1" />
          Previsão do Tempo
        </button>
      </div>

      {/* Conteúdo */}
      <div className="bg-gray-50 p-6">
        {activeMainTab === 'sensores' ? (
          <div className="grid grid-cols-2 gap-6">
            {/* ===== Gráficos dos Sensores ===== */}
            {tiposSensorPresentes.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow-sm col-span-2">
                <div className="flex mb-4 border-b border-gray-200 overflow-x-auto">
                  {tiposSensorPresentes.map(tipo => (
                    <button
                      key={tipo}
                      onClick={() => setActiveSensorTab(tipo)}
                      className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
                        activeSensorTab === tipo
                          ? 'border-b-2'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                      style={{
                        color: activeSensorTab === tipo ? tipoColors[tipo] || '#3b82f6' : undefined,
                        borderBottomColor: activeSensorTab === tipo ? tipoColors[tipo] || '#3b82f6' : undefined
                      }}
                    >
                      {tipoIcons[tipo] || tipoIcons["pH"]}
                      <span className="ml-2">{tipo}</span>
                    </button>
                  ))}
                </div>
                <div className="h-80">{renderSensorGraphs()}</div>
              </div>
            )}

            {/* ===== Cards dos Sensores ===== */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 col-span-2">
              {sensores.map(sensor => (
                <div
                  key={sensor.id}
                  className={`p-4 rounded-xl shadow-md ${tipoBgMap[sensor.tipo] || 'bg-gray-100'}`}
                >
                  {/* Header do Card */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-800">{tipoIcons[sensor.tipo] || tipoIcons["pH"]}</span>
                      <span className="font-semibold text-gray-800 truncate">{sensor.nome}</span>
                    </div>
                    {sensor.localizacao_json && (
                      <MapPin className="w-4 h-4 text-gray-400" title="Com localização" />
                    )}
                  </div>

                  {/* Tipo do Sensor */}
                  <div className="mb-3">
                    <span className="text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded-full">
                      {sensor.tipo}
                    </span>
                  </div>

                  {/* Última Leitura */}
                  <div className="flex items-center gap-2 mb-2">
                    <Gauge className="w-4 h-4 text-gray-400" />
                    <span className={`text-xl font-bold ${tipoValueColorMap[sensor.tipo]}`}>
                      {sensor.ultima_leitura?.valor ?? "-"} 
                      <span className="text-sm ml-1">{sensor.unidade ?? ""}</span>
                    </span>
                  </div>

                  {/* Data da Última Leitura */}
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(sensor.ultima_leitura?.registrado_em)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* ===== Botões de Ação ===== */}
            <div className="flex gap-3 col-span-2">
              <Link href={`/protegido/monitoramento/${lavoura.id}/sensores`}>
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Gerenciar Sensores
                </button>
              </Link>
              <Link href={`/protegido/monitoramento/${lavoura.id}/sensores/adicionar`}>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Adicionar Sensor
                </button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-sm">
            {weatherData && (
              <>
                {renderCurrentWeather()}
                <div className="flex mb-4 border-b border-gray-200 overflow-x-auto">
                  {['current', 'temperature', 'humidity', 'rain', 'forecast'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveWeatherTab(tab)}
                      className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
                        activeWeatherTab === tab ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {tab === 'current' && <Gauge className="h-4 w-4 inline mr-1" />}
                      {tab === 'temperature' && <Thermometer className="h-4 w-4 inline mr-1" />}
                      {tab === 'humidity' && <Droplets className="h-4 w-4 inline mr-1" />}
                      {tab === 'rain' && <CloudRain className="h-4 w-4 inline mr-1" />}
                      {tab === 'forecast' && <Eye className="h-4 w-4 inline mr-1" />}
                      {tab === 'current' ? 'Atual' : tab === 'temperature' ? 'Temperatura' : 
                        tab === 'humidity' ? 'Umidade' : tab === 'rain' ? 'Chuva' : 'Previsão'}
                    </button>
                  ))}
                </div>
                <div className="h-80">
                  {activeWeatherTab === 'current' ? (
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
                    renderWeatherCharts()
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}