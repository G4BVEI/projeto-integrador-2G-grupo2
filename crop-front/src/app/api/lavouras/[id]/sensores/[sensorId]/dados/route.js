import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET - Buscar dados do sensor
export async function GET(request, { params }) {
  const { id, sensorId } = params;
  const supabase = createClient(request.cookies);

  try {
    const { data: dados, error } = await supabase
      .from('dados_sensor')
      .select('*')
      .eq('sensor_id', sensorId)
      .order('registrado_em', { ascending: false });

    if (error) throw error;

    return NextResponse.json(dados);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST - Adicionar dado
export async function POST(request, { params }) {
  const { id, sensorId } = params;
  const supabase = createClient(request.cookies);

  try {
    const body = await request.json();
    if (!body.valor) return NextResponse.json({ error: "Valor obrigatório" }, { status: 400 });

    const { data, error } = await supabase
      .from('dados_sensor')
      .insert({ sensor_id: sensorId, valor: body.valor, registrado_em: new Date().toISOString() })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
