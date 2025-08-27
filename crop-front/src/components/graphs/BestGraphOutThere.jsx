"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Thermometer,
  Droplets,
  CloudRain,
  Wind,
  Gauge,
  Eye,
  Calendar,
  Zap,
  Sun,
  Square,
  Cpu,
  Plus,
  Settings,
  MapPin,
  TestTube,
} from "lucide-react";

export default function BestGraph({ sensores }) {
  // Agrupar sensores por tipo
  const sensoresPorTipo = sensores.reduce((acc, sensor) => {
    const tipo = sensor.tipo || "Outro";
    if (!acc[tipo]) {
      acc[tipo] = [];
    }
    acc[tipo].push(sensor);
    return acc;
  }, {});

  // Preparar dados para o gráfico
  const chartData = Object.entries(sensoresPorTipo).map(([tipo, sensores]) => {
    const ultimasLeituras = sensores.map((sensor) => ({
      nome: sensor.nome,
      valor: sensor.ultima_leitura?.valor || 0,
      unidade: sensor.unidade || "",
    }));

    return {
      tipo,
      sensores: ultimasLeituras,
    };
  });

  // Cores para cada tipo de sensor
  const tipoColors = {
    Temperatura: "#ef4444",
    Umidade: "#3b82f6",
    Pluviometro: "#1d4ed8",
    Pressao: "#eadf08ff",
    Luminosidade: "#f97316",
    pH: "#a855f7",
    Outro: "#6b7280"
  };
  const tipoIcons = {
    Temperatura: <Thermometer className="h-4 w-4" />,
    Umidade: <Droplets className="h-4 w-4" />,
    Pluviometro: <CloudRain className="h-4 w-4" />,
    Pressao: <Zap className="h-4 w-4" />,
    Luminosidade: <Sun className="h-4 w-4" />,
    pH: <TestTube className="h-4 w-4" />,
  };

  const tipoBgMap = {
    Temperatura:
      "bg-gradient-to-br from-red-50 to-red-100 border-l-4 border-red-400",
    Umidade:
      "bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-blue-400",
    Pluviometro:
      "bg-gradient-to-br from-blue-100 to-blue-200 border-l-4 border-blue-600",
    Pressao:
      "bg-gradient-to-br from-yellow-50 to-yellow-100 border-l-4 border-yellow-400",
    Luminosidade:
      "bg-gradient-to-br from-orange-50 to-orange-100 border-l-4 border-orange-400",
    pH: "bg-gradient-to-br from-purple-50 to-purple-100 border-l-4 border-purple-400",
  };

  const tipoValueColorMap = {
    Temperatura: "text-red-600",
    Umidade: "text-blue-600",
    Pluviometro: "text-blue-700",
    Pressao: "text-yellow-600",
    Luminosidade: "text-orange-600",
    pH: "text-purple-600",
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Nunca";
    return new Date(dateString).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  if (sensores.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="text-center text-gray-500">
          Nenhum sensor disponível para exibir gráficos
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Leituras dos Sensores</h2>
      {/* ===== Cards dos Sensores ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 col-span-2">
        {sensores.map((sensor) => (
          <div
            key={sensor.id}
            className={`p-4 rounded-xl shadow-md ${
              tipoBgMap[sensor.tipo] || "bg-gray-100"
            }`}
          >
            {/* Header do Card */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-gray-800">
                  {tipoIcons[sensor.tipo] || tipoIcons["pH"]}
                </span>
                <span className="font-semibold text-gray-800 truncate">
                  {sensor.nome}
                </span>
              </div>
              {sensor.localizacao_json && (
                <MapPin
                  className="w-4 h-4 text-gray-400"
                  title="Com localização"
                />
              )}
            </div>
            <div className="flex flex-col">
              <div className="flex flex-row justify-around">
                {/* Tipo do Sensor */}
                <div className="mb-3">
                  <span className="text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded-full">
                    {sensor.tipo}
                  </span>
                </div>

                {/* Última Leitura */}
                <div className="flex items-center gap-2 mb-2">
                  <Gauge className="w-4 h-4 text-gray-400" />
                  <span
                    className={`text-xl font-bold ${
                      tipoValueColorMap[sensor.tipo]
                    }`}
                  >
                    {sensor.leituras[0]?.valor ?? "-"}
                    <span className="text-sm ml-1">{sensor.unidade ?? ""}</span>
                  </span>
                </div>

                {/* Data da Última Leitura */}
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(sensor.leituras[0]?.registrado_em)}</span>
                </div>
              </div>
              {/* Grafico */}
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={sensor.leituras?.slice(0, 10).reverse()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="registrado_em"
                        tickFormatter={(v) => new Date(v).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                        angle={0}
                        textAnchor="middle"
                        height={80}
                      />
                      <YAxis
                        label={{
                          value: sensor?.unidade || "Valor",
                          angle: -90,
                          position: "insideLeft",
                        }}
                      />
                      <Tooltip
                        formatter={(value) => [
                          `${value} ${sensor?.unidade || ""}`,
                          "Valor",
                        ]}
                        labelFormatter={(v) => `Data leitura: ${new Date(v).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", day: "2-digit" })}`}
                      />
                      <Bar
                        dataKey="valor"
                        fill={tipoColors[sensor.tipo] || tipoColors["Outro"]}
                        name="Valor"
                      />
                    </BarChart>
                  </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
