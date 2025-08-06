import { useState } from 'react'
import { Search, Plus, Edit, ChevronDown } from 'lucide-react'
import ListaTalhoes from './ListaTalhoes'

function LavouraPage() {
  const [searchTerm, setSearchTerm] = useState('')

  return (
    <div className="flex-1 p-6 bg-gray-50">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
        <span>Início</span>
        <span>›</span>
        <span className="text-gray-900 font-medium">Lavouras</span>
      </nav>

      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Lavouras</h1>
        <p className="text-gray-600">Acompanhe o desempenho das principais talhões</p>
      </div>

      {/* Controls Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar por tipo de cultura"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filter and Actions */}
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
              Setor
              <ChevronDown className="h-4 w-4" />
            </button>
            
            <button className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors">
              <Plus className="h-4 w-4" />
              Adicionar Lavoura
            </button>
            
            <button className="flex items-center gap-2 px-4 py-2 border border-green-600 text-green-600 rounded-md hover:bg-green-50 transition-colors">
              <Edit className="h-4 w-4" />
              Modificar Lavoura
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <ListaTalhoes searchTerm={searchTerm} />
    </div>
  )
}

export default LavouraPage

