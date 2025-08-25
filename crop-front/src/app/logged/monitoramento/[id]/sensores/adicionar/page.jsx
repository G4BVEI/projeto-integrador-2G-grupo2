'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { createClient } from '@/lib/supabase/client';
import MapPointEditor from '@/components/maps/MapPointEditor';
import { Thermometer, Droplets, CloudRain, Zap, Sun, Square, Save, MapPin, TestTube } from 'lucide-react';

// Mapeamento de tipos para unidades padrão
const tipoUnidades = {
  "Temperatura": "°C",
  "Umidade": "%",
  "Pluviometro": "mm",
  "Pressao": "hPa",
  "Luminosidade": "lux",
  "pH": " "
};

// Ícones para cada tipo de sensor
const tipoIconos = {
  "Temperatura": <Thermometer className="w-5 h-5 text-red-500" />,
  "Umidade": <Droplets className="w-5 h-5 text-blue-500" />,
  "Pluviometro": <CloudRain className="w-5 h-5 text-blue-600" />,
  "Pressao": <Zap className="w-5 h-5 text-yellow-500" />,
  "Luminosidade": <Sun className="w-5 h-5 text-orange-400" />,
  "pH": <TestTube className="w-5 h-5 text-purple-500" />
};

export default function AdicionarSensor() {
  const [formData, setFormData] = useState({
    nome: '',
    tipo: '',
    unidade: '',
    parametros: '',
    latitude: '',
    longitude: ''
  });
  const [talhao, setTalhao] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();

  // Buscar dados do talhão
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

  // Atualizar unidade automaticamente quando o tipo mudar
  useEffect(() => {
    if (formData.tipo && tipoUnidades[formData.tipo]) {
      setFormData(prev => ({
        ...prev,
        unidade: tipoUnidades[formData.tipo]
      }));
    }
  }, [formData.tipo]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePointUpdate = (newPoint) => {
    setFormData(prev => ({
      ...prev,
      latitude: newPoint[0].toFixed(6),
      longitude: newPoint[1].toFixed(6)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Parse parâmetros JSON
      let parametrosObj = {};
      if (formData.parametros) {
        try {
          parametrosObj = JSON.parse(formData.parametros);
        } catch {
          throw new Error('Parâmetros devem estar em formato JSON válido');
        }
      }

      // Preparar localização do sensor
      let localizacaoJson = null;
      if (formData.latitude && formData.longitude) {
        localizacaoJson = {
          type: 'Point',
          coordinates: [Number(formData.longitude), Number(formData.latitude)]
        };
      }

      const response = await fetch(`/api/lavouras/${params.id}/sensores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: formData.nome,
          tipo: formData.tipo,
          unidade: formData.unidade,
          parametros: parametrosObj,
          localizacao_json: localizacaoJson,
          talhao_id: params.id
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erro ao cadastrar sensor');
      }

      const data = await response.json();
      toast.success(`Sensor "${data.nome}" cadastrado com sucesso!`);
      router.push(`/logged/monitoramento/${params.id}/sensores`);

    } catch (err) {
      console.error('Erro no cadastro:', err);
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!talhao) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          {formData.tipo ? tipoIconos[formData.tipo] : <Square className="w-8 h-8 text-gray-400" />}
          Adicionar Sensor
        </h1>
        <p className="text-gray-600 mt-2">
          Talhão: <span className="font-semibold text-green-700">{talhao.nome}</span>
          {talhao.tipo_cultura && ` • ${talhao.tipo_cultura}`}
          {talhao.area && ` • ${talhao.area} ha`}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulário */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Informações do Sensor</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Sensor *
              </label>
              <input
                type="text"
                name="nome"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="Ex: Sensor de Temperatura Norte"
                value={formData.nome}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Sensor *
              </label>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(tipoUnidades).map(([tipo, unidade]) => (
                  <button
                    key={tipo}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, tipo }))}
                    className={`p-4 border-2 rounded-lg text-center transition-all ${
                      formData.tipo === tipo
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      {tipoIconos[tipo]}
                      <span className="text-sm font-medium">{tipo}</span>
                      {unidade && (
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          {unidade}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unidade de Medida *
              </label>
              <input
                type="text"
                name="unidade"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                value={formData.unidade}
                onChange={handleInputChange}
                required
                placeholder="Ex: °C, %, mm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Unidade padrão para {formData.tipo || 'este tipo'} é {tipoUnidades[formData.tipo] || 'não definida'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Parâmetros Avançados (JSON)
              </label>
              <textarea
                name="parametros"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all font-mono text-sm"
                rows={4}
                value={formData.parametros}
                onChange={handleInputChange}
                placeholder='{"frequencia_leituras": 5, "limite_min": 0, "limite_max": 100, "calibracao": 1.0}'
              />
              <p className="text-xs text-gray-500 mt-1">
                Configure parâmetros específicos do sensor em formato JSON
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !formData.nome || !formData.tipo || !formData.unidade}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 text-white py-3 px-6 rounded-lg font-medium transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:shadow-none"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Cadastrar Sensor
                </>
              )}
            </button>
          </form>
        </div>

        {/* Mapa */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              Localização do Sensor
            </h2>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              Opcional
            </span>
          </div>

          <div className="h-96 rounded-lg overflow-hidden border border-gray-200 mb-4">
            <MapPointEditor
              fields={[{
                id: talhao.id,
                nome: talhao.nome,
                coords: talhao.localizacao_json?.coordinates?.[0]?.map(c => [c[1], c[0]]) || []
              }]}
              selectedIds={[talhao.id]}
              initialPoint={formData.latitude && formData.longitude
                ? [Number(formData.latitude), Number(formData.longitude)]
                : null}
              onPointUpdate={handlePointUpdate}
            />
          </div>

          {formData.latitude && formData.longitude ? (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-sm font-medium">
                📍 Localização definida
              </p>
              <p className="text-green-700 text-xs mt-1">
                Lat: {formData.latitude} | Long: {formData.longitude}
              </p>
            </div>
          ) : (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 text-sm">
                🗺️ Clique no mapa para definir a localização do sensor
              </p>
            </div>
          )}

          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Tipos de Sensor:</h3>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
              <div>🌡️ Temperatura (°C)</div>
              <div>💧 Umidade (%)</div>
              <div>🌧️ Pluviômetro (mm)</div>
              <div>⚡ Pressão (hPa)</div>
              <div>☀️ Luminosidade (lux)</div>
              <div>🧪 pH (personalizado)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}