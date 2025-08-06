import talhoes from "@/data/talhoes.json";


function ListaTalhoes() {

    return (
  <div className="mt-10 px-6">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-gray-100 text-gray-600 uppercase text-xs">
              <th className="px-4 py-3">Nome do Talhão</th>
              <th className="px-4 py-3">Tipo de Cultura</th>
              <th className="px-4 py-3">Umidade do Solo</th>
              <th className="px-4 py-3">Última Atividade</th>
              <th className="px-4 py-3">Ações</th>
            </tr>
          </thead>
          <tbody className="text-gray-800">
            {talhoes.map((talhao, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{talhao.nome_do_talhao}</td>
                <td className="px-4 py-3">{talhao.tipo_de_cultura}</td>
                <td className="px-4 py-3">{talhao.umidade_do_solo}</td>
                <td className="px-4 py-3">{talhao.ultima_atividade}</td>
                <td className="px-4 py-3">
                  <a
                    href="#"
                    className="text-green-600 hover:underline"
                  >
                    Ver Detalhes
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

  );

}
export default ListaTalhoes
