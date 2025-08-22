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
  initialPoint = null,
  onPointUpdate 
}) {
  const mapRef = useRef(null)
  const layerRef = useRef(null)
  const markerRef = useRef(null)
  const [currentPoint, setCurrentPoint] = useState(initialPoint || null)

  useEffect(() => {
    // Initialize map only once
    if (!mapRef.current) {
      const map = L.map('map-point-editor-container').setView([-15.788, -47.879], 13)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
      }).addTo(map)

      // Add click event to place/move point
      map.on('click', (e) => {
        const newPoint = [e.latlng.lat, e.latlng.lng];
        setCurrentPoint(newPoint);
        onPointUpdate(newPoint);
        
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
            onPointUpdate(draggedPoint);
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
    if (!selectedField || !selectedField.coords) return

    // Add static markers for each point of the field
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
        fillOpacity: 0.2
      }).addTo(layerRef.current)
    }

    // Add or update the editable sensor point
    if (currentPoint) {
      if (markerRef.current) {
        markerRef.current.setLatLng(currentPoint);
      } else {
        markerRef.current = L.marker(currentPoint, {
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
          onPointUpdate(draggedPoint);
        });
      }
    }

    // Fit bounds to all points (field + sensor point)
    const allPoints = [...selectedField.coords];
    if (currentPoint) {
      allPoints.push(currentPoint);
    }
    
    if (allPoints.length > 0) {
      const bounds = L.latLngBounds(allPoints)
      mapRef.current.fitBounds(bounds, { padding: [20, 20] })
    }

  }, [fields, selectedIds, currentPoint])

  // Initialize with initial point
  useEffect(() => {
    if (initialPoint) {
      setCurrentPoint(initialPoint);
    }
  }, [initialPoint]);

  return <div id="map-point-editor-container" className="w-full h-full" />
}