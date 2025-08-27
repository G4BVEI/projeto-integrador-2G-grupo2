"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "react-hot-toast";

function GerenciamentoAtividades() {
  const [atividades, setAtividades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function fetchAtividades() {
      try {
        setLoading(true);
        
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          throw userError || new Error("Usuário não autenticado");
        }

        // Fetch atividades with talhao info
        const { data, error } = await supabase
          .from('atividades')
          .select(`
            *,
            talhoes:nome
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;

        setAtividades(data || []);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching atividades:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchAtividades();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pendente': return 'bg-yellow-100 text-yellow-800';
      case 'em_andamento': return 'bg-blue-100 text-blue-800';
      case 'concluida': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pendente': return 'Pendente';
      case 'em_andamento': return 'Em Andamento';
      case 'concluida': return 'Concluída';
      default: return status;
    }
  };

  const handleNovaAtividade = () => {
    router.push('/protegido/atividades/nova');
  };

  if (loading) return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/80 z-50">
      <div className="text-center">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full border-b-2 border-green-600 h-16 w-16" />
        </div>
        <p className="mt-4 text-gray-600">Carregando atividades...</p>
      </div>
    </div>
  );

  if (error) {
    return <div className="p-4 text-red-500">Erro: {error}</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gerenciamento de Atividades</h1>
        <button 
          onClick={handleNovaAtividade}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <span className="text-lg">+</span>
          Nova Atividade
        </button>
      </div>

      <div className="overflow-x-auto">
        <ul>
          {atividades.length > 0 ? (
            atividades.map((atividade) => (
              <li key={atividade.id} className="p-4 mb-4 bg-white rounded shadow hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h2 className="text-lg font-medium">{atividade.tipo_atividade}</h2>
                    <p className="text-gray-600 mt-1">{atividade.descricao}</p>
                    
                    <div className="flex items-center mt-2 text-sm text-gray-500">
                      <span className="mr-4">
                        <strong>Responsável:</strong> {atividade.responsavel}
                      </span>
                      <span className="mr-4">
                        <strong>Início:</strong> {new Date(atividade.data_inicio).toLocaleDateString('pt-BR')}
                      </span>
                      <span>
                        <strong>Conclusão:</strong> {new Date(atividade.data_conclusao).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(atividade.status)} mb-2`}>
                      {getStatusText(atividade.status)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(atividade.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 mt-3">
                  <button 
                    onClick={() => router.push(`/protegido/atividades/${atividade.id}/editar`)}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  >
                    Editar
                  </button>
                  <button 
                    onClick={() => router.push(`/protegido/atividades/${atividade.id}`)}
                    className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
                  >
                    Detalhes
                  </button>
                </div>
              </li>
            ))
          ) : (
            <li className="p-4 text-center text-gray-500">
              Nenhuma atividade cadastrada ainda
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

export default GerenciamentoAtividades;