'use client'

import { useEffect, useRef } from 'react'
import { Chart } from 'chart.js/auto'

export default function PrecipitationChart({ data }) {
  const chartRef = useRef(null)
  const chartInstance = useRef(null)

  useEffect(() => {
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
    <section className="bg-white rounded-lg shadow-sm p-4">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Precipitação</h3>
      <canvas ref={chartRef} className="w-full h-36" />
      <button className="mt-4 text-sm text-green-500 hover:underline">
        Acessar biblioteca completa
      </button>
    </section>
  )
}

