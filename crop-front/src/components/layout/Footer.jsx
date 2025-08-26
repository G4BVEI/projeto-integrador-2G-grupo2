"use client"

import Link from "next/link"
import { 
  MapPin, 
  Mail, 
  Phone, 
  Leaf,
  BarChart3,
  Bell,
  Calendar,
  FileText,
  Smartphone
} from "lucide-react"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-800 text-white py-12 border-4 border-red-500">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Leaf className="w-8 h-8 text-green-400" />
              <span className="text-2xl font-bold">CropSense</span>
            </div>
            <p className="text-green-100 leading-relaxed">
              Facilitando o acesso à agricultura de precisão para pequenos e médios produtores. 
              Monitore suas lavouras com inteligência e tome decisões baseadas em dados reais.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-green-300">Links Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="#funcionalidades" 
                  className="text-green-100 hover:text-green-300 transition-colors duration-300 flex items-center space-x-2"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Funcionalidades</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="#como-funciona" 
                  className="text-green-100 hover:text-green-300 transition-colors duration-300 flex items-center space-x-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Como Funciona</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/auth/login" 
                  className="text-green-100 hover:text-green-300 transition-colors duration-300 flex items-center space-x-2"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Fazer Login</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/auth/cadastro" 
                  className="text-green-100 hover:text-green-300 transition-colors duration-300 flex items-center space-x-2"
                >
                  <Bell className="w-4 h-4" />
                  <span>Cadastrar-se</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-green-300">Recursos</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/documentacao" 
                  className="text-green-100 hover:text-green-300 transition-colors duration-300 flex items-center space-x-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>Documentação</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/suporte" 
                  className="text-green-100 hover:text-green-300 transition-colors duration-300 flex items-center space-x-2"
                >
                  <Bell className="w-4 h-4" />
                  <span>Suporte</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/blog" 
                  className="text-green-100 hover:text-green-300 transition-colors duration-300 flex items-center space-x-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>Blog</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/api" 
                  className="text-green-100 hover:text-green-300 transition-colors duration-300 flex items-center space-x-2"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>API</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-green-300">Contato</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div className="text-green-100">
                  <p>Rua da Agricultura, 123</p>
                  <p>São Paulo, SP - 01234-567</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-green-400 flex-shrink-0" />
                <a 
                  href="mailto:caixacropsense@gmail.com" 
                  className="text-green-100 hover:text-green-300 transition-colors duration-300"
                >
                  caixacropsense@gmail.com
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-green-400 flex-shrink-0" />
                <a 
                  href="tel:+5511999999999" 
                  className="text-green-100 hover:text-green-300 transition-colors duration-300"
                >
                  (11) 99999-9999
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="border-t border-green-800">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-xl font-semibold text-green-300 mb-2">
              Receba Dicas de Agricultura de Precisão
            </h3>
            <p className="text-green-100 mb-6">
              Inscreva-se em nossa newsletter e receba conteúdos exclusivos sobre tecnologia agrícola
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Seu melhor e-mail"
                className="flex-1 px-4 py-3 rounded-lg bg-green-800 border border-green-700 text-white placeholder-green-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <button className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-300 whitespace-nowrap">
                Inscrever-se
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-green-800 bg-green-950">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-green-200 text-sm">
              © {currentYear} CropSense. Todos os direitos reservados.
            </div>
            <div className="flex flex-wrap justify-center md:justify-end space-x-6 text-sm">
              <Link 
                href="/privacidade" 
                className="text-green-200 hover:text-green-300 transition-colors duration-300"
              >
                Política de Privacidade
              </Link>
              <Link 
                href="/termos" 
                className="text-green-200 hover:text-green-300 transition-colors duration-300"
              >
                Termos de Uso
              </Link>
              <Link 
                href="/cookies" 
                className="text-green-200 hover:text-green-300 transition-colors duration-300"
              >
                Política de Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}