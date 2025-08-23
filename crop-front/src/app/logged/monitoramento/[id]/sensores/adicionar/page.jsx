'use client'

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { createClient } from '@/lib/supabase/client';
import MapPointEditor from '@/components/lavouras/MapPointEditor';

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

  if (!talhao) return <div className="p-6">Carregando...</div>;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Adicionar Sensor</h1>
        <p className="text-gray-600">Talhão: {talhao.nome}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulário */}
        <div className="bg-white p-6 rounded-lg shadow">
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome do Sensor*</label>
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
                <label className="block text-sm font-medium mb-1">Tipo de Sensor*</label>
                <select
                  name="tipo"
                  className="w-full p-2 border rounded"
                  value={formData.tipo}
                  onChange={handleInputChange}
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
                <label className="block text-sm font-medium mb-1">Unidade de Medida*</label>
                <input
                  type="text"
                  name="unidade"
                  className="w-full p-2 border rounded"
                  value={formData.unidade}
                  onChange={handleInputChange}
                  placeholder="Ex: °C, %, mm, hPa, lux"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Parâmetros (JSON)</label>
                <textarea
                  name="parametros"
                  className="w-full p-2 border rounded font-mono text-sm"
                  rows={4}
                  value={formData.parametros}
                  onChange={handleInputChange}
                  placeholder='Ex: {"frequencia_leituras": 5, "limite_min": 0, "limite_max": 100}'
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    className="w-full p-2 border rounded"
                    value={formData.latitude}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    className="w-full p-2 border rounded"
                    value={formData.longitude}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Salvando...' : 'Salvar Sensor'}
            </button>
          </form>
        </div>

        {/* Mapa */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-4">Localização do Sensor (Opcional)</h2>
          <div className="h-96 rounded overflow-hidden mb-4">
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
          {formData.latitude && formData.longitude && (
            <p className="text-sm text-green-600">
              Localização definida: {formData.latitude}, {formData.longitude}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
