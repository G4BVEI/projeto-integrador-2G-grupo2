"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function Monitoramento() {
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
      <div className="overflow-x-auto">
        <ul>

            {lavouras.length > 0 ? (
                lavouras.map((lavoura) => (
                    <li key={lavoura.id} className="p-4 mb-2 bg-white rounded shadow hover:bg-gray-50 cursor-pointer"
                        onClick={() => router.push(`/protegido/monitoramento/${lavoura.id}`)}>
                      <div className="flex justify-between items-center">
                        <div>
                          <h2 className="text-lg font-medium">{lavoura.nome}</h2>
                          <p className="text-gray-600">{lavoura.tipo_cultura || '-'}</p>
                        </div>
                        <div className="text-sm text-gray-500">
                          Criado em: {new Date(lavoura.criado_em).toLocaleDateString()}
                        </div>
                      </div>
                    </li>
              ))
            ) : (
                <li>Nenhuma lavoura adicionado ainda</li>
            )}
        </ul>
    </div>
  );
}

export default Monitoramento;