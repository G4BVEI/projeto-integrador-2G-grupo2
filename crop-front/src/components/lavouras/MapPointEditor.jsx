'use client'

import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix para ícones padrão do Leaflet em Next.js
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function MapPointEditor({ 
  fields = [], 
  selectedIds = [], 
  sensorPoints = [],
  onPointUpdate,
  tileLayer = 'openstreetmap'
}) {
  const mapRef = useRef(null)
  const layerRef = useRef(null)
  const markerRef = useRef(null)
  const [currentPoint, setCurrentPoint] = useState(null)

  useEffect(() => {
    // Initialize map only once
    if (!mapRef.current) {
      const map = L.map('map-point-editor-container').setView([-15.788, -47.879], 13)

      // Adicionar camada base baseada na preferência
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

      // Add click event to place/move point
      map.on('click', (e) => {
        const newPoint = [e.latlng.lat, e.latlng.lng];
        setCurrentPoint(newPoint);
        if (onPointUpdate) {
          onPointUpdate(newPoint);
        }
        
        // Update or create marker
        if (markerRef.current) {
          markerRef.current.setLatLng(newPoint);
        } else {
          markerRef.current = L.marker(newPoint, {
            draggable: true,
            icon: L.divIcon({
              className: 'sensor-marker-editable',
              html: `<div class="sensor-pin" style="background-color: #3b82f6;"></div><span>Sensor</span>`,
              iconSize: [30, 42],
              iconAnchor: [15, 42]
            })
          }).addTo(layerRef.current);
          
          // Add drag event
          markerRef.current.on('dragend', (e) => {
            const draggedPoint = [e.target.getLatLng().lat, e.target.getLatLng().lng];
            setCurrentPoint(draggedPoint);
            if (onPointUpdate) {
              onPointUpdate(draggedPoint);
            }
          });

          // Add double click to remove
          markerRef.current.on('dblclick', () => {
            layerRef.current.removeLayer(markerRef.current);
            markerRef.current = null;
            setCurrentPoint(null);
            if (onPointUpdate) {
              onPointUpdate(null);
            }
          });
        }
      });

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

    // Clear previous layers but keep the editable marker
    const layers = layerRef.current.getLayers();
    layers.forEach(layer => {
      if (layer !== markerRef.current) {
        layerRef.current.removeLayer(layer);
      }
    });

    // Add fields (talhões) for reference
    const selectedField = fields.find(field => selectedIds.includes(field.id))
    if (selectedField && selectedField.coords) {
      // Add static markers for each point of the field
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

      // Draw polygon when there are 3+ points
      if (selectedField.coords.length >= 3) {
        L.polygon(selectedField.coords, {
          color: '#16a34a',
          weight: 2,
          fillOpacity: 0.2
        }).addTo(layerRef.current)
      }
    }

    // Add sensor points
    if (sensorPoints && sensorPoints.length > 0) {
      sensorPoints.forEach((sensor, index) => {
        if (sensor.localizacao) {
          L.marker(sensor.localizacao, {
            draggable: false,
            icon: L.divIcon({
              className: 'sensor-marker',
              html: `<div class="sensor-pin"></div><span>${sensor.nome || 'Sensor'}</span>`,
              iconSize: [30, 42],
              iconAnchor: [15, 42]
            })
          }).addTo(layerRef.current);
        }
      })
    }

    // Fit bounds to all points (field + sensor points)
    const allPoints = [];
    
    if (selectedField && selectedField.coords) {
      allPoints.push(...selectedField.coords);
    }
    
    if (sensorPoints && sensorPoints.length > 0) {
      sensorPoints.forEach(sensor => {
        if (sensor.localizacao) {
          allPoints.push(sensor.localizacao);
        }
      });
    }
    
    if (allPoints.length > 0) {
      const bounds = L.latLngBounds(allPoints)
      mapRef.current.fitBounds(bounds, { padding: [20, 20] })
    }

  }, [fields, selectedIds, sensorPoints])

  return <div id="map-point-editor-container" className="w-full h-full" />
}