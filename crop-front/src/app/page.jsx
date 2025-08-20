import Link from "next/link";

import {
  CheckCircle,
  MapPin,
  BarChart3,
  Bell,
  Calendar,
  FileText,
  Smartphone,
} from "lucide-react";

export default function CropSenseLanding() {
  return (
    <div className="min-h-screen bg-white">
      {/* Menu */}
      <header className="border-b border-green-200 bg-green-50/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <a href="#">
              <span className="text-xl font-bold text-green-800">
                CropSense
              </span>
            </a>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <a
              href="#funcionalidades"
              className="text-green-600 hover:text-green-800 transition-colors"
            >
              Funcionalidades
            </a>
            <a
              href="#como-funciona"
              className="text-green-600 hover:text-green-800 transition-colors"
            >
              Como Funciona
            </a>
            <a
              href="#contato"
              className="text-green-600 hover:text-green-800 transition-colors"
            >
              Contato
            </a>
          </nav>
          <Link
            href="auth/cadastro"
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Começar Agora
          </Link>
        </div>
      </header>

      {/* Início */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-100 via-white to-green-50"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-700 border border-green-200 mb-6">
              Agricultura de Precisão Acessível
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold text-green-900 mb-6 leading-tight">
              Monitore seus talhões com
              <span className="text-green-600"> inteligência</span>
            </h1>
            <p className="text-xl text-green-700 mb-8 max-w-2xl mx-auto leading-relaxed">
              Democratize o acesso à agricultura de precisão. Monitore solo,
              clima e plantações em tempo real, otimize recursos e aumente sua
              produtividade com decisões baseadas em dados.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="auth/cadastro"
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium text-lg transition-colors inline-block text-center"
              >
                Começar Gratuitamente
              </Link>
              <button className="border-2 border-green-600 text-green-600 hover:bg-green-50 px-8 py-3 rounded-lg font-medium text-lg transition-colors">
                Ver Demonstração
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Problemas */}
      <section className="py-16 bg-green-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-green-900 mb-6">
              O Problema que Resolvemos
            </h2>
            <p className="text-lg text-green-700">
              Pequenos e médios produtores enfrentam sérias dificuldades no
              monitoramento de suas propriedades
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white border border-green-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-green-900 mb-3">
                Desperdício de Recursos
              </h3>
              <p className="text-green-700">
                Uso inadequado de água e insumos agrícolas por falta de
                monitoramento preciso das condições do solo.
              </p>
            </div>
            <div className="bg-white border border-green-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <Bell className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-green-900 mb-3">
                Decisões por Intuição
              </h3>
              <p className="text-green-700">
                Baixa produtividade devido à tomada de decisão baseada em
                suposições ao invés de dados reais.
              </p>
            </div>
            <div className="bg-white border border-green-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-green-900 mb-3">
                Reações Tardias
              </h3>
              <p className="text-green-700">
                Identificação tardia de pragas, secas ou desequilíbrios no solo,
                causando perdas significativas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Funcionalidades */}
      <section id="funcionalidades" className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-green-900 mb-6">
              Funcionalidades Completas
            </h2>
            <p className="text-lg text-green-700">
              Tudo que você precisa para monitorar e otimizar sua produção
              agrícola
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white border border-green-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-green-900 mb-3">
                Gestão de Talhões
              </h3>
              <p className="text-green-700">
                Cadastre fazendas e divida em talhões com localização via mapas
                interativos
              </p>
            </div>
            <div className="bg-white border border-green-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-green-900 mb-3">
                Dashboard em Tempo Real
              </h3>
              <p className="text-green-700">
                Visualize dados de umidade, pH, temperatura do solo e condições
                climáticas
              </p>
            </div>
            <div className="bg-white border border-green-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Bell className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-green-900 mb-3">
                Alertas Inteligentes
              </h3>
              <p className="text-green-700">
                Receba notificações automáticas quando condições ultrapassam
                limites ideais
              </p>
            </div>
            <div className="bg-white border border-green-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Smartphone className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-green-900 mb-3">
                Integração com APIs
              </h3>
              <p className="text-green-700">
                Conecte com dados climáticos, mapas e sensores IoT para
                monitoramento completo
              </p>
            </div>
            <div className="bg-white border border-green-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-green-900 mb-3">
                Calendário de Ações
              </h3>
              <p className="text-green-700">
                Planeje irrigação, colheitas e intervenções com agenda integrada
              </p>
            </div>
            <div className="bg-white border border-green-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-green-900 mb-3">
                Relatórios Exportáveis
              </h3>
              <p className="text-green-700">
                Gere relatórios em PDF e CSV com dados históricos e análises
                detalhadas
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section id="como-funciona" className="py-20 bg-green-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-green-900 mb-6">
              Como Funciona
            </h2>
            <p className="text-lg text-green-700">
              Processo simples para começar a monitorar suas plantações
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-lg font-semibold text-green-900 mb-2">
                Cadastro
              </h3>
              <p className="text-green-700">
                Crie sua conta e cadastre fazendas e talhões via mapa
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-lg font-semibold text-green-900 mb-2">
                Integração
              </h3>
              <p className="text-green-700">
                Conecte sensores ou APIs de clima para coleta de dados
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-lg font-semibold text-green-900 mb-2">
                Monitoramento
              </h3>
              <p className="text-green-700">
                Acompanhe dados em tempo real no dashboard intuitivo
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">4</span>
              </div>
              <h3 className="text-lg font-semibold text-green-900 mb-2">
                Otimização
              </h3>
              <p className="text-green-700">
                Receba alertas e tome decisões baseadas em dados reais
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Resultados */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold text-green-900 mb-6">
                  Resultados Comprovados
                </h2>
                <p className="text-lg text-green-700 mb-8">
                  Segundo a Embrapa, perdas no campo por falta de controle
                  técnico ultrapassam 20% em algumas culturas. Com o CropSense,
                  você pode reverter esse cenário.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-green-900">
                      Redução de até 30% no desperdício de água
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-green-900">
                      Aumento de 25% na produtividade média
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-green-900">
                      Economia de 40% em insumos agrícolas
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-green-900">
                      Detecção precoce de problemas em 90% dos casos
                    </span>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="bg-gradient-to-br from-green-100 to-green-50 rounded-2xl p-8">
                  <img
                    src="/images/landing-page.png"
                    alt="Monitoramento agrícola inteligente"
                    className="w-full h-auto rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Botão de cadastro */}
      <section className="py-20 bg-green-600">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              Pronto para Revolucionar sua Agricultura?
            </h2>
            <p className="text-xl text-green-100 mb-8">
              Junte-se a centenas de produtores que já estão otimizando suas
              plantações com o CropSense
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="auth/cadastro"
                className="bg-white text-green-600 hover:bg-green-50 px-8 py-3 rounded-lg font-medium text-lg transition-colors inline-block text-center"
              >
                Começar Gratuitamente
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        id="contato"
        className="py-12 bg-green-50 border-t border-green-200"
      >
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-green-800">
                  CropSense
                </span>
              </div>
              <p className="text-green-700">
                Democratizando a agricultura de precisão para pequenos e médios
                produtores.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-green-900 mb-4">Produto</h3>
              <ul className="space-y-2 text-green-700">
                <li>
                  <a
                    href="#"
                    className="hover:text-green-900 transition-colors"
                  >
                    Funcionalidades
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-green-900 transition-colors"
                  >
                    Preços
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-green-900 transition-colors"
                  >
                    Demonstração
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-green-900 mb-4">Recursos</h3>
              <ul className="space-y-2 text-green-700">
                <li>
                  <a
                    href="#"
                    className="hover:text-green-900 transition-colors"
                  >
                    Documentação
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-green-900 transition-colors"
                  >
                    Suporte
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-green-900 mb-4">Contato</h3>
              <ul className="space-y-2 text-green-700">
                <li>cropsense@gmail.com.br</li>
                <li>(49) 99938-4275</li>
                <li>Concórdia, SC</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-green-200 mt-8 pt-8 text-center text-green-700">
            <p>&copy; 2025 CropSense. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
