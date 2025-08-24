// VisualizarTalhao.jsx atualizado
"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import { toast } from "react-hot-toast";
import DedicatedGraph from "@/components/graphs/DedicatedGraph";

const MapView = dynamic(() => import("@/components/maps/MapView"), {
  ssr: false,
  loading: () => (
    <div className="h-96 bg-gray-100 rounded flex items-center justify-center">
      Carregando mapa...
    </div>
  ),
});

export default function VisualizarTalhao() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;
  const [talhaoData, setTalhaoData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [points, setPoints] = useState([]);

  useEffect(() => {
    if (id) {
      fetchTalhao();
    }
  }, [id]);

  const fetchTalhao = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/lavouras/${id}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao carregar talhão");
      }

      const data = await response.json();
      setTalhaoData(data);

      // Converter GeoJSON para pontos no mapa
      if (data.localizacao_json && data.localizacao_json.coordinates) {
        const coords = data.localizacao_json.coordinates[0];
        const formattedPoints = coords.map((coord) => ({
          lat: coord[1],
          lng: coord[0],
        }));

        // Remover último ponto se for igual ao primeiro (polígono fechado)
        if (
          formattedPoints.length > 1 &&
          formattedPoints[0].lat ===
            formattedPoints[formattedPoints.length - 1].lat &&
          formattedPoints[0].lng ===
            formattedPoints[formattedPoints.length - 1].lng
        ) {
          formattedPoints.pop();
        }

        setPoints(formattedPoints);
      }
    } catch (error) {
      console.error("Erro ao carregar talhão:", error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="text-lg">Carregando talhão...</div>
      </div>
    );
  }

  if (!talhaoData) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="text-lg">Talhão não encontrado</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Visualizar Talhão</h1>
        <button
          onClick={() => router.push("/logged/lavouras")}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Voltar para Lista
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informações do Talhão */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Dados do Talhão</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-500">
                Nome do Talhão
              </label>
              <p className="text-lg">{talhaoData.nome}</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-500">
                Tipo de Cultura
              </label>
              <p className="text-lg">
                {talhaoData.tipo_cultura || "Não informado"}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-500">
                Sistema de Irrigação
              </label>
              <p className="text-lg">
                {talhaoData.sistema_irrigacao || "Não informado"}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-500">
                Data de Plantio
              </label>
              <p className="text-lg">
                {talhaoData.data_plantio || "Não informada"}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-500">
                Descrição
              </label>
              <p className="text-lg">
                {talhaoData.descricao || "Não informada"}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-500">
                Área (hectares)
              </label>
              <p className="text-lg">{talhaoData.area || 0}</p>
            </div>
          </div>
        </div>
        {/* Mapa */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Localização</h2>
          <div className="h-96 rounded overflow-hidden">
            <MapView
              fields={[
                {
                  id: "view-field",
                  name: talhaoData.nome,
                  description: talhaoData.descricao,
                  type: "talhao",
                  coords: points
                    .filter((p) => p.lat && p.lng)
                    .map((p) => [p.lat, p.lng]),
                },
              ]}
              selectedIds={["view-field"]}
            />
          </div>
        </div>
        <div className="col-span-1 lg:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow">
            <DedicatedGraph talhao={talhaoData} />
          </div>
        </div>
        <div className="col-span-1 lg:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow">
            <Link href={`/logged/monitoramento/${id}/sensores`}>
              <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                Editar sensores
              </button>
            </Link> 
          </div>
        </div>
      </div>
    </div>
  );
}
