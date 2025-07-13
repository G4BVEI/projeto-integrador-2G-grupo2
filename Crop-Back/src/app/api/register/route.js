import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return new Response("Email e senha são obrigatórios", { status: 400 });
    }

    // Validação simples de email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response("Email inválido", { status: 400 });
    }

    // Validação simples de senha
    if (password.length < 6) {
      return new Response(
        "Senha deve ter no mínimo 6 caracteres",
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return new Response("Email já está em uso", { status: 400 });
    }

    const hashedPassword = await hash(password, 10);

    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Erro ao cadastrar:", error);
    return new Response("Erro interno do servidor", { status: 500 });
  }
}
