
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
  const memoryStore = useRef<ChatMessage[]>([]);
  const processingRef = useRef(false);

  console.log('🎯 useAIMessagesUnified state (FASE 6 - CORRECCIÓN QUIRÚRGICA):', {
    user: user?.id || 'none',
    messagesCount: messages.length,
    isInitialized,
    strategy: getStrategy(),
    isSupabaseLoading,
    processing: processingRef.current
  });

  // FASE 6: Función de validación directa contra BD
  const validatePersistence = useCallback(async (expectedCount: number, operation: string): Promise<boolean> => {
    const strategy = getStrategy();
    console.log(`🔍 FASE 6 - Validating persistence for ${operation}, expected count: ${expectedCount}, strategy: ${strategy}`);
    
    try {
      let actualMessages: ChatMessage[] = [];
      
      switch (strategy) {
        case 'supabase':
          // FASE 6: Validación directa contra Supabase
          actualMessages = await loadFromSupabase();
          break;
        case 'localStorage':
          actualMessages = loadFromLocalStorage();
          break;
        case 'memory':
          actualMessages = memoryStore.current;
          break;
      }
      
      const isValid = actualMessages.length === expectedCount;
      console.log(`🔍 FASE 6 - Persistence validation result:`, {
        operation,
        expected: expectedCount,
        actual: actualMessages.length,
        isValid,
        strategy
      });
      
      if (isValid) {
        // FASE 6: Solo actualizar estado si la validación es exitosa
        setMessages(actualMessages);
      }
      
      return isValid;
    } catch (error) {
      console.error(`❌ FASE 6 - Persistence validation failed:`, error);
      return false;
    }
  }, [getStrategy, loadFromSupabase, loadFromLocalStorage]);

  // FASE 6: Cargar mensajes con validación forzada
  const loadMessages = useCallback(async (): Promise<ChatMessage[]> => {
    const strategy = getStrategy();
    console.log(`📥 FASE 6 - Loading messages using strategy: ${strategy}`);
    
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
      
      console.log(`✅ FASE 6 - Loaded ${loadedMessages.length} messages via ${strategy}`);
      setMessages(loadedMessages);
      return loadedMessages;
      
    } catch (error) {
      console.error(`❌ FASE 6 - Error loading messages via ${strategy}:`, error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [getStrategy, loadFromSupabase, loadFromLocalStorage]);

  // FASE 6: Persistencia con validación REAL antes de actualizar estado
  const saveMessage = useCallback(async (message: ChatMessage): Promise<void> => {
    const strategy = getStrategy();
    console.log(`💾 FASE 6 - Saving message via ${strategy}:`, {
      id: message.id,
      type: message.type,
      contentPreview: message.content.substring(0, 50)
    });
    
    if (processingRef.current) {
      console.log('⚠️ FASE 6 - Save operation already in progress, skipping');
      return;
    }
    
    processingRef.current = true;
    
    try {
      // FASE 6: Obtener conteo actual ANTES de la operación
      const currentCount = messages.length;
      const expectedCount = currentCount + 1;
      
      console.log(`📊 FASE 6 - Save operation:`, {
        currentCount,
        expectedCount,
        strategy
      });
      
      switch (strategy) {
        case 'supabase':
          await saveToSupabase(message);
          console.log(`✅ FASE 6 - Message saved to Supabase`);
          
          // FASE 6: Validar persistencia REAL antes de actualizar estado
          await new Promise(resolve => setTimeout(resolve, 500)); // Dar tiempo a Supabase
          
          const isValid = await validatePersistence(expectedCount, 'saveMessage');
          if (!isValid) {
            throw new Error(`FASE 6 - Persistence validation failed for saveMessage`);
          }
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
      
      console.log(`✅ FASE 6 - Message saved and validated successfully via ${strategy}`);
      
    } catch (error) {
      console.error(`❌ FASE 6 - Error saving message via ${strategy}:`, error);
      throw error;
    } finally {
      processingRef.current = false;
    }
  }, [getStrategy, saveToSupabase, saveToLocalStorage, messages, validatePersistence]);

  // FASE 6: Actualizar mensaje con validación
  const updateMessage = useCallback(async (messageId: string, updates: Partial<ChatMessage>): Promise<void> => {
    const strategy = getStrategy();
    console.log(`🔄 FASE 6 - Updating message ${messageId} via ${strategy}`);
    
    if (processingRef.current) {
      console.log('⚠️ FASE 6 - Update operation already in progress, skipping');
      return;
    }
    
    processingRef.current = true;
    
    try {
      const currentCount = messages.length;
      
      switch (strategy) {
        case 'supabase':
          await updateInSupabase(messageId, updates);
          console.log(`✅ FASE 6 - Message updated in Supabase`);
          
          // FASE 6: Validar persistencia después de actualización
          await new Promise(resolve => setTimeout(resolve, 300));
          
          const isValid = await validatePersistence(currentCount, 'updateMessage');
          if (!isValid) {
            throw new Error(`FASE 6 - Persistence validation failed for updateMessage`);
          }
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
      
      console.log(`✅ FASE 6 - Message updated and validated successfully via ${strategy}`);
      
    } catch (error) {
      console.error(`❌ FASE 6 - Error updating message via ${strategy}:`, error);
      throw error;
    } finally {
      processingRef.current = false;
    }
  }, [getStrategy, updateInSupabase, saveToLocalStorage, messages, validatePersistence]);

  // FASE 6: Marcar todos como leídos con validación
  const markAllAsRead = useCallback(async (): Promise<void> => {
    const strategy = getStrategy();
    console.log(`👁️ FASE 6 - Marking all as read via ${strategy}`);
    
    if (processingRef.current) {
      console.log('⚠️ FASE 6 - MarkAllAsRead operation already in progress, skipping');
      return;
    }
    
    processingRef.current = true;
    
    try {
      const currentCount = messages.length;
      
      switch (strategy) {
        case 'supabase':
          await markAllAsReadInSupabase();
          console.log(`✅ FASE 6 - All messages marked as read in Supabase`);
          
          // FASE 6: Validar que la operación bulk se persistió correctamente
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const isValid = await validatePersistence(currentCount, 'markAllAsRead');
          if (!isValid) {
            throw new Error(`FASE 6 - Persistence validation failed for markAllAsRead`);
          }
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
      
      console.log(`✅ FASE 6 - All messages marked as read and validated via ${strategy}`);
      
    } catch (error) {
      console.error(`❌ FASE 6 - Error marking all as read via ${strategy}:`, error);
      throw error;
    } finally {
      processingRef.current = false;
    }
  }, [getStrategy, markAllAsReadInSupabase, saveToLocalStorage, messages, validatePersistence]);

  // FASE 6: Limpiar chat con validación de limpieza completa
  const clearChat = useCallback(async (): Promise<void> => {
    const strategy = getStrategy();
    console.log(`🗑️ FASE 6 - Clearing chat via ${strategy}`);
    
    if (processingRef.current) {
      console.log('⚠️ FASE 6 - ClearChat operation already in progress, skipping');
      return;
    }
    
    processingRef.current = true;
    
    try {
      switch (strategy) {
        case 'supabase':
          await clearChatInSupabase();
          console.log(`✅ FASE 6 - Chat cleared in Supabase`);
          
          // FASE 6: Validar limpieza completa
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const isValid = await validatePersistence(0, 'clearChat');
          if (!isValid) {
            throw new Error(`FASE 6 - Persistence validation failed for clearChat`);
          }
          break;
          
        case 'localStorage':
          clearLocalStorage();
          setMessages([]);
          break;
          
        case 'memory':
          memoryStore.current = [];
          setMessages([]);
          break;
      }
      
      console.log(`✅ FASE 6 - Chat cleared and validated successfully via ${strategy}`);
      
    } catch (error) {
      console.error(`❌ FASE 6 - Error clearing chat via ${strategy}:`, error);
      throw error;
    } finally {
      processingRef.current = false;
    }
  }, [getStrategy, clearChatInSupabase, clearLocalStorage, validatePersistence]);

  // FASE 6: Inicializar mensajes con carga forzada
  useEffect(() => {
    if (!isInitialized) {
      console.log('🚀 FASE 6 - Initializing unified messages system with forced sync...');
      
      loadMessages().then(() => {
        setIsInitialized(true);
        console.log('✅ FASE 6 - Unified messages system initialized with validation');
      }).catch(error => {
        console.error('❌ FASE 6 - Failed to initialize messages:', error);
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
    validatePersistence, // FASE 6: Exponer validación para tests
    currentStrategy: getStrategy()
  };
};
