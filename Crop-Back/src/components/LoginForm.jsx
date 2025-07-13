"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    setLoading(false);

    if (res?.ok) {
      router.push("/noaccess/semacesso"); // ou outra rota que quiser
    } else {
      setError("Email ou senha incorretos");
      console.error("Erro ao logar", res);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-[calc(100%-4rem)] px-4">
      <div className="bg-white bg-opacity-90 p-6 rounded-xl shadow-md w-full max-w-md border border-gray-300">
        <h2 className="text-2xl font-medium text-green-600 text-center mb-4">
          Entre em sua conta
        </h2>
        <form className="space-y-4" onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="w-full px-4 py-2 border rounded-md bg-gray-100 outline-none text-gray-700"
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="w-full px-4 py-2 border rounded-md bg-gray-100 outline-none text-gray-700"
          />
          <p className="text-sm text-gray-500 -mt-2.5 text-right mr-5 -mb-0.5">
            <a href="#" className="text-green-600 hover:underline">
              Esqueceu sua senha?
            </a>
          </p>
          {error && (
            <p className="text-red-600 text-sm text-center mb-2">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-md font-medium mt-1.5 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="text-center text-sm mt-2 text-gray-500">
          Não possui uma conta?{" "}
          <Link href="/auth/cadastro" className="text-green-600 hover:underline ">
            Clique aqui
          </Link>
        </p>
      </div>

      {/* Divider */}
      <div className="flex items-center w-full max-w-md my-4">
        <hr className="flex-grow border-gray-300" />
        <span className="mx-2 text-gray-175 text-sm">Ou</span>
        <hr className="flex-grow border-gray-300" />
      </div>

      {/* Botão Google */}
      <button className="flex items-center gap-2 border px-6 py-2 rounded-full bg-white shadow hover:shadow-md transition text-sm text-gray-500">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
          alt="Google"
          className="w-5 h-5"
        />
        Continue com o Google
      </button>
    </div>
  );
}
