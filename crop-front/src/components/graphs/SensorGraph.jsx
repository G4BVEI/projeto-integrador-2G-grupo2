'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export default function SensorGraph({ sensores }) {
  // Agrupar sensores por tipo
  const sensoresPorTipo = sensores.reduce((acc, sensor) => {
    const tipo = sensor.tipo || 'Outro'
    if (!acc[tipo]) {
      acc[tipo] = []
    }
    acc[tipo].push(sensor)
    return acc
  }, {})

  // Preparar dados para o gráfico
  const chartData = Object.entries(sensoresPorTipo).map(([tipo, sensores]) => {
    const ultimasLeituras = sensores.map(sensor => ({
      nome: sensor.nome,
      valor: sensor.ultima_leitura?.valor || 0,
      unidade: sensor.unidade || ''
    }))

    return {
      tipo,
      sensores: ultimasLeituras
    }
  })

  // Cores para cada tipo de sensor
  const tipoColors = {
    "Temperatura": "#ef4444",
    "Umidade": "#3b82f6",
    "Pluviometro": "#1d4ed8",
    "Pressao": "#eab308",
    "Luminosidade": "#f97316",
    "Outro": "#6b7280"
  }

  if (sensores.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="text-center text-gray-500">
          Nenhum sensor disponível para exibir gráficos
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Leituras dos Sensores</h2>
      <div className="space-y-6">
        {chartData.map((grupo, index) => (
          <div key={index} className="border rounded-lg p-4">
            <h3 className="text-lg font-medium mb-4 text-gray-800">{grupo.tipo}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={grupo.sensores}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="nome" 
                  angle={0}
                  textAnchor="middle"
                  height={80}
                />
                <YAxis 
                  label={{ 
                    value: grupo.sensores[0]?.unidade || 'Valor', 
                    angle: -90, 
                    position: 'insideLeft' 
                  }} 
                />
                <Tooltip 
                  formatter={(value) => [`${value} ${grupo.sensores[0]?.unidade || ''}`, 'Valor']}
                  labelFormatter={(value) => `Sensor: ${value}`}
                />
                <Legend />
                <Bar 
                  dataKey="valor" 
                  fill={tipoColors[grupo.tipo] || tipoColors["Outro"]}
                  name="Valor"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ))}
      </div>
    </div>
  )
}