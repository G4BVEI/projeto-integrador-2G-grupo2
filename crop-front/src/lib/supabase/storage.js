import { supabase } from './client';

export const storageService = {
  // Upload de imagem para o storage
  async uploadImage(file, userId, folder = 'avatars') {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('user-avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Obter URL pública da imagem
      const { data: { publicUrl } } = supabase.storage
        .from('user-avatars')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Erro no upload da imagem:', error);
      throw error;
    }
  },

  // Deletar imagem antiga
  async deleteImage(imageUrl) {
    try {
      if (!imageUrl) return;
      
      // Extrair caminho da URL
      const urlParts = imageUrl.split('/');
      const filePath = urlParts.slice(urlParts.indexOf('user-avatars') + 1).join('/');
      
      const { error } = await supabase.storage
        .from('user-avatars')
        .remove([filePath]);

      if (error) {
        console.error('Erro ao deletar imagem antiga:', error);
      }
    } catch (error) {
      console.error('Erro ao processar deleção:', error);
    }
  }
};