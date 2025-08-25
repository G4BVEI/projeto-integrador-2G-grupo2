import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const cookieStore = request.cookies
    const supabase = createClient(cookieStore)

    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file')
    
    if (!file) {
      return NextResponse.json(
        { error: 'Nenhum arquivo enviado' },
        { status: 400 }
      )
    }

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Apenas imagens são permitidas' },
        { status: 400 }
      )
    }

    // Validar tamanho do arquivo (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'A imagem deve ter no máximo 5MB' },
        { status: 400 }
      )
    }

    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/${Date.now()}.${fileExt}`
    const filePath = `avatars/${fileName}`

    // Fazer upload para o Supabase Storage (bucket user_data)
    const { error: uploadError } = await supabase.storage
      .from('user_data')
      .upload(filePath, file)

    if (uploadError) {
      console.error('Erro no upload:', uploadError)
      return NextResponse.json(
        { error: uploadError.message || 'Erro ao fazer upload da imagem' },
        { status: 500 }
      )
    }

    // Obter URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('user_data')
      .getPublicUrl(filePath)

    // Atualizar user_data com a nova URL
    const { error: updateError } = await supabase
      .from('user_data')
      .update({ img_url: publicUrl })
      .eq('id', user.id)

    if (updateError) {
      console.error('Erro ao atualizar user_data:', updateError)
      return NextResponse.json(
        { error: 'Erro ao salvar URL da imagem' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      imageUrl: publicUrl 
    })

  } catch (error) {
    console.error('Erro no upload:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}