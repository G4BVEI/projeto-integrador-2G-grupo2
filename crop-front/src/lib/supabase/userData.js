import { supabase } from './client';
import { storageService } from './storage';

export const userDataService = {
  // Buscar dados do usuário
  async getUserData(userId) {
    try {
      const { data, error } = await supabase
        .from('user_data')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        throw error;
      }

      return data || null;
    } catch (error) {
      console.error('Erro ao buscar user_data:', error);
      throw error;
    }
  },

  // Criar ou atualizar dados do usuário
  async upsertUserData(userId, updates) {
    try {
      const { data, error } = await supabase
        .from('user_data')
        .upsert({
          id: userId,
          ...updates,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao salvar user_data:', error);
      throw error;
    }
  },

  // Upload de avatar e atualização
  async updateAvatar(userId, file) {
    try {
      // Buscar dados atuais para verificar se tem imagem antiga
      const currentData = await this.getUserData(userId);
      const oldImageUrl = currentData?.img_url;

      // Fazer upload da nova imagem
      const newImageUrl = await storageService.uploadImage(file, userId);

      // Deletar imagem antiga se existir
      if (oldImageUrl) {
        await storageService.deleteImage(oldImageUrl);
      }

      // Atualizar user_data com nova URL
      const updatedData = await this.upsertUserData(userId, {
        img_url: newImageUrl
      });

      return updatedData;
    } catch (error) {
      console.error('Erro ao atualizar avatar:', error);
      throw error;
    }
  }
};