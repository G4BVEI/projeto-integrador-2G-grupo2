'use client'

import { useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import 'leaflet/dist/leaflet.css'

function MapCore({ markers, center, zoom }) {
  const mapRef = useRef(null)

  useEffect(() => {
    let L
    ;(async () => {
      const leaflet = await import('leaflet')
      L = leaflet.default

      if (mapRef.current) return

      const map = L.map('map').setView(center, zoom)
      mapRef.current = map

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
      }).addTo(map)

      const side = 0.001 // ~100m
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
    })()

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [markers, center, zoom])

  return <div id="map" className="flex-1 rounded-lg overflow-hidden h-96" />
}

export default dynamic(() => Promise.resolve(MapCore), { ssr: false })
