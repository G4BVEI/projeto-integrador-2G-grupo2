import talhoes from "../lavouras/talhoes.json";

function ListaTalhoes() {
  return (
    <div>
      <h2>Lista de Talhões</h2>
      <ul>
        {talhoes.map((talhao, index) => (
          <li key={index}>
            <strong>{talhao.nome_do_talhao}</strong> - {talhao.tipo_de_cultura} - Umidade: {talhao.umidade_do_solo} - Última atividade: {talhao.ultima_atividade}
          </li>
        ))}
      </ul>
    </div>
  );
}
export default ListaTalhoes