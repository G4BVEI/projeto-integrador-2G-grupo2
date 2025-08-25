'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { FcGoogle } from 'react-icons/fc';

export default function LoginForm({ onGoogleLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push('/protegido/dashboard');
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      await onGoogleLogin();
    } catch (error) {
      setError('Erro ao fazer login com Google');
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md z-10">
        <h1 className="text-2xl font-bold text-center text-green-600 mb-6">Login</h1>
        
        {error && (
          <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
            {error}
          </div>
        )}
        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">ou</span>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md transition ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Entrando...' : 'Entrar com Email'}
          </button>
        </form>

        <div className="mt-4 text-center text-sm">
          <span className="text-gray-600">Não tem conta? </span>
          <Link href="/auth/cadastro" className="text-green-600 hover:underline font-medium">
            Cadastre-se
          </Link>
        </div>
                {/* Botão do Google */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-md hover:bg-gray-50 transition mb-4 disabled:opacity-50"
        >
          <FcGoogle className="w-5 h-5" />
          <span>Entrar com Google</span>
        </button>
      </div>
    </div>
  );
}