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
    if (!body.localizacao || 
        !body.localizacao.type || 
        body.localizacao.type !== 'Polygon' ||
        !body.localizacao.coordinates || 
        body.localizacao.coordinates[0].length < 3) {
      return NextResponse.json(
        { error: 'Geometria inválida. São necessários pelo menos 3 pontos para formar um polígono.' },
        { status: 400 }
      )
    }

    // 3. Converter para o formato WKT (Well-Known Text) que o PostGIS entende
    const coordenadasWKT = `POLYGON((${
      body.localizacao.coordinates[0]
        .map(coord => `${coord[0]} ${coord[1]}`)
        .join(',')
    }))`

    // 4. Inserir no banco usando a função PostGIS st_geomfromtext
    const { data, error } = await supabase.rpc('create_lavoura', {
      nome: body.nome,
      tipo_cultura: body.tipo_cultura,
      sistema_irrigacao: body.sistema_irrigacao,
      data_plantio: body.data_plantio,
      descricao: body.descricao,
      area: body.area,
      geometria: coordenadasWKT,
      user_id: user.id
    })

    if (error) throw error

    return NextResponse.json(data, { status: 201 })

  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}