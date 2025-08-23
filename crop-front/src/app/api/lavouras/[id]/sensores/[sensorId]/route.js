import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET - Buscar sensor específico
export async function GET(request, { params }) {
  const { id, sensorId } = params;
  const cookieStore = request.cookies;
  const supabase = createClient(cookieStore);

  try {
    // Autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Buscar sensor com verificação de propriedade
    const { data: sensor, error: sensorError } = await supabase
      .from('sensores')
      .select('*')
      .eq('id', sensorId)
      .eq('talhao_id', id)
      .single();

    if (sensorError || !sensor) {
      return NextResponse.json({ error: 'Sensor não encontrado' }, { status: 404 });
    }

    // Verificar se o talhão pertence ao usuário
    const { data: talhao, error: talhaoError } = await supabase
      .from('talhoes')
      .select('user_id')
      .eq('id', id)
      .single();

    if (talhaoError || !talhao || talhao.user_id !== user.id) {
      return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 403 });
    }

    return NextResponse.json(sensor, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Atualizar sensor
export async function PUT(request, { params }) {
  const { id, sensorId } = params;
  const cookieStore = request.cookies;
  const supabase = createClient(cookieStore);

  try {
    // Autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar se o sensor pertence ao usuário
    const { data: talhao, error: talhaoError } = await supabase
      .from('talhoes')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (talhaoError || !talhao) {
      return NextResponse.json({ error: 'Talhão não encontrado' }, { status: 404 });
    }

    // Validar corpo da requisição
    const body = await request.json();
    
    if (!body.nome || !body.tipo || !body.unidade) {
      return NextResponse.json(
        { error: 'Nome, tipo e unidade são obrigatórios' },
        { status: 400 }
      );
    }

    // Atualizar sensor
    const { data: sensor, error: sensorError } = await supabase
      .from('sensores')
      .update({
        nome: body.nome,
        tipo: body.tipo,
        unidade: body.unidade,
        parametros: body.parametros || {},
        localizacao_json: body.localizacao_json || null
      })
      .eq('id', sensorId)
      .eq('talhao_id', id)
      .select()
      .single();

    if (sensorError) throw sensorError;

    return NextResponse.json(sensor, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Deletar sensor
export async function DELETE(request, { params }) {
  const { id, sensorId } = params;
  const cookieStore = request.cookies;
  const supabase = createClient(cookieStore);

  try {
    // Autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar se o sensor pertence ao usuário
    const { data: talhao, error: talhaoError } = await supabase
      .from('talhoes')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (talhaoError || !talhao) {
      return NextResponse.json({ error: 'Talhão não encontrado' }, { status: 404 });
    }

    // Deletar sensor
    const { error: deleteError } = await supabase
      .from('sensores')
      .delete()
      .eq('id', sensorId)
      .eq('talhao_id', id);

    if (deleteError) throw deleteError;

    return NextResponse.json({ message: 'Sensor deletado com sucesso' }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}