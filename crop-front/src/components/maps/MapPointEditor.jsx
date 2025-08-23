'use client'

import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-editable'

// Fix ícones padrão do Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function MapPointEditor({
  fields = [],
  selectedIds = [],
  initialPoint = null,
  onPointUpdate,
  tileLayer = 'openstreetmap'
}) {
  const mapRef = useRef(null)
  const layerRef = useRef(null)
  const sensorMarkerRef = useRef(null)
  const polygonRef = useRef(null)
  const [point, setPoint] = useState(initialPoint)

  useEffect(() => {
    if (!mapRef.current) {
      const map = L.map('map-point-editor-container', { editable: true }).setView([-15.788, -47.879], 13)

      // Tile layers
      if (tileLayer === 'google') {
        L.tileLayer('http://mt1.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
          attribution: '© Google',
          maxZoom: 20
        }).addTo(map)
      } else {
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap'
        }).addTo(map)
      }

      mapRef.current = map
      layerRef.current = L.layerGroup().addTo(map)

      // Clique no mapa para definir sensor
      map.on('click', (e) => {
        const newPoint = [e.latlng.lat, e.latlng.lng]

        // Atualiza marcador do sensor
        if (sensorMarkerRef.current) {
          sensorMarkerRef.current.setLatLng(newPoint)
        } else {
          const marker = L.marker(newPoint, { draggable: true }).addTo(layerRef.current)
          marker.on('dragend', (evt) => {
            const latlng = [evt.target.getLatLng().lat, evt.target.getLatLng().lng]
            setPoint(latlng)
            onPointUpdate?.(latlng)
          })
          sensorMarkerRef.current = marker
        }

        setPoint(newPoint)
        onPointUpdate?.(newPoint)
      })
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [onPointUpdate, tileLayer])

  useEffect(() => {
    if (!mapRef.current || !layerRef.current) return

    // Limpar camadas antigas
    layerRef.current.clearLayers()
    sensorMarkerRef.current = null
    polygonRef.current = null

    // Adicionar polígono do talhão
    const field = fields.find(f => selectedIds.includes(f.id))
    if (field && field.coords && field.coords.length >= 3) {
      polygonRef.current = L.polygon(field.coords, {
        color: '#16a34a',
        weight: 2,
        fillOpacity: 0.2
      }).addTo(layerRef.current)
    }

    // Readicionar sensor existente
    if (point) {
      const marker = L.marker(point, { draggable: true }).addTo(layerRef.current)
      marker.on('dragend', (evt) => {
        const latlng = [evt.target.getLatLng().lat, evt.target.getLatLng().lng]
        setPoint(latlng)
        onPointUpdate?.(latlng)
      })
      sensorMarkerRef.current = marker
    }

    // Ajustar zoom para ver tudo
    const bounds = []
    if (field && field.coords) bounds.push(...field.coords)
    if (point) bounds.push(point)
    if (bounds.length > 0) mapRef.current.fitBounds(bounds, { padding: [20, 20] })

  }, [fields, selectedIds, point, onPointUpdate])

  return (
    <div className="relative w-full h-full">
      <div id="map-point-editor-container" className="w-full h-full" />
      {point && (
        <div className="absolute bottom-2 left-2 bg-white p-2 rounded shadow z-1000 text-sm font-mono">
          Sensor: {point[0].toFixed(6)}, {point[1].toFixed(6)}
        </div>
      )}
    </div>
  )
}
