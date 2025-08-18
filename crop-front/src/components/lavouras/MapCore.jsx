// components/lavouras/MapCore.jsx
'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-editable'

export default function MapCore({ fields = [], selectedIds = [], onPolygonUpdate }) {
  const mapRef = useRef(null)
  const layerRef = useRef(null)
  const markersRef = useRef([])
  const polygonRef = useRef(null)

  useEffect(() => {
    // Initialize map only once
    if (!mapRef.current) {
      const map = L.map('map-container', {
        editable: true
      }).setView([-15.788, -47.879], 13) // Default to Brazil center

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
    markersRef.current = []

    const selectedField = fields.find(field => selectedIds.includes(field.id))
    if (!selectedField || !selectedField.coords) return

    // Center on first point when added
    if (selectedField.coords.length === 1) {
      mapRef.current.setView(selectedField.coords[0], 15)
    }

    // Add draggable markers for each point
    selectedField.coords.forEach((coord, index) => {
      const marker = L.marker(coord, {
        draggable: true,
        icon: L.divIcon({
          className: 'map-marker',
          html: `<div class="marker-pin"></div><span>${index + 1}</span>`,
          iconSize: [30, 42],
          iconAnchor: [15, 42]
        })
      }).addTo(layerRef.current)

      marker.on('dragend', (e) => {
        const newCoords = [...selectedField.coords]
        newCoords[index] = [e.target.getLatLng().lat, e.target.getLatLng().lng]
        onPolygonUpdate(newCoords)
      })

      markersRef.current.push(marker)
    })

    // Draw polygon when there are 3+ points
    if (selectedField.coords.length >= 3) {
      polygonRef.current = L.polygon(selectedField.coords, {
        color: '#16a34a',
        weight: 2,
        fillOpacity: 0.3
      }).addTo(layerRef.current)

      // Enable editing
      polygonRef.current.enableEdit()

      // Update when edited
      polygonRef.current.on('editable:vertex:dragend editable:vertex:deleted editable:vertex:created editable:dragend', () => {
        const newCoords = polygonRef.current.getLatLngs()[0].map(latlng => [latlng.lat, latlng.lng])
        onPolygonUpdate(newCoords)
      })
    }

    // Fit bounds to all points
    if (selectedField.coords.length > 0) {
      const bounds = L.latLngBounds(selectedField.coords)
      mapRef.current.fitBounds(bounds, { padding: [20, 20] })
    }

  }, [fields, selectedIds])

  return <div id="map-container" className="w-full h-full" />
}