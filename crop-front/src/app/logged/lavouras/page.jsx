import talhoes from "@/data/talhoes.json";


function ListaTalhoes() {

    return (
  <div className="flex justify-center overflow-x-auto">
  <table className="table-auto border-collapse border border-gray-300">
    <thead className="bg-gray-100">
      <tr>
        <th className="border px-4 py-2">Talhão</th>
        <th className="border px-4 py-2">Tipo de Cultura</th>
        <th className="border px-4 py-2">Umidade do Solo</th>
        <th className="border px-4 py-2">Última Atividade</th>
      </tr>
    </thead>
    <tbody>
      {talhoes.map((talhao, index) => (
        <tr key={index}>
          <td className="border px-4 py-2">{talhao.nome_do_talhao}</td>
          <td className="border px-4 py-2">{talhao.tipo_de_cultura}</td>
          <td className="border px-4 py-2">{talhao.umidade_do_solo}</td>
          <td className="border px-4 py-2">{talhao.ultima_atividade}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

  );

}
export default ListaTalhoes
