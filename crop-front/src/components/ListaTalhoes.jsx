import talhoes from "@/data/talhoes.json";

function ListaTalhoes({ searchTerm = '' }) {
  // Filtrar talhões baseado no termo de busca
  const filteredTalhoes = talhoes.filter(talhao => 
    talhao.tipo_de_cultura.toLowerCase().includes(searchTerm.toLowerCase()) ||
    talhao.nome_do_talhao.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {filteredTalhoes.length > 0 ? (
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nome do Talhão
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo de Cultura
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Umidade do Solo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Última Atividade
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTalhoes.map((talhao, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {talhao.nome_do_talhao}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {talhao.tipo_de_cultura}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    parseInt(talhao.umidade_do_solo) < 30 
                      ? 'bg-red-100 text-red-800'
                      : parseInt(talhao.umidade_do_solo) < 60
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {talhao.umidade_do_solo}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {talhao.ultima_atividade}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  <button className="px-3 py-1 text-sm border border-green-600 text-green-600 rounded-md hover:bg-green-50 transition-colors">
                    Ver Detalhes
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="p-8 text-center">
          <p className="text-gray-500">Nenhum talhão encontrado para "{searchTerm}"</p>
        </div>
      )}
    </div>
  );
}

export default ListaTalhoes

