'use client';

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import MapView from "@/components/maps/MapView";
import { Plus, Edit, Trash2, MapPin, Gauge, Calendar } from "lucide-react";

function SensoresLavoura() {
  const [sensores, setSensores] = useState([]);
  const [lavoura, setLavoura] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const params = useParams();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const lavouraId = params.id;

        // 1. Buscar lavoura
        const { data: lavouraData, error: lavouraError } = await supabase
          .from('lavouras')
          .select('*')
          .eq('id', lavouraId)
          .single();
        if (lavouraError) throw lavouraError;
        setLavoura(lavouraData);

        // 2. Buscar sensores
        const { data: sensoresData, error: sensoresError } = await supabase
          .from('sensores')
          .select('*')
          .eq('lavoura_id', lavouraId)
          .order('criado_em', { ascending: false });
        if (sensoresError) throw sensoresError;

        // 3. Buscar última leitura de cada sensor
        const sensoresComUltimaLeitura = await Promise.all(
          (sensoresData || []).map(async sensor => {
            const { data: dados, error: dadosError } = await supabase
              .from('dados_sensor')
              .select('valor, registrado_em')
              .eq('sensor_id', sensor.id)
              .order('registrado_em', { ascending: false })
              .limit(1);
            if (dadosError) console.error(dadosError);

            return {
              ...sensor,
              ultima_leitura: dados?.[0] || null
            };
          })
        );

        setSensores(sensoresComUltimaLeitura);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [params.id]);

  const formatDate = (dateString) => {
    if (!dateString) return "Nunca";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading) return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/80 z-50">
      <div className="text-center">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full border-b-2 border-green-600 h-16 w-16" />
        </div>
        <p className="mt-4 text-gray-600">Carregando sensores...</p>
      </div>
    </div>
  );


  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center text-red-500">
        <p className="text-lg font-semibold mb-2">Erro ao carregar</p>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );

  const sensoresComLocalizacao = sensores.filter(s => s.localizacao_json?.coordinates);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Sensores do Lavoura</h1>
        {lavoura && (
          <p className="text-gray-600 mt-2">
            {lavoura.nome} • {lavoura.tipo_cultura || 'Sem cultura definida'} • {lavoura.area || 0} ha
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tabela de Sensores */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Lista de Sensores</h2>
            <button
              onClick={() => router.push(`/protegido/monitoramento/${params.id}/sensores/adicionar`)}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-4 py-3 rounded-lg flex items-center gap-2 transition-all shadow-md hover:shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Adicionar Sensor
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-gray-600 uppercase text-xs font-medium">
                  <th className="px-4 py-3 rounded-l-lg">Sensor</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Última Leitura</th>
                  <th className="px-4 py-3 rounded-r-lg">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sensores.length > 0 ? sensores.map(sensor => (
                  <tr key={sensor.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-semibold text-gray-800">{sensor.nome}</p>
                        <p className="text-sm text-gray-500">{sensor.unidade || 'Sem unidade'}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        <Gauge className="w-3 h-3" />
                        {sensor.tipo}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-semibold text-gray-800">
                          {sensor.ultima_leitura?.valor ?? "-"} {sensor.unidade ?? ""}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(sensor.ultima_leitura?.registrado_em)}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => router.push(`/protegido/monitoramento/${params.id}/sensores/editar/${sensor.id}`)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar sensor"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm('Tem certeza que deseja excluir este sensor?')) {
                              const { error } = await supabase.from('sensores').delete().eq('id', sensor.id)
                              if (error) return alert('Erro ao excluir sensor')
                              setSensores(sensores.filter(s => s.id !== sensor.id))
                            }
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Excluir sensor"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" className="px-4 py-12 text-center">
                      <div className="text-gray-400 mb-2">
                        <Gauge className="w-12 h-12 mx-auto" />
                      </div>
                      <p className="text-gray-500">Nenhum sensor cadastrado</p>
                      <p className="text-sm text-gray-400 mt-1">Adicione sensores para começar o monitoramento</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mapa */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              Localização dos Sensores
            </h2>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              sensoresComLocalizacao.length > 0 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {sensoresComLocalizacao.length} com localização
            </span>
          </div>

          <div className="h-96 rounded-lg overflow-hidden border border-gray-200">
            {lavoura && (
              <MapView
                fields={[
                  {
                    id: lavoura.id,
                    nome: lavoura.nome,
                    coords: lavoura.localizacao_json?.coordinates?.[0]?.map(coord => [coord[1], coord[0]]) || []
                  }
                ]}
                selectedIds={[lavoura.id]}
                sensorPoints={sensoresComLocalizacao.map(sensor => ({
                  ...sensor,
                  popupContent: `
                    <div class="p-3">
                      <h4 class="font-semibold text-gray-800 mb-2">${sensor.nome}</h4>
                      <div class="space-y-1 text-sm">
                        <p><span class="font-medium">Tipo:</span> ${sensor.tipo}</p>
                        <p><span class="font-medium">Leitura:</span> ${sensor.ultima_leitura?.valor ?? '-'} ${sensor.unidade ?? ''}</p>
                        <p><span class="font-medium">Última atualização:</span> ${formatDate(sensor.ultima_leitura?.registrado_em)}</p>
                      </div>
                    </div>
                  `
                }))}
              />
            )}
          </div>

          <div className="mt-4 text-sm text-gray-500">
            {sensoresComLocalizacao.length > 0 ? (
              <p className="text-green-600">
                <MapPin className="w-4 h-4 inline mr-1" />
                {sensoresComLocalizacao.length} sensor(es) com localização definida no mapa
              </p>
            ) : (
              <p>
                <MapPin className="w-4 h-4 inline mr-1" />
                Nenhum sensor com localização definida
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SensoresLavoura;