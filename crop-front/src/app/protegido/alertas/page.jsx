"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle, RefreshCw, Trash2 } from "lucide-react";

export default function Alertas() {
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [verificando, setVerificando] = useState(false);

  useEffect(() => {
    fetchAlertas();
  }, []);

  const fetchAlertas = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/alertas');
      
      if (!response.ok) {
        throw new Error('Erro ao buscar alertas');
      }
      
      const data = await response.json();
      
      // Ordenar: não verificados primeiro, depois verificados (por data mais recente)
      const alertasOrdenados = data.sort((a, b) => {
        // Primeiro ordena por status de verificação (não verificados primeiro)
        if (a.verificado && !b.verificado) return 1;
        if (!a.verificado && b.verificado) return -1;
        
        // Se ambos têm o mesmo status, ordena por data (mais recente primeiro)
        return new Date(b.criado_em) - new Date(a.criado_em);
      });
      
      setAlertas(alertasOrdenados);
    } catch (err) {
      setError(err.message);
      console.error("Erro ao buscar alertas:", err);
    } finally {
      setLoading(false);
    }
  };

  const verificarNovosAlertas = async () => {
    try {
      setVerificando(true);
      const response = await fetch('/api/alertas', {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error('Erro ao verificar novos alertas');
      }
      
      const result = await response.json();
      
      if (result.novos_alertas > 0) {
        await fetchAlertas();
      }
      
      alert(`Verificação concluída. ${result.novos_alertas} novo(s) alerta(s) encontrado(s).`);
    } catch (err) {
      setError(err.message);
      console.error("Erro ao verificar alertas:", err);
    } finally {
      setVerificando(false);
    }
  };

  const marcarComoVerificado = async (alertaId) => {
    try {
      const response = await fetch(`/api/alertas/${alertaId}`, {
        method: 'PATCH',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao marcar alerta como verificado');
      }
      
      const updatedAlerta = await response.json();
      
      // Atualizar a lista mantendo a ordenação
      setAlertas(prevAlertas => {
        const novosAlertas = prevAlertas.map(alerta => 
          alerta.id === alertaId ? { ...alerta, verificado: true, verificado_em: new Date().toISOString() } : alerta
        );
        
        // Reordenar após a atualização
        return novosAlertas.sort((a, b) => {
          if (a.verificado && !b.verificado) return 1;
          if (!a.verificado && b.verificado) return -1;
          return new Date(b.criado_em) - new Date(a.criado_em);
        });
      });
      
    } catch (err) {
      console.error('Erro ao marcar alerta como verificado:', err);
      alert(`Erro ao marcar alerta como verificado: ${err.message}`);
    }
  };

  const deletarAlerta = async (alertaId) => {
    if (!confirm('Tem certeza que deseja deletar este alerta?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/alertas/${alertaId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao deletar alerta');
      }
      
      setAlertas(alertas.filter(alerta => alerta.id !== alertaId));
      alert('Alerta deletado com sucesso!');
      
    } catch (err) {
      console.error('Erro ao deletar alerta:', err);
      alert(`Erro ao deletar alerta: ${err.message}`);
    }
  };

  // Separar alertas verificados e não verificados para exibição
  const alertasNaoVerificados = alertas.filter(alerta => !alerta.verificado);
  const alertasVerificados = alertas.filter(alerta => alerta.verificado);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 z-50">
        <div className="text-center">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full border-b-2 border-green-600 h-16 w-16" />
          </div>
          <p className="mt-4 text-gray-600">Buscando alertas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-500">
          <p className="text-lg font-semibold mb-2">Erro ao carregar alertas</p>
          <p>{error}</p>
          <button
            onClick={fetchAlertas}
            className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <AlertTriangle className="text-yellow-500" />
              Alertas do Sistema
            </h1>
            <p className="text-gray-600 mt-1">Monitoramento de condições anômalas nas lavouras</p>
          </div>
          <button
            onClick={verificarNovosAlertas}
            disabled={verificando}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${verificando ? 'animate-spin' : ''}`} />
            {verificando ? 'Verificando...' : 'Verificar Novos Alertas'}
          </button>
        </div>

        {alertas.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Nenhum alerta no momento</h2>
            <p className="text-gray-600">Todos os sensores estão reportando valores dentro dos parâmetros normais.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Alertas Não Verificados */}
            {alertasNaoVerificados.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <AlertTriangle className="text-red-500 w-5 h-5" />
                  Alertas Ativos ({alertasNaoVerificados.length})
                </h2>
                <div className="space-y-4">
                  {alertasNaoVerificados.map((alerta) => (
                    <AlertaCard 
                      key={alerta.id} 
                      alerta={alerta} 
                      onVerificar={marcarComoVerificado}
                      onDeletar={deletarAlerta}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Alertas Verificados */}
            {alertasVerificados.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <CheckCircle className="text-green-500 w-5 h-5" />
                  Alertas Verificados ({alertasVerificados.length})
                </h2>
                <div className="space-y-4">
                  {alertasVerificados.map((alerta) => (
                    <AlertaCard 
                      key={alerta.id} 
                      alerta={alerta} 
                      onVerificar={marcarComoVerificado}
                      onDeletar={deletarAlerta}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Componente separado para o card de alerta
function AlertaCard({ alerta, onVerificar, onDeletar }) {
  return (
    <div className={`bg-white p-6 rounded-xl shadow-lg border ${alerta.verificado ? 'border-green-100 border-l-4 border-l-green-500' : 'border-red-100 border-l-4 border-l-red-500'}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-800">
              Alerta no {alerta.lavouras?.nome} - {alerta.lavouras?.tipo_cultura}
            </h3>
            {alerta.verificado && (
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                Verificado
              </span>
            )}
          </div>
          <p className="text-gray-700 mb-2">
            O sensor <strong>{alerta.sensores?.nome}</strong> ({alerta.sensores?.tipo}) detectou um valor fora do normal:{" "}
            <strong>{alerta.valor_medido} {alerta.sensores?.unidade}</strong>
          </p>
          <p className="text-red-600 font-medium mb-3">{alerta.mensagem}</p>
          <p className="text-sm text-gray-500">
            Detectado em: {new Date(alerta.criado_em).toLocaleString('pt-BR')}
          </p>
          {alerta.verificado && alerta.verificado_em && (
            <p className="text-sm text-green-600 mt-1">
              Verificado em: {new Date(alerta.verificado_em).toLocaleString('pt-BR')}
            </p>
          )}
        </div>
        <div className="ml-4 flex flex-col gap-2">
          {!alerta.verificado && (
            <button
              onClick={() => onVerificar(alerta.id)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm"
            >
              Marcar como verificado
            </button>
          )}
          <button
            onClick={() => onDeletar(alerta.id)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm flex items-center justify-center gap-1"
          >
            <Trash2 className="w-4 h-4" />
            Deletar
          </button>
          <Link
            href={`/protegido/monitoramento/${alerta.lavoura_id}/sensores/editar/${alerta.sensor_id}`}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm text-center"
          >
            Ver Sensor
          </Link>
          <Link
            href={`/protegido/monitoramento/${alerta.lavoura_id}`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm text-center"
          >
            Ver Lavoura
          </Link>
        </div>
      </div>
    </div>
  );
}