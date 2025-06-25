
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { ChatMessage } from '@/hooks/useAIAssistant';

export const useAIMessagesPersistence = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Cargar mensajes desde Supabase
  const loadMessages = useCallback(async (): Promise<ChatMessage[]> => {
    if (!user) return [];
    
    console.log('📥 Loading messages from Supabase for user:', user.id);
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('ai_chat_messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('❌ Error loading messages:', error);
        return [];
      }

      const messages: ChatMessage[] = (data || []).map(row => ({
        id: row.id,
        type: row.type as 'user' | 'assistant' | 'notification' | 'suggestion',
        content: row.content,
        timestamp: new Date(row.created_at),
        isRead: row.is_read,
        priority: row.priority as 'low' | 'medium' | 'high' | 'urgent' | undefined,
        contextData: row.context_data,
        error: row.has_error
      }));

      console.log(`✅ Loaded ${messages.length} messages from Supabase`);
      return messages;
    } catch (error) {
      console.error('❌ Exception loading messages:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Guardar mensaje en Supabase
  const saveMessage = useCallback(async (message: ChatMessage): Promise<void> => {
    if (!user) return;
    
    console.log('💾 Saving message to Supabase:', message.id);
    
    try {
      const { error } = await supabase
        .from('ai_chat_messages')
        .insert({
          id: message.id,
          user_id: user.id,
          type: message.type,
          content: message.content,
          priority: message.priority || null,
          context_data: message.contextData || {},
          is_read: message.isRead,
          has_error: message.error || false,
          created_at: message.timestamp.toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('❌ Error saving message:', error);
        throw error;
      }

      console.log('✅ Message saved successfully:', message.id);
    } catch (error) {
      console.error('❌ Exception saving message:', error);
      throw error;
    }
  }, [user]);

  // Actualizar mensaje en Supabase
  const updateMessage = useCallback(async (messageId: string, updates: Partial<ChatMessage>): Promise<void> => {
    if (!user) return;
    
    console.log('🔄 Updating message in Supabase:', messageId);
    
    try {
      const updateData: any = {
        updated_at: new Date().toISOString()
      };

      if (updates.isRead !== undefined) updateData.is_read = updates.isRead;
      if (updates.priority !== undefined) updateData.priority = updates.priority;
      if (updates.error !== undefined) updateData.has_error = updates.error;
      if (updates.content !== undefined) updateData.content = updates.content;

      const { error } = await supabase
        .from('ai_chat_messages')
        .update(updateData)
        .eq('id', messageId)
        .eq('user_id', user.id);

      if (error) {
        console.error('❌ Error updating message:', error);
        throw error;
      }

      console.log('✅ Message updated successfully:', messageId);
    } catch (error) {
      console.error('❌ Exception updating message:', error);
      throw error;
    }
  }, [user]);

  // Marcar múltiples mensajes como leídos
  const markAllAsRead = useCallback(async (): Promise<void> => {
    if (!user) return;
    
    console.log('👁️ Marking all messages as read in Supabase');
    
    try {
      const { error } = await supabase
        .from('ai_chat_messages')
        .update({ 
          is_read: true,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) {
        console.error('❌ Error marking all as read:', error);
        throw error;
      }

      console.log('✅ All messages marked as read');
    } catch (error) {
      console.error('❌ Exception marking all as read:', error);
      throw error;
    }
  }, [user]);

  // Limpiar chat completo
  const clearChat = useCallback(async (): Promise<void> => {
    if (!user) return;
    
    console.log('🗑️ Clearing chat in Supabase');
    
    try {
      const { error } = await supabase
        .from('ai_chat_messages')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error('❌ Error clearing chat:', error);
        throw error;
      }

      console.log('✅ Chat cleared successfully');
    } catch (error) {
      console.error('❌ Exception clearing chat:', error);
      throw error;
    }
  }, [user]);

  // Configurar suscripción en tiempo real
  useEffect(() => {
    if (!user || !isInitialized) return;

    console.log('🔄 Setting up realtime subscription for AI messages');
    
    const channel = supabase
      .channel('ai-chat-messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ai_chat_messages',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('📡 Realtime update received:', payload);
          // El componente que use este hook deberá manejar esto
        }
      )
      .subscribe();

    return () => {
      console.log('🛑 Cleaning up realtime subscription');
      supabase.removeChannel(channel);
    };
  }, [user, isInitialized]);

  return {
    loadMessages,
    saveMessage,
    updateMessage,
    markAllAsRead,
    clearChat,
    isLoading,
    isInitialized,
    setIsInitialized
  };
};
