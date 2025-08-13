'use client'

import { useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const Map = dynamic(
  () => Promise.resolve(MapCore),
  { ssr: false }
)

export default function MapWrapper({ markers, center, zoom }) {
  return <Map markers={markers} center={center} zoom={zoom} />
}

// Componente core do mapa (quadrados dinâmicos)
function MapCore({ markers, center, zoom }) {
  const mapRef = useRef(null)

  useEffect(() => {
    if (mapRef.current) return

    const map = L.map('map').setView(center, zoom)
    mapRef.current = map

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
    }).addTo(map)

    const side = 0.001 // ~100m, ajustar conforme necessário
    const rectangles = []

    markers.forEach(({ pos, label }) => {
      const bounds = [
        [pos[0] - side / 2, pos[1] - side / 2],
        [pos[0] + side / 2, pos[1] + side / 2],
      ]
      const rect = L.rectangle(bounds, { color: 'blue', weight: 1, fillOpacity: 0.4 })
        .addTo(map)
        .bindPopup(label)
      rectangles.push(rect)
    })

    return () => {
      rectangles.forEach(r => r.remove())
      map.remove()
      mapRef.current = null
    }
  }, [markers, center, zoom])

  return <div id="map" className="flex-1 rounded-lg overflow-hidden h-96" />
}
