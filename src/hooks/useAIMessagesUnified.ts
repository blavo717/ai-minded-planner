
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
  // FASE 5: Eliminar forceUpdateRef - usar solo messages array como fuente de verdad
  const memoryStore = useRef<ChatMessage[]>([]);
  const processingRef = useRef(false);

  console.log('🎯 useAIMessagesUnified state (FASE 4-5 optimized):', {
    user: user?.id || 'none',
    messagesCount: messages.length,
    isInitialized,
    strategy: getStrategy(),
    isSupabaseLoading,
    processing: processingRef.current
  });

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
      return loadedMessages;
      
    } catch (error) {
      console.error(`❌ Error loading messages via ${strategy}:`, error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [getStrategy, loadFromSupabase, loadFromLocalStorage]);

  // FASE 1 & 2: Persistencia con timeouts realistas y sin force updates innecesarios
  const saveMessage = useCallback(async (message: ChatMessage): Promise<void> => {
    const strategy = getStrategy();
    console.log(`💾 Saving message via ${strategy} (FASE 1-2):`, {
      id: message.id,
      type: message.type,
      contentPreview: message.content.substring(0, 50)
    });
    
    try {
      switch (strategy) {
        case 'supabase':
          await saveToSupabase(message);
          // FASE 1: Actualizar estado local directamente - NO recargar
          setMessages(prev => [...prev, message]);
          console.log(`✅ Message saved to Supabase and local state updated`);
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
      
    } catch (error) {
      console.error(`❌ Error saving message via ${strategy}:`, error);
      throw error;
    }
  }, [getStrategy, saveToSupabase, saveToLocalStorage, messages]);

  // Actualizar mensaje
  const updateMessage = useCallback(async (messageId: string, updates: Partial<ChatMessage>): Promise<void> => {
    const strategy = getStrategy();
    console.log(`🔄 Updating message ${messageId} via ${strategy}`);
    
    try {
      switch (strategy) {
        case 'supabase':
          await updateInSupabase(messageId, updates);
          // FASE 1: Actualizar estado local directamente - NO recargar
          setMessages(prev => prev.map(msg => 
            msg.id === messageId ? { ...msg, ...updates } : msg
          ));
          console.log(`✅ Message updated in Supabase and local state`);
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
      
    } catch (error) {
      console.error(`❌ Error updating message via ${strategy}:`, error);
      throw error;
    }
  }, [getStrategy, updateInSupabase, saveToLocalStorage, messages]);

  // Marcar todos como leídos
  const markAllAsRead = useCallback(async (): Promise<void> => {
    const strategy = getStrategy();
    console.log(`👁️ Marking all as read via ${strategy}`);
    
    try {
      switch (strategy) {
        case 'supabase':
          await markAllAsReadInSupabase();
          // FASE 1: Actualizar estado local directamente - NO recargar
          setMessages(prev => prev.map(msg => ({ ...msg, isRead: true })));
          console.log(`✅ All messages marked as read in Supabase and local state`);
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
      
    } catch (error) {
      console.error(`❌ Error marking all as read via ${strategy}:`, error);
      throw error;
    }
  }, [getStrategy, markAllAsReadInSupabase, saveToLocalStorage, messages]);

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
      
    } catch (error) {
      console.error(`❌ Error clearing chat via ${strategy}:`, error);
      throw error;
    }
  }, [getStrategy, clearChatInSupabase, clearLocalStorage]);

  // Inicializar mensajes al montar
  useEffect(() => {
    if (!isInitialized) {
      console.log('🚀 Initializing unified messages system (FASE 5)...');
      
      loadMessages().then(() => {
        setIsInitialized(true);
        console.log('✅ Unified messages system initialized');
      }).catch(error => {
        console.error('❌ Failed to initialize messages:', error);
        setIsInitialized(true);
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
    // FASE 5: Eliminar forceUpdateRef - usar solo el array messages
    currentStrategy: getStrategy()
  };
};
