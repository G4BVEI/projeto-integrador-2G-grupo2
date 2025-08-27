'use client';

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { User, Mail, Edit3, Save, X, Camera, Loader2 } from "lucide-react";

export default function UserProfile() {
  const [userData, setUserData] = useState({
    username: "",
    nome: "",
    img_url: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [session, setSession] = useState(null);
  const fileInputRef = useRef(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function fetchUserData() {
      try {
        setLoading(true);
        
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);

        const { data, error } = await supabase
          .from('user_data')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (!data) {
          const { data: newData, error: insertError } = await supabase
            .from('user_data')
            .insert({
              id: session.user.id,
              username: session.user.email?.split('@')[0] || '',
              nome: '',
              img_url: ''
            })
            .select()
            .single();

          if (insertError) throw insertError;
          setUserData(newData);
        } else {
          setUserData(data);
        }

      } catch (err) {
        setError(err.message);
        console.error('Erro ao buscar user_data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, []);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      setError(null);

      // Validar tipo e tamanho do arquivo
      if (!file.type.startsWith('image/')) {
        throw new Error('Apenas imagens são permitidas');
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error('A imagem deve ter no máximo 5MB');
      }

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro no upload');
      }

      // Atualizar o estado com a nova imagem
      setUserData(prev => ({ ...prev, img_url: result.imageUrl }));
      setSuccess('Imagem atualizada com sucesso!');

    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw sessionError || new Error("Usuário não autenticado");
      }

      const { error } = await supabase
        .from('user_data')
        .update({
          username: userData.username,
          nome: userData.nome,
          updated_at: new Date().toISOString()
        })
        .eq('id', session.user.id);

      if (error) throw error;

      setSuccess("Dados atualizados com sucesso!");
      setIsEditing(false);
    } catch (err) {
      setError(err.message);
      console.error("Erro ao salvar user_data:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setUserData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-green-600" />
          <p className="mt-2 text-gray-600">Carregando perfil...</p>fd
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-left items-center min-h-screen bg-white-100 p-4">
      <div className="bg-gray-100 p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Meu Perfil</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        {/* Avatar com Upload */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
              {userData.img_url ? (
                <img
                  src={userData.img_url}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-12 h-12 text-gray-400" />
              )}
            </div>
            
            <label
              htmlFor="avatar-upload"
              className="absolute bottom-0 right-0 bg-green-600 text-white p-2 rounded-full cursor-pointer hover:bg-green-700 transition-colors"
            >
              {uploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
            </label>
            
            <input
              id="avatar-upload"
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
              disabled={uploading}
            />
          </div>
        </div>

        <form className="space-y-4" onSubmit={handleSave}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome de Usuário
            </label>
            <input
              type="text"
              value={userData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              disabled={!isEditing || saving}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome Completo
            </label>
            <input
              type="text"
              value={userData.nome}
              onChange={(e) => handleInputChange('nome', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              disabled={!isEditing || saving}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="flex items-center">
              <Mail className="w-4 h-4 text-gray-400 mr-2" />
              <span className="text-gray-600">{session?.user?.email}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              O email não pode ser alterado
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
              disabled={isEditing}
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Editar Perfil
            </button>
            <button
              type="submit"
              disabled={!isEditing || saving}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Salvar
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                disabled={saving}
                className="px-4 py-2 border border-white-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center"
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </button>
            )}
          </div>
        </form>

        <div className="mt-8 pt-4 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Informações da Conta</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p>ID: {userData.id}</p>
            <p>Membro desde: {userData.created_at ? new Date(userData.created_at).toLocaleDateString('pt-BR') : '-'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}