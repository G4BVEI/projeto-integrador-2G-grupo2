"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ConfirmPage() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Verificar se o usuário já está confirmado
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        router.push("/logged/dashboard");
      }
    });
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-[calc(100%-4rem)] px-4">
      <div className="bg-white bg-opacity-90 p-6 rounded-xl shadow-md w-full max-w-md border border-gray-300">
        <h2 className="text-2xl font-medium text-green-600 text-center mb-4">
          Verifique seu e-mail
        </h2>
        <p className="text-center mb-4">
          Enviamos um link de confirmação para o seu e-mail. Por favor, verifique sua caixa de entrada.
        </p>
        <button
          onClick={() => router.push("/auth/login")}
          className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-md font-medium"
        >
          Voltar para o login
        </button>
      </div>
    </div>
  );
}