'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import 'leaflet/dist/leaflet.css'
import { toast } from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'

const MapCore = dynamic(
  () => import('@/components/lavouras/MapCore'),
  {
    ssr: false,
    loading: () => (
      <div className="h-96 bg-gray-100 rounded flex items-center justify-center">
        Carregando mapa...
      </div>
    )
  }
)

export default function EditarTalhao() {
  const params = useParams()
  const router = useRouter()
  const id = params.id
  
  const [points, setPoints] = useState([])
  const [formData, setFormData] = useState({
    nome: '',
    tipo_cultura: '',
    sistema_irrigacao: '',
    data_plantio: '',
    descricao: '',
    area: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (id) {
      fetchTalhao()
    }
  }, [id])

  const fetchTalhao = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/lavouras/${id}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao carregar talhão')
      }
      
      const data = await response.json()
      
      // Preencher formulário com dados existentes
      setFormData({
        nome: data.nome || '',
        tipo_cultura: data.tipo_cultura || '',
        sistema_irrigacao: data.sistema_irrigacao || '',
        data_plantio: data.data_plantio || '',
        descricao: data.descricao || '',
        area: data.area || 0
      })
      
      // Converter GeoJSON para pontos no mapa
      if (data.localizacao_json && data.localizacao_json.coordinates) {
        const coords = data.localizacao_json.coordinates[0]
        const formattedPoints = coords.map(coord => ({
          lat: coord[1], // GeoJSON é [lng, lat], nosso mapa usa [lat, lng]
          lng: coord[0]
        }))
        
        // Remover último ponto se for igual ao primeiro (polígono fechado)
        if (formattedPoints.length > 1 && 
            formattedPoints[0].lat === formattedPoints[formattedPoints.length-1].lat &&
            formattedPoints[0].lng === formattedPoints[formattedPoints.length-1].lng) {
          formattedPoints.pop()
        }
        
        setPoints(formattedPoints)
      }
    } catch (error) {
      console.error('Erro ao carregar talhão:', error)
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const addPoint = () => {
    setPoints([...points, { lat: "", lng: "" }]);
  };

  const updatePoint = (index, field, value) => {
    const newPoints = [...points];
    newPoints[index][field] = value;
    setPoints(newPoints);
  };

  const removePoint = (index) => {
    setPoints(points.filter((_, i) => i !== index));
  };

  const movePoint = (index, direction) => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === points.length - 1)
    )
      return;

    const newPoints = [...points];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    [newPoints[index], newPoints[newIndex]] = [
      newPoints[newIndex],
      newPoints[index],
    ];
    setPoints(newPoints);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePolygonUpdate = (newCoords) => {
    setPoints(newCoords.map((coord) => ({ lat: coord[0], lng: coord[1] })));
    calculateArea(newCoords);
  };

  const calculateArea = (coords) => {
    if (coords.length < 3) {
      setFormData((prev) => ({ ...prev, area: 0 }));
      return;
    }

    let total = 0;
    for (let i = 0; i < coords.length; i++) {
      const [x1, y1] = coords[i];
      const [x2, y2] = coords[(i + 1) % coords.length];
      total += x1 * y2 - x2 * y1;
    }

    const areaMeters = Math.abs(total) * 0.5 * 111319.9 * 111319.9;
    setFormData((prev) => ({
      ...prev,
      area: parseFloat((areaMeters / 10000).toFixed(2)),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // 1. Validar pontos mínimos
    const pontosValidos = points.filter(p => !isNaN(Number(p.lat)) && !isNaN(Number(p.lng)))
    if (pontosValidos.length < 3) {
      toast.error('Adicione pelo menos 3 pontos válidos no mapa')
      return
    }

    setIsSubmitting(true)

    try {
      // 2. Preparar geometria no formato GeoJSON
      const coordenadas = pontosValidos.map(p => [Number(p.lng), Number(p.lat)])
      
      // Fechar o polígono (primeiro e último ponto devem ser iguais)
      if (!coordenadas[0].every((val, i) => val === coordenadas[coordenadas.length-1][i])) {
        coordenadas.push([...coordenadas[0]])
      }

      // 3. Criar objeto GeoJSON
      const localizacaoJson = {
        type: 'Polygon',
        coordinates: [coordenadas]
      }

      // 4. Chamar API para atualizar
      const response = await fetch(`/api/lavouras/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          localizacao_json: localizacaoJson
        })
      })

      // 5. Tratar resposta
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Erro ao atualizar talhão')
      }

      const data = await response.json()
      toast.success(`Talhão "${data.nome}" atualizado com sucesso!`)
      
      // 6. Redirecionar para lista de talhões
      router.push('/talhoes')

    } catch (error) {
      console.error('Erro na atualização:', error)
      toast.error(error.message.includes('geometry') 
        ? 'Formato inválido dos pontos no mapa. Certifique-se de que são coordenadas válidas.' 
        : error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="text-lg">Carregando talhão...</div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Editar Talhão</h1>
        <button
          onClick={() => router.push('/talhoes')}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Voltar
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Nome do Talhão*
                </label>
                <input
                  type="text"
                  name="nome"
                  className="w-full p-2 border rounded"
                  value={formData.nome}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Tipo de Cultura*
                </label>
                <select
                  name="tipo_cultura"
                  className="w-full p-2 border rounded"
                  value={formData.tipo_cultura}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Selecione...</option>
                  <option value="Soja">Soja</option>
                  <option value="Milho">Milho</option>
                  <option value="Café">Café</option>
                  <option value="Cana-de-açúcar">Cana-de-açúcar</option>
                  <option value="Algodão">Algodão</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Sistema de Irrigação
                </label>
                <select
                  name="sistema_irrigacao"
                  className="w-full p-2 border rounded"
                  value={formData.sistema_irrigacao}
                  onChange={handleInputChange}
                >
                  <option value="">Selecione...</option>
                  <option value="Gotejamento">Gotejamento</option>
                  <option value="Pivô Central">Pivô Central</option>
                  <option value="Aspersão">Aspersão</option>
                  <option value="Nenhum">Nenhum</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Data de Plantio
                </label>
                <input
                  type="date"
                  name="data_plantio"
                  className="w-full p-2 border rounded"
                  value={formData.data_plantio}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Descrição
                </label>
                <textarea
                  name="descricao"
                  className="w-full p-2 border rounded"
                  rows={3}
                  value={formData.descricao}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Área (hectares)
                </label>
                <input
                  type="number"
                  className="w-full p-2 border rounded"
                  value={formData.area}
                  readOnly
                />
              </div>

              <div className="pt-2">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium">
                    Pontos no Mapa*
                  </label>
                  <button
                    type="button"
                    onClick={addPoint}
                    className="px-3 py-1 bg-green-500 text-white rounded text-sm"
                  >
                    Adicionar Ponto
                  </button>
                </div>

                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {points.map((point, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 p-2 border rounded"
                    >
                      <span className="text-gray-500 w-6">{index + 1}.</span>

                      <input
                        type="number"
                        step="0.000001"
                        placeholder="Latitude"
                        className="flex-1 p-1 border rounded"
                        value={point.lat}
                        onChange={(e) =>
                          updatePoint(index, "lat", e.target.value)
                        }
                        required
                      />

                      <input
                        type="number"
                        step="0.000001"
                        placeholder="Longitude"
                        className="flex-1 p-1 border rounded"
                        value={point.lng}
                        onChange={(e) =>
                          updatePoint(index, "lng", e.target.value)
                        }
                        required
                      />

                      <div className="flex space-x-1">
                        <button
                          type="button"
                          onClick={() => movePoint(index, "up")}
                          className="p-1 text-gray-500 hover:text-gray-700"
                          disabled={index === 0}
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={() => movePoint(index, "down")}
                          className="p-1 text-gray-500 hover:text-gray-700"
                          disabled={index === points.length - 1}
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          onClick={() => removePoint(index)}
                          className="p-1 text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-4">
              <button
                type="button"
                onClick={() => router.push('/talhoes')}
                className="flex-1 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
                disabled={
                  isSubmitting || points.filter((p) => p.lat && p.lng).length < 3
                }
              >
                {isSubmitting ? "Salvando..." : "Salvar Alterações"}
              </button>
            </div>
          </form>
        </div>

        {/* Seção do Mapa */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="h-96 rounded overflow-hidden">
            <MapCore
              fields={[
                {
                  id: "edit-field",
                  name: formData.nome,
                  description: formData.descricao,
                  type: "talhao",
                  coords: points
                    .filter((p) => p.lat && p.lng)
                    .map((p) => [p.lat, p.lng]),
                },
              ]}
              selectedIds={["edit-field"]}
              onPolygonUpdate={handlePolygonUpdate}
            />
          </div>
          <div className="mt-3 text-sm text-gray-500">
            {points.filter((p) => p.lat && p.lng).length >= 3 ? (
              <span className="text-green-600">
                Área criada! Arraste os pontos ou bordas para ajustar.
              </span>
            ) : (
              <span>Adicione pelo menos 3 pontos para formar uma área</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}