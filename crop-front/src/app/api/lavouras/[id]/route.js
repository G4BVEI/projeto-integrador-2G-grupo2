import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request, { params }) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  
  try {
    const { id } = params

    const { data, error } = await supabase
      .from('public.talhoes')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error

    if (!data) {
      return NextResponse.json(
        { error: 'Lavoura não encontrada' },
        { status: 404 }
      )
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
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  
  try {
    const { id } = params
    const body = await request.json()

    const { data, error } = await supabase
      .from('public.talhoes')
      .update({
        ...body,
        atualizado_em: new Date().toISOString()
      })
      .eq('id', id)
      .select()

    if (error) throw error

    return NextResponse.json(data[0])
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  
  try {
    const { id } = params

    const { error } = await supabase
      .from('public.talhoes')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json(
      { message: 'Lavoura excluída com sucesso' },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}