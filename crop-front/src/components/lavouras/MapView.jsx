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

export default function MapView({ fields = [], selectedIds = [], sensorPoints = [] }) {
  const mapRef = useRef(null)
  const layerRef = useRef(null)

  useEffect(() => {
    // Initialize map only once
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

    // Clear previous layers
    layerRef.current.clearLayers()

    // Add sensor points if provided
    if (sensorPoints && sensorPoints.length > 0) {
      sensorPoints.forEach((sensor, index) => {
        if (sensor.localizacao_json && sensor.localizacao_json.coordinates) {
          // Inverter coordenadas (GeoJSON é [lng, lat], Leaflet quer [lat, lng])
          const coords = [
            sensor.localizacao_json.coordinates[0],
            sensor.localizacao_json.coordinates[1]
          ];
          
          const marker = L.marker(coords, {
            draggable: false,
            icon: L.divIcon({
              className: 'sensor-marker',
              html: `<div class="sensor-pin"></div><span>${sensor.nome || 'Sensor'}</span>`,
              iconSize: [30, 42],
              iconAnchor: [15, 42]
            })
          }).addTo(layerRef.current);
          
          // Add popup with sensor info
          marker.bindPopup(`
            <div class="map-tooltip">
              <strong>${sensor.nome}</strong><br/>
              Tipo: ${sensor.tipo}<br/>
              Unidade: ${sensor.unidade}
            </div>
          `);
        }
      })
    }

    // Add fields (talhões)
    const selectedField = fields.find(field => selectedIds.includes(field.id))
    if (!selectedField || !selectedField.coords) return

    // Add static markers for each point
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
    // Draw polygon when there are 3+ points
    if (selectedField.coords.length >= 3) {
      L.polygon(selectedField.coords, {
        color: '#16a34a',
        weight: 2,
        fillOpacity: 0.3
      }).addTo(layerRef.current)
    }

    // Fit bounds to all points (fields + sensors)
    const allPoints = [];
    
    // Add field points
    if (selectedField.coords && selectedField.coords.length > 0) {
      allPoints.push(...selectedField.coords);
    }
    
    // Add sensor points
    if (sensorPoints && sensorPoints.length > 0) {
      sensorPoints.forEach(sensor => {
        if (sensor.localizacao_json && sensor.localizacao_json.coordinates) {
          // Inverter coordenadas
          allPoints.push([
            sensor.localizacao_json.coordinates[1],
            sensor.localizacao_json.coordinates[0]
          ]);
        }
      });
    }
    
    if (allPoints.length > 0) {
      const bounds = L.latLngBounds(allPoints)
      mapRef.current.fitBounds(bounds, { padding: [20, 20] })
    }

  }, [fields, selectedIds, sensorPoints])

  return <div id="map-view-container" className="w-full h-full" />
}