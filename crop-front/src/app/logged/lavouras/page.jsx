import talhoes from "../lavouras/talhoes.json";


function ListaTalhoes() {

    return (
    <div>
      {talhoes.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Talhão</th>
              <th>Tipo de Cultura</th>
              <th>Umidade do Solo</th>
              <th>Última Atividade</th>
            </tr>
          </thead>
          <tbody>
            {talhoes.map((talhao, index) => (
              <tr key={index}>
                <td>{talhao.nome_do_talhao}</td>
                <td>{talhao.tipo_de_cultura}</td>
                <td>{talhao.umidade_do_solo}</td>
                <td>{talhao.ultima_atividade}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

}
export default ListaTalhoes
