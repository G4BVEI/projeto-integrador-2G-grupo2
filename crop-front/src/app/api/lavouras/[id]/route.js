import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request, { params }) {
  const cookieStore = request.cookies
  const supabase = createClient(cookieStore)
  const { id } = params

  try {
    // 1. Autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // 2. Buscar lavoura específico
    const { data, error } = await supabase
      .from('lavouras')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Lavoura não encontrado' },
          { status: 404 }
        )
      }
      throw error
    }

    return NextResponse.json(data)

  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

export async function PUT(request, { params }) {
  const cookieStore = request.cookies
  const supabase = createClient(cookieStore)
  const { id } = params

  try {
    // 1. Autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // 2. Validar corpo da requisição
    const body = await request.json()
    
    // Verificar se a geometria está no formato correto
    if (body.localizacao_json && 
        (!body.localizacao_json.type || 
         body.localizacao_json.type !== 'Polygon' ||
         !body.localizacao_json.coordinates || 
         body.localizacao_json.coordinates[0].length < 3)) {
      return NextResponse.json(
        { error: 'Geometria inválida. São necessários pelo menos 3 pontos para formar um polígono.' },
        { status: 400 }
      )
    }

    // 3. Verificar se o lavoura pertence ao usuário
    const { data: existingLavoura, error: checkError } = await supabase
      .from('lavouras')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (checkError || !existingLavoura) {
      return NextResponse.json(
        { error: 'Lavoura não encontrado ou não pertence ao usuário' },
        { status: 404 }
      )
    }

    // 4. Atualizar o lavoura
    const { data, error } = await supabase
      .from('lavouras')
      .update({
        nome: body.nome,
        descricao: body.descricao,
        tipo_cultura: body.tipo_cultura,
        sistema_irrigacao: body.sistema_irrigacao,
        data_plantio: body.data_plantio,
        area: body.area,
        localizacao_json: body.localizacao_json,
        atualizado_em: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)

  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}