"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function Monitoramento() {
  const [talhoes, setTalhoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function fetchTalhoes() {
      try {
        setLoading(true);
        
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          throw userError || new Error("Usuário não autenticado");
        }

        // Fetch talhoes only for this user
        const { data, error } = await supabase
          .from('talhoes')
          .select('*')
          .eq('user_id', user.id)
          .order('criado_em', { ascending: false });

        if (error) throw error;

        setTalhoes(data || []);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching talhoes:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchTalhoes();
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
      <div className="overflow-x-auto">
        <ul>

            {talhoes.length > 0 ? (
                talhoes.map((talhao) => (
                    <li key={talhao.id} className="p-4 mb-2 bg-white rounded shadow hover:bg-gray-50 cursor-pointer"
                        onClick={() => router.push(`/logged/monitoramento/${talhao.id}`)}>
                      <div className="flex justify-between items-center">
                        <div>
                          <h2 className="text-lg font-medium">{talhao.nome}</h2>
                          <p className="text-gray-600">{talhao.tipo_cultura || '-'}</p>
                        </div>
                        <div className="text-sm text-gray-500">
                          Criado em: {new Date(talhao.criado_em).toLocaleDateString()}
                        </div>
                      </div>
                    </li>
              ))
            ) : (
                <li>Nenhum talhão adicionado ainda</li>
            )}
        </ul>
    </div>
  );
}

export default Monitoramento;