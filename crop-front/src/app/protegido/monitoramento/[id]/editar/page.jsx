'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import { toast } from 'react-hot-toast';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useParams } from 'next/navigation';

const MapEditor = dynamic(
  () => import('@/components/maps/MapEditor'),
  {
    ssr: false,
    loading: () => (
      <div className="h-96 bg-gray-100 rounded flex items-center justify-center">
        Carregando mapa...
      </div>
    )
  }
);


export default function EditarLavoura() {
  const { id } = useParams();
  const [points, setPoints] = useState([]);
  const [formData, setFormData] = useState({
    nome: '',
    tipo_cultura: '',
    sistema_irrigacao: '',
    data_plantio: '',
    descricao: '',
    area: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();
  const [sementes, setSementes] = useState([]);

  
  // Carregar dados do lavoura
  useEffect(() => {
        async function fetchSementes() {
          try {

    
            const { data, error } = await supabase
              .from('sementes')
              .select('*')
    
            if (error) throw error;
    
            setSementes(data || []);
          } catch (err) {
            setError(err.message);
            console.error('Error fetching sementes:', err);
          } finally {
            setLoading(false);
          } 
        }    fetchSementes();
  }, []);

  useEffect(() => {
    const fetchLavoura = async () => {
      try {
        const res = await fetch(`/api/lavouras/${id}`);
        if (!res.ok) throw new Error('Erro ao carregar lavoura');
        const data = await res.json();

        setFormData({
          nome: data.nome || '',
          tipo_cultura: data.tipo_cultura || '',
          sistema_irrigacao: data.sistema_irrigacao || '',
          data_plantio: data.data_plantio ? data.data_plantio.split('T')[0] : '',
          descricao: data.descricao || '',
          area: data.area || 0,
        });

        if (data.localizacao_json?.coordinates?.[0]) {
          const pts = data.localizacao_json.coordinates[0]
            .slice(0, -1)
            .map(([lng, lat]) => ({
              lat: lat.toString(),
              lng: lng.toString(),
            }));
          setPoints(pts);
        }
      } catch (err) {
        toast.error(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLavoura();
  }, [id]);

  const addPoint = () => setPoints([...points, { lat: "", lng: "" }]);

  const updatePoint = (index, field, value) => {
    const newPoints = [...points];
    newPoints[index][field] = value;
    setPoints(newPoints);

    if (field === 'lat' || field === 'lng') {
      const validPoints = newPoints.filter(p => p.lat && p.lng).map(p => [Number(p.lat), Number(p.lng)]);
      if (validPoints.length >= 3) calculateArea(validPoints);
    }
  };

  const removePoint = (index) => setPoints(points.filter((_, i) => i !== index));

  const movePoint = (index, direction) => {
    if ((direction === "up" && index === 0) || (direction === "down" && index === points.length - 1)) return;
    const newPoints = [...points];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    [newPoints[index], newPoints[newIndex]] = [newPoints[newIndex], newPoints[index]];
    setPoints(newPoints);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePolygonUpdate = (newCoords) => {
    const updatedPoints = newCoords.map(coord => ({ lat: coord[0].toString(), lng: coord[1].toString() }));
    setPoints(updatedPoints);
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
    e.preventDefault();
    const pontosValidos = points.filter(p => !isNaN(Number(p.lat)) && !isNaN(Number(p.lng)));
    if (pontosValidos.length < 3) {
      toast.error('Adicione pelo menos 3 pontos válidos no mapa');
      return;
    }

    setIsSubmitting(true);
    try {
      const coordenadas = pontosValidos.map(p => [Number(p.lng), Number(p.lat)]);
      if (!coordenadas[0].every((val, i) => val === coordenadas[coordenadas.length - 1][i])) {
        coordenadas.push([...coordenadas[0]]);
      }
      const localizacaoJson = { type: 'Polygon', coordinates: [coordenadas] };

      const response = await fetch(`/api/lavouras/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, localizacao_json: localizacaoJson }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erro ao atualizar lavoura');
      }
      const data = await response.json();
      toast.success(`Lavoura "${data.nome}" atualizado com sucesso!`);
      router.push(`/protegido/monitoramento/${data.id}`);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="p-6">Carregando...</div>;
  

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Editar Lavoura</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="bg-white p-6 rounded-lg shadow">
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Nome */}
              <div>
                <label className="block text-sm font-medium mb-1">Nome do Lavoura*</label>
                <input
                  type="text"
                  name="nome"
                  className="w-full p-2 border rounded"
                  value={formData.nome}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Tipo de Cultura */}
              <div>
                <label className="block text-sm font-medium mb-1">Tipo de Cultura*</label>
                <select
                  name="tipo_cultura"
                  className="w-full p-2 border rounded"
                  value={formData.tipo_cultura}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Selecione...</option>
                  {
                  sementes.map((sementes) => (
                    <option key={sementes.tipo}value={sementes.tipo}>{sementes.tipo}</option>
                    ))
                  }
                </select>
              </div>

              {/* Sistema de Irrigação */}
              <div>
                <label className="block text-sm font-medium mb-1">Sistema de Irrigação</label>
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

              {/* Data de Plantio */}
              <div>
                <label className="block text-sm font-medium mb-1">Data de Plantio</label>
                <input
                  type="date"
                  name="data_plantio"
                  className="w-full p-2 border rounded"
                  value={formData.data_plantio}
                  onChange={handleInputChange}
                />
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-sm font-medium mb-1">Descrição</label>
                <textarea
                  name="descricao"
                  className="w-full p-2 border rounded"
                  rows={3}
                  value={formData.descricao}
                  onChange={handleInputChange}
                />
              </div>

              {/* Área */}
              <div>
                <label className="block text-sm font-medium mb-1">Área (hectares)</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded"
                  value={formData.area}
                  readOnly
                />
              </div>

              {/* Pontos */}
              <div className="pt-2">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium">Pontos no Mapa*</label>
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
                    <div key={index} className="flex items-center space-x-2 p-2 border rounded">
                      <span className="text-gray-500 w-6">{index + 1}.</span>
                      <input
                        type="number"
                        step="0.000001"
                        placeholder="Latitude"
                        className="flex-1 p-1 border rounded"
                        value={point.lat}
                        onChange={(e) => updatePoint(index, "lat", e.target.value)}
                        required
                      />
                      <input
                        type="number"
                        step="0.000001"
                        placeholder="Longitude"
                        className="flex-1 p-1 border rounded"
                        value={point.lng}
                        onChange={(e) => updatePoint(index, "lng", e.target.value)}
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

            <button
              type="submit"
              className="w-full mt-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
              disabled={isSubmitting || points.filter((p) => p.lat && p.lng).length < 3}
            >
              {isSubmitting ? "Salvando..." : "Atualizar Lavoura"}
            </button>
          </form>
        </div>

        {/* Mapa */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="h-96 rounded overflow-hidden">
            <MapEditor
              fields={[
                {
                  id: "edit-field",
                  name: formData.nome,
                  description: formData.descricao,
                  type: "lavoura",
                  coords: points.filter((p) => p.lat && p.lng).map((p) => [Number(p.lat), Number(p.lng)]),
                },
              ]}
              selectedIds={["edit-field"]}
              onPolygonUpdate={handlePolygonUpdate}
            />
          </div>
          <div className="mt-3 text-sm text-gray-500">
            <p>Clique no mapa para adicionar pontos</p>
            <p>Arraste os pontos para mover</p>
            <p>Clique direito para remover pontos</p>
            {points.filter((p) => p.lat && p.lng).length >= 3 ? (
              <span className="text-green-600">Área criada! Arraste os pontos ou bordas para ajustar.</span>
            ) : (
              <span className="text-red-400">Adicione pelo menos 3 pontos para formar uma área</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
