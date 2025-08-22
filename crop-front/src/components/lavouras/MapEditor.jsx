'use client'

import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-editable'

// Fix para ícones padrão do Leaflet em Next.js
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Criar um ícone personalizado com melhor hitbox
const createCustomIcon = (index) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div class="marker-container">
        <div class="marker-pin"></div>
        <span class="marker-number">${index + 1}</span>
      </div>
    `,
    iconSize: [24, 36],
    iconAnchor: [12, 36],
    popupAnchor: [0, -36]
  });
};

export default function MapEditor({ fields = [], selectedIds = [], onPolygonUpdate, tileLayer = 'google' }) {
  const mapRef = useRef(null)
  const layerRef = useRef(null)
  const markersRef = useRef([])
  const polygonRef = useRef(null)
  const [currentTileLayer, setCurrentTileLayer] = useState(tileLayer)
  const tileLayersRef = useRef({})

  useEffect(() => {
    // Initialize map only once
    if (!mapRef.current) {
      const map = L.map('map-container', {
        editable: true
      }).setView([-14.2350, -51.9253], 4)

      // Create tile layers
      tileLayersRef.current.openstreetmap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
      })
      
      tileLayersRef.current.google = L.tileLayer('http://mt1.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
        attribution: '© Google',
        maxZoom: 20
      })

      // Add the initial tile layer
      tileLayersRef.current[currentTileLayer].addTo(map)

      mapRef.current = map
      layerRef.current = L.layerGroup().addTo(map)

      // Adicionar evento de clique para criar pontos
      map.on('click', (e) => {
        const newPoint = [e.latlng.lat, e.latlng.lng];
        const selectedField = fields.find(field => selectedIds.includes(field.id));
        
        if (selectedField) {
          // Adicionar novo ponto às coordenadas existentes
          const newCoords = [...selectedField.coords, newPoint];
          onPolygonUpdate(newCoords);
        } else if (selectedIds.includes('new-field')) {
          // Para o novo talhão (quando não há campo selecionado ainda)
          const newField = fields.find(field => field.id === 'new-field');
          if (newField) {
            const newCoords = [...newField.coords, newPoint];
            onPolygonUpdate(newCoords);
          } else {
            // Criar novo campo se não existir
            onPolygonUpdate([newPoint]);
          }
        }
      });
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [fields, selectedIds, onPolygonUpdate])

  // Effect to change tile layer
  useEffect(() => {
    if (!mapRef.current) return
    
    // Remove current tile layer
    Object.values(tileLayersRef.current).forEach(layer => {
      if (mapRef.current.hasLayer(layer)) {
        mapRef.current.removeLayer(layer)
      }
    })
    
    // Add new tile layer
    tileLayersRef.current[currentTileLayer].addTo(mapRef.current)
  }, [currentTileLayer])

  useEffect(() => {
    if (!mapRef.current || !layerRef.current) return

    // Clear previous layers
    layerRef.current.clearLayers()
    markersRef.current = []
    polygonRef.current = null

    const selectedField = fields.find(field => selectedIds.includes(field.id))
    if (!selectedField || !selectedField.coords || selectedField.coords.length === 0) return

    // Add draggable markers for each point
    selectedField.coords.forEach((coord, index) => {
      const marker = L.marker(coord, {
        draggable: true,
        icon: createCustomIcon(index)
      }).addTo(layerRef.current)

      marker.on('dragend', (e) => {
        const newCoords = [...selectedField.coords]
        newCoords[index] = [e.target.getLatLng().lat, e.target.getLatLng().lng]
        onPolygonUpdate(newCoords)
      })

      // Adicionar evento de clique direito para remover ponto
      marker.on('contextmenu', (e) => {
        e.originalEvent.preventDefault()
        const newCoords = selectedField.coords.filter((_, i) => i !== index)
        onPolygonUpdate(newCoords)
      })

      // Tooltip para instruções
      marker.bindTooltip(`Ponto ${index + 1}<br>Clique direito para remover`, {
        permanent: false,
        direction: 'top'
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

  }, [fields, selectedIds, onPolygonUpdate])

  const handleTileLayerChange = (e) => {
    setCurrentTileLayer(e.target.value)
  }

  return (
    <div className="relative w-full h-full">
      <div id="map-container" className="w-full h-full" />
      <div className="absolute top-2 right-2 z-1000 bg-white p-2 rounded shadow">
        <select 
          value={currentTileLayer} 
          onChange={handleTileLayerChange}
          className="text-sm p-1 border rounded"
        >
          <option value="openstreetmap">OpenStreetMap</option>
          <option value="google">Google Maps</option>
        </select>
      </div>
      <div className="absolute top-2 left-2 z-1000 bg-white p-2 rounded shadow text-sm">
        <p>• Clique no mapa para adicionar pontos</p>
        <p>• Arraste os pontos para mover</p>
        <p>• Clique direito para remover pontos</p>
      </div>
    </div>
  )
}