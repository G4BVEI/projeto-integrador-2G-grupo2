'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function MapView({ fields = [], selectedIds = [], sensorPoints = [] }) {
  const mapRef = useRef(null)
  const layerRef = useRef(null)

  useEffect(() => {
    if (!mapRef.current) {
      const map = L.map('map-view-container').setView([-15.788, -47.879], 13)
      L.tileLayer('http://mt1.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
        attribution: '© Google',
        maxZoom: 20
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

    layerRef.current.clearLayers()

    // Adicionar polígono do talhão
    const field = fields.find(f => selectedIds.includes(f.id))
    if (field && field.coords && field.coords.length >= 3) {
      L.polygon(field.coords, { color: '#16a34a', weight: 2, fillOpacity: 0.3 }).addTo(layerRef.current)
    }

    // Adicionar sensores
    sensorPoints.forEach(sensor => {
      if (sensor.localizacao_json?.coordinates) {
        const [lng, lat] = sensor.localizacao_json.coordinates
        const marker = L.marker([lat, lng], {
          draggable: false,
          icon: L.divIcon({
            className: 'sensor-marker',
            html: `<div class="sensor-pin"></div>`,
            iconSize: [40, 52],
            iconAnchor: [ ]
          })
        }).addTo(layerRef.current)

        marker.bindPopup(`
        <div class="map-tooltip">
          <strong>${sensor.nome || 'Sensor'}</strong><br/>
          Tipo: ${sensor.tipo || '-'}<br/>
          Unidade: ${sensor.unidade || '-'}
        </div>
      `);
          marker.on('mouseover', function() {
      this.openPopup();
    });
    marker.on('mouseout', function() {
      this.closePopup();
    });
    }
  });

    // Ajustar bounds
    const allPoints = []
    if (field?.coords) allPoints.push(...field.coords)
    sensorPoints.forEach(s => {
      if (s.localizacao_json?.coordinates) {
        allPoints.push([s.localizacao_json.coordinates[1], s.localizacao_json.coordinates[0]])
      }
    })
    if (allPoints.length > 0) mapRef.current.fitBounds(allPoints, { padding: [20, 20] })

  }, [fields, selectedIds, sensorPoints])

  return <div id="map-view-container" className="w-full h-full" />
}
// The above code is a React component that renders a Leaflet map with polygons and markers based on provided field and sensor data.
/*
    selectedField.coords.forEach((coord, index) => {
      L.marker(coord, {
        draggable: false,
        icon: L.divIcon({
          className: 'map-marker',
          html: `<div class="marker-pin"></div><span>${index + 1}</span>`,
          iconSize: [30, 42],
          iconAnchor: [15, 42]
        })
      }).addTo(layerRef.current)
    })
*/