'use client'

import { useEffect } from 'react'
import L from 'leaflet'

export default function MapComponent({ markers }) {
  useEffect(() => {
    // Verificar se já existe um mapa
    const mapElement = document.getElementById('map')
    if (mapElement && mapElement._leaflet_id) return

    const map = L.map('map').setView([-27.23, -52.02], 10)
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
    }).addTo(map)

    markers.forEach(({ pos, label }) => {
      L.marker(pos).addTo(map).bindPopup(label)
    })

    return () => {
      if (map) map.remove()
    }
  }, [markers])

  return <div id="map" className="flex-1 rounded-lg overflow-hidden h-96" />
}

