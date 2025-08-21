// components/lavouras/MapView.jsx
'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix para ícones padrão do Leaflet em Next.js
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function MapView({ fields = [], selectedIds = [] }) {
  const mapRef = useRef(null)
  const layerRef = useRef(null)

  useEffect(() => {
    // Initialize map only once
    if (!mapRef.current) {
      const map = L.map('map-view-container').setView([-15.788, -47.879], 13)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
      }).addTo(map)

      mapRef.current = map
      layerRef.current = L.layerGroup().addTo(map)
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (!mapRef.current || !layerRef.current) return

    // Clear previous layers
    layerRef.current.clearLayers()

    const selectedField = fields.find(field => selectedIds.includes(field.id))
    if (!selectedField || !selectedField.coords) return

    // Add static markers for each point
    selectedField.coords.forEach((coord, index) => {
      L.marker(coord, {
        draggable: false, // Sempre estático
        icon: L.divIcon({
          className: 'map-marker',
          html: `<div class="marker-pin"></div><span>${index + 1}</span>`,
          iconSize: [30, 42],
          iconAnchor: [15, 42]
        })
      }).addTo(layerRef.current)
    })

    // Draw polygon when there are 3+ points
    if (selectedField.coords.length >= 3) {
      L.polygon(selectedField.coords, {
        color: '#16a34a',
        weight: 2,
        fillOpacity: 0.3
      }).addTo(layerRef.current)
    }

    // Fit bounds to all points
    if (selectedField.coords.length > 0) {
      const bounds = L.latLngBounds(selectedField.coords)
      mapRef.current.fitBounds(bounds, { padding: [20, 20] })
    }

  }, [fields, selectedIds])

  return <div id="map-view-container" className="w-full h-full" />
}