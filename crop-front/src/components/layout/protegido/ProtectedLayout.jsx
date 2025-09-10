"use client"

import React, { useState, useEffect } from "react"
import { Menu, Bell, User, Home, Leaf, Wrench, Cloud, Info, Search, X, ChevronRight, AlertTriangle, RefreshCw , CheckCircle} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

// Índice de busca com todas as rotas
const searchIndex = [
  {
    path: "/protegido/dashboard",
    title: "Dashboard",
    description: "Página inicial do sistema",
    category: "Geral",
  },
  {
    path: "/protegido/dashboard/atividades",
    title: "Atividades",
    description: "Visualizar atividades do sistema",
    category: "Dashboard",
  },
  {
    path: "/protegido/lavouras",
    title: "Lavouras",
    description: "Gerenciamento de lavouras",
    category: "Lavouras",
  },
  {
    path: "/protegido/lavouras/adicionar",
    title: "Adicionar Lavoura",
    description: "Criar nova lavoura",
    category: "Lavouras",
  },
  {
    path: "/protegido/monitoramento",
    title: "Monitoramento",
    description: "Acompanhamento de lavouras",
    category: "Monitoramento",
    requiresContext: true,
    contextPrompt: "Monitoramento de qual lavoura?",
    contextQuery: "lavouras",
  },
  {
    path: "/protegido/monitoramento/[id]",
    title: "Detalhes da Lavoura",
    description: "Detalhes e métricas da lavoura",
    category: "Monitoramento",
    requiresContext: true,
    contextPrompt: "Qual lavoura deseja visualizar?",
    contextQuery: "lavouras",
  },
  {
    path: "/protegido/monitoramento/[id]/editar",
    title: "Editar Lavoura",
    description: "Editar informações da lavoura",
    category: "Monitoramento",
    requiresContext: true,
    contextPrompt: "Qual lavoura deseja editar?",
    contextQuery: "lavouras",
  },
  {
    path: "/protegido/monitoramento/[id]/sensores",
    title: "Sensores da Lavoura",
    description: "Gerenciar sensores da lavoura",
    category: "Monitoramento",
    requiresContext: true,
    contextPrompt: "Sensores de qual lavoura?",
    contextQuery: "lavouras",
  },
  {
    path: "/protegido/monitoramento/[id]/sensores/adicionar",
    title: "Adicionar Sensor",
    description: "Adicionar novo sensor à lavoura",
    category: "Monitoramento",
    requiresContext: true,
    contextPrompt: "Adicionar sensor em qual lavoura?",
    contextQuery: "lavouras",
  },
  {
    path: "/protegido/monitoramento/[id]/sensores/editar/[sensorId]",
    title: "Editar Sensor",
    description: "Editar informações do sensor",
    category: "Monitoramento",
    requiresContext: true,
    contextLevels: [
      {
        prompt: "Editar sensor de qual lavoura?",
        query: "lavouras",
        param: "id",
      },
      {
        prompt: "Qual sensor deseja editar?",
        query: "sensores",
        param: "sensorId",
        dependsOn: "id",
      },
    ],
  },
  {
    path: "/protegido/clima",
    title: "Clima",
    description: "Previsão do tempo e condições climáticas",
    category: "Clima",
  },
  {
    path: "/protegido/atividades/novo",
    title: "Nova Atividade",
    description: "Registrar nova atividade",
    category: "Atividades",
  },
  {
    path: "/protegido/perfil",
    title: "Perfil",
    description: "Editar informações do perfil",
    category: "Perfil",
  },
  {
    path: "/protegido/alertas",
    title: "Alertas",
    description: "Central de notificações do sistema",
    category: "Sistema",
  },
  {
    path: "/protegido/atividades",
    title: "atividades",
    description: "Central de atividades",
    category: "Atividades"
  }
]

// Componente de Popup de Notificações
function NotificationPopup({ alertas, onMarkAsRead, onDelete, onRefresh, verificando }) {
  const [isOpen, setIsOpen] = useState(false)
  const alertasNaoLidos = alertas.filter(alerta => !alerta.verificado)

  return (
    <div className="relative">
      <button 
        className="p-2 rounded-md hover:bg-gray-100 relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell size={20} className="md:w-6 md:h-6" />
        {alertasNaoLidos.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {alertasNaoLidos.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h3 className="font-semibold">Notificações</h3>
              <p className="text-sm text-gray-500">{alertasNaoLidos.length} não lidas</p>
            </div>
            <button
              onClick={onRefresh}
              disabled={verificando}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
              title="Verificar novos alertas"
            >
              <RefreshCw className={`w-4 h-4 ${verificando ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="divide-y divide-gray-100">
            {alertas.length === 0 ? (
              <div className="p-4 text-center text-gray-500">Nenhum alerta no momento</div>
            ) : (
              alertas
                .sort((a, b) => new Date(b.criado_em) - new Date(a.criado_em)) // ordenar do mais recente
                .slice(0, 8)
                .map((alerta) => (
                  <div key={alerta.id} className={`p-4 ${!alerta.verificado ? 'bg-yellow-50 border-l-4 border-l-yellow-400' : ''}`}>
                    <div className="flex items-start gap-3">
                      <AlertTriangle className={`w-5 h-5 mt-0.5 ${alerta.verificado ? 'text-gray-400' : 'text-yellow-500'}`} />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <h4 className="font-medium text-gray-900">{alerta.tipo_alerta?.toUpperCase() || 'ALERTA'}</h4>
                          <span className="text-xs text-gray-500">
                            {new Date(alerta.criado_em).toLocaleString('pt-BR')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mt-1">{alerta.mensagem}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Lavoura: {alerta.lavouras?.nome || 'N/A'} • Sensor: {alerta.sensores?.nome || 'N/A'}
                        </p>
                        {!alerta.verificado && (
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={() => onMarkAsRead(alerta.id)}
                              className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
                            >
                              Marcar como lido
                            </button>
                            <button
                              onClick={() => onDelete(alerta.id)}
                              className="text-xs bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
                            >
                              Deletar
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>

          {alertas.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <Link 
                href="/protegido/alertas" 
                className="text-sm text-blue-600 hover:underline flex items-center justify-center"
                onClick={() => setIsOpen(false)}
              >
                Ver todos os alertas →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Componente de busca
function GlobalSearch({ isMobile = false }) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [selectedResult, setSelectedResult] = useState(null)
  const [contextLevel, setContextLevel] = useState(0)
  const [contextData, setContextData] = useState({})
  const [contextOptions, setContextOptions] = useState([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const fetchContextOptions = async (contextQuery, dependsOnValue = null) => {
    setLoading(true)
    try {
      let data = []

      if (contextQuery === "lavouras") {
        const { data: lavouras, error } = await supabase.from("lavouras").select("id, nome").order("nome")
        if (!error) data = lavouras
      } else if (contextQuery === "sensores" && dependsOnValue) {
        const { data: sensores, error } = await supabase
          .from("sensores")
          .select("id, nome, tipo")
          .eq("lavoura_id", dependsOnValue)
          .order("nome")
        if (!error) data = sensores
      }

      setContextOptions(data)
    } catch (error) {
      console.error("Erro ao buscar opções:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (searchQuery) => {
    setQuery(searchQuery)
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    const searchTerm = searchQuery.toLowerCase().trim()
    const filteredResults = searchIndex.filter(
      (item) =>
        item.title.toLowerCase().includes(searchTerm) ||
        item.description.toLowerCase().includes(searchTerm) ||
        item.path.toLowerCase().includes(searchTerm),
    )
    setResults(filteredResults)
  }

  const handleSelectResult = (result) => {
    if (result.requiresContext) {
      setSelectedResult(result)
      setContextLevel(0)
      setContextData({})
      const firstLevel = result.contextLevels ? result.contextLevels[0] : { query: result.contextQuery }
      fetchContextOptions(firstLevel.query)
    } else {
      router.push(result.path)
      setIsOpen(false)
      setQuery("")
    }
  }

  const handleSelectContextOption = (option) => {
    if (selectedResult) {
      const currentLevel = selectedResult.contextLevels ? selectedResult.contextLevels[contextLevel] : { param: 'id' }
      
      const newContextData = {
        ...contextData,
        [currentLevel.param]: option.id,
      }
      setContextData(newContextData)

      if (selectedResult.contextLevels && contextLevel < selectedResult.contextLevels.length - 1) {
        const nextLevel = selectedResult.contextLevels[contextLevel + 1]
        const dependsOnValue = newContextData[nextLevel.dependsOn]
        setContextLevel(contextLevel + 1)
        fetchContextOptions(nextLevel.query, dependsOnValue)
      } else {
        let finalPath = selectedResult.path
        Object.entries(newContextData).forEach(([param, value]) => {
          finalPath = finalPath.replace(`[${param}]`, value)
        })
        router.push(finalPath)
        setIsOpen(false)
        setQuery("")
        setSelectedResult(null)
        setContextLevel(0)
        setContextData({})
      }
    }
  }

  const handleBackContext = () => {
    if (contextLevel > 0) {
      const previousLevel = selectedResult.contextLevels[contextLevel - 1]
      setContextLevel(contextLevel - 1)
      const newContextData = { ...contextData }
      selectedResult.contextLevels.slice(contextLevel).forEach((level) => {
        delete newContextData[level.param]
      })
      setContextData(newContextData)
      const dependsOnValue = previousLevel.dependsOn ? newContextData[previousLevel.dependsOn] : null
      fetchContextOptions(previousLevel.query, dependsOnValue)
    } else {
      setSelectedResult(null)
      setContextLevel(0)
      setContextData({})
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    setQuery("")
    setSelectedResult(null)
    setContextLevel(0)
    setContextData({})
    setResults([])
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('.search-container')) {
        handleClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        handleClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  return (
    <div className="relative search-container">
      <div className="relative">
        {isMobile ? (
          <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-md hover:bg-gray-100">
            <Search className="w-5 h-5 text-gray-600" />
          </button>
        ) : (
          <>
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
          </>
        )}
      </div>

      {isOpen && (
        <>
          {isMobile && <div className="fixed inset-0 bg-white bg-opacity-50 z-40" onClick={handleClose} />}
          <div className={`${
            isMobile
              ? "fixed top-16 left-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
              : "absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
          }`}>
            {isMobile && (
              <div className="p-4 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Buscar páginas..."
                    value={query}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    autoFocus
                  />
                  {query && (
                    <button
                      onClick={() => setQuery("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {selectedResult ? (
              <div className="p-4">
                <div className="flex items-center mb-4">
                  <button onClick={handleBackContext} className="text-gray-500 hover:text-gray-700 mr-2">
                    <ChevronRight className="w-4 h-4 rotate-180" />
                  </button>
                  <h3 className="font-semibold">
                    {selectedResult.contextLevels ? selectedResult.contextLevels[contextLevel].prompt : selectedResult.contextPrompt}
                  </h3>
                </div>

                {selectedResult.contextLevels && selectedResult.contextLevels.length > 1 && (
                  <div className="flex items-center gap-1 text-xs text-gray-500 mb-4">
                    {selectedResult.contextLevels.slice(0, contextLevel + 1).map((level, index) => (
                      <React.Fragment key={index}>
                        {index > 0 && <span>›</span>}
                        <span className={index === contextLevel ? "text-green-600 font-medium" : ""}>
                          {level.prompt.split(" ")[0]}
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
                        {option.tipo && <div className="text-sm text-gray-500">Tipo: {option.tipo}</div>}
                      </button>
                    ))}
                    {contextOptions.length === 0 && !loading && (
                      <div className="text-center text-gray-500 py-4">
                        {contextLevel === 0 ? "Nenhuma lavoura encontrado" : "Nenhum sensor encontrado"}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
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
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">Seleção necessária</span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : query ? (
                  <div className="p-4 text-center text-gray-500">Nenhum resultado encontrado para "{query}"</div>
                ) : (
                  <div className="p-4 text-center text-gray-500">Digite para buscar páginas</div>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function NavLink({ href, icon: Icon, children, collapsed }) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
        isActive ? "bg-green-100 text-green-700" : "hover:bg-gray-100 text-gray-700"
      }`}
    >
      <Icon size={20} />
      {!collapsed && <span>{children}</span>}
    </Link>
  )
}

export default function ProtectedLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [session, setSession] = useState(null)
  const [userData, setUserData] = useState(null)
  const [alertas, setAlertas] = useState([])
  const [verificando, setVerificando] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  // Função para buscar alertas
  const fetchAlertas = async () => {
    try {
      const response = await fetch('/api/alertas')
      if (response.ok) {
        const data = await response.json()
        setAlertas(data)
      }
    } catch (error) {
      console.error('Erro ao buscar alertas:', error)
    }
  }

  // Função para verificar novos alertas
  const verificarNovosAlertas = async () => {
    if (verificando) return
    
    try {
      setVerificando(true)
      const response = await fetch('/api/alertas', {
        method: 'POST'
      })
      
      if (response.ok) {
        const result = await response.json()
        
        if (result.novos_alertas > 0) {
          alert(`🚨 ${result.novos_alertas} novo(s) alerta(s) detectado(s)!`)
          await fetchAlertas()
        }
        
        return result.novos_alertas
      }
    } catch (error) {
      console.error('Erro ao verificar alertas:', error)
    } finally {
      setVerificando(false)
    }
    return 0
  }

  // Função para marcar alerta como lido
  const marcarComoLido = async (alertaId) => {
    try {
      const response = await fetch(`/api/alertas/${alertaId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ verificado: true })
      })

      if (response.ok) {
        setAlertas(alertas.map(alerta => 
          alerta.id === alertaId 
            ? { ...alerta, verificado: true, verificado_em: new Date().toISOString() }
            : alerta
        ))
      }
    } catch (error) {
      console.error('Erro ao marcar como lido:', error)
    }
  }

  // Função para deletar alerta
  const deletarAlerta = async (alertaId) => {
    if (!confirm('Tem certeza que deseja deletar este alerta?')) return
    
    try {
      const response = await fetch(`/api/alertas/${alertaId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setAlertas(alertas.filter(alerta => alerta.id !== alertaId))
      }
    } catch (error) {
      console.error('Erro ao deletar alerta:', error)
    }
  }

  // Efeito para verificação automática em loop
  useEffect(() => {
    let intervaloId
    let timeoutId

    const iniciarVerificacao = () => {
      verificarNovosAlertas().then(() => {
        intervaloId = setInterval(async () => {
          await verificarNovosAlertas()
        }, 30000)
      })

      fetchAlertas()
    }

    if (session) {
      timeoutId = setTimeout(iniciarVerificacao, 2000)
    }

    return () => {
      if (intervaloId) clearInterval(intervaloId)
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [session])

  useEffect(() => {
    const getUserData = async () => {
      if (session?.user) {
        const { data, error } = await supabase
          .from("user_data")
          .select("username, img_url")
          .eq("id", session.user.id)
          .single()
        if (!error) setUserData(data)
      }
    }

    getUserData()
  }, [session, supabase])

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) {
        router.push("/auth/login")
      } else {
        setSession(session)
      }
    }

    getSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (!session) router.push("/auth/login")
    })

    return () => subscription?.unsubscribe()
  }, [router, supabase.auth])

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuOpen) {
        const sidebar = document.querySelector("[data-sidebar]")
        const menuButton = document.querySelector("[data-menu-button]")

        // Se clicou fora do sidebar e não foi no botão do menu, fecha o menu
        if (sidebar && !sidebar.contains(event.target) && !menuButton?.contains(event.target)) {
          setMobileMenuOpen(false)
        }
      }
    }

    if (mobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("touchstart", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("touchstart", handleClickOutside)
    }
  }, [mobileMenuOpen])

  if (!session) {
    return null
  }

  return (
    <div>
      {/* HEADER */}
      <header className="fixed top-0 left-0 w-full h-16 bg-white shadow-sm z-[100] px-4 md:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center md:hidden">
            <button
              className="p-2 rounded-md hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-menu-button
            >
              <Menu size={24} />
            </button>
          </div>

          <div className="hidden md:flex items-center space-x-4 flex-shrink-0">
            <span className="text-xl font-bold text-green-500">CropSense</span>
            <button className="p-2 rounded-md hover:bg-gray-100" onClick={() => setCollapsed(!collapsed)}>
              <Menu size={24} />
            </button>
          </div>

          <div className="md:hidden absolute left-1/2 transform -translate-x-1/2">
            <span className="text-xl font-bold text-green-500">CropSense</span>
          </div>

          <div className="hidden md:flex flex-1 max-w-xl mx-auto">
            <GlobalSearch />
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2 md:space-x-4 flex-shrink-0">
            <div className="md:hidden">
              <GlobalSearch isMobile={true} />
            </div>

            <NotificationPopup 
              alertas={alertas}
              onMarkAsRead={marcarComoLido}
              onDelete={deletarAlerta}
              onRefresh={verificarNovosAlertas}
              verificando={verificando}
            />

            <Link href="/protegido/perfil">
              <button className="p-2 rounded-full hover:bg-gray-100">
                <User size={20} className="md:w-6 md:h-6" />
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-white bg-opacity-50 z-30 md:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* SIDEBAR */}
      <aside
        data-sidebar
        className={`fixed top-16 left-0 h-[calc(100%-4rem)] bg-white text-gray-700 border-r border-gray-200 flex flex-col justify-between transition-all duration-300 ${
          mobileMenuOpen ? "w-64 z-40" : "-translate-x-full z-40"
        } md:translate-x-0 md:z-10 ${collapsed ? "md:w-16" : "md:w-64"}`}
      >
        {/* Navigation */}
        <nav className="mt-6 px-2 flex-1 space-y-2">
          <NavLink href="/protegido/dashboard" icon={Home} collapsed={collapsed}>
            Dashboard
          </NavLink>
          <NavLink href="/protegido/lavouras" icon={Leaf} collapsed={collapsed}>
            Lavouras
          </NavLink>
          <NavLink href="/protegido/monitoramento" icon={Wrench} collapsed={collapsed}>
            Monitoramento
          </NavLink>
          <NavLink href="/protegido/clima" icon={Cloud} collapsed={collapsed}>
            Clima
          </NavLink>
          <NavLink href="/protegido/alertas" icon={AlertTriangle} collapsed={collapsed}>
            Alertas
          </NavLink>
          <NavLink href="/protegido/atividades" icon={CheckCircle} collapsed={collapsed}>
            Atividades
          </NavLink>
          <NavLink href="/protegido/sobre" icon={Info} collapsed={collapsed}>
            Sobre
          </NavLink>
        </nav>

        {/* User Profile */}
        <Link
          href="/protegido/perfil"
          className="px-2 pb-6 pt-4 border-t border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            {userData?.img_url ? (
              <img
                src={userData.img_url || "/placeholder.svg"}
                alt="User Avatar"
                className="w-10 h-10 rounded-full border-2 border-green-500 object-cover"
              />
            ) : (
              <div className="p-1 border-2 border-green-500 rounded-full">
                <User size={24} className="text-green-500" />
              </div>
            )}

            {!collapsed && (
              <div>
                <p className="text-sm font-medium">{session.user.email}</p>
                <p className="text-xs text-gray-500">{userData?.username || "Usuário"}</p>
              </div>
            )}
          </div>
        </Link>
      </aside>

      {/* MAIN CONTENT */}
      <main
        className={`mt-16 p-4 md:p-6 transition-all duration-300 z-35 relative ${collapsed ? "md:ml-16" : "md:ml-64"}`}
        style={{
          height: "calc(100vh - 4rem)",
          overflowY: "auto",
        }}
      >
        {children}
      </main>
    </div>
  )
}