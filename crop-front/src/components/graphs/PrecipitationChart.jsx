'use client'

import { useEffect, useRef, useState } from 'react'
import { Chart } from 'chart.js/auto'

const API_KEY = 'c1a01ddb4d54bf9903e1cefe8c0a35f3'

export default function PrecipitationChart() {
  const chartRef = useRef(null)
  const chartInstance = useRef(null)
  const [data, setData] = useState({ labels: [], values: [] })

  useEffect(() => {
    async function fetchWeather(lat, lon) {
      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
        )
        const weatherData = await response.json()

        // Agrupar por dia da semana
        const dailyRain = {}
        weatherData.list.forEach(item => {
          const date = new Date(item.dt * 1000)
          const dayName = date.toLocaleDateString('pt-BR', { weekday: 'short' }) // Seg, Ter...
          const rain = item.rain?.['3h'] || 0
          dailyRain[dayName] = (dailyRain[dayName] || 0) + rain
        })

        const labels = Object.keys(dailyRain)
        const values = Object.values(dailyRain)
        setData({ labels, values })
      } catch (error) {
        console.error('Erro ao buscar dados do clima:', error)
      }
    }

    // Pegar localização do usuário
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
        type: 'bar',
        data: {
          labels: data.labels,
          datasets: [{
            label: 'mm',
            data: data.values,
            backgroundColor: '#10b981',
            borderRadius: 5,
          }],
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true } },
        },
      })
    }

    return () => {
      if (chartInstance.current) chartInstance.current.destroy()
    }
  }, [data])

  return (
    <section className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Precipitação da Semana</h3>
      <canvas ref={chartRef} className="w-full h-36" />
    </section>
  )
}
