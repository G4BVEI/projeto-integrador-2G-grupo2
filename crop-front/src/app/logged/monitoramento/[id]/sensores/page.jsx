'use client';

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import MapView from "@/components/lavouras/MapView";

function SensoresTalhao() {
  const [sensores, setSensores] = useState([]);
  const [talhao, setTalhao] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const params = useParams();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const talhaoId = params.id;

        // Fetch talhão
        const { data: talhaoData, error: talhaoError } = await supabase
          .from('talhoes')
          .select('*')
          .eq('id', talhaoId)
          .single();
        if (talhaoError) throw talhaoError;
        setTalhao(talhaoData);

        // Fetch sensores
        const { data: sensoresData, error: sensoresError } = await supabase
          .from('sensores')
          .select('*')
          .eq('talhao_id', talhaoId)
          .order('criado_em', { ascending: false });
        if (sensoresError) throw sensoresError;
        setSensores(sensoresData || []);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [params.id]);

  if (loading) {
    return <div className="p-4">Carregando sensores...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Erro: {error}</div>;
  }

  return (
    <div className="p-6">
      {/* Cabeçalho */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Sensores do Talhão</h1>
          {talhao && (
            <p className="text-gray-600">
              {talhao.nome} - {talhao.tipo_cultura}
            </p>
          )}
        </div>
        <button
          onClick={() => router.push(`/logged/monitoramento/${params.id}/sensores/adicionar`)}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2"
        >
          <span className="text-lg">+</span> Adicionar Sensor
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tabela de Sensores */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-gray-100 text-gray-600 uppercase text-xs">
                  <th className="px-4 py-3">Nome</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Unidade</th>
                  <th className="px-4 py-3">Ações</th>
                </tr>
              </thead>
              <tbody className="text-gray-800">
                {sensores.length > 0 ? (
                  sensores.map((sensor) => (
                    <tr key={sensor.id} className="hover:bg-gray-50 border-b">
                      <td className="px-4 py-3 font-medium">{sensor.nome}</td>
                      <td className="px-4 py-3">{sensor.tipo}</td>
                      <td className="px-4 py-3">{sensor.unidade}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => router.push(`/logged/monitoramento/${params.id}/sensores/editar/${sensor.id}`)}
                          className="text-blue-600 hover:underline mr-3"
                        >
                          Editar
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm('Tem certeza que deseja excluir este sensor?')) {
                              try {
                                const { error } = await supabase
                                  .from('sensores')
                                  .delete()
                                  .eq('id', sensor.id);
                                if (error) throw error;
                                setSensores(sensores.filter(s => s.id !== sensor.id));
                              } catch (err) {
                                console.error('Erro ao excluir sensor:', err);
                                alert('Erro ao excluir sensor');
                              }
                            }
                          }}
                          className="text-red-600 hover:underline"
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                      Nenhum sensor cadastrado ainda
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mapa */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-4">Localização dos Sensores</h2>
          <div className="h-96 rounded overflow-hidden">
            {talhao && (
              <MapView
                fields={[
                  {
                    id: talhao.id,
                    nome: talhao.nome,
                    coords: talhao.localizacao_json?.coordinates?.[0]?.map(coord => [coord[1], coord[0]]) || []
                  }
                ]}
                selectedIds={[talhao.id]}
                sensorPoints={sensores.filter(s => s.localizacao_json)}
              />
            )}
          </div>
          <div className="mt-3 text-sm text-gray-500">
            {sensores.filter(s => s.localizacao_json).length > 0 ? (
              <span className="text-green-600">
                {sensores.filter(s => s.localizacao_json).length} sensor(es) com localização definida
              </span>
            ) : (
              <span>Nenhum sensor com localização definida</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SensoresTalhao;
