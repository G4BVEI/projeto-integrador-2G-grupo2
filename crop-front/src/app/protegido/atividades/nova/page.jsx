"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";

export default function NovaAtividade() {
  const supabase = createClient();

  const [talhoes, setTalhoes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    tipo_atividade: "",
    responsavel: "",
    data_inicio: new Date().toISOString().split("T")[0],
    data_conclusao: "",
    status: "Planejada",
    descricao: "",
    talhao_id: "",
  });

  // Buscar os talhões no Supabase
  useEffect(() => {
    async function fetchTalhoes() {
      const { data, error } = await supabase.from("talhoes").select("*");
      if (error) {
        toast.error("Erro ao carregar talhões");
        console.error(error);
      } else {
        setTalhoes(data || []);
      }
      setLoading(false);
    }
    fetchTalhoes();
  }, []);

  // Manipular envio do formulário
  async function handleSubmit(e) {
    e.preventDefault();

    const atividade = { ...form, data_conclusao: form.data_conclusao || null };

    const { error } = await supabase.from("atividades").insert([atividade]);

    if (error) {
      toast.error("Erro ao salvar: " + error.message);
      console.error(error);
    } else {
      toast.success("Atividade salva com sucesso!");
      setForm({
        tipo_atividade: "",
        responsavel: "",
        data_inicio: new Date().toISOString().split("T")[0],
        data_conclusao: "",
        status: "Planejada",
        descricao: "",
        talhao_id: "",
      });
    }
  }

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-6 pb-3 border-b border-gray-200">
          Nova Atividade
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tipo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Atividade *
              </label>
              <select
                value={form.tipo_atividade}
                onChange={(e) =>
                  setForm({ ...form, tipo_atividade: e.target.value })
                }
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              >
                <option value="">Selecione o tipo</option>
                <option value="Aplicação de Defensivo">Aplicação de Defensivo</option>
                <option value="Plantio">Plantio</option>
                <option value="Colheita">Colheita</option>
                <option value="Irrigação">Irrigação</option>
                <option value="Adubação">Adubação</option>
                <option value="Monitoramento">Monitoramento</option>
              </select>
            </div>

            {/* Responsável */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Responsável *
              </label>
              <input
                type="text"
                value={form.responsavel}
                onChange={(e) =>
                  setForm({ ...form, responsavel: e.target.value })
                }
                required
                placeholder="Nome do responsável"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              />
            </div>

            {/* Data início */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data de Início *
              </label>
              <input
                type="date"
                value={form.data_inicio}
                onChange={(e) =>
                  setForm({ ...form, data_inicio: e.target.value })
                }
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              />
            </div>

            {/* Data conclusão */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data de Conclusão
              </label>
              <input
                type="date"
                value={form.data_conclusao}
                onChange={(e) =>
                  setForm({ ...form, data_conclusao: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status *
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              >
                <option value="Planejada">Planejada</option>
                <option value="Em Andamento">Em Andamento</option>
                <option value="Concluída">Concluída</option>
                <option value="Cancelada">Cancelada</option>
              </select>
            </div>

            {/* Talhão */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Talhão *
              </label>
              <select
                value={form.talhao_id}
                onChange={(e) => setForm({ ...form, talhao_id: e.target.value })}
                required
                disabled={loading}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              >
                <option value="">Selecione o talhão</option>
                {talhoes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nome} - {t.cultura}
                  </option>
                ))}
              </select>
            </div>

            {/* Descrição */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição da Atividade *
              </label>
              <textarea
                value={form.descricao}
                onChange={(e) =>
                  setForm({ ...form, descricao: e.target.value })
                }
                required
                rows={4}
                placeholder="Descreva detalhadamente a atividade..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              />
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-3 mt-8 pt-5 border-t border-gray-200">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-dark transition"
            >
              Salvar Atividade
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
