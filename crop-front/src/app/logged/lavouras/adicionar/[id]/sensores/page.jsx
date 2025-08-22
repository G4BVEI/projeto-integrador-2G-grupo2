'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { createClient } from '@/lib/supabase/client';
import dynamic from 'next/dynamic';

const MapPointEditor = dynamic(
  () => import('@/components/lavouras/MapPointEditor'),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
        Carregando mapa...
      </div>
    )
  }
);

export default function AdicionarSensoresTalhao() {
  const [talhao, setTalhao] = useState(null);
  const [sensores, setSensores] = useState([]);
  const [activeSensorIndex, setActiveSensorIndex] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function fetchTalhao() {
      try {
        const { data, error } = await supabase
          .from('talhoes')
          .select('*')
          .eq('id', params.id)
          .single();

        if (error) throw error;
        setTalhao(data);
      } catch (err) {
        console.error('Erro ao buscar talhão:', err);
        toast.error('Erro ao carregar dados do talhão');
      }
    }

    fetchTalhao();
  }, [params.id]);

  const addSensor = () => {
    const newSensor = {
      nome: '',
      tipo: '',
      unidade: '',
      parametros: '{}',
      lat: '',
      lng: ''
    };
    setSensores([...sensores, newSensor]);
    setActiveSensorIndex(sensores.length);
  };

  const updateSensor = (index, field, value) => {
    const newSensores = [...sensores];
    newSensores[index][field] = value;
    
    // Se estiver atualizando lat ou lng, atualizar também a localização
    if (field === 'lat' || field === 'lng') {
      const lat = field === 'lat' ? value : newSensores[index].lat;
      const lng = field === 'lng' ? value : newSensores[index].lng;
      
      if (lat && lng && !isNaN(Number(lat)) && !isNaN(Number(lng))) {
        newSensores[index].localizacao = [Number(lat), Number(lng)];
      } else {
        newSensores[index].localizacao = null;
      }
    }
    
    setSensores(newSensores);
  };

  const updateSensorLocalizacao = (index, point) => {
    const newSensores = [...sensores];
    newSensores[index].localizacao = point;
    newSensores[index].lat = point[0].toString();
    newSensores[index].lng = point[1].toString();
    setSensores(newSensores);
  };

  const removeSensor = (index) => {
    setSensores(sensores.filter((_, i) => i !== index));
    if (activeSensorIndex === index) {
      setActiveSensorIndex(null);
    } else if (activeSensorIndex > index) {
      setActiveSensorIndex(activeSensorIndex - 1);
    }
  };

  const setActiveSensor = (index) => {
    setActiveSensorIndex(index);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar sensores
    for (const sensor of sensores) {
      if (!sensor.nome || !sensor.tipo || !sensor.unidade) {
        toast.error('Preencha nome, tipo e unidade para todos os sensores');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // Cadastrar sensores
      for (const sensor of sensores) {
        let localizacaoJson = null;
        
        // Usar a localização das coordenadas se disponível
        if (sensor.localizacao) {
          localizacaoJson = {
            type: 'Point',
            coordinates: [sensor.localizacao[1], sensor.localizacao[0]] // [lng, lat]
          };
        }
        // Se não tiver localização mas tiver lat/lng, usar essas
        else if (sensor.lat && sensor.lng && !isNaN(Number(sensor.lat)) && !isNaN(Number(sensor.lng))) {
          localizacaoJson = {
            type: 'Point',
            coordinates: [Number(sensor.lng), Number(sensor.lat)] // [lng, lat]
          };
        }

        // Tentar parsear parâmetros JSON
        let parametrosObj = {};
        try {
          parametrosObj = sensor.parametros ? JSON.parse(sensor.parametros) : {};
        } catch (err) {
          console.error('Erro ao parsear parâmetros JSON:', err);
        }

        const response = await fetch(`/api/lavouras/${params.id}/sensores`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nome: sensor.nome,
            tipo: sensor.tipo,
            unidade: sensor.unidade,
            parametros: parametrosObj,
            localizacao_json: localizacaoJson,
            talhao_id: params.id
          })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('Erro ao cadastrar sensor:', sensor.nome, errorData);
          throw new Error(errorData.error || `Erro ao cadastrar sensor ${sensor.nome}`);
        }
      }

      toast.success(`${sensores.length} sensor(es) cadastrados com sucesso!`);
      router.push(`/logged/monitoramento/${params.id}/sensores`);

    } catch (error) {
      console.error('Erro no cadastro:', error);
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!talhao) {
    return <div className="p-6">Carregando...</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Adicionar Sensores</h1>
        <p className="text-gray-600">Talhão: {talhao.nome}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <form onSubmit={handleSubmit}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Sensores</h2>
              <button
                type="button"
                onClick={addSensor}
                className="px-3 py-1 bg-green-500 text-white rounded text-sm"
              >
                + Adicionar Sensor
              </button>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {sensores.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Nenhum sensor adicionado ainda</p>
              ) : (
                sensores.map((sensor, index) => (
                  <div key={index} className={`p-4 border rounded ${activeSensorIndex === index ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-medium">Sensor {index + 1}</h3>
                      <button
                        type="button"
                        onClick={() => removeSensor(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Nome do Sensor*
                        </label>
                        <input
                          type="text"
                          className="w-full p-2 border rounded"
                          value={sensor.nome}
                          onChange={(e) => updateSensor(index, 'nome', e.target.value)}
                          placeholder="Ex: Sensor de Temperatura 1"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Tipo de Sensor*
                        </label>
                        <select
                          className="w-full p-2 border rounded"
                          value={sensor.tipo}
                          onChange={(e) => updateSensor(index, 'tipo', e.target.value)}
                          required
                        >
                          <option value="">Selecione...</option>
                          <option value="Temperatura">Temperatura</option>
                          <option value="Umidade">Umidade do Solo</option>
                          <option value="Pluviometro">Pluviômetro</option>
                          <option value="Pressao">Pressão Atmosférica</option>
                          <option value="Luminosidade">Luminosidade</option>
                          <option value="Outro">Outro</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Unidade de Medida*
                        </label>
                        <input
                          type="text"
                          className="w-full p-2 border rounded"
                          value={sensor.unidade}
                          onChange={(e) => updateSensor(index, 'unidade', e.target.value)}
                          placeholder="Ex: °C, %, mm, hPa, lux"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Parâmetros (JSON)
                        </label>
                        <textarea
                          className="w-full p-2 border rounded font-mono text-sm"
                          rows={2}
                          value={sensor.parametros}
                          onChange={(e) => updateSensor(index, 'parametros', e.target.value)}
                          placeholder='{"frequencia_leituras": 5, "limite_min": 0, "limite_max": 100}'
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Latitude
                          </label>
                          <input
                            type="number"
                            step="0.000001"
                            className="w-full p-2 border rounded"
                            value={sensor.lat}
                            onChange={(e) => updateSensor(index, 'lat', e.target.value)}
                            placeholder="Latitude"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Longitude
                          </label>
                          <input
                            type="number"
                            step="0.000001"
                            className="w-full p-2 border rounded"
                            value={sensor.lng}
                            onChange={(e) => updateSensor(index, 'lng', e.target.value)}
                            placeholder="Longitude"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setActiveSensor(index)}
                        className={`w-full py-2 text-sm rounded ${activeSensorIndex === index ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                      >
                        {activeSensorIndex === index ? 'Ativo - Clique no mapa para posicionar' : 'Selecionar para posicionar no mapa'}
                      </button>

                      {(sensor.localizacao || (sensor.lat && sensor.lng)) && (
                        <div className="text-sm text-green-600">
                          Localização: {sensor.lat || 'N/A'}, {sensor.lng || 'N/A'}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex space-x-4 mt-6">
              <button
                type="button"
                onClick={() => router.push(`/logged/monitoramento/${params.id}/sensores`)}
                className="flex-1 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Pular e Ir para Monitoramento
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
                disabled={isSubmitting || sensores.length === 0}
              >
                {isSubmitting ? "Salvando..." : "Salvar Sensores"}
              </button>
            </div>
          </form>
        </div>

        {/* Seção do Mapa para posicionamento do sensor */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-4">Localização dos Sensores</h2>
          <div className="h-96 rounded overflow-hidden mb-4">
            <MapPointEditor 
              fields={[
                {
                  id: talhao.id,
                  nome: talhao.nome,
                  coords: talhao.localizacao_json?.coordinates?.[0]?.map(coord => [coord[1], coord[0]]) || []
                }
              ]}
              selectedIds={[talhao.id]}
              sensorPoints={sensores.filter(s => s.localizacao || (s.lat && s.lng))}
              onPointUpdate={(point) => {
                if (activeSensorIndex !== null) {
                  updateSensorLocalizacao(activeSensorIndex, point);
                }
              }}
            />
          </div>
          <div className="text-sm text-gray-500">
            {activeSensorIndex !== null ? (
              <span className="text-blue-600">
                Clique no mapa para posicionar o sensor selecionado
              </span>
            ) : (
              <span>Selecione um sensor da lista para posicioná-lo no mapa</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}