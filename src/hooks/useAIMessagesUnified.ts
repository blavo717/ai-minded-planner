
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

  console.log('🎯 FASE 13 - useAIMessagesUnified state:', {
    user: user?.id || 'none',
    messagesCount: messages.length,
    isInitialized,
    strategy: getStrategy(),
    isSupabaseLoading,
    processing: processingRef.current
  });

  // FASE 13: validatePersistence SIMPLIFICADO - solo lectura, sin auto-corrección
  const validatePersistence = useCallback(async (expectedCount: number, operation: string): Promise<boolean> => {
    const strategy = getStrategy();
    console.log(`🔍 FASE 13: Validación simplificada para ${operation}, esperado: ${expectedCount}, estrategia: ${strategy}`);
    
    try {
      let actualMessages: ChatMessage[] = [];
      
      switch (strategy) {
        case 'supabase':
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
      
      console.log(`🔍 FASE 13: Validación resultado:`, {
        operation,
        expected: expectedCount,
        actual: actualMessages.length,
        isValid,
        strategy
      });
      
      return isValid;
    } catch (error) {
      console.error(`❌ FASE 13: Error en validación:`, error);
      return false;
    }
  }, [getStrategy, loadFromSupabase, loadFromLocalStorage]);

  // FASE 13: syncWithDB SEPARADO - solo para sincronización explícita
  const syncWithDB = useCallback(async (): Promise<void> => {
    const strategy = getStrategy();
    console.log(`🔄 FASE 13: Sincronización explícita con ${strategy}`);
    
    try {
      let realMessages: ChatMessage[] = [];
      
      switch (strategy) {
        case 'supabase':
          realMessages = await loadFromSupabase();
          break;
        case 'localStorage':
          realMessages = loadFromLocalStorage();
          break;
        case 'memory':
          realMessages = memoryStore.current;
          break;
      }
      
      console.log(`✅ FASE 13: Sincronizando ${messages.length} → ${realMessages.length}`);
      setMessages(realMessages);
      
    } catch (error) {
      console.error(`❌ FASE 13: Error en sincronización:`, error);
    }
  }, [getStrategy, loadFromSupabase, loadFromLocalStorage, messages.length]);

  // FASE 13: forceFullReset SIMPLIFICADO - timeouts realistas
  const forceFullReset = useCallback(async (): Promise<void> => {
    console.log('🔄 FASE 13: Reset completo simplificado...');
    
    try {
      setIsLoading(true);
      processingRef.current = true;
      
      // 1. Limpiar BD
      console.log('🗑️ FASE 13: Limpiando BD...');
      await clearChatInSupabase();
      
      // 2. Timeout realista para BD
      console.log('⏳ FASE 13: Esperando limpieza BD (5s)...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // 3. Limpiar storage local
      clearLocalStorage();
      memoryStore.current = [];
      
      // 4. Forzar estado React limpio
      setMessages([]);
      
      // 5. Validar resultado
      const isClean = await validatePersistence(0, 'forceFullReset');
      if (!isClean) {
        console.warn('⚠️ FASE 13: Reset no completamente limpio, sincronizando...');
        await syncWithDB();
      }
      
      console.log('✅ FASE 13: Reset completo exitoso');
      
    } catch (error) {
      console.error('❌ FASE 13: Error en reset:', error);
      throw error;
    } finally {
      processingRef.current = false;
      setIsLoading(false);
    }
  }, [clearChatInSupabase, clearLocalStorage, validatePersistence, syncWithDB]);

  // FASE 13: loadMessages SIMPLIFICADO
  const loadMessages = useCallback(async (): Promise<ChatMessage[]> => {
    const strategy = getStrategy();
    console.log(`📥 FASE 13: Cargando mensajes - estrategia: ${strategy}`);
    
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
      
      console.log(`✅ FASE 13: Cargados ${loadedMessages.length} mensajes via ${strategy}`);
      setMessages(loadedMessages);
      
      return loadedMessages;
      
    } catch (error) {
      console.error(`❌ FASE 13: Error cargando mensajes:`, error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [getStrategy, loadFromSupabase, loadFromLocalStorage]);

  // FASE 13: saveMessage SIMPLIFICADO - timeouts realistas
  const saveMessage = useCallback(async (message: ChatMessage): Promise<void> => {
    const strategy = getStrategy();
    console.log(`💾 FASE 13: Guardando mensaje via ${strategy}`);
    
    if (processingRef.current) {
      throw new Error('Operación ya en progreso');
    }
    
    processingRef.current = true;
    
    try {
      switch (strategy) {
        case 'supabase':
          await saveToSupabase(message);
          // FASE 13: Timeout realista
          await new Promise(resolve => setTimeout(resolve, 2000));
          break;
          
        case 'localStorage':
          const updatedMessages = [...messages, message];
          saveToLocalStorage(updatedMessages);
          setMessages(updatedMessages);
          memoryStore.current = updatedMessages;
          break;
          
        case 'memory':
          memoryStore.current = [...memoryStore.current, message];
          setMessages([...memoryStore.current]);
          break;
      }
      
      console.log(`✅ FASE 13: Mensaje guardado exitosamente via ${strategy}`);
      
    } catch (error) {
      console.error(`❌ FASE 13: Error guardando mensaje:`, error);
      throw error;
    } finally {
      processingRef.current = false;
    }
  }, [getStrategy, saveToSupabase, saveToLocalStorage, messages]);

  // FASE 13: updateMessage SIMPLIFICADO
  const updateMessage = useCallback(async (messageId: string, updates: Partial<ChatMessage>): Promise<void> => {
    const strategy = getStrategy();
    console.log(`🔄 FASE 13: Actualizando mensaje ${messageId} via ${strategy}`);
    
    if (processingRef.current) {
      throw new Error('Operación ya en progreso');
    }
    
    processingRef.current = true;
    
    try {
      switch (strategy) {
        case 'supabase':
          await updateInSupabase(messageId, updates);
          await new Promise(resolve => setTimeout(resolve, 2000));
          break;
          
        case 'localStorage':
          const updatedMessages = messages.map(msg => 
            msg.id === messageId ? { ...msg, ...updates } : msg
          );
          saveToLocalStorage(updatedMessages);
          setMessages(updatedMessages);
          memoryStore.current = updatedMessages;
          break;
          
        case 'memory':
          memoryStore.current = memoryStore.current.map(msg => 
            msg.id === messageId ? { ...msg, ...updates } : msg
          );
          setMessages([...memoryStore.current]);
          break;
      }
      
      console.log(`✅ FASE 13: Mensaje actualizado exitosamente via ${strategy}`);
      
    } catch (error) {
      console.error(`❌ FASE 13: Error actualizando mensaje:`, error);
      throw error;
    } finally {
      processingRef.current = false;
    }
  }, [getStrategy, updateInSupabase, saveToLocalStorage, messages]);

  // FASE 13: markAllAsRead SIMPLIFICADO
  const markAllAsRead = useCallback(async (): Promise<void> => {
    const strategy = getStrategy();
    console.log(`👁️ FASE 13: Marcando todos como leídos via ${strategy}`);
    
    if (processingRef.current) {
      throw new Error('Operación ya en progreso');
    }
    
    processingRef.current = true;
    
    try {
      switch (strategy) {
        case 'supabase':
          await markAllAsReadInSupabase();
          await new Promise(resolve => setTimeout(resolve, 3000));
          break;
          
        case 'localStorage':
          const updatedMessages = messages.map(msg => ({ ...msg, isRead: true }));
          saveToLocalStorage(updatedMessages);
          setMessages(updatedMessages);
          memoryStore.current = updatedMessages;
          break;
          
        case 'memory':
          memoryStore.current = memoryStore.current.map(msg => ({ ...msg, isRead: true }));
          setMessages([...memoryStore.current]);
          break;
      }
      
      console.log(`✅ FASE 13: Todos marcados como leídos via ${strategy}`);
      
    } catch (error) {
      console.error(`❌ FASE 13: Error marcando como leídos:`, error);
      throw error;
    } finally {
      processingRef.current = false;
    }
  }, [getStrategy, markAllAsReadInSupabase, saveToLocalStorage, messages]);

  // FASE 13: clearChat SIMPLIFICADO
  const clearChat = useCallback(async (): Promise<void> => {
    const strategy = getStrategy();
    console.log(`🗑️ FASE 13: Limpiando chat via ${strategy}`);
    
    if (processingRef.current) {
      throw new Error('Operación ya en progreso');
    }
    
    processingRef.current = true;
    
    try {
      switch (strategy) {
        case 'supabase':
          await clearChatInSupabase();
          await new Promise(resolve => setTimeout(resolve, 3000));
          break;
          
        case 'localStorage':
          clearLocalStorage();
          setMessages([]);
          memoryStore.current = [];
          break;
          
        case 'memory':
          memoryStore.current = [];
          setMessages([]);
          break;
      }
      
      console.log(`✅ FASE 13: Chat limpiado exitosamente via ${strategy}`);
      
    } catch (error) {
      console.error(`❌ FASE 13: Error limpiando chat:`, error);
      throw error;
    } finally {
      processingRef.current = false;
    }
  }, [getStrategy, clearChatInSupabase, clearLocalStorage]);

  // FASE 13: Inicialización SIMPLIFICADA
  useEffect(() => {
    if (!isInitialized) {
      console.log('🚀 FASE 13: Inicializando sistema simplificado...');
      
      loadMessages().then(() => {
        setIsInitialized(true);
        console.log('✅ FASE 13: Sistema inicializado');
      }).catch(error => {
        console.error('❌ FASE 13: Error inicializando:', error);
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
    validatePersistence,
    syncWithDB,
    forceFullReset,
    currentStrategy: getStrategy()
  };
};
