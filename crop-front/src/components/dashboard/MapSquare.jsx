'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import 'leaflet/dist/leaflet.css'

const MapCore = ({ fields, selectedIds, viewMode }) => {
  const mapRef = useRef(null)

  useEffect(() => {
    let L
    ;(async () => {
      const leaflet = await import('leaflet')
      L = leaflet.default

      if (mapRef.current) return

      const map = L.map('map', { zoomControl: true }).setView([0, 0], 2)
      mapRef.current = map

      // Base layer padrão (OSM)
      const baseLayer = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        { maxZoom: 19 }
      ).addTo(map)

      // LayerGroup para poligonos
      const polygonGroup = L.layerGroup().addTo(map)

      // Filtra lavouras selecionadas
      const toDisplay = fields.filter(f => selectedIds.includes(f.id))

      if (toDisplay.length === 0) return

      const allBounds = []

      toDisplay.forEach(({ coords, name, description, type }) => {
        // Cor por tipo
        let color = 'gray'
        if (type === 'lavoura') color = 'green'
        if (type === 'pastagem') color = 'yellow'
        if (type === 'sensor') color = 'blue'

        const polygon = L.polygon(coords, {
          color,
          weight: 2,
          fillOpacity: viewMode === 'sensor' ? 0.1 : 0.3,
        }).addTo(polygonGroup)

        polygon.bindPopup(`<b>${name}</b><br>${description}`)

        allBounds.push(polygon.getBounds())
      })

      // Ajusta view para caber todas as lavouras selecionadas
      const combined = allBounds.reduce((acc, b) => acc.extend(b), L.latLngBounds(allBounds[0]))
      map.fitBounds(combined, { padding: [20, 20] })
    })()

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [fields, selectedIds, viewMode])

  return <div id="map" className="flex-1 rounded-lg overflow-hidden h-96" />
}

export default dynamic(() => Promise.resolve(MapCore), { ssr: false })
