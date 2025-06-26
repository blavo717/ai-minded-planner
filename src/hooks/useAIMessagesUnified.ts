
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
  const lastSyncRef = useRef<number>(0);

  console.log('🎯 useAIMessagesUnified state (FASE 7 - RESINCRONIZACIÓN TOTAL):', {
    user: user?.id || 'none',
    messagesCount: messages.length,
    isInitialized,
    strategy: getStrategy(),
    isSupabaseLoading,
    processing: processingRef.current
  });

  // FASE 7: PASO 1 - Función de reset completo
  const forceFullReset = useCallback(async (): Promise<void> => {
    console.log('🔄 FASE 7 - PASO 1: Iniciando reset completo...');
    
    try {
      setIsLoading(true);
      processingRef.current = true;
      
      // 1. Limpiar BD real
      await clearChatInSupabase();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 2. Limpiar localStorage
      clearLocalStorage();
      
      // 3. Limpiar memoria
      memoryStore.current = [];
      
      // 4. Resetear estado React
      setMessages([]);
      
      // 5. Forzar re-sincronización
      lastSyncRef.current = Date.now();
      
      console.log('✅ FASE 7 - PASO 1: Reset completo exitoso');
      
    } catch (error) {
      console.error('❌ FASE 7 - PASO 1: Error en reset completo:', error);
      throw error;
    } finally {
      processingRef.current = false;
      setIsLoading(false);
    }
  }, [clearChatInSupabase, clearLocalStorage]);

  // FASE 7: PASO 2 - Validación de consistencia BD-Estado
  const validateConsistency = useCallback(async (): Promise<boolean> => {
    const strategy = getStrategy();
    console.log(`🔍 FASE 7 - PASO 2: Validando consistencia BD-Estado con estrategia: ${strategy}`);
    
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
      
      const isConsistent = realMessages.length === messages.length;
      
      if (!isConsistent) {
        console.warn(`⚠️ FASE 7 - PASO 2: INCONSISTENCIA DETECTADA:`, {
          real: realMessages.length,
          local: messages.length,
          strategy,
          diff: Math.abs(realMessages.length - messages.length)
        });
        
        // Auto-corrección: usar datos reales
        setMessages(realMessages);
        return false;
      }
      
      console.log(`✅ FASE 7 - PASO 2: Consistencia BD-Estado verificada`);
      return true;
      
    } catch (error) {
      console.error(`❌ FASE 7 - PASO 2: Error validando consistencia:`, error);
      return false;
    }
  }, [getStrategy, loadFromSupabase, loadFromLocalStorage, messages.length]);

  // FASE 7: PASO 2 - Validación directa contra BD (para tests)
  const validatePersistence = useCallback(async (expectedCount: number, operation: string): Promise<boolean> => {
    const strategy = getStrategy();
    console.log(`🔍 FASE 7 - Validando persistencia DIRECTA para ${operation}, esperado: ${expectedCount}, estrategia: ${strategy}`);
    
    try {
      let actualMessages: ChatMessage[] = [];
      
      switch (strategy) {
        case 'supabase':
          // FASE 7: Validación directa, no usar cache
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
      console.log(`🔍 FASE 7 - Validación persistencia resultado:`, {
        operation,
        expected: expectedCount,
        actual: actualMessages.length,
        isValid,
        strategy,
        timeDiff: Date.now() - lastSyncRef.current
      });
      
      if (isValid) {
        // FASE 7: Actualizar estado solo si la validación es exitosa
        setMessages(actualMessages);
        lastSyncRef.current = Date.now();
      }
      
      return isValid;
    } catch (error) {
      console.error(`❌ FASE 7 - Error en validación persistencia:`, error);
      return false;
    }
  }, [getStrategy, loadFromSupabase, loadFromLocalStorage]);

  // FASE 7: PASO 2 - Cargar mensajes con sincronización forzada
  const loadMessages = useCallback(async (forceSync: boolean = false): Promise<ChatMessage[]> => {
    const strategy = getStrategy();
    console.log(`📥 FASE 7 - PASO 2: Cargando mensajes con estrategia: ${strategy}, forceSync: ${forceSync}`);
    
    setIsLoading(true);
    
    try {
      let loadedMessages: ChatMessage[] = [];
      
      switch (strategy) {
        case 'supabase':
          // FASE 7: Siempre cargar desde BD en modo de resincronización
          loadedMessages = await loadFromSupabase();
          break;
        case 'localStorage':
          loadedMessages = loadFromLocalStorage();
          break;
        case 'memory':
          loadedMessages = memoryStore.current;
          break;
      }
      
      console.log(`✅ FASE 7 - PASO 2: Cargados ${loadedMessages.length} mensajes via ${strategy}`);
      setMessages(loadedMessages);
      lastSyncRef.current = Date.now();
      
      // FASE 7: Validar consistencia post-carga
      if (forceSync || Date.now() - lastSyncRef.current > 30000) {
        await validateConsistency();
      }
      
      return loadedMessages;
      
    } catch (error) {
      console.error(`❌ FASE 7 - PASO 2: Error cargando mensajes via ${strategy}:`, error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [getStrategy, loadFromSupabase, loadFromLocalStorage, validateConsistency]);

  // FASE 7: PASO 3 - Persistencia con pre/post validación
  const saveMessage = useCallback(async (message: ChatMessage): Promise<void> => {
    const strategy = getStrategy();
    console.log(`💾 FASE 7 - PASO 3: Guardando mensaje via ${strategy}:`, {
      id: message.id,
      type: message.type,
      contentPreview: message.content.substring(0, 50)
    });
    
    if (processingRef.current) {
      console.log('⚠️ FASE 7 - PASO 3: Operación de guardado ya en progreso, rechazando');
      throw new Error('Operación de guardado ya en progreso');
    }
    
    processingRef.current = true;
    
    try {
      // FASE 7: Pre-validación
      const preCount = messages.length;
      const expectedCount = preCount + 1;
      
      console.log(`📊 FASE 7 - PASO 3: Pre-validación:`, {
        preCount,
        expectedCount,
        strategy
      });
      
      switch (strategy) {
        case 'supabase':
          await saveToSupabase(message);
          console.log(`✅ FASE 7 - PASO 3: Mensaje guardado en Supabase`);
          
          // FASE 7: Post-validación con tiempo realista
          await new Promise(resolve => setTimeout(resolve, 750));
          
          const isValid = await validatePersistence(expectedCount, 'saveMessage');
          if (!isValid) {
            throw new Error(`FASE 7 - PASO 3: Post-validación falló para saveMessage`);
          }
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
      
      lastSyncRef.current = Date.now();
      console.log(`✅ FASE 7 - PASO 3: Mensaje guardado y validado exitosamente via ${strategy}`);
      
    } catch (error) {
      console.error(`❌ FASE 7 - PASO 3: Error guardando mensaje via ${strategy}:`, error);
      throw error;
    } finally {
      processingRef.current = false;
    }
  }, [getStrategy, saveToSupabase, saveToLocalStorage, messages, validatePersistence]);

  // FASE 7: PASO 3 - Actualizar mensaje con validación
  const updateMessage = useCallback(async (messageId: string, updates: Partial<ChatMessage>): Promise<void> => {
    const strategy = getStrategy();
    console.log(`🔄 FASE 7 - PASO 3: Actualizando mensaje ${messageId} via ${strategy}`);
    
    if (processingRef.current) {
      console.log('⚠️ FASE 7 - PASO 3: Operación de actualización ya en progreso, rechazando');
      throw new Error('Operación de actualización ya en progreso');
    }
    
    processingRef.current = true;
    
    try {
      const currentCount = messages.length;
      
      switch (strategy) {
        case 'supabase':
          await updateInSupabase(messageId, updates);
          console.log(`✅ FASE 7 - PASO 3: Mensaje actualizado en Supabase`);
          
          // FASE 7: Post-validación
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const isValid = await validatePersistence(currentCount, 'updateMessage');
          if (!isValid) {
            throw new Error(`FASE 7 - PASO 3: Post-validación falló para updateMessage`);
          }
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
      
      lastSyncRef.current = Date.now();
      console.log(`✅ FASE 7 - PASO 3: Mensaje actualizado y validado exitosamente via ${strategy}`);
      
    } catch (error) {
      console.error(`❌ FASE 7 - PASO 3: Error actualizando mensaje via ${strategy}:`, error);
      throw error;
    } finally {
      processingRef.current = false;
    }
  }, [getStrategy, updateInSupabase, saveToLocalStorage, messages, validatePersistence]);

  // FASE 7: PASO 3 - Marcar todos como leídos con validación
  const markAllAsRead = useCallback(async (): Promise<void> => {
    const strategy = getStrategy();
    console.log(`👁️ FASE 7 - PASO 3: Marcando todos como leídos via ${strategy}`);
    
    if (processingRef.current) {
      console.log('⚠️ FASE 7 - PASO 3: Operación markAllAsRead ya en progreso, rechazando');
      throw new Error('Operación markAllAsRead ya en progreso');
    }
    
    processingRef.current = true;
    
    try {
      const currentCount = messages.length;
      
      switch (strategy) {
        case 'supabase':
          await markAllAsReadInSupabase();
          console.log(`✅ FASE 7 - PASO 3: Todos los mensajes marcados como leídos en Supabase`);
          
          // FASE 7: Post-validación
          await new Promise(resolve => setTimeout(resolve, 750));
          
          const isValid = await validatePersistence(currentCount, 'markAllAsRead');
          if (!isValid) {
            throw new Error(`FASE 7 - PASO 3: Post-validación falló para markAllAsRead`);
          }
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
      
      lastSyncRef.current = Date.now();
      console.log(`✅ FASE 7 - PASO 3: Todos los mensajes marcados como leídos y validados via ${strategy}`);
      
    } catch (error) {
      console.error(`❌ FASE 7 - PASO 3: Error marcando todos como leídos via ${strategy}:`, error);
      throw error;
    } finally {
      processingRef.current = false;
    }
  }, [getStrategy, markAllAsReadInSupabase, saveToLocalStorage, messages, validatePersistence]);

  // FASE 7: PASO 1 - Limpiar chat con reset completo
  const clearChat = useCallback(async (): Promise<void> => {
    const strategy = getStrategy();
    console.log(`🗑️ FASE 7 - PASO 1: Limpiando chat via ${strategy}`);
    
    if (processingRef.current) {
      console.log('⚠️ FASE 7 - PASO 1: Operación clearChat ya en progreso, rechazando');
      throw new Error('Operación clearChat ya en progreso');
    }
    
    processingRef.current = true;
    
    try {
      switch (strategy) {
        case 'supabase':
          await clearChatInSupabase();
          console.log(`✅ FASE 7 - PASO 1: Chat limpiado en Supabase`);
          
          // FASE 7: Post-validación de limpieza
          await new Promise(resolve => setTimeout(resolve, 750));
          
          const isValid = await validatePersistence(0, 'clearChat');
          if (!isValid) {
            throw new Error(`FASE 7 - PASO 1: Post-validación falló para clearChat`);
          }
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
      
      lastSyncRef.current = Date.now();
      console.log(`✅ FASE 7 - PASO 1: Chat limpiado y validado exitosamente via ${strategy}`);
      
    } catch (error) {
      console.error(`❌ FASE 7 - PASO 1: Error limpiando chat via ${strategy}:`, error);
      throw error;
    } finally {
      processingRef.current = false;
    }
  }, [getStrategy, clearChatInSupabase, clearLocalStorage, validatePersistence]);

  // FASE 7: PASO 2 - Inicializar con resincronización forzada
  useEffect(() => {
    if (!isInitialized) {
      console.log('🚀 FASE 7 - PASO 2: Inicializando sistema unificado con resincronización forzada...');
      
      loadMessages(true).then(() => {
        setIsInitialized(true);
        console.log('✅ FASE 7 - PASO 2: Sistema unificado inicializado con resincronización');
      }).catch(error => {
        console.error('❌ FASE 7 - PASO 2: Error inicializando mensajes:', error);
        setIsInitialized(true);
      });
    }
  }, [loadMessages, isInitialized]);

  // FASE 7: PASO 5 - Monitoreo de consistencia automático
  useEffect(() => {
    if (!isInitialized) return;
    
    const consistencyInterval = setInterval(async () => {
      const timeSinceLastSync = Date.now() - lastSyncRef.current;
      if (timeSinceLastSync > 60000) { // 1 minuto
        console.log('🔄 FASE 7 - PASO 5: Ejecutando verificación de consistencia automática...');
        await validateConsistency();
      }
    }, 30000); // Cada 30 segundos
    
    return () => clearInterval(consistencyInterval);
  }, [isInitialized, validateConsistency]);

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
    forceFullReset, // FASE 7: Exponer para tests
    validateConsistency, // FASE 7: Exponer para monitoreo
    currentStrategy: getStrategy()
  };
};
