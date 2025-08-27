import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Dicionário de valores ideais para cada cultura (com umidade em %)
const culturaValores = {
  Soja: { temp_min: 20, temp_max: 30, umid_min: 60, umid_max: 80, ph_min: 5.5, ph_max: 6.5 },
  Milho: { temp_min: 18, temp_max: 27, umid_min: 60, umid_max: 80, ph_min: 5.5, ph_max: 6.5 },
  Trigo: { temp_min: 15, temp_max: 22, umid_min: 50, umid_max: 70, ph_min: 6.0, ph_max: 7.0 },
  Cevada: { temp_min: 12, temp_max: 20, umid_min: 50, umid_max: 70, ph_min: 6.0, ph_max: 7.5 },
  Café: { temp_min: 18, temp_max: 23, umid_min: 60, umid_max: 80, ph_min: 6.0, ph_max: 7.0 },
  "Cana-de-açúcar": { temp_min: 22, temp_max: 30, umid_min: 60, umid_max: 80, ph_min: 6.0, ph_max: 7.0 },
  Algodão: { temp_min: 20, temp_max: 30, umid_min: 50, umid_max: 70, ph_min: 6.0, ph_max: 7.0 },
  Arroz: { temp_min: 20, temp_max: 30, umid_min: 70, umid_max: 90, ph_min: 6.0, ph_max: 7.0 },
  Feijão: { temp_min: 18, temp_max: 24, umid_min: 50, umid_max: 70, ph_min: 6.0, ph_max: 7.0 },
  Sorgo: { temp_min: 25, temp_max: 30, umid_min: 40, umid_max: 60, ph_min: 6.0, ph_max: 7.0 },
  Amendoim: { temp_min: 20, temp_max: 30, umid_min: 60, umid_max: 80, ph_min: 6.0, ph_max: 7.0 },
  Girassol: { temp_min: 18, temp_max: 25, umid_min: 40, umid_max: 60, ph_min: 6.0, ph_max: 7.0 },
  Canola: { temp_min: 10, temp_max: 20, umid_min: 40, umid_max: 60, ph_min: 6.0, ph_max: 7.0 },
  Mandioca: { temp_min: 20, temp_max: 27, umid_min: 50, umid_max: 70, ph_min: 6.0, ph_max: 7.0 },
};

// GET - Buscar alertas
export async function GET(request) {
  const supabase = createClient();

  try {
    const { searchParams } = new URL(request.url);
    const apenasNaoVerificados = searchParams.get('nao_verificados') === 'true';

    let query = supabase
      .from('alertas')
      .select(`
        *,
        sensores (*),
        talhoes (*)
      `)
      .order('criado_em', { ascending: false });

    if (apenasNaoVerificados) {
      query = query.eq('verificado', false);
    }

    const { data: alertas, error } = await query;

    if (error) throw error;

    return NextResponse.json(alertas);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST - Verificar e gerar novos alertas
export async function POST(request) {
  const supabase = createClient();

  try {
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
    const novosAlertas = [];
    
    for (const dado of dadosSensores) {
      const sensor = sensores.find(s => s.id === dado.sensor_id);
      if (!sensor) continue;
      
      const talhao = talhoes.find(t => t.id === sensor.talhao_id);
      if (!talhao || !talhao.tipo_cultura) continue;
      
      const valoresIdeais = culturaValores[talhao.tipo_cultura];
      if (!valoresIdeais) continue;
      
      // Verificar se já existe um alerta não verificado para este sensor
      const { data: alertaExistente, error: alertaError } = await supabase
        .from('alertas')
        .select('*')
        .eq('sensor_id', sensor.id)
        .eq('verificado', false)
        .limit(1);
      
      if (alertaError) throw alertaError;
      
      // Se já existe um alerta não verificado, pular para o próximo sensor
      if (alertaExistente && alertaExistente.length > 0) {
        continue;
      }
      
      // Verificar se o valor está fora do range ideal
      let problema = null;
      let tipoAlerta = null;
      let valorIdealMin = null;
      let valorIdealMax = null;
      
      switch (sensor.tipo) {
        case "Temperatura":
          tipoAlerta = "temperatura";
          valorIdealMin = valoresIdeais.temp_min;
          valorIdealMax = valoresIdeais.temp_max;
          
          if (dado.valor < valoresIdeais.temp_min) {
            problema = `Temperatura abaixo do ideal (${valoresIdeais.temp_min}°C - ${valoresIdeais.temp_max}°C)`;
          } else if (dado.valor > valoresIdeais.temp_max) {
            problema = `Temperatura acima do ideal (${valoresIdeais.temp_min}°C - ${valoresIdeais.temp_max}°C)`;
          }
          break;
          
        case "Umidade":
          tipoAlerta = "umidade";
          valorIdealMin = valoresIdeais.umid_min;
          valorIdealMax = valoresIdeais.umid_max;
          
          if (dado.valor < valoresIdeais.umid_min) {
            problema = `Umidade do solo abaixo do ideal (${valoresIdeais.umid_min}% - ${valoresIdeais.umid_max}%)`;
          } else if (dado.valor > valoresIdeais.umid_max) {
            problema = `Umidade do solo acima do ideal (${valoresIdeais.umid_min}% - ${valoresIdeais.umid_max}%)`;
          }
          break;
          
        case "pH":
          tipoAlerta = "ph";
          valorIdealMin = valoresIdeais.ph_min;
          valorIdealMax = valoresIdeais.ph_max;
          
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
        const alertaData = {
          sensor_id: sensor.id,
          talhao_id: talhao.id,
          tipo_alerta: tipoAlerta,
          valor_medido: dado.valor,
          valor_ideal_min: valorIdealMin,
          valor_ideal_max: valorIdealMax,
          mensagem: problema,
          verificado: false
        };
        
        // Salvar alerta no banco
        const { data: alertaSalvo, error: insertError } = await supabase
          .from('alertas')
          .insert([alertaData])
          .select();
        
        if (insertError) throw insertError;
        
        if (alertaSalvo && alertaSalvo.length > 0) {
          novosAlertas.push(alertaSalvo[0]);
        }
      }
    }
    
    return NextResponse.json({ 
      message: 'Verificação de alertas concluída', 
      novos_alertas: novosAlertas.length,
      alertas: novosAlertas 
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH - Marcar alerta como verificado
export async function PATCH(request) {
  const supabase = createClient();

  try {
    const { id } = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: "ID do alerta é obrigatório" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('alertas')
      .update({ 
        verificado: true,
        verificado_em: new Date().toISOString()
      })
      .eq('id', id)
      .select();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}