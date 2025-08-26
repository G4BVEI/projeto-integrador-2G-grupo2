'use client';

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Breadcrumb from "@/components/layout/Breadcrumb";
import MapPointEditor from "@/components/maps/MapPointEditor";
import { Thermometer, Droplets, CloudRain, Zap, Sun, Square, Save, MapPin, Gauge, TestTube } from "lucide-react";
import { toast } from "react-hot-toast";

// Mapeamento de tipos para unidades padrão
const tipoUnidades = {
  "Temperatura": "°C",
  "Umidade": "%",
  "Pluviometro": "mm",
  "Pressao": "hPa",
  "Luminosidade": "lux",
  "pH": " "
};

// Ícones para cada tipo de sensor
const tipoIconos = {
  "Temperatura": <Thermometer className="w-5 h-5 text-red-500" />,
  "Umidade": <Droplets className="w-5 h-5 text-blue-500" />,
  "Pluviometro": <CloudRain className="w-5 h-5 text-blue-600" />,
  "Pressao": <Zap className="w-5 h-5 text-yellow-500" />,
  "Luminosidade": <Sun className="w-5 h-5 text-orange-400" />,
  "pH": <TestTube className="w-5 h-5 text-purple-500" />
};


function EditarSensor() {
  const [talhao, setTalhao] = useState(null);
  const [sensor, setSensor] = useState(null);
  const [dadosSensor, setDadosSensor] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [novoValor, setNovoValor] = useState("");

  const [formData, setFormData] = useState({
    nome: '',
    tipo: '',
    unidade: '',
    parametros: '',
    latitude: '',
    longitude: ''
  });

  const params = useParams();
  const router = useRouter();
  const supabase = createClient();

  // Fetch inicial
  useEffect(() => {
    async function fetchData() {
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

        // Sensor
        const { data: sensorData, error: sensorError } = await supabase
          .from("sensores")
          .select("*")
          .eq("id", params.sensorId)
          .single();
        
        if (sensorError) throw sensorError;
        setSensor(sensorData);

        // Preencher formulário com dados do sensor
        if (sensorData) {
          setFormData({
            nome: sensorData.nome || '',
            tipo: sensorData.tipo || '',
            unidade: sensorData.unidade || '',
            parametros: sensorData.parametros ? JSON.stringify(sensorData.parametros, null, 2) : '',
            latitude: sensorData.localizacao_json?.coordinates?.[1]?.toString() || '',
            longitude: sensorData.localizacao_json?.coordinates?.[0]?.toString() || ''
          });
        }

        // Dados do sensor
        const { data: dadosData, error: dadosError } = await supabase
          .from("dados_sensor")
          .select("*")
          .eq("sensor_id", params.sensorId)
          .order("registrado_em", { ascending: false });
        
        if (dadosError) throw dadosError;
        setDadosSensor(dadosData || []);

      } catch (err) {
        setError(err.message || "Erro ao carregar dados");
        toast.error("Erro ao carregar dados do sensor");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [params.id, params.sensorId]);

  // Atualizar unidade automaticamente quando o tipo mudar
  useEffect(() => {
    if (formData.tipo && tipoUnidades[formData.tipo]) {
      setFormData(prev => ({
        ...prev,
        unidade: tipoUnidades[formData.tipo]
      }));
    }
  }, [formData.tipo]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePointUpdate = (newPoint) => {
    setFormData(prev => ({
      ...prev,
      latitude: newPoint[0].toFixed(6),
      longitude: newPoint[1].toFixed(6)
    }));
  };

  const handleUpdateSensor = async (e) => {
    e.preventDefault();
    setUpdating(true);

    try {
      // Parse parâmetros JSON
      let parametrosObj = {};
      if (formData.parametros) {
        try {
          parametrosObj = JSON.parse(formData.parametros);
        } catch {
          throw new Error('Parâmetros devem estar em formato JSON válido');
        }
      }

      // Preparar localização do sensor
      let localizacaoJson = null;
      if (formData.latitude && formData.longitude) {
        localizacaoJson = {
          type: 'Point',
          coordinates: [Number(formData.longitude), Number(formData.latitude)]
        };
      }

      const response = await fetch(`/api/lavouras/${params.id}/sensores/${params.sensorId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: formData.nome,
          tipo: formData.tipo,
          unidade: formData.unidade,
          parametros: parametrosObj,
          localizacao_json: localizacaoJson
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erro ao atualizar sensor');
      }

      const updatedSensor = await response.json();
      setSensor(updatedSensor);
      toast.success("Sensor atualizado com sucesso!");

    } catch (err) {
      console.error('Erro na atualização:', err);
      toast.error(err.message);
    } finally {
      setUpdating(false);
    }
  };

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
      toast.success("Dado registrado com sucesso!");
    } catch (err) {
      toast.error("Erro ao registrar dado: " + err.message);
    }
  };

if (loading) return (
  <div className="fixed inset-0 flex items-center justify-center bg-white/80 z-50">
    <div className="text-center">
      <div className="flex items-center justify-center">
        <div className="animate-spin rounded-full border-b-2 border-green-600 h-16 w-16" />
      </div>
      <p className="mt-4 text-gray-600">Carregando informações do Sensor...</p>
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

  const breadcrumbItems = [
    { label: "Monitoramento", href: "/protegido/monitoramento" },
    ...(talhao ? [{ label: talhao.nome, href: `/protegido/monitoramento/${talhao.id}` }] : []),
    { label: "Sensores", href: `/protegido/monitoramento/${params.id}/sensores` },
    { label: "Editar Sensor" },
    ...(sensor ? [{ label: sensor.nome }] : []),
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <Breadcrumb items={breadcrumbItems} />
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          {formData.tipo ? tipoIconos[formData.tipo] : <Square className="w-8 h-8 text-gray-400" />}
          Editar Sensor
        </h1>
        <p className="text-gray-600 mt-2">
          Talhão: <span className="font-semibold text-green-700">{talhao?.nome}</span>
          {talhao?.tipo_cultura && ` • ${talhao.tipo_cultura}`}
          {talhao?.area && ` • ${talhao.area} ha`}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Formulário de Edição */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Informações do Sensor</h2>
          
          <form onSubmit={handleUpdateSensor} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Sensor *
              </label>
              <input
                type="text"
                name="nome"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                value={formData.nome}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Sensor *
              </label>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(tipoUnidades).map(([tipo, unidade]) => (
                  <button
                    key={tipo}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, tipo }))}
                    className={`p-4 border-2 rounded-lg text-center transition-all ${
                      formData.tipo === tipo
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      {tipoIconos[tipo]}
                      <span className="text-sm font-medium">{tipo}</span>
                      {unidade && (
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          {unidade}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unidade de Medida *
              </label>
              <input
                type="text"
                name="unidade"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                value={formData.unidade}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Parâmetros Avançados (JSON)
              </label>
              <textarea
                name="parametros"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all font-mono text-sm"
                rows={4}
                value={formData.parametros}
                onChange={handleInputChange}
                placeholder='{"frequencia_leituras": 5, "limite_min": 0, "limite_max": 100}'
              />
            </div>

            <button
              type="submit"
              disabled={updating || !formData.nome || !formData.tipo || !formData.unidade}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 text-white py-3 px-6 rounded-lg font-medium transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:shadow-none"
            >
              {updating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Atualizando...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Atualizar Sensor
                </>
              )}
            </button>
          </form>
        </div>

        {/* Mapa */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-green-600" />
              Localização do Sensor
            </h2>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              Opcional
            </span>
          </div>

          <div className="h-96 rounded-lg overflow-hidden border border-gray-200 mb-4">
            {talhao && (
              <MapPointEditor
                fields={[{
                  id: talhao.id,
                  nome: talhao.nome,
                  coords: talhao.localizacao_json?.coordinates?.[0]?.map(c => [c[1], c[0]]) || []
                }]}
                selectedIds={[talhao.id]}
                initialPoint={formData.latitude && formData.longitude
                  ? [Number(formData.latitude), Number(formData.longitude)]
                  : null}
                onPointUpdate={handlePointUpdate}
              />
            )}
          </div>

          {formData.latitude && formData.longitude ? (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-sm font-medium">
                📍 Localização definida
              </p>
              <p className="text-green-700 text-xs mt-1">
                Lat: {formData.latitude} | Long: {formData.longitude}
              </p>
            </div>
          ) : (
            <div className="p-4 bg-green-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 text-sm">
                Clique no mapa para definir a localização
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Registro de Novos Dados */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Gauge className="w-5 h-5 text-green-600" />
          Registrar Novo Dado
        </h2>
        
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valor do Dado *
            </label>
            <input
              type="number"
              step="0.01"
              value={novoValor}
              onChange={e => setNovoValor(e.target.value)}
              placeholder={`Digite o valor em ${formData.unidade || 'unidades'}`}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            />
          </div>
          <button
            onClick={handleAddData}
            disabled={!novoValor}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Registrar
          </button>
        </div>
      </div>

      {/* Histórico de Dados */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Histórico de Leituras</h2>
          <p className="text-sm text-gray-600">Últimas leituras registradas para este sensor</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-gray-600 uppercase text-xs font-medium">
                <th className="px-6 py-3 text-left">Data e Hora</th>
                <th className="px-6 py-3 text-left">Valor</th>
                <th className="px-6 py-3 text-left">Unidade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {dadosSensor.length > 0 ? (
                dadosSensor.map(dado => (
                  <tr key={dado.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      {new Date(dado.registrado_em).toLocaleString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-800">
                      {dado.valor}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {formData.unidade}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="px-6 py-12 text-center">
                    <div className="text-gray-400 mb-2">
                      <Gauge className="w-12 h-12 mx-auto" />
                    </div>
                    <p className="text-gray-500">Nenhum dado registrado</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Use o formulário acima para registrar a primeira leitura
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default EditarSensor;