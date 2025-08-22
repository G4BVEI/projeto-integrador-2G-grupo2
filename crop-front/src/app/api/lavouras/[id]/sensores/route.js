import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request, { params }) {
  const { id } = params;
  const cookieStore = request.cookies;
  const supabase = createClient(cookieStore);

  try {
    // 1. Autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // 2. Validar se o talhão pertence ao usuário
    const { data: talhao, error: talhaoError } = await supabase
      .from('talhoes')
      .select('id, user_id')
      .eq('id', id)
      .single();

    if (talhaoError || !talhao || talhao.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Talhão não encontrado ou não pertence ao usuário' },
        { status: 404 }
      );
    }

    // 3. Validar corpo da requisição
    const body = await request.json();
    
    if (!body.nome || !body.tipo || !body.unidade) {
      return NextResponse.json(
        { error: 'Nome, tipo e unidade são obrigatórios' },
        { status: 400 }
      );
    }

    // 4. Inserir sensor
    const { data, error } = await supabase
      .from('sensores')
      .insert({
        talhao_id: id,
        nome: body.nome,
        tipo: body.tipo,
        unidade: body.unidade,
        parametros: body.parametros || {},
        localizacao_json: body.localizacao_json || null
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });

  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}