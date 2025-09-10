"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function ListaLavouras() {
  const [lavouras, setLavouras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function fetchLavouras() {
      try {
        setLoading(true);
        
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          throw userError || new Error("Usuário não autenticado");
        }

        // Fetch lavouras only for this user
        const { data, error } = await supabase
          .from('lavouras')
          .select('*')
          .eq('user_id', user.id)
          .order('criado_em', { ascending: false });

        if (error) throw error;

        setLavouras(data || []);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching lavouras:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchLavouras();
  }, []);

  if (loading) return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/80 z-50">
      <div className="text-center">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full border-b-2 border-green-600 h-16 w-16" />
        </div>
        <p className="mt-4 text-gray-600">Carregando lavouras...</p>
      </div>
    </div>
  );

  if (error) {
    return <div className="p-4 text-red-500">Erro: {error}</div>;
  }

  return (
    <div className="-mt-4 -ml-5">
      {/* Botão de Adicionar */}
      <div className="mb-4">
        <button
          onClick={() => router.push("/protegido/lavouras/adicionar")}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2"
        >
          <span className="text-lg">+</span> Adicionar Lavoura
        </button>
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-gray-100 text-gray-600 uppercase text-xs">
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Tipo de Cultura</th>
              <th className="px-4 py-3">Sistema de Irrigação</th>
              <th className="px-4 py-3">Data de Plantio</th>
              <th className="px-4 py-3">Área (ha)</th>
              <th className="px-4 py-3">Ações</th>
            </tr>
          </thead>
          <tbody className="text-gray-800">
            {lavouras.length > 0 ? (
              lavouras.map((lavoura) => (
                <tr key={lavoura.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{lavoura.nome}</td>
                  <td className="px-4 py-3">{lavoura.tipo_cultura}</td>
                  <td className="px-4 py-3">{lavoura.sistema_irrigacao}</td>
                  <td className="px-4 py-3">
                    {lavoura.data_plantio ? new Date(lavoura.data_plantio).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-4 py-3">{lavoura.area ? `${lavoura.area} ha` : '-'}</td>
                  <td className="px-4 py-3">
                    <button 
                      onClick={() => router.push(`/protegido/monitoramento/${lavoura.id}`)}
                      className="text-green-600 hover:underline mr-3"
                    >
                      Detalhes
                    </button>
                    <button 
                      onClick={() => router.push(`/protegido/monitoramento/${lavoura.id}/editar`)}
                      className="text-blue-600 hover:underline"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-4 py-3 text-center text-gray-500">
                  Nenhum lavoura cadastrado ainda
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ListaLavouras;