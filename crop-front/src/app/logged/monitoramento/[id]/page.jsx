'use client';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { createClient } from "@/lib/supabase/client";
import CombinedGraphs from "@/components/graphs/CombinedGraphs";
import { Thermometer, Droplets, CloudRain, Zap, Sun, Plus, Edit2, Gauge, Calendar, MapPin, Sprout, Navigation, TestTube, Settings} from "lucide-react";
import "leaflet/dist/leaflet.css";
import DedicatedGraph from "@/components/graphs/DedicatedGraph";
import SensorGraph from "@/components/graphs/SensorGraph";

const MapView = dynamic(() => import("@/components/maps/MapView"), { ssr: false });

export default function DashboardTalhao() {
  const params = useParams();
  const supabase = createClient();
  const [talhao, setTalhao] = useState(null);
  const [sensores, setSensores] = useState([]);
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const tipoIconMap = {
    "Temperatura": <Thermometer className="w-5 h-5 text-red-500" />,
    "Umidade": <Droplets className="w-5 h-5 text-blue-500" />,
    "Pluviometro": <CloudRain className="w-5 h-5 text-blue-600" />,
    "Pressao": <Zap className="w-5 h-5 text-yellow-500" />,
    "Luminosidade": <Sun className="w-5 h-5 text-orange-400" />,
    "pH": <TestTube className="w-5 h-5 text-purple-500" />,
  };

  const tipoBgMap = {
    "Temperatura": "bg-gradient-to-br from-red-50 to-red-100 border-l-4 border-red-400",
    "Umidade": "bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-blue-400",
    "Pluviometro": "bg-gradient-to-br from-blue-100 to-blue-200 border-l-4 border-blue-600",
    "Pressao": "bg-gradient-to-br from-yellow-50 to-yellow-100 border-l-4 border-yellow-400",
    "Luminosidade": "bg-gradient-to-br from-orange-50 to-orange-100 border-l-4 border-orange-400",
    "pH": "bg-gradient-to-br from-purple-50 to-purple-100 border-l-4 border-purple-400"
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Nunca";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  useEffect(() => {
    if (!params.id) return;
    fetchData();
  }, [params.id]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Talhão
      const { data: talhaoData, error: talhaoError } = await supabase
        .from("talhoes")
        .select("*")
        .eq("id", params.id)
        .single();
      if (talhaoError) throw talhaoError;
      setTalhao(talhaoData);

      // Pontos do talhão
      if (talhaoData.localizacao_json?.coordinates) {
        const coords = talhaoData.localizacao_json.coordinates[0];
        const formatted = coords.map(c => ({ lat: c[1], lng: c[0] }));
        if (formatted.length > 1 &&
            formatted[0].lat === formatted[formatted.length-1].lat &&
            formatted[0].lng === formatted[formatted.length-1].lng) formatted.pop();
        setPoints(formatted);
      }

      // Sensores
      const { data: sensoresData, error: sensoresError } = await supabase
        .from("sensores")
        .select("*")
        .eq("talhao_id", params.id)
        .order("criado_em", { ascending: false });
      if (sensoresError) throw sensoresError;

      const sensoresComUltimaLeitura = await Promise.all(
        sensoresData.map(async s => {
          const { data, error } = await supabase
            .from("dados_sensor")
            .select("valor, registrado_em")
            .eq("sensor_id", s.id)
            .order("registrado_em", { ascending: false })
            .limit(1);
          if (error) console.error(error);
          return { ...s, ultima_leitura: data?.[0] || null };
        })
      );

      setSensores(sensoresComUltimaLeitura);
    } catch (err) {
      setError(err.message || "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/80 z-50">
      <div className="text-center">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full border-b-2 border-green-600 h-16 w-16" />
        </div>
        <p className="mt-4 text-gray-600">Carregando informações sobre sua lavoura...</p>
      </div>
    </div>
  );


  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center text-red-500">
        <p className="text-lg font-semibold mb-2">Erro ao carregar</p>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );

  if (!talhao) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center text-gray-500">
        <p className="text-lg font-semibold">Talhão não encontrado</p>
      </div>
    </div>
  );

  const sensoresComLocalizacao = sensores.filter(s => s.localizacao_json?.coordinates);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <Sprout className="text-green-600" />
          {talhao.nome}
        </h1>
        <p className="text-gray-600 mt-1">Monitoramento em tempo real</p>
      </div>

      <div className="space-y-6">

        {/* Informações do Talhão + Mapa */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Informações do Talhão */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <Sprout className="w-5 h-5 text-green-600" />
                Informações do Talhão
              </h2>
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" title="Online"></div>
            </div>

            <div className="space-y-3 text-gray-700 mb-6">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="font-medium">Cultura</span>
                <span className="text-gray-600">{talhao.tipo_cultura || "Não informado"}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="font-medium">Sistema de Irrigação</span>
                <span className="text-gray-600">{talhao.sistema_irrigacao || "Não informado"}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="font-medium">Data de Plantio</span>
                <span className="text-gray-600">{talhao.data_plantio || "Não informada"}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="font-medium">Área Total</span>
                <span className="text-gray-600">{talhao.area || 0} ha</span>
              </div>
              <div className="pt-2">
                <span className="font-medium block mb-1">Descrição</span>
                <p className="text-gray-600 text-sm">
                  {talhao.descricao ? talhao.descricao : "Sem descrição provida"}
                </p>
              </div>
            </div>
<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
  <Link href={`/logged/monitoramento/${talhao.id}/editar`} className="sm:col-span-2">
    <button className="w-full flex items-center justify-center gap-2 px-4 py-3 
      bg-green-600 text-white rounded-lg 
      hover:bg-green-500 transition-all shadow-md hover:shadow-lg">
      <Edit2 className="w-4 h-4" />
      <span className="font-medium">Editar Talhão</span>
    </button>
  </Link>

  <Link href={`/logged/monitoramento/${talhao.id}/sensores`}>
    <button className="w-full flex items-center justify-center gap-2 px-4 py-3 
      bg-green-500 text-white rounded-lg 
      hover:bg-green-600 transition-all shadow-md hover:shadow-lg">
      <Settings className="w-4 h-4" />
      <span className="font-medium">Gerenciar Sensores</span>
    </button>
  </Link>

  <Link href={`/logged/monitoramento/${talhao.id}/sensores/adicionar`}>
    <button className="w-full flex items-center justify-center gap-2 px-4 py-3 
      bg-green-500 text-white rounded-lg 
      hover:bg-green-600 transition-all shadow-md hover:shadow-lg">
      <Plus className="w-4 h-4" />
      <span className="font-medium">Adicionar Sensor</span>
    </button>
  </Link>
</div>



          </div>

          {/* Mapa */}
          <div className="col-span-2 bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <Navigation className="w-5 h-5 text-green-600" />
                Localização Geográfica
              </h2>
              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {sensoresComLocalizacao.length} sensor(es) mapeado(s)
              </span>
            </div>
            
            <div className="h-96 rounded-xl overflow-hidden border border-gray-200">
              <MapView
                fields={[{
                  id: talhao.id,
                  name: talhao.nome,
                  description: talhao.descricao,
                  type: 'talhao',
                  coords: points.map(p => [p.lat, p.lng])
                }]}
                selectedIds={[talhao.id]}
                sensorPoints={sensoresComLocalizacao.map(s => ({
                  ...s,
                  popupContent: `
                    <div class="p-3">
                      <h4 class="font-semibold text-gray-800 mb-2">${s.nome}</h4>
                      <div class="space-y-1 text-sm">
                        <p><span class="font-medium">Tipo:</span> ${s.tipo}</p>
                        <p><span class="font-medium">Leitura:</span> ${s.ultima_leitura?.valor ?? '-'} ${s.unidade ?? ''}</p>
                        <p><span class="font-medium">Última atualização:</span> ${formatDate(s.ultima_leitura?.registrado_em)}</p>
                      </div>
                    </div>
                  `
                }))}
              />
            </div>
            
            <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
              <span>Coordenadas do talhão</span>
              <span>{points.length} pontos demarcados</span>
            </div>
          </div>
        </div>

        {/* Gráficos Combinados */}
        <DedicatedGraph talhao={talhao} />
        <SensorGraph sensores={sensores} />

        {/* Lista de Sensores */}
      </div>
    </div>
  );
}