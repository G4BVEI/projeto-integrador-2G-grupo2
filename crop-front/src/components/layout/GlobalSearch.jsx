'use client';

import React, { useState, useEffect } from "react";
import { Search, X, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Índice de busca com todas as rotas
const searchIndex = [
  {
    path: 
'/protegido/dashboard',
    title: 'Dashboard',
    description: 'Página inicial do sistema',
    category: 'Geral'
  },
  {
    path: 
'/protegido/dashboard/atividades',
    title: 'Atividades',
    description: 'Visualizar atividades do sistema',
    category: 'Dashboard'
  },
  {
    path: 
'/protegido/lavouras',
    title: 'Lavouras',
    description: 'Gerenciamento de lavouras',
    category: 'Lavouras'
  },
  {
    path: 
'/protegido/lavouras/adicionar',
    title: 'Adicionar Lavoura',
    description: 'Criar nova lavoura',
    category: 'Lavouras'
  },
  {
    path: 
'/protegido/monitoramento',
    title: 'Monitoramento',
    description: 'Acompanhamento de talhões',
    category: 'Monitoramento',
    requiresContext: true,
    contextPrompt: 'Monitoramento de qual talhão?',
    contextQuery: 'talhoes'
  },
  {
    path: 
'/protegido/monitoramento/[id]',
    title: 'Detalhes do Talhão',
    description: 'Detalhes e métricas do talhão',
    category: 'Monitoramento',
    requiresContext: true,
    contextPrompt: 'Qual talhão deseja visualizar?',
    contextQuery: 'talhoes'
  },
  {
    path: 
'/protegido/monitoramento/[id]/editar',
    title: 'Editar Talhão',
    description: 'Editar informações do talhão',
    category: 'Monitoramento',
    requiresContext: true,
    contextPrompt: 'Qual talhão deseja editar?',
    contextQuery: 'talhoes'
  },
  {
    path: 
'/protegido/monitoramento/[id]/sensores',
    title: 'Sensores do Talhão',
    description: 'Gerenciar sensores do talhão',
    category: 'Monitoramento',
    requiresContext: true,
    contextPrompt: 'Sensores de qual talhão?',
    contextQuery: 'talhoes'
  },
  {
    path: 
'/protegido/monitoramento/[id]/sensores/adicionar',
    title: 'Adicionar Sensor',
    description: 'Adicionar novo sensor ao talhão',
    category: 'Monitoramento',
    requiresContext: true,
    contextPrompt: 'Adicionar sensor em qual talhão?',
    contextQuery: 'talhoes'
  },
  {
    path: 
'/protegido/monitoramento/[id]/sensores/editar/[sensorId]',
    title: 'Editar Sensor',
    description: 'Editar informações do sensor',
    category: 'Monitoramento',
    requiresContext: true,
    contextLevels: [
      {
        prompt: 'Editar sensor de qual talhão?',
        query: 'talhoes',
        param: 'id'
      },
      {
        prompt: 'Qual sensor deseja editar?',
        query: 'sensores',
        param: 'sensorId',
        dependsOn: 'id' // Depende do talhão selecionado
      }
    ]
  },
  {
    path: 
'/protegido/clima',
    title: 'Clima',
    description: 'Previsão do tempo e condições climáticas',
    category: 'Clima'
  },
  {
    path: 
'/protegido/atividades/novo',
    title: 'Nova Atividade',
    description: 'Registrar nova atividade',
    category: 'Atividades'
  },
  {
    path: 
'/protegido/perfil',
    title: 'Perfil',
    description: 'Editar informações do perfil',
    category: 'Perfil'
  },
  {
    path: 
'/protegido/notificacoes',
    title: 'Notificações',
    description: 'Central de notificações',
    category: 'Sistema'
  }
];

export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const [contextLevel, setContextLevel] = useState(0);
  const [contextData, setContextData] = useState({});
  const [contextOptions, setContextOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Buscar opções de contexto
  const fetchContextOptions = async (contextQuery, dependsOnValue = null) => {
    setLoading(true);
    try {
      let data = [];
      
      if (contextQuery === 'talhoes') {
        const { data: talhoes, error } = await supabase
          .from('talhoes')
          .select('id, nome')
          .order('nome');
        
        if (!error) data = talhoes;
      }
      else if (contextQuery === 'sensores' && dependsOnValue) {
        const { data: sensores, error } = await supabase
          .from('sensores')
          .select('id, nome, tipo')
          .eq('talhao_id', dependsOnValue)
          .order('nome');
        
        if (!error) data = sensores;
      }
      
      setContextOptions(data);
    } catch (error) {
      console.error('Erro ao buscar opções:', error);
    } finally {
      setLoading(false);
    }
  };

  // Função de busca
  const handleSearch = (searchQuery) => {
    setQuery(searchQuery);
    
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    const searchTerm = searchQuery.toLowerCase().trim();
    const filteredResults = searchIndex.filter(item =>
      item.title.toLowerCase().includes(searchTerm) ||
      item.description.toLowerCase().includes(searchTerm) ||
      item.path.toLowerCase().includes(searchTerm)
    );

    setResults(filteredResults);
  };

  // Selecionar um resultado
  const handleSelectResult = (result) => {
    if (result.requiresContext) {
      setSelectedResult(result);
      setContextLevel(0);
      setContextData({});
      
      // Buscar opções para o primeiro nível de contexto
      const firstLevel = result.contextLevels[0];
      fetchContextOptions(firstLevel.query);
    } else {
      router.push(result.path);
      setIsOpen(false);
      setQuery('');
    }
  };

  // Selecionar uma opção de contexto
  const handleSelectContextOption = (option) => {
    if (selectedResult) {
      const currentLevel = selectedResult.contextLevels[contextLevel];
      
      // Atualizar dados de contexto
      const newContextData = {
        ...contextData,
        [currentLevel.param]: option.id
      };
      
      setContextData(newContextData);

      // Verificar se há mais níveis
      if (contextLevel < selectedResult.contextLevels.length - 1) {
        // Avançar para o próximo nível
        const nextLevel = selectedResult.contextLevels[contextLevel + 1];
        const dependsOnValue = newContextData[nextLevel.dependsOn];
        
        setContextLevel(contextLevel + 1);
        fetchContextOptions(nextLevel.query, dependsOnValue);
      } else {
        // Último nível - navegar para a página
        let finalPath = selectedResult.path;
        
        // Substituir todos os parâmetros na rota
        Object.entries(newContextData).forEach(([param, value]) => {
          finalPath = finalPath.replace(`[${param}]`, value);
        });
        
        router.push(finalPath);
        setIsOpen(false);
        setQuery('');
        setSelectedResult(null);
        setContextLevel(0);
        setContextData({});
      }
    }
  };

  // Voltar para o nível anterior
  const handleBackContext = () => {
    if (contextLevel > 0) {
      const previousLevel = selectedResult.contextLevels[contextLevel - 1];
      setContextLevel(contextLevel - 1);
      
      // Limpar dados dos níveis posteriores
      const newContextData = { ...contextData };
      selectedResult.contextLevels.slice(contextLevel).forEach(level => {
        delete newContextData[level.param];
      });
      setContextData(newContextData);
      
      // Recarregar opções do nível anterior
      const dependsOnValue = previousLevel.dependsOn ? newContextData[previousLevel.dependsOn] : null;
      fetchContextOptions(previousLevel.query, dependsOnValue);
    } else {
      // Voltar para os resultados da busca
      setSelectedResult(null);
      setContextLevel(0);
      setContextData({});
    }
  };

  // Fechar busca
  const handleClose = () => {
    setIsOpen(false);
    setQuery('');
    setSelectedResult(null);
    setContextLevel(0);
    setContextData({});
    setResults([]);
  };

  // ... (código de efeitos para teclas e clique fora permanece o mesmo) ...

  return (
    <div className="relative search-container">
      {/* Input de busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Buscar páginas..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="w-64 pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
        {query && (
          <button
            onClick={handleClose}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Modal de resultados */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {selectedResult ? (
            // Visualização de contexto com múltiplos níveis
            <div className="p-4">
              <div className="flex items-center mb-4">
                <button
                  onClick={handleBackContext}
                  className="text-gray-500 hover:text-gray-700 mr-2"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" />
                </button>
                <h3 className="font-semibold">
                  {selectedResult.contextLevels[contextLevel].prompt}
                </h3>
              </div>
              
              {/* Breadcrumb dos níveis */}
              {selectedResult.contextLevels.length > 1 && (
                <div className="flex items-center gap-1 text-xs text-gray-500 mb-4">
                  {selectedResult.contextLevels.slice(0, contextLevel + 1).map((level, index) => (
                    <React.Fragment key={index}>
                      {index > 0 && <span>›</span>}
                      <span className={index === contextLevel ? 'text-green-600 font-medium' : ''}>
                        {level.prompt.split(' ')[0]}
                      </span>
                    </React.Fragment>
                  ))}
                </div>
              )}
              
              {loading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500 mx-auto"></div>
                </div>
              ) : (
                <div className="space-y-2">
                  {contextOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleSelectContextOption(option)}
                      className="w-full text-left p-3 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                    >
                      <div className="font-medium">{option.nome}</div>
                      {option.tipo && (
                        <div className="text-sm text-gray-500">Tipo: {option.tipo}</div>
                      )}
                      {option.area && (
                        <div className="text-sm text-gray-500">Área: {option.area} ha</div>
                      )}
                    </button>
                  ))}
                  
                  {contextOptions.length === 0 && !loading && (
                    <div className="text-center text-gray-500 py-4">
                      {contextLevel === 0 ? 'Nenhum talhão encontrado' : 'Nenhum sensor encontrado'}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            // Visualização normal de resultados
            <>
              {results.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {results.map((result) => (
                    <button
                      key={result.path}
                      onClick={() => handleSelectResult(result)}
                      className="w-full text-left p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="font-medium text-green-700">{result.title}</div>
                      <div className="text-sm text-gray-500">{result.description}</div>
                      <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                        <span className="bg-gray-100 px-2 py-1 rounded">{result.category}</span>
                        {result.requiresContext && (
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            Seleção necessária
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : query ? (
                <div className="p-4 text-center text-gray-500">
                  Nenhum resultado encontrado para "{query}"
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  Digite para buscar páginas
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}