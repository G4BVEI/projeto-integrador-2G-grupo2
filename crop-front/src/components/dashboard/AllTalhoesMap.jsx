// components/dashboard/AllTalhoesMap.jsx
'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

const AllTalhoesMap = ({ talhoes = [] }) => {
  const mapRef = useRef(null)
  const router = useRouter()
  const mapInitialized = useRef(false)

  useEffect(() => {
    // Configurar a função global de redirecionamento
    window.talhaoRedirect = (id) => {
      router.push(`/logged/monitoramento/${id}`)
    }

    // Inicializar o mapa apenas uma vez
    if (mapInitialized.current || talhoes.length === 0) return

    const initializeMap = async () => {
      try {
        // Carregar Leaflet dinamicamente
        const L = await import('leaflet')
        await import('leaflet/dist/leaflet.css')
        
        // Fix para ícones
        delete L.Icon.Default.prototype._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        })

        // Inicializar mapa
        const map = L.map('all-talhoes-map').setView([-15.788, -47.879], 4)
        
        // Adicionar camada base
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap'
        }).addTo(map)

        // Adicionar cada talhão ao mapa
        const bounds = L.latLngBounds()
        let hasVisibleTalhoes = false

        talhoes.forEach(talhao => {
          if (!talhao.localizacao_json || !talhao.localizacao_json.coordinates) return
          
          try {
            const coords = talhao.localizacao_json.coordinates[0]
              .map(coord => [coord[1], coord[0]]) // Converter [lng, lat] para [lat, lng]
            
            // Criar polígono
            const polygon = L.polygon(coords, {
              color: '#16a34a',
              weight: 2,
              fillOpacity: 0.3
            }).addTo(map)

            // Tooltip com nome ao passar o mouse
            polygon.bindTooltip(talhao.nome, { 
              permanent: false, 
              direction: 'center',
              className: 'map-tooltip'
            })

            // Popup com mais informações e redirecionamento ao clicar
            const popupContent = document.createElement('div')
            popupContent.className = 'p-2'
            popupContent.innerHTML = `
              <h3 class="font-bold text-lg">${talhao.nome}</h3>
              <p class="text-sm">${talhao.tipo_cultura || 'Tipo não especificado'}</p>
              <p class="text-sm">${talhao.area || 0} hectares</p>
              <button 
                class="mt-2 px-3 py-1 bg-green-600 text-white rounded text-sm w-full detalhes-btn"
                data-id="${talhao.id}"
              >
                Ver detalhes
              </button>
            `
            
            // Adicionar evento de clique ao botão
            const popup = L.popup().setContent(popupContent)
            polygon.bindPopup(popup)
            
            // Adicionar evento após o popup ser aberto
            polygon.on('popupopen', () => {
              const button = document.querySelector('.detalhes-btn')
              if (button) {
                button.addEventListener('click', () => {
                  router.push(`/logged/monitoramento/${talhao.id}`)
                })
              }
            })

            // Expandir bounds para incluir este talhão
            bounds.extend(polygon.getBounds())
            hasVisibleTalhoes = true
          } catch (error) {
            console.error('Erro ao renderizar talhão:', talhao.id, error)
          }
        })

        // Ajustar visualização para mostrar todos os talhões
        if (hasVisibleTalhoes) {
          map.fitBounds(bounds, { padding: [50, 50] })
        }

        mapRef.current = map
        mapInitialized.current = true
      } catch (error) {
        console.error('Erro ao inicializar mapa:', error)
      }
    }

    initializeMap()

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
      delete window.talhaoRedirect
    }
  }, [talhoes, router])

  if (talhoes.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Meus Talhões</h2>
        <div className="h-96 bg-gray-100 rounded flex items-center justify-center">
          <p className="text-gray-500">Nenhum talhão encontrado</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Meus Talhões</h2>
      <div id="all-talhoes-map" className="h-96 rounded"></div>
      <p className="text-sm text-gray-500 mt-2">
        Passe o mouse sobre um talhão para ver o nome. Clique para ver detalhes.
      </p>
    </div>
  )
}

export default AllTalhoesMap