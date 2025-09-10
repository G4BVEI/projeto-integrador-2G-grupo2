// components/dashboard/MapSquare.jsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import 'leaflet/dist/leaflet.css'

// Fix para ícones padrão do Leaflet em Next.js
const fixLeafletIcons = () => {
  if (typeof window !== 'undefined') {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  }
};

const MapSquare = ({ markers, center, zoom }) => {
  const mapRef = useRef(null)
  const router = useRouter()
  const [lavouras, setLavouras] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Carregar todos as lavouras
    const fetchLavouras = async () => {
      try {
        const response = await fetch('/api/lavouras')
        if (response.ok) {
          const data = await response.json()
          setLavouras(data)
        }
      } catch (error) {
        console.error('Erro ao carregar lavouras:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLavouras()
  }, [])

  useEffect(() => {
    if (isLoading) return

    let L
    let map
    
    const initializeMap = async () => {
      const leaflet = await import('leaflet')
      L = leaflet.default
      fixLeafletIcons()

      if (mapRef.current) return

      // Inicializar o mapa
      map = L.map('map-square', { zoomControl: true }).setView(center, zoom)
      mapRef.current = map

      // Adicionar camada base (OSM)
      L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        { maxZoom: 19, attribution: '© OpenStreetMap' }
      ).addTo(map)

      // Adicionar marcadores padrão se não houver lavouras
      if (lavouras.length === 0 && markers && markers.length > 0) {
        markers.forEach(marker => {
          L.marker(marker.position)
            .addTo(map)
            .bindPopup(`<b>${marker.name}</b>`)
        })
        
        if (markers.length === 1) {
          map.setView(markers[0].position, 13)
        } else if (markers.length > 1) {
          const group = new L.featureGroup(markers.map(m => L.marker(m.position)))
          map.fitBounds(group.getBounds().pad(0.1))
        }
        
        return
      }

      // Adicionar polígonos das lavouras
      const allBounds = []
      
      lavouras.forEach(lavoura => {
        if (lavoura.localizacao_json && lavoura.localizacao_json.coordinates) {
          try {
            // Converter GeoJSON para formato do Leaflet
            const coords = lavoura.localizacao_json.coordinates[0].map(coord => [coord[1], coord[0]])
            
            // Criar polígono
            const polygon = L.polygon(coords, {
              color: '#16a34a',
              weight: 2,
              fillOpacity: 0.4
            }).addTo(map)
            
            // Adicionar popup com informações
            const popupContent = `
              <div class="p-2">
                <h3 class="font-bold text-lg">${lavoura.nome}</h3>
                <p class="text-sm">${lavoura.tipo_cultura || 'Tipo não especificado'}</p>
                <p class="text-sm">Área: ${lavoura.area || 0} hectares</p>
                <button 
                  class="mt-2 px-3 py-1 bg-green-600 text-white rounded text-xs view-lavoura"
                  data-id="${lavoura.id}"
                >
                  Ver detalhes
                </button>
              </div>
            `
            
            polygon.bindPopup(popupContent)
            
            // Evento de clique no botão dentro do popup
            polygon.on('popupopen', () => {
              const button = document.querySelector('.view-lavoura')
              if (button) {
                button.addEventListener('click', (e) => {
                  const lavouraId = e.target.getAttribute('data-id')
                  router.push(`/lavouras/${lavouraId}`)
                })
              }
            })
            
            // Evento de mouseover para destacar
            polygon.on('mouseover', function(e) {
              this.setStyle({ weight: 4 })
            })
            
            polygon.on('mouseout', function(e) {
              this.setStyle({ weight: 2 })
            })
            
            allBounds.push(polygon.getBounds())
          } catch (error) {
            console.error('Erro ao renderizar lavoura:', lavoura.nome, error)
          }
        }
      })

      // Ajustar visualização para mostrar todos as lavouras
      if (allBounds.length > 0) {
        const bounds = L.latLngBounds(allBounds)
        map.fitBounds(bounds, { padding: [20, 20] })
      }
    }

    initializeMap()

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [lavouras, isLoading, center, zoom, markers, router])

  if (isLoading) {
    return (
      <div className="flex-1 rounded-lg overflow-hidden h-96 bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500">Carregando mapa...</div>
      </div>
    )
  }

  return <div id="map-square" className="flex-1 rounded-lg overflow-hidden h-96" />
}

export default dynamic(() => Promise.resolve(MapSquare), { ssr: false })