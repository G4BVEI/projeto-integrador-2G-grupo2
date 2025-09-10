import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request) {
  const cookieStore = request.cookies
  const supabase = createClient(cookieStore)

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
    if (!body.localizacao_json || 
        !body.localizacao_json.type || 
        body.localizacao_json.type !== 'Polygon' ||
        !body.localizacao_json.coordinates || 
        body.localizacao_json.coordinates[0].length < 3) {
      return NextResponse.json(
        { error: 'Geometria inválida. São necessários pelo menos 3 pontos para formar um polígono.' },
        { status: 400 }
      )
    }

    // 3. Inserir no banco usando a nova estrutura lavouras
    const { data, error } = await supabase
      .from('lavouras')
      .insert({
        user_id: user.id,
        nome: body.nome,
        descricao: body.descricao,
        tipo_cultura: body.tipo_cultura,
        sistema_irrigacao: body.sistema_irrigacao,
        data_plantio: body.data_plantio,
        area: body.area,
        localizacao_json: body.localizacao_json
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })

  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}