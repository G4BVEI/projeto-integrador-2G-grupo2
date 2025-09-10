'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';

export default function GerenciamentoAtividades() {
  const [atividades, setAtividades] = useState([
    {
      id: 1,
      tipo: 'Aplicação de Defensivo',
      responsavel: 'João Silva',
      dataInicio: '2024-01-15',
      dataConclusao: '2024-01-16',
      status: 'concluida',
      descricao: 'Aplicação de herbicida na área norte'
    },
    {
      id: 2,
      tipo: 'Irrigação',
      responsavel: 'Maria Santos',
      dataInicio: '2024-01-20',
      dataConclusao: '2024-01-22',
      status: 'em_andamento',
      descricao: 'Irrigação por aspersão na lavoura 3'
    },
    {
      id: 3,
      tipo: 'Plantio',
      responsavel: 'Carlos Oliveira',
      dataInicio: '2024-01-25',
      dataConclusao: '2024-01-30',
      status: 'pendente',
      descricao: 'Plantio de soja na área sul'
    },
    {
      id: 4,
      tipo: 'Colheita',
      responsavel: 'Ana Costa',
      dataInicio: '2024-02-01',
      dataConclusao: '2024-02-05',
      status: 'pendente',
      descricao: 'Colheita do milho na lavoura 1'
    }
  ]);

  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [atividadeEditando, setAtividadeEditando] = useState(null);
  const [formData, setFormData] = useState({
    tipo: '',
    responsavel: '',
    dataInicio: '',
    dataConclusao: '',
    status: 'pendente',
    descricao: ''
  });

  // Filtrar atividades baseado no status selecionado
  const atividadesFiltradas = atividades.filter(atividade => {
    if (filtroStatus === 'todos') return true;
    return atividade.status === filtroStatus;
  });

  // Calcular estatísticas
  const totalAtividades = atividades.length;
  const atividadesPendentes = atividades.filter(a => a.status === 'pendente').length;
  const atividadesConcluidas = atividades.filter(a => a.status === 'concluida').length;
  const atividadesEmAndamento = atividades.filter(a => a.status === 'em_andamento').length;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const abrirModal = (atividade = null) => {
    if (atividade) {
      setAtividadeEditando(atividade);
      setFormData(atividade);
    } else {
      setAtividadeEditando(null);
      setFormData({
        tipo: '',
        responsavel: '',
        dataInicio: '',
        dataConclusao: '',
        status: 'pendente',
        descricao: ''
      });
    }
    setMostrarModal(true);
  };

  const fecharModal = () => {
    setMostrarModal(false);
    setAtividadeEditando(null);
  };

  const salvarAtividade = (e) => {
    e.preventDefault();
    
    if (atividadeEditando) {
      // Editar atividade existente
      setAtividades(prev => prev.map(atividade => 
        atividade.id === atividadeEditando.id 
          ? { ...formData, id: atividadeEditando.id }
          : atividade
      ));
      toast.success('Atividade atualizada com sucesso!');
    } else {
      // Criar nova atividade
      const novaAtividade = {
        ...formData,
        id: Date.now() // ID simples para demonstração
      };
      setAtividades(prev => [...prev, novaAtividade]);
      toast.success('Nova atividade criada com sucesso!');
    }
    
    fecharModal();
  };

  const excluirAtividade = (id) => {
    if (confirm('Tem certeza que deseja excluir esta atividade?')) {
      setAtividades(prev => prev.filter(atividade => atividade.id !== id));
      toast.success('Atividade excluída com sucesso!');
    }
  };

  const marcarComoConcluida = (id) => {
    setAtividades(prev => prev.map(atividade => 
      atividade.id === id 
        ? { ...atividade, status: 'concluida' }
        : atividade
    ));
    toast.success('Atividade marcada como concluída!');
  };

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

  return (
    <div className="p-6">
      {/* Título e Botão Nova Atividade */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gerenciamento de Atividades</h1>
        <button
          onClick={() => abrirModal()}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <span className="text-lg">+</span>
          Nova Atividade
        </button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
          <h3 className="text-sm font-medium text-gray-600">Total de Atividades</h3>
          <p className="text-2xl font-bold text-gray-800">{totalAtividades}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-yellow-500">
          <h3 className="text-sm font-medium text-gray-600">Pendentes</h3>
          <p className="text-2xl font-bold text-yellow-600">{atividadesPendentes}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
          <h3 className="text-sm font-medium text-gray-600">Em Andamento</h3>
          <p className="text-2xl font-bold text-blue-600">{atividadesEmAndamento}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
          <h3 className="text-sm font-medium text-gray-600">Concluídas</h3>
          <p className="text-2xl font-bold text-green-600">{atividadesConcluidas}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h3 className="text-lg font-medium mb-3">Filtros</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFiltroStatus('todos')}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              filtroStatus === 'todos' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFiltroStatus('pendente')}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              filtroStatus === 'pendente' 
                ? 'bg-yellow-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Pendentes
          </button>
          <button
            onClick={() => setFiltroStatus('em_andamento')}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              filtroStatus === 'em_andamento' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Em Andamento
          </button>
          <button
            onClick={() => setFiltroStatus('concluida')}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              filtroStatus === 'concluida' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Concluídas
          </button>
        </div>
      </div>

      {/* Lista de Atividades */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo da Atividade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Responsável
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data Início
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data Conclusão
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {atividadesFiltradas.map((atividade) => (
                <tr key={atividade.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{atividade.tipo}</div>
                      <div className="text-sm text-gray-500">{atividade.descricao}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {atividade.responsavel}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(atividade.dataInicio).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(atividade.dataConclusao).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(atividade.status)}`}>
                      {getStatusText(atividade.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => abrirModal(atividade)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Editar
                      </button>
                      {atividade.status !== 'concluida' && (
                        <button
                          onClick={() => marcarComoConcluida(atividade.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Concluir
                        </button>
                      )}
                      <button
                        onClick={() => excluirAtividade(atividade.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para Nova/Editar Atividade */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">
              {atividadeEditando ? 'Editar Atividade' : 'Nova Atividade'}
            </h2>
            
            <form onSubmit={salvarAtividade}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tipo da Atividade*</label>
                  <select
                    name="tipo"
                    value={formData.tipo}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="">Selecione...</option>
                    <option value="Plantio">Plantio</option>
                    <option value="Irrigação">Irrigação</option>
                    <option value="Aplicação de Defensivo">Aplicação de Defensivo</option>
                    <option value="Fertilização">Fertilização</option>
                    <option value="Colheita">Colheita</option>
                    <option value="Preparo do Solo">Preparo do Solo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Responsável*</label>
                  <input
                    type="text"
                    name="responsavel"
                    value={formData.responsavel}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Data de Início*</label>
                  <input
                    type="date"
                    name="dataInicio"
                    value={formData.dataInicio}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Data Prevista de Conclusão*</label>
                  <input
                    type="date"
                    name="dataConclusao"
                    value={formData.dataConclusao}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  >
                    <option value="pendente">Pendente</option>
                    <option value="em_andamento">Em Andamento</option>
                    <option value="concluida">Concluída</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Descrição</label>
                  <textarea
                    name="descricao"
                    value={formData.descricao}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={fecharModal}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  {atividadeEditando ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}