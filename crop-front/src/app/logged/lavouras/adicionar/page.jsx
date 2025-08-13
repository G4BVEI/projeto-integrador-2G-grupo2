"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function AdicionarLavoura() {
  const router = useRouter();
  const [form, setForm] = useState({
    nome_do_talhao: "",
    tipo_de_cultura: "",
    umidade_do_solo: "",
    ultima_atividade: ""
  });

  const salvarLavoura = () => {
    console.log("Nova lavoura:", form);
    // Aqui você poderia salvar no backend com fetch/axios
    router.push("/logged/lavouras");
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Adicionar Nova Lavoura</h1>

      <div className="flex flex-col gap-3 max-w-md">
        <input
          type="text"
          placeholder="Nome do Talhão"
          className="border p-2 rounded"
          value={form.nome_do_talhao}
          onChange={(e) => setForm({ ...form, nome_do_talhao: e.target.value })}
        />
        <input
          type="text"
          placeholder="Tipo de Cultura"
          className="border p-2 rounded"
          value={form.tipo_de_cultura}
          onChange={(e) => setForm({ ...form, tipo_de_cultura: e.target.value })}
        />
        <input
          type="text"
          placeholder="Umidade (%)"
          className="border p-2 rounded"
          value={form.umidade_do_solo}
          onChange={(e) => setForm({ ...form, umidade_do_solo: e.target.value })}
        />
        <input
          type="text"
          placeholder="Última Atividade"
          className="border p-2 rounded"
          value={form.ultima_atividade}
          onChange={(e) => setForm({ ...form, ultima_atividade: e.target.value })}
        />

        <div className="flex gap-2 mt-4">
          <button
            onClick={salvarLavoura}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          >
            Salvar
          </button>
          <button
            onClick={() => router.push("/logged/lavouras")}
            className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdicionarLavoura;
