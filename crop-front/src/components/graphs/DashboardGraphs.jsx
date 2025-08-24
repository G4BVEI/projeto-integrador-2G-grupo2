'use client'

import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend, BarChart, Bar } from 'recharts'
import { Thermometer, Droplets, CloudRain, Filter, CheckSquare, Square } from 'lucide-react'

const API_KEY =  process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY
const plotColors = ['#22c55e','#3b82f6','#8b5cf6','#ef4444','#f97316','#8b5cf6']

export default function WeatherDashboard({ talhoes }) {
  const [temperatureData, setTemperatureData] = useState([])
  const [humidityData, setHumidityData] = useState([])
  const [rainData, setRainData] = useState([])
  const [selectedTalhoes, setSelectedTalhoes] = useState({})
  const [showFilter, setShowFilter] = useState(false)
  const [activeTab, setActiveTab] = useState('temperature')

  // Inicializar todos os talhões como selecionados
  useEffect(() => {
    if (talhoes && talhoes.length > 0) {
      const initialSelection = {}
      talhoes.forEach(talhao => {
        initialSelection[talhao.id] = true
      })
      setSelectedTalhoes(initialSelection)
    }
  }, [talhoes])

  // Selecionar/desmarcar todos os talhões
  const toggleAllTalhoes = (selectAll) => {
    const newSelection = {}
    talhoes.forEach(talhao => {
      newSelection[talhao.id] = selectAll
    })
    setSelectedTalhoes(newSelection)
  }

  // Alternar seleção de um talhão específico
  const toggleTalhao = (talhaoId) => {
    setSelectedTalhoes(prev => ({
      ...prev,
      [talhaoId]: !prev[talhaoId]
    }))
  }

  // Obter talhões selecionados
  const getSelectedTalhoes = () => {
    return talhoes.filter(talhao => selectedTalhoes[talhao.id])
  }

  useEffect(() => {
    async function fetchWeatherData() {
      const selected = getSelectedTalhoes()
      if (!selected || !selected.length) {
        setTemperatureData([])
        setHumidityData([])
        setRainData([])
        return
      }

      const tempPoints = []
      const humidityPoints = []
      const rainPoints = []

      for (const talhao of selected) {
        const lat = talhao.localizacao_json?.coordinates?.[0]?.[0]?.[1] || talhao.latitude
        const lon = talhao.localizacao_json?.coordinates?.[0]?.[0]?.[0] || talhao.longitude
        if (!lat || !lon) continue

        try {
          const res = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&lang=pt_br&appid=${API_KEY}`
          )
          const json = await res.json()
          if (!json.list) continue

          json.list.forEach(item => {
            const time = new Date(item.dt * 1000).getHours().toString().padStart(2,'0') + 'H'
            const date = new Date(item.dt * 1000).toLocaleDateString('pt-BR')

            // Temperatura
            let tempPoint = tempPoints.find(p => p.time === time)
            if (!tempPoint) {
              tempPoint = { time }
              selected.forEach(t => { tempPoint[t.id] = null })
              tempPoints.push(tempPoint)
            }
            tempPoint[talhao.id] = Number(item.main.temp.toFixed(1))

            // Umidade
            let humidityPoint = humidityPoints.find(p => p.time === time)
            if (!humidityPoint) {
              humidityPoint = { time }
              selected.forEach(t => { humidityPoint[t.id] = null })
              humidityPoints.push(humidityPoint)
            }
            humidityPoint[talhao.id] = Number(item.main.humidity)

            // Precipitação (chuva)
            let rainPoint = rainPoints.find(p => p.date === date)
            if (!rainPoint) {
              rainPoint = { date }
              selected.forEach(t => { rainPoint[t.id] = null })
              rainPoints.push(rainPoint)
            }
            
            const rainValue = item.rain ? item.rain['3h'] || 0 : 0
            if (rainPoint[talhao.id] === null) {
              rainPoint[talhao.id] = rainValue
            } else {
              rainPoint[talhao.id] += rainValue
            }
          })
        } catch (err) {
          console.error(err)
        }
      }

      setTemperatureData(tempPoints)
      setHumidityData(humidityPoints)
      setRainData(rainPoints)
    }

    fetchWeatherData()
  }, [selectedTalhoes, talhoes])

  if (!talhoes || talhoes.length === 0) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="flex items-center mb-2 text-lg font-medium">
          <Thermometer className="h-5 w-5 mr-2 text-green-500" />
          Dashboard Meteorológico
        </h3>
        <p className="text-sm text-gray-500">Nenhum talhão disponível</p>
      </div>
    )
  }

  const selectedTalhoesList = getSelectedTalhoes()
  const allSelected = selectedTalhoesList.length === talhoes.length
  const noneSelected = selectedTalhoesList.length === 0

  const renderChart = () => {
    if (noneSelected) {
      return (
        <div className="h-64 flex items-center justify-center text-gray-400">
          Selecione talhões para visualizar dados
        </div>
      )
    }

    switch (activeTab) {
      case 'temperature':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={temperatureData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis label={{ value: '°C', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value) => [`${value}°C`, 'Temperatura']} />
              <Legend formatter={id => talhoes.find(t => t.id === id)?.nome || id} />
              {selectedTalhoesList.map((t, idx) => (
                <Line 
                  key={t.id} 
                  dataKey={t.id.toString()} 
                  stroke={plotColors[idx % plotColors.length]} 
                  connectNulls 
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )
      
      case 'humidity':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={humidityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis label={{ value: '%', angle: -90, position: 'insideLeft' }} domain={[0, 100]} />
              <Tooltip formatter={(value) => [`${value}%`, 'Umidade']} />
              <Legend formatter={id => talhoes.find(t => t.id === id)?.nome || id} />
              {selectedTalhoesList.map((t, idx) => (
                <Line 
                  key={t.id} 
                  dataKey={t.id.toString()} 
                  stroke={plotColors[idx % plotColors.length]} 
                  connectNulls 
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )
      
      case 'rain':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rainData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis label={{ value: 'mm', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value) => [`${value}mm`, 'Precipitação']} />
              <Legend formatter={id => talhoes.find(t => t.id === id)?.nome || id} />
              {selectedTalhoesList.map((t, idx) => (
                <Bar 
                  key={t.id} 
                  dataKey={t.id.toString()} 
                  fill={plotColors[idx % plotColors.length]} 
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )
    }
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-3">
        <h3 className="flex items-center text-lg font-medium">
          {activeTab === 'temperature' && <Thermometer className="h-5 w-5 mr-2 text-green-500" />}
          {activeTab === 'humidity' && <Droplets className="h-5 w-5 mr-2 text-blue-500" />}
          {activeTab === 'rain' && <CloudRain className="h-5 w-5 mr-2 text-purple-500" />}
          {activeTab === 'temperature' && 'Temperatura'}
          {activeTab === 'humidity' && 'Umidade'}
          {activeTab === 'rain' && 'Previsão de Chuva'}
        </h3>
        <button
          onClick={() => setShowFilter(!showFilter)}
          className="flex items-center text-sm text-gray-600 hover:text-gray-800"
        >
          <Filter className="h-4 w-4 mr-1" />
          Filtros
        </button>
      </div>

      {showFilter && (
        <div className="mb-3 p-3 bg-gray-50 rounded-lg">
          <div className="flex justify-between mb-2">
            <button
              onClick={() => toggleAllTalhoes(true)}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
            >
              <CheckSquare className="h-4 w-4 mr-1" />
              Marcar todos
            </button>
            <button
              onClick={() => toggleAllTalhoes(false)}
              className="text-sm text-red-600 hover:text-red-800 flex items-center"
            >
              <Square className="h-4 w-4 mr-1" />
              Desmarcar todos
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {talhoes.map(talhao => (
              <label key={talhao.id} className="flex items-center text-sm">
                <input
                  type="checkbox"
                  checked={!!selectedTalhoes[talhao.id]}
                  onChange={() => toggleTalhao(talhao.id)}
                  className="mr-2 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                {talhao.nome}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Tabs de navegação */}
      <div className="flex mb-3 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('temperature')}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'temperature'
              ? 'text-green-600 border-b-2 border-green-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Temperatura
        </button>
        <button
          onClick={() => setActiveTab('humidity')}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'humidity'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Umidade
        </button>
        <button
          onClick={() => setActiveTab('rain')}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'rain'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Chuva
        </button>
      </div>

      <p className="text-sm text-gray-500 mb-3">
        {noneSelected 
          ? "Selecione pelo menos um talhão" 
          : `Mostrando ${selectedTalhoesList.length} de ${talhoes.length} talhões`
        }
      </p>

      <div className="h-64">
        {renderChart()}
      </div>
    </div>
  )
}