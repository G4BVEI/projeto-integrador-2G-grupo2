"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { AlertTriangle, CheckCircle } from "lucide-react";

// Dicionário de valores ideais para cada cultura
const culturaValores = {
  Soja: { temp_min: 20, temp_max: 30, umid_min: 600, umid_max: 700, ph_min: 5.5, ph_max: 6.5 },
  Milho: { temp_min: 18, temp_max: 27, umid_min: 500, umid_max: 800, ph_min: 5.5, ph_max: 6.5 },
  Trigo: { temp_min: 15, temp_max: 22, umid_min: 450, umid_max: 650, ph_min: 6.0, ph_max: 7.0 },
  Cevada: { temp_min: 12, temp_max: 20, umid_min: 350, umid_max: 600, ph_min: 6.0, ph_max: 7.5 },
  Café: { temp_min: 18, temp_max: 23, umid_min: 1200, umid_max: 1800, ph_min: 6.0, ph_max: 7.0 },
  "Cana-de-açúcar": { temp_min: 22, temp_max: 30, umid_min: 1200, umid_max: 1800, ph_min: 6.0, ph_max: 7.0 },
  Algodão: { temp_min: 20, temp_max: 30, umid_min: 700, umid_max: 1200, ph_min: 6.0, ph_max: 7.0 },
  Arroz: { temp_min: 20, temp_max: 30, umid_min: 800, umid_max: 1200, ph_min: 6.0, ph_max: 7.0 },
  Feijão: { temp_min: 18, temp_max: 24, umid_min: 300, umid_max: 600, ph_min: 6.0, ph_max: 7.0 },
  Sorgo: { temp_min: 25, temp_max: 30, umid_min: 400, umid_max: 600, ph_min: 6.0, ph_max: 7.0 },
  Amendoim: { temp_min: 20, temp_max: 30, umid_min: 500, umid_max: 700, ph_min: 6.0, ph_max: 7.0 },
  Girassol: { temp_min: 18, temp_max: 25, umid_min: 400, umid_max: 600, ph_min: 6.0, ph_max: 7.0 },
  Canola: { temp_min: 10, temp_max: 20, umid_min: 400, umid_max: 600, ph_min: 6.0, ph_max: 7.0 },
  Mandioca: { temp_min: 20, temp_max: 27, umid_min: 500, umid_max: 700, ph_min: 6.0, ph_max: 7.0 },
};

export default function Alertas() {
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const supabase = createClient();

  useEffect(() => {
    fetchAlertas();
  }, []);

  const fetchAlertas = async () => {
    try {
      setLoading(true);
      
      // Buscar todos os talhões
      const { data: talhoes, error: talhoesError } = await supabase
        .from("talhoes")
        .select("*");
      
      if (talhoesError) throw talhoesError;

      // Buscar todos os sensores
      const { data: sensores, error: sensoresError } = await supabase
        .from("sensores")
        .select("*");
      
      if (sensoresError) throw sensoresError;

      // Buscar os dados mais recentes de cada sensor
      const dadosSensorPromises = sensores.map(async (sensor) => {
        const { data, error } = await supabase
          .from("dados_sensor")
          .select("*")
          .eq("sensor_id", sensor.id)
          .order("registrado_em", { ascending: false })
          .limit(1);
        
        if (error) throw error;
        return data && data.length > 0 ? { ...data[0], sensor_id: sensor.id } : null;
      });

      const dadosSensores = (await Promise.all(dadosSensorPromises)).filter(Boolean);

      // Gerar alertas
      const alertasGerados = [];
      
      for (const dado of dadosSensores) {
        const sensor = sensores.find(s => s.id === dado.sensor_id);
        if (!sensor) continue;
        
        const talhao = talhoes.find(t => t.id === sensor.talhao_id);
        if (!talhao || !talhao.tipo_cultura) continue;
        
        const valoresIdeais = culturaValores[talhao.tipo_cultura];
        if (!valoresIdeais) continue;
        
        // Verificar se o valor está fora do range ideal
        let problema = null;
        
        switch (sensor.tipo) {
          case "Temperatura":
            if (dado.valor < valoresIdeais.temp_min) {
              problema = `Temperatura abaixo do ideal (${valoresIdeais.temp_min}°C - ${valoresIdeais.temp_max}°C)`;
            } else if (dado.valor > valoresIdeais.temp_max) {
              problema = `Temperatura acima do ideal (${valoresIdeais.temp_min}°C - ${valoresIdeais.temp_max}°C)`;
            }
            break;
            
          case "Umidade":
            if (dado.valor < valoresIdeais.umid_min) {
              problema = `Umidade do solo abaixo do ideal (${valoresIdeais.umid_min} - ${valoresIdeais.umid_max})`;
            } else if (dado.valor > valoresIdeais.umid_max) {
              problema = `Umidade do solo acima do ideal (${valoresIdeais.umid_min} - ${valoresIdeais.umid_max})`;
            }
            break;
            
          case "pH":
            if (dado.valor < valoresIdeais.ph_min) {
              problema = `pH abaixo do ideal (${valoresIdeais.ph_min} - ${valoresIdeais.ph_max}). Considere aplicar calcário.`;
            } else if (dado.valor > valoresIdeais.ph_max) {
              problema = `pH acima do ideal (${valoresIdeais.ph_min} - ${valoresIdeais.ph_max}). Considere aplicar enxofre.`;
            }
            break;
            
          default:
            // Para outros tipos de sensor, não temos valores de referência
            break;
        }
        
        if (problema) {
          alertasGerados.push({
            id: `${dado.sensor_id}-${dado.registrado_em}`,
            sensor,
            talhao,
            dado,
            problema,
            registrado_em: dado.registrado_em,
          });
        }
      }
      
      // Ordenar por data (mais recente primeiro)
      alertasGerados.sort((a, b) => new Date(b.registrado_em) - new Date(a.registrado_em));
      
      setAlertas(alertasGerados);
    } catch (err) {
      setError(err.message);
      console.error("Erro ao buscar alertas:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 z-50">
        <div className="text-center">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full border-b-2 border-green-600 h-16 w-16" />
          </div>
          <p className="mt-4 text-gray-600">Buscando alertas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-500">
          <p className="text-lg font-semibold mb-2">Erro ao carregar alertas</p>
          <p>{error}</p>
          <button
            onClick={fetchAlertas}
            className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <AlertTriangle className="text-yellow-500" />
            Alertas do Sistema
          </h1>
          <p className="text-gray-600 mt-1">Monitoramento de condições anômalas nas lavouras</p>
        </div>

        {alertas.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Nenhum alerta no momento</h2>
            <p className="text-gray-600">Todos os sensores estão reportando valores dentro dos parâmetros normais.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {alertas.map((alerta) => (
              <div key={alerta.id} className="bg-white p-6 rounded-xl shadow-lg border border-red-100 border-l-4 border-l-red-500">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      Alerta no {alerta.talhao.nome} - {alerta.talhao.tipo_cultura}
                    </h3>
                    <p className="text-gray-700 mb-2">
                      O sensor <strong>{alerta.sensor.nome}</strong> ({alerta.sensor.tipo}) detectou um valor fora do normal:{" "}
                      <strong>{alerta.dado.valor} {alerta.sensor.unidade}</strong>
                    </p>
                    <p className="text-red-600 font-medium mb-3">{alerta.problema}</p>
                    <p className="text-sm text-gray-500">
                      Detectado em: {new Date(alerta.registrado_em).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div className="ml-4 flex flex-col gap-2">
                    <Link
                      href={`/protegido/monitoramento/${alerta.talhao.id}/sensores/editar/${alerta.sensor.id}`}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm text-center"
                    >
                      Ver Sensor
                    </Link>
                    <Link
                      href={`/protegido/monitoramento/${alerta.talhao.id}`}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm text-center"
                    >
                      Ver Talhão
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}