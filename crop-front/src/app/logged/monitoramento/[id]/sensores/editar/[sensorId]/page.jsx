'use client';

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Breadcrumb from "@/components/layout/Breadcrumb";

function EditarSensor() {
  const [talhao, setTalhao] = useState(null);
  const [sensorAtual, setSensorAtual] = useState(null);
  const [dadosSensor, setDadosSensor] = useState([]);
  const [loading, setLoading] = useState(true);
  const [novoValor, setNovoValor] = useState("");
  const [error, setError] = useState(null);

  const params = useParams();
  const supabase = createClient();

  // Fetch inicial
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        // Talhão
        const { data: talhaoData } = await supabase
          .from("talhoes")
          .select("*")
          .eq("id", params.id)
          .single();
        setTalhao(talhaoData);

        // Sensor
        const { data: sensorData } = await supabase
          .from("sensores")
          .select("*")
          .eq("id", params.sensorId)
          .single();
        setSensorAtual(sensorData);

        // Dados do sensor
        const { data: dadosData } = await supabase
          .from("dados_sensor")
          .select("*")
          .eq("sensor_id", params.sensorId)
          .order("registrado_em", { ascending: false });
        setDadosSensor(dadosData || []);
      } catch (err) {
        setError(err.message || err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [params.id, params.sensorId]);

  // Registrar novo dado
  const handleAddData = async () => {
    if (!novoValor) return;

    try {
      const res = await fetch(`/api/lavouras/${params.id}/sensores/${params.sensorId}/dados`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ valor: novoValor })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao registrar dado");

      setDadosSensor([data, ...dadosSensor]);
      setNovoValor("");
    } catch (err) {
      alert("Erro ao registrar dado: " + err.message);
    }
  };

  if (loading) return <div className="p-4">Carregando...</div>;
  if (error) return <div className="p-4 text-red-500">Erro: {error}</div>;

  const breadcrumbItems = [
    { label: "Monitoramento", href: "/logged/monitoramento" },
    ...(talhao ? [{ label: talhao.nome, href: `/logged/monitoramento/${talhao.id}/sensores` }] : []),
    { label: "Sensores", href: `/logged/monitoramento/${params.id}/sensores` },
    { label: "Editar Sensor" },
    ...(sensorAtual ? [{ label: sensorAtual.nome }] : []),
  ];

  return (
    <div className="p-6">
      <Breadcrumb items={breadcrumbItems} />
      <h1 className="text-2xl font-bold mb-4">Editar Sensor: {sensorAtual?.nome}</h1>

      {/* Form para registrar novo dado */}
      <div className="mb-6 p-4 bg-white rounded shadow">
        <h2 className="font-medium mb-2">Registrar novo dado</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={novoValor}
            onChange={e => setNovoValor(e.target.value)}
            placeholder="Valor do parâmetro"
            className="border px-3 py-2 rounded flex-1"
          />
          <button
            onClick={handleAddData}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Registrar
          </button>
        </div>
      </div>

      {/* Lista de dados registrados */}
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-gray-100 text-gray-600 uppercase text-xs">
              <th className="px-4 py-3">Registrado em</th>
              <th className="px-4 py-3">Valor</th>
            </tr>
          </thead>
          <tbody>
            {dadosSensor.length > 0 ? (
              dadosSensor.map(dado => (
                <tr key={dado.id} className="hover:bg-gray-50 border-b">
                  <td className="px-4 py-3">{new Date(dado.registrado_em).toLocaleString()}</td>
                  <td className="px-4 py-3">{dado.valor}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2" className="px-4 py-8 text-center text-gray-500">
                  Nenhum dado registrado ainda
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default EditarSensor;
