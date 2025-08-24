'use client'

import { useEffect, useRef, useState } from 'react'
import { Chart } from 'chart.js/auto'

const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY

export default function TemperatureChart() {
  const chartRef = useRef(null)
  const chartInstance = useRef(null)
  const [data, setData] = useState({ labels: [], values: [], tooltips: [] })

  useEffect(() => {
    async function fetchWeather(lat, lon) {
      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&lang=pt_br&appid=${API_KEY}`
        )
        const weatherData = await response.json()

        const groupedLabels = []
        const groupedValues = []
        const groupedTooltips = []

        // Agrupar previsões em intervalos de 6h
        for (let i = 0; i < weatherData.list.length; i += 2) {
          const chunk = weatherData.list.slice(i, i + 2)

          const startDate = new Date(chunk[0].dt * 1000)

          let hours = startDate.getHours()
          const ampm = hours >= 12 ? 'PM' : 'AM'
          const weekday = startDate.toLocaleDateString('pt-BR', { weekday: 'short' })

          // Label curto no eixo X → "06H"
          const shortLabel = `${hours.toString().padStart(2, '0')}H`

          // Tooltip detalhado → "qua, 06H (AM)"
          const detailedLabel = `${weekday}, ${hours.toString().padStart(2, '0')}H (${ampm})`

          // Média da temperatura nesses 6h
          const avgTemp =
            chunk.reduce((acc, item) => acc + (item.main.temp || 0), 0) / chunk.length

          groupedLabels.push(shortLabel)
          groupedTooltips.push(detailedLabel)
          groupedValues.push(avgTemp.toFixed(1))
        }

        setData({ labels: groupedLabels, values: groupedValues, tooltips: groupedTooltips })
      } catch (error) {
        console.error('Erro ao buscar dados do clima:', error)
      }
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords
          fetchWeather(latitude, longitude)
        },
        error => {
          console.error('Erro ao obter localização:', error)
        }
      )
    } else {
      console.error('Geolocalização não suportada pelo navegador.')
    }
  }, [])

  useEffect(() => {
    if (!data.labels.length) return

    if (chartRef.current) {
      if (chartInstance.current) chartInstance.current.destroy()

      chartInstance.current = new Chart(chartRef.current, {
        type: 'line',
        data: {
          labels: data.labels,
          datasets: [{
            label: 'Temperatura (°C)',
            data: data.values,
            fill: false,
            borderColor: '#f97316',
            backgroundColor: '#f97316',
            tension: 0.3,
          }],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: true },
            tooltip: {
              callbacks: {
                title: (tooltipItems) => {
                  const idx = tooltipItems[0].dataIndex
                  return data.tooltips[idx] // mostra "qua, 06H (AM)"
                }
              }
            }
          },
          scales: { y: { beginAtZero: false } },
        },
      })
    }

    return () => {
      if (chartInstance.current) chartInstance.current.destroy()
    }
  }, [data])

  return (
    <section className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">
        Clima
      </h3>
      <canvas ref={chartRef} className="w-full h-48" />
    </section>
  )
}
