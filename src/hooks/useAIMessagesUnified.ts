
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

  console.log('🎯 FASE 9 - useAIMessagesUnified state:', {
    user: user?.id || 'none',
    messagesCount: messages.length,
    isInitialized,
    strategy: getStrategy(),
    isSupabaseLoading,
    processing: processingRef.current
  });

  // FASE 9: PASO 2 - Reset completo del sistema
  const forceFullReset = useCallback(async (): Promise<void> => {
    console.log('🔄 FASE 9 - PASO 2: Iniciando RESET COMPLETO del sistema...');
    
    try {
      setIsLoading(true);
      processingRef.current = true;
      
      // 1. Limpiar BD real (Supabase)
      console.log('🗑️ FASE 9 - PASO 2: Limpiando BD real (Supabase)...');
      await clearChatInSupabase();
      await new Promise(resolve => setTimeout(resolve, 3000)); // FASE 9: Más tiempo para BD real
      
      // 2. Limpiar localStorage
      console.log('🗑️ FASE 9 - PASO 2: Limpiando localStorage...');
      clearLocalStorage();
      
      // 3. Limpiar memoria
      console.log('🗑️ FASE 9 - PASO 2: Limpiando memoria...');
      memoryStore.current = [];
      
      // 4. Resetear estado React
      console.log('🗑️ FASE 9 - PASO 2: Reseteando estado React...');
      setMessages([]);
      
      // 5. Forzar sincronización completa
      lastSyncRef.current = Date.now();
      
      console.log('✅ FASE 9 - PASO 2: RESET COMPLETO exitoso');
      
    } catch (error) {
      console.error('❌ FASE 9 - PASO 2: Error en reset completo:', error);
      throw error;
    } finally {
      processingRef.current = false;
      setIsLoading(false);
    }
  }, [clearChatInSupabase, clearLocalStorage]);

  // FASE 9: PASO 3 - Validación DIRECTA contra BD real
  const validatePersistence = useCallback(async (expectedCount: number, operation: string): Promise<boolean> => {
    const strategy = getStrategy();
    console.log(`🔍 FASE 9 - PASO 3: Validación DIRECTA para ${operation}, esperado: ${expectedCount}, estrategia: ${strategy}`);
    
    try {
      let actualMessages: ChatMessage[] = [];
      
      switch (strategy) {
        case 'supabase':
          // FASE 9: VALIDACIÓN DIRECTA - siempre cargar desde BD, no cache
          console.log('📥 FASE 9 - PASO 3: Cargando DIRECTAMENTE desde Supabase...');
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
      console.log(`🔍 FASE 9 - PASO 3: Validación resultado:`, {
        operation,
        expected: expectedCount,
        actual: actualMessages.length,
        isValid,
        strategy,
        timeDiff: Date.now() - lastSyncRef.current
      });
      
      if (isValid) {
        // FASE 9: Actualizar estado solo si validación exitosa
        setMessages(actualMessages);
        lastSyncRef.current = Date.now();
      } else {
        console.warn(`⚠️ FASE 9 - PASO 3: DESINCRONIZACIÓN DETECTADA - BD: ${actualMessages.length}, Esperado: ${expectedCount}`);
      }
      
      return isValid;
    } catch (error) {
      console.error(`❌ FASE 9 - PASO 3: Error en validación persistencia:`, error);
      return false;
    }
  }, [getStrategy, loadFromSupabase, loadFromLocalStorage]);

  // FASE 9: PASO 5 - Consistencia automática con auto-corrección
  const validateConsistency = useCallback(async (): Promise<boolean> => {
    const strategy = getStrategy();
    console.log(`🔍 FASE 9 - PASO 5: Validando consistencia con estrategia: ${strategy}`);
    
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
        console.warn(`⚠️ FASE 9 - PASO 5: INCONSISTENCIA CRÍTICA DETECTADA:`, {
          real: realMessages.length,
          local: messages.length,
          strategy,
          diff: Math.abs(realMessages.length - messages.length)
        });
        
        // FASE 9: Auto-corrección inmediata
        console.log('🔧 FASE 9 - PASO 5: Aplicando auto-corrección...');
        setMessages(realMessages);
        return false;
      }
      
      console.log(`✅ FASE 9 - PASO 5: Consistencia verificada - ${realMessages.length} mensajes`);
      return true;
      
    } catch (error) {
      console.error(`❌ FASE 9 - PASO 5: Error validando consistencia:`, error);
      return false;
    }
  }, [getStrategy, loadFromSupabase, loadFromLocalStorage, messages.length]);

  // FASE 9: PASO 3 - Cargar mensajes con sincronización forzada
  const loadMessages = useCallback(async (forceSync: boolean = false): Promise<ChatMessage[]> => {
    const strategy = getStrategy();
    console.log(`📥 FASE 9 - PASO 3: Cargando mensajes - estrategia: ${strategy}, forceSync: ${forceSync}`);
    
    setIsLoading(true);
    
    try {
      let loadedMessages: ChatMessage[] = [];
      
      switch (strategy) {
        case 'supabase':
          // FASE 9: SIEMPRE cargar desde BD para asegurar sincronización
          console.log('📥 FASE 9 - PASO 3: Carga FORZADA desde Supabase...');
          loadedMessages = await loadFromSupabase();
          break;
        case 'localStorage':
          loadedMessages = loadFromLocalStorage();
          break;
        case 'memory':
          loadedMessages = memoryStore.current;
          break;
      }
      
      console.log(`✅ FASE 9 - PASO 3: Cargados ${loadedMessages.length} mensajes via ${strategy}`);
      setMessages(loadedMessages);
      lastSyncRef.current = Date.now();
      
      return loadedMessages;
      
    } catch (error) {
      console.error(`❌ FASE 9 - PASO 3: Error cargando mensajes via ${strategy}:`, error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [getStrategy, loadFromSupabase, loadFromLocalStorage]);

  // FASE 9: PASO 3 - Guardar con validación directa post-operación
  const saveMessage = useCallback(async (message: ChatMessage): Promise<void> => {
    const strategy = getStrategy();
    console.log(`💾 FASE 9 - PASO 3: Guardando mensaje via ${strategy}:`, {
      id: message.id,
      type: message.type,
      contentPreview: message.content.substring(0, 50)
    });
    
    if (processingRef.current) {
      console.log('⚠️ FASE 9 - PASO 3: Operación ya en progreso, rechazando');
      throw new Error('Operación ya en progreso');
    }
    
    processingRef.current = true;
    
    try {
      const preCount = messages.length;
      const expectedCount = preCount + 1;
      
      console.log(`📊 FASE 9 - PASO 3: Pre-validación: ${preCount} → ${expectedCount}`);
      
      switch (strategy) {
        case 'supabase':
          await saveToSupabase(message);
          console.log(`✅ FASE 9 - PASO 3: Guardado en Supabase`);
          
          // FASE 9: PASO 4 - Timeout realista para BD en producción (aumentado)
          await new Promise(resolve => setTimeout(resolve, 5000)); // 5 segundos para BD real
          
          const isValid = await validatePersistence(expectedCount, 'saveMessage');
          if (!isValid) {
            throw new Error(`FASE 9 - PASO 3: Post-validación falló para saveMessage`);
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
      console.log(`✅ FASE 9 - PASO 3: Mensaje guardado y validado exitosamente via ${strategy}`);
      
    } catch (error) {
      console.error(`❌ FASE 9 - PASO 3: Error guardando mensaje via ${strategy}:`, error);
      throw error;
    } finally {
      processingRef.current = false;
    }
  }, [getStrategy, saveToSupabase, saveToLocalStorage, messages, validatePersistence]);

  // FASE 9: PASO 3 - Actualizar con validación directa (timeout aumentado)
  const updateMessage = useCallback(async (messageId: string, updates: Partial<ChatMessage>): Promise<void> => {
    const strategy = getStrategy();
    console.log(`🔄 FASE 9 - PASO 3: Actualizando mensaje ${messageId} via ${strategy}`);
    
    if (processingRef.current) {
      throw new Error('Operación ya en progreso');
    }
    
    processingRef.current = true;
    
    try {
      const currentCount = messages.length;
      
      switch (strategy) {
        case 'supabase':
          await updateInSupabase(messageId, updates);
          console.log(`✅ FASE 9 - PASO 3: Actualizado en Supabase`);
          
          // FASE 9: PASO 4 - Timeout realista (aumentado)
          await new Promise(resolve => setTimeout(resolve, 4000)); // 4 segundos
          
          const isValid = await validatePersistence(currentCount, 'updateMessage');
          if (!isValid) {
            throw new Error(`FASE 9 - PASO 3: Post-validación falló para updateMessage`);
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
      console.log(`✅ FASE 9 - PASO 3: Mensaje actualizado y validado via ${strategy}`);
      
    } catch (error) {
      console.error(`❌ FASE 9 - PASO 3: Error actualizando mensaje via ${strategy}:`, error);
      throw error;
    } finally {
      processingRef.current = false;
    }
  }, [getStrategy, updateInSupabase, saveToLocalStorage, messages, validatePersistence]);

  // FASE 9: PASO 3 - Marcar todos como leídos con validación (timeout aumentado)
  const markAllAsRead = useCallback(async (): Promise<void> => {
    const strategy = getStrategy();
    console.log(`👁️ FASE 9 - PASO 3: Marcando todos como leídos via ${strategy}`);
    
    if (processingRef.current) {
      throw new Error('Operación ya en progreso');
    }
    
    processingRef.current = true;
    
    try {
      const currentCount = messages.length;
      
      switch (strategy) {
        case 'supabase':
          await markAllAsReadInSupabase();
          console.log(`✅ FASE 9 - PASO 3: Todos marcados como leídos en Supabase`);
          
          // FASE 9: PASO 4 - Timeout realista para operaciones bulk (aumentado)
          await new Promise(resolve => setTimeout(resolve, 6000)); // 6 segundos para bulk
          
          const isValid = await validatePersistence(currentCount, 'markAllAsRead');
          if (!isValid) {
            throw new Error(`FASE 9 - PASO 3: Post-validación falló para markAllAsRead`);
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
      console.log(`✅ FASE 9 - PASO 3: Todos marcados como leídos y validados via ${strategy}`);
      
    } catch (error) {
      console.error(`❌ FASE 9 - PASO 3: Error marcando todos como leídos via ${strategy}:`, error);
      throw error;
    } finally {
      processingRef.current = false;
    }
  }, [getStrategy, markAllAsReadInSupabase, saveToLocalStorage, messages, validatePersistence]);

  // FASE 9: PASO 2 - Limpiar chat con reset completo (timeout aumentado)
  const clearChat = useCallback(async (): Promise<void> => {
    const strategy = getStrategy();
    console.log(`🗑️ FASE 9 - PASO 2: Limpiando chat via ${strategy}`);
    
    if (processingRef.current) {
      throw new Error('Operación ya en progreso');
    }
    
    processingRef.current = true;
    
    try {
      switch (strategy) {
        case 'supabase':
          await clearChatInSupabase();
          console.log(`✅ FASE 9 - PASO 2: Chat limpiado en Supabase`);
          
          // FASE 9: PASO 4 - Timeout realista para limpieza (aumentado)
          await new Promise(resolve => setTimeout(resolve, 5000)); // 5 segundos para limpieza
          
          const isValid = await validatePersistence(0, 'clearChat');
          if (!isValid) {
            throw new Error(`FASE 9 - PASO 2: Post-validación falló para clearChat`);
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
      console.log(`✅ FASE 9 - PASO 2: Chat limpiado y validado via ${strategy}`);
      
    } catch (error) {
      console.error(`❌ FASE 9 - PASO 2: Error limpiando chat via ${strategy}:`, error);
      throw error;
    } finally {
      processingRef.current = false;
    }
  }, [getStrategy, clearChatInSupabase, clearLocalStorage, validatePersistence]);

  // FASE 9: PASO 3 - Inicialización con sincronización forzada
  useEffect(() => {
    if (!isInitialized) {
      console.log('🚀 FASE 9 - PASO 3: Inicializando con sincronización FORZADA...');
      
      loadMessages(true).then(() => {
        setIsInitialized(true);
        console.log('✅ FASE 9 - PASO 3: Sistema inicializado con sincronización forzada');
      }).catch(error => {
        console.error('❌ FASE 9 - PASO 3: Error inicializando:', error);
        setIsInitialized(true);
      });
    }
  }, [loadMessages, isInitialized]);

  // FASE 9: PASO 5 - Monitoreo automático de consistencia (intervalo aumentado)
  useEffect(() => {
    if (!isInitialized) return;
    
    const consistencyInterval = setInterval(async () => {
      const timeSinceLastSync = Date.now() - lastSyncRef.current;
      if (timeSinceLastSync > 45000) { // 45 segundos - aumentado
        console.log('🔄 FASE 9 - PASO 5: Verificación automática de consistencia...');
        await validateConsistency();
      }
    }, 20000); // Cada 20 segundos - aumentado
    
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
    forceFullReset,
    validateConsistency,
    currentStrategy: getStrategy()
  };
};
