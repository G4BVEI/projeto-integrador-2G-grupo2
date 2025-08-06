'use client'

import dynamic from 'next/dynamic'

const MapComponent = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => <div className="flex-1 rounded-lg bg-gray-200 h-96 flex items-center justify-center">
    <p className="text-gray-500">Carregando mapa...</p>
  </div>
})

export default function MapWrapper({ markers }) {
  return <MapComponent markers={markers} />
}

