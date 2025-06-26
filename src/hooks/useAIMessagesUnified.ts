
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAIMessagesPersistence } from '@/hooks/useAIMessagesPersistence';
import { useAIPersistenceStrategy } from '@/hooks/useAIPersistenceStrategy';
import { generateValidUUID } from '@/utils/uuid';
import type { ChatMessage } from '@/hooks/useAIAssistant';

export const useAIMessagesUnified = () => {
  const { user } = useAuth();
  const { 
    loadMessages: loadFromSupabase, 
    saveMessage: saveToSupabase, 
    updateMessage: updateInSupabase, 
    markAllAsRead: markAllAsReadInSupabase, 
    clearChat: clearChatInSupabase,
    isLoading: isSupabaseLoading
  } = useAIMessagesPersistence();
  
  const { 
    getStrategy, 
    saveToLocalStorage, 
    loadFromLocalStorage, 
    clearLocalStorage 
  } = useAIPersistenceStrategy();
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const forceUpdateRef = useRef(0);
  const memoryStore = useRef<ChatMessage[]>([]);

  // DEBUGGING MASIVO
  console.log('🎯 useAIMessagesUnified state:', {
    user: user?.id || 'none',
    messagesCount: messages.length,
    isInitialized,
    strategy: getStrategy(),
    isSupabaseLoading,
    forceUpdateRef: forceUpdateRef.current
  });

  // FIX: FORZAR RE-RENDER MEJORADO
  const forceUpdate = useCallback(() => {
    forceUpdateRef.current += 1;
    console.log('🔄 Forcing unified messages re-render:', forceUpdateRef.current);
    
    // TRIGGER ADICIONAL PARA ASEGURAR ACTUALIZACIÓN
    setTimeout(() => {
      forceUpdateRef.current += 1;
      console.log('🔄 Secondary force update:', forceUpdateRef.current);
    }, 50);
  }, []);

  // Cargar mensajes según la estrategia
  const loadMessages = useCallback(async (): Promise<ChatMessage[]> => {
    const strategy = getStrategy();
    console.log(`📥 Loading messages using strategy: ${strategy}`);
    
    setIsLoading(true);
    
    try {
      let loadedMessages: ChatMessage[] = [];
      
      switch (strategy) {
        case 'supabase':
          loadedMessages = await loadFromSupabase();
          break;
          
        case 'localStorage':
          loadedMessages = loadFromLocalStorage();
          break;
          
        case 'memory':
          loadedMessages = memoryStore.current;
          break;
      }
      
      console.log(`✅ Loaded ${loadedMessages.length} messages via ${strategy}`);
      setMessages(loadedMessages);
      forceUpdate();
      return loadedMessages;
      
    } catch (error) {
      console.error(`❌ Error loading messages via ${strategy}:`, error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [getStrategy, loadFromSupabase, loadFromLocalStorage, forceUpdate]);

  // FIX: GUARDAR MENSAJE CON SINCRONIZACIÓN MEJORADA
  const saveMessage = useCallback(async (message: ChatMessage): Promise<void> => {
    const strategy = getStrategy();
    console.log(`💾 Saving message via ${strategy}:`, {
      id: message.id,
      type: message.type,
      contentPreview: message.content.substring(0, 50)
    });
    
    try {
      switch (strategy) {
        case 'supabase':
          await saveToSupabase(message);
          // Recargar mensajes para asegurar sincronización
          await loadMessages();
          break;
          
        case 'localStorage':
          const updatedMessages = [...messages, message];
          saveToLocalStorage(updatedMessages);
          setMessages(updatedMessages);
          break;
          
        case 'memory':
          memoryStore.current = [...memoryStore.current, message];
          setMessages([...memoryStore.current]);
          break;
      }
      
      console.log(`✅ Message saved successfully via ${strategy}`);
      forceUpdate();
      
      // ESPERAR UN POCO PARA ASEGURAR PROPAGACIÓN
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error(`❌ Error saving message via ${strategy}:`, error);
      throw error;
    }
  }, [getStrategy, saveToSupabase, saveToLocalStorage, messages, forceUpdate, loadMessages]);

  // Actualizar mensaje
  const updateMessage = useCallback(async (messageId: string, updates: Partial<ChatMessage>): Promise<void> => {
    const strategy = getStrategy();
    console.log(`🔄 Updating message ${messageId} via ${strategy}`);
    
    try {
      switch (strategy) {
        case 'supabase':
          await updateInSupabase(messageId, updates);
          // Recargar mensajes para asegurar sincronización
          await loadMessages();
          break;
          
        case 'localStorage':
          const updatedMessages = messages.map(msg => 
            msg.id === messageId ? { ...msg, ...updates } : msg
          );
          saveToLocalStorage(updatedMessages);
          setMessages(updatedMessages);
          break;
          
        case 'memory':
          memoryStore.current = memoryStore.current.map(msg => 
            msg.id === messageId ? { ...msg, ...updates } : msg
          );
          setMessages([...memoryStore.current]);
          break;
      }
      
      console.log(`✅ Message updated successfully via ${strategy}`);
      forceUpdate();
      
    } catch (error) {
      console.error(`❌ Error updating message via ${strategy}:`, error);
      throw error;
    }
  }, [getStrategy, updateInSupabase, saveToLocalStorage, messages, forceUpdate, loadMessages]);

  // Marcar todos como leídos
  const markAllAsRead = useCallback(async (): Promise<void> => {
    const strategy = getStrategy();
    console.log(`👁️ Marking all as read via ${strategy}`);
    
    try {
      switch (strategy) {
        case 'supabase':
          await markAllAsReadInSupabase();
          // Recargar mensajes para asegurar sincronización
          await loadMessages();
          break;
          
        case 'localStorage':
          const updatedMessages = messages.map(msg => ({ ...msg, isRead: true }));
          saveToLocalStorage(updatedMessages);
          setMessages(updatedMessages);
          break;
          
        case 'memory':
          memoryStore.current = memoryStore.current.map(msg => ({ ...msg, isRead: true }));
          setMessages([...memoryStore.current]);
          break;
      }
      
      console.log(`✅ All messages marked as read via ${strategy}`);
      forceUpdate();
      
    } catch (error) {
      console.error(`❌ Error marking all as read via ${strategy}:`, error);
      throw error;
    }
  }, [getStrategy, markAllAsReadInSupabase, saveToLocalStorage, messages, forceUpdate, loadMessages]);

  // Limpiar chat
  const clearChat = useCallback(async (): Promise<void> => {
    const strategy = getStrategy();
    console.log(`🗑️ Clearing chat via ${strategy}`);
    
    try {
      switch (strategy) {
        case 'supabase':
          await clearChatInSupabase();
          break;
          
        case 'localStorage':
          clearLocalStorage();
          break;
          
        case 'memory':
          memoryStore.current = [];
          break;
      }
      
      setMessages([]);
      console.log(`✅ Chat cleared successfully via ${strategy}`);
      forceUpdate();
      
    } catch (error) {
      console.error(`❌ Error clearing chat via ${strategy}:`, error);
      throw error;
    }
  }, [getStrategy, clearChatInSupabase, clearLocalStorage, forceUpdate]);

  // Inicializar mensajes al montar
  useEffect(() => {
    if (!isInitialized) {
      console.log('🚀 Initializing unified messages system...');
      
      loadMessages().then(() => {
        setIsInitialized(true);
        console.log('✅ Unified messages system initialized');
      }).catch(error => {
        console.error('❌ Failed to initialize messages:', error);
        setIsInitialized(true); // Inicializar de todos modos
      });
    }
  }, [loadMessages, isInitialized]);

  return {
    messages,
    isLoading: isLoading || isSupabaseLoading,
    isInitialized,
    saveMessage,
    updateMessage,
    markAllAsRead,
    clearChat,
    loadMessages,
    forceUpdateRef: forceUpdateRef.current,
    currentStrategy: getStrategy()
  };
};
