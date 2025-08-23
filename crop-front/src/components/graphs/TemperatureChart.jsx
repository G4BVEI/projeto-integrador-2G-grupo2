'use client'

import { useEffect, useRef } from 'react'
import { Chart } from 'chart.js/auto'

export default function TemperatureChart({ data, currentTemp, minTemp, location }) {
  const chartRef = useRef(null)
  const chartInstance = useRef(null)

  useEffect(() => {
    if (chartRef.current) {
      if (chartInstance.current) chartInstance.current.destroy()
      
      chartInstance.current = new Chart(chartRef.current, {
        type: 'line',
        data: {
          labels: data.labels,
          datasets: [{
            label: '°C',
            data: data.values,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.2)',
            fill: true,
            tension: 0.3,
            pointRadius: 3,
          }],
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: false } },
        },
      })
    }

    return () => {
      if (chartInstance.current) chartInstance.current.destroy()
    }
  }, [data])

  return (
    <section className="bg-white rounded-lg shadow-sm p-4">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Clima</h3>
      <p className="text-sm text-gray-600 mb-2">{location}</p>
      <p className="text-sm text-gray-700 mb-1">
        Temperatura atual: <strong>{currentTemp}°C</strong>
      </p>
      <p className="text-sm text-gray-700 mb-3">
        Temperatura mínima: <strong>{minTemp}°C</strong>
      </p>
      <canvas ref={chartRef} className="w-full h-24" />
      <p className="text-sm text-gray-500 mt-2">Previsão para 5 dias...</p>
    </section>
  )
}

