
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { generateValidUUID, validateAndFixUUID } from '@/utils/uuid';
import type { ChatMessage } from '@/hooks/useAIAssistant';

export const useAIMessagesPersistence = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Cargar mensajes desde Supabase
  const loadMessages = useCallback(async (): Promise<ChatMessage[]> => {
    if (!user) {
      console.log('📥 No user authenticated, returning empty messages');
      return [];
    }
    
    console.log('📥 Loading messages from Supabase for user:', user.id);
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('ai_chat_messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('❌ Supabase error loading messages:', error);
        throw error;
      }

      const messages: ChatMessage[] = (data || []).map(row => {
        // Validar UUID del mensaje cargado
        const validId = validateAndFixUUID(row.id);
        
        return {
          id: validId,
          type: row.type as 'user' | 'assistant' | 'notification' | 'suggestion',
          content: row.content,
          timestamp: new Date(row.created_at),
          isRead: row.is_read,
          priority: row.priority as 'low' | 'medium' | 'high' | 'urgent' | undefined,
          contextData: row.context_data,
          error: row.has_error
        };
      });

      console.log(`✅ Successfully loaded ${messages.length} messages from Supabase`);
      return messages;
    } catch (error) {
      console.error('❌ Critical error loading messages:', error);
      console.error('❌ Error details:', JSON.stringify(error, null, 2));
      
      // En caso de error crítico, devolver array vacío pero notificar
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Guardar mensaje en Supabase con validación UUID robusta
  const saveMessage = useCallback(async (message: ChatMessage): Promise<void> => {
    if (!user) {
      console.warn('⚠️ Cannot save message: no authenticated user');
      return;
    }
    
    // Validar y corregir UUID antes de guardar
    const validatedMessage = {
      ...message,
      id: validateAndFixUUID(message.id)
    };
    
    console.log('💾 Saving message to Supabase:', {
      id: validatedMessage.id,
      type: validatedMessage.type,
      contentLength: validatedMessage.content.length,
      userId: user.id
    });
    
    try {
      const messageData = {
        id: validatedMessage.id,
        user_id: user.id,
        type: validatedMessage.type,
        content: validatedMessage.content,
        priority: validatedMessage.priority || null,
        context_data: validatedMessage.contextData || {},
        is_read: validatedMessage.isRead,
        has_error: validatedMessage.error || false,
        created_at: validatedMessage.timestamp.toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('📦 Message data to insert:', {
        id: messageData.id,
        user_id: messageData.user_id,
        type: messageData.type,
        priority: messageData.priority
      });

      const { error } = await supabase
        .from('ai_chat_messages')
        .insert(messageData);

      if (error) {
        console.error('❌ Supabase insert error:', error);
        console.error('❌ Failed message data:', messageData);
        throw error;
      }

      console.log('✅ Message saved successfully to Supabase:', validatedMessage.id);
    } catch (error) {
      console.error('❌ Critical error saving message:', error);
      console.error('❌ Message that failed:', validatedMessage);
      throw error;
    }
  }, [user]);

  // Actualizar mensaje en Supabase
  const updateMessage = useCallback(async (messageId: string, updates: Partial<ChatMessage>): Promise<void> => {
    if (!user) {
      console.warn('⚠️ Cannot update message: no authenticated user');
      return;
    }
    
    const validatedId = validateAndFixUUID(messageId);
    console.log('🔄 Updating message in Supabase:', validatedId);
    
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
        .eq('id', validatedId)
        .eq('user_id', user.id);

      if (error) {
        console.error('❌ Supabase update error:', error);
        throw error;
      }

      console.log('✅ Message updated successfully:', validatedId);
    } catch (error) {
      console.error('❌ Critical error updating message:', error);
      throw error;
    }
  }, [user]);

  // Marcar múltiples mensajes como leídos
  const markAllAsRead = useCallback(async (): Promise<void> => {
    if (!user) {
      console.warn('⚠️ Cannot mark all as read: no authenticated user');
      return;
    }
    
    console.log('👁️ Marking all messages as read in Supabase for user:', user.id);
    
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

      console.log('✅ All messages marked as read successfully');
    } catch (error) {
      console.error('❌ Critical error marking all as read:', error);
      throw error;
    }
  }, [user]);

  // Limpiar chat completo
  const clearChat = useCallback(async (): Promise<void> => {
    if (!user) {
      console.warn('⚠️ Cannot clear chat: no authenticated user');
      return;
    }
    
    console.log('🗑️ Clearing all chat messages in Supabase for user:', user.id);
    
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
      console.error('❌ Critical error clearing chat:', error);
      throw error;
    }
  }, [user]);

  // Configurar suscripción en tiempo real
  useEffect(() => {
    if (!user || !isInitialized) return;

    console.log('🔄 Setting up realtime subscription for AI messages, user:', user.id);
    
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
