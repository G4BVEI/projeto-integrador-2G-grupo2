import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET - Buscar alerta específico
export async function GET(request, { params }) {
  const supabase = createClient();
  const { id } = params;

  try {
    const { data: alerta, error } = await supabase
      .from('alertas')
      .select(`
        *,
        sensores (*),
        talhoes (*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    return NextResponse.json(alerta);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH - Marcar alerta como verificado
export async function PATCH(request, { params }) {
  const supabase = createClient();
  const { id } = params;

  try {
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

// DELETE - Deletar alerta
export async function DELETE(request, { params }) {
  const supabase = createClient();
  const { id } = params;

  try {
    const { error } = await supabase
      .from('alertas')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Alerta deletado com sucesso' });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}