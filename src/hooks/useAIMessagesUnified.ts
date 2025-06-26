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

  console.log('🎯 FASE 11 - useAIMessagesUnified state:', {
    user: user?.id || 'none',
    messagesCount: messages.length,
    isInitialized,
    strategy: getStrategy(),
    isSupabaseLoading,
    processing: processingRef.current
  });

  // FASE 11: CORRECCIÓN CRÍTICA 1 - forceFullReset con sincronización FORZADA post-reset
  const forceFullReset = useCallback(async (): Promise<void> => {
    console.log('🔄 FASE 11 - CORRECCIÓN 1: Iniciando RESET TOTAL con sincronización FORZADA...');
    
    try {
      setIsLoading(true);
      processingRef.current = true;
      
      // 1. Limpiar BD real (Supabase) con confirmación
      console.log('🗑️ FASE 11 - CORRECCIÓN 1: Limpiando BD real (Supabase)...');
      await clearChatInSupabase();
      await new Promise(resolve => setTimeout(resolve, 12000)); // FASE 11: Timeout aumentado significativamente
      
      // 2. FASE 11: CORRECCIÓN CRÍTICA - Confirmar limpieza BD directamente
      console.log('🔍 FASE 11 - CORRECCIÓN 1: Confirmando limpieza BD directa...');
      const confirmMessages = await loadFromSupabase();
      if (confirmMessages.length > 0) {
        console.error(`❌ FASE 11 - CORRECCIÓN 1: BD no está limpia! Encontrados ${confirmMessages.length} mensajes`);
        throw new Error(`BD no está limpia después del reset: ${confirmMessages.length} mensajes restantes`);
      }
      
      // 3. Limpiar localStorage
      console.log('🗑️ FASE 11 - CORRECCIÓN 1: Limpiando localStorage...');
      clearLocalStorage();
      
      // 4. Limpiar memoria
      console.log('🗑️ FASE 11 - CORRECCIÓN 1: Limpiando memoria...');
      memoryStore.current = [];
      
      // 5. FASE 11: CORRECCIÓN CRÍTICA - FORZAR sincronización estado React con BD vacía
      console.log('🔄 FASE 11 - CORRECCIÓN 1: FORZANDO sincronización estado React con BD vacía...');
      setMessages([]);
      
      // 6. FASE 11: Validación adicional de sincronización forzada
      await new Promise(resolve => setTimeout(resolve, 5000)); // Tiempo para propagación React
      console.log('✅ FASE 11 - CORRECCIÓN 1: Estado React forzadamente sincronizado:', {
        bdMessages: 0,
        localMessages: 0,
        reactMessages: 0
      });
      
      // 7. Forzar sincronización completa
      lastSyncRef.current = Date.now();
      
      console.log('✅ FASE 11 - CORRECCIÓN 1: RESET TOTAL con sincronización FORZADA completado');
      
    } catch (error) {
      console.error('❌ FASE 11 - CORRECCIÓN 1: Error en reset total:', error);
      throw error;
    } finally {
      processingRef.current = false;
      setIsLoading(false);
    }
  }, [clearChatInSupabase, clearLocalStorage, loadFromSupabase]);

  // FASE 11: CORRECCIÓN CRÍTICA 2 - validatePersistence con AUTO-CORRECCIÓN INMEDIATA del estado local
  const validatePersistence = useCallback(async (expectedCount: number, operation: string): Promise<boolean> => {
    const strategy = getStrategy();
    console.log(`🔍 FASE 11 - CORRECCIÓN 2: Validación BD DIRECTA con auto-corrección para ${operation}, esperado: ${expectedCount}, estrategia: ${strategy}`);
    
    try {
      let actualMessages: ChatMessage[] = [];
      
      switch (strategy) {
        case 'supabase':
          // FASE 11: CORRECCIÓN CRÍTICA - SIEMPRE cargar desde BD, NUNCA estado local
          console.log('📥 FASE 11 - CORRECCIÓN 2: Cargando DIRECTAMENTE desde BD real (NO estado local)...');
          actualMessages = await loadFromSupabase();
          console.log(`📊 FASE 11 - CORRECCIÓN 2: BD real contiene ${actualMessages.length} mensajes, esperado: ${expectedCount}`);
          break;
        case 'localStorage':
          actualMessages = loadFromLocalStorage();
          break;
        case 'memory':
          actualMessages = memoryStore.current;
          break;
      }
      
      const isValid = actualMessages.length === expectedCount;
      const desync = Math.abs(actualMessages.length - expectedCount);
      
      console.log(`🔍 FASE 11 - CORRECCIÓN 2: Validación BD directa resultado:`, {
        operation,
        expected: expectedCount,
        actual: actualMessages.length,
        isValid,
        strategy,
        desync,
        severity: desync > 100 ? 'CRÍTICA' : desync > 10 ? 'ALTA' : 'BAJA'
      });
      
      // FASE 11: CORRECCIÓN CRÍTICA 2 - SIEMPRE actualizar estado local con BD real
      console.log('🔧 FASE 11 - CORRECCIÓN 2: AUTO-CORRECCIÓN INMEDIATA - Actualizando estado local con BD real...');
      setMessages(actualMessages);
      lastSyncRef.current = Date.now();
      console.log(`✅ FASE 11 - CORRECCIÓN 2: Estado local AUTO-CORREGIDO: ${messages.length} → ${actualMessages.length}`);
      
      if (!isValid) {
        console.error(`❌ FASE 11 - CORRECCIÓN 2: DESINCRONIZACIÓN DETECTADA - BD: ${actualMessages.length}, Esperado: ${expectedCount}, Diff: ${desync}`);
      } else {
        console.log(`✅ FASE 11 - CORRECCIÓN 2: Validación exitosa y estado local sincronizado`);
      }
      
      return isValid;
    } catch (error) {
      console.error(`❌ FASE 11 - CORRECCIÓN 2: Error en validación BD directa:`, error);
      return false;
    }
  }, [getStrategy, loadFromSupabase, loadFromLocalStorage, messages.length]);

  // FASE 11: CORRECCIÓN 3 - Consistencia automática con auto-corrección AGRESIVA
  const validateConsistency = useCallback(async (): Promise<boolean> => {
    const strategy = getStrategy();
    console.log(`🔍 FASE 11 - CORRECCIÓN 3: Validando consistencia BD-Estado con auto-corrección AGRESIVA: ${strategy}`);
    
    try {
      let realMessages: ChatMessage[] = [];
      
      switch (strategy) {
        case 'supabase':
          // FASE 11: SIEMPRE cargar desde BD real para consistencia
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
        const diff = Math.abs(realMessages.length - messages.length);
        console.warn(`⚠️ FASE 11 - CORRECCIÓN 3: INCONSISTENCIA CRÍTICA DETECTADA:`, {
          real: realMessages.length,
          local: messages.length,
          strategy,
          diff: diff,
          severity: diff > 100 ? 'CRÍTICA' : diff > 50 ? 'ALTA' : diff > 10 ? 'MEDIA' : 'BAJA'
        });
        
        // FASE 11: CORRECCIÓN 3 - Auto-corrección AGRESIVA inmediata
        console.log('🔧 FASE 11 - CORRECCIÓN 3: Aplicando auto-corrección AGRESIVA inmediata...');
        setMessages(realMessages);
        lastSyncRef.current = Date.now();
        console.log(`✅ FASE 11 - CORRECCIÓN 3: Auto-corrección AGRESIVA aplicada: ${messages.length} → ${realMessages.length}`);
        return false;
      }
      
      console.log(`✅ FASE 11 - CORRECCIÓN 3: Consistencia verificada - ${realMessages.length} mensajes sincronizados`);
      return true;
      
    } catch (error) {
      console.error(`❌ FASE 11 - CORRECCIÓN 3: Error validando consistencia:`, error);
      return false;
    }
  }, [getStrategy, loadFromSupabase, loadFromLocalStorage, messages.length]);

  // FASE 11: CORRECCIÓN 3 - Cargar mensajes con sincronización BD forzada
  const loadMessages = useCallback(async (forceSync: boolean = false): Promise<ChatMessage[]> => {
    const strategy = getStrategy();
    console.log(`📥 FASE 11 - CORRECCIÓN 3: Cargando mensajes BD directa - estrategia: ${strategy}, forceSync: ${forceSync}`);
    
    setIsLoading(true);
    
    try {
      let loadedMessages: ChatMessage[] = [];
      
      switch (strategy) {
        case 'supabase':
          // FASE 11: SIEMPRE cargar desde BD para asegurar sincronización real
          console.log('📥 FASE 11 - CORRECCIÓN 3: Carga BD DIRECTA desde Supabase...');
          loadedMessages = await loadFromSupabase();
          console.log(`📊 FASE 11 - CORRECCIÓN 3: Cargados ${loadedMessages.length} mensajes desde BD real`);
          break;
        case 'localStorage':
          loadedMessages = loadFromLocalStorage();
          break;
        case 'memory':
          loadedMessages = memoryStore.current;
          break;
      }
      
      console.log(`✅ FASE 11 - CORRECCIÓN 3: Cargados ${loadedMessages.length} mensajes via ${strategy}`);
      setMessages(loadedMessages);
      lastSyncRef.current = Date.now();
      
      return loadedMessages;
      
    } catch (error) {
      console.error(`❌ FASE 11 - CORRECCIÓN 3: Error cargando mensajes via ${strategy}:`, error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [getStrategy, loadFromSupabase, loadFromLocalStorage]);

  // FASE 11: CORRECCIÓN 4 - Guardar con validación BD directa (timeouts aumentados 60-120s)
  const saveMessage = useCallback(async (message: ChatMessage): Promise<void> => {
    const strategy = getStrategy();
    console.log(`💾 FASE 11 - CORRECCIÓN 4: Guardando mensaje via ${strategy}:`, {
      id: message.id,
      type: message.type,
      contentPreview: message.content.substring(0, 50)
    });
    
    if (processingRef.current) {
      console.log('⚠️ FASE 11 - CORRECCIÓN 4: Operación ya en progreso, rechazando');
      throw new Error('Operación ya en progreso');
    }
    
    processingRef.current = true;
    
    try {
      const preCount = messages.length;
      const expectedCount = preCount + 1;
      
      console.log(`📊 FASE 11 - CORRECCIÓN 4: Pre-validación: ${preCount} → ${expectedCount}`);
      
      switch (strategy) {
        case 'supabase':
          await saveToSupabase(message);
          console.log(`✅ FASE 11 - CORRECCIÓN 4: Guardado en BD real`);
          
          // FASE 11: CORRECCIÓN 4 - Timeout realista para BD en producción (aumentado 60-120s)
          console.log('⏳ FASE 11 - CORRECCIÓN 4: Esperando propagación BD (timeout 60-120s)...');
          await new Promise(resolve => setTimeout(resolve, 60000)); // 60 segundos base
          
          // FASE 11: Validación BD directa con auto-corrección
          const isValid = await validatePersistence(expectedCount, 'saveMessage');
          if (!isValid) {
            // FASE 11: Retry con timeout extendido
            console.log('⏳ FASE 11 - CORRECCIÓN 4: Retry con timeout extendido...');
            await new Promise(resolve => setTimeout(resolve, 60000)); // +60 segundos adicionales
            const retryValid = await validatePersistence(expectedCount, 'saveMessage-retry');
            if (!retryValid) {
              throw new Error(`FASE 11 - CORRECCIÓN 4: Post-validación BD directa falló para saveMessage después de retry`);
            }
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
      console.log(`✅ FASE 11 - CORRECCIÓN 4: Mensaje guardado y validado exitosamente via ${strategy}`);
      
    } catch (error) {
      console.error(`❌ FASE 11 - CORRECCIÓN 4: Error guardando mensaje via ${strategy}:`, error);
      throw error;
    } finally {
      processingRef.current = false;
    }
  }, [getStrategy, saveToSupabase, saveToLocalStorage, messages, validatePersistence]);

  // FASE 11: CORRECCIÓN 4 - Actualizar con validación BD directa (timeout aumentado 60-120s)
  const updateMessage = useCallback(async (messageId: string, updates: Partial<ChatMessage>): Promise<void> => {
    const strategy = getStrategy();
    console.log(`🔄 FASE 11 - CORRECCIÓN 4: Actualizando mensaje ${messageId} via ${strategy}`);
    
    if (processingRef.current) {
      throw new Error('Operación ya en progreso');
    }
    
    processingRef.current = true;
    
    try {
      const currentCount = messages.length;
      
      switch (strategy) {
        case 'supabase':
          await updateInSupabase(messageId, updates);
          console.log(`✅ FASE 11 - CORRECCIÓN 4: Actualizado en BD real`);
          
          // FASE 11: CORRECCIÓN 4 - Timeout realista aumentado 60-120s
          console.log('⏳ FASE 11 - CORRECCIÓN 4: Esperando propagación actualización BD (60-120s)...');
          await new Promise(resolve => setTimeout(resolve, 90000)); // 90 segundos para updates
          
          // FASE 11: Validación BD directa con auto-corrección
          const isValid = await validatePersistence(currentCount, 'updateMessage');
          if (!isValid) {
            throw new Error(`FASE 11 - CORRECCIÓN 4: Post-validación BD directa falló para updateMessage`);
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
      console.log(`✅ FASE 11 - CORRECCIÓN 4: Mensaje actualizado y validado BD directa via ${strategy}`);
      
    } catch (error) {
      console.error(`❌ FASE 11 - CORRECCIÓN 4: Error actualizando mensaje via ${strategy}:`, error);
      throw error;
    } finally {
      processingRef.current = false;
    }
  }, [getStrategy, updateInSupabase, saveToLocalStorage, messages, validatePersistence]);

  // FASE 11: CORRECCIÓN 4 - Marcar todos como leídos con validación BD directa (timeout aumentado 60-120s)
  const markAllAsRead = useCallback(async (): Promise<void> => {
    const strategy = getStrategy();
    console.log(`👁️ FASE 11 - CORRECCIÓN 4: Marcando todos como leídos via ${strategy}`);
    
    if (processingRef.current) {
      throw new Error('Operación ya en progreso');
    }
    
    processingRef.current = true;
    
    try {
      const currentCount = messages.length;
      
      switch (strategy) {
        case 'supabase':
          await markAllAsReadInSupabase();
          console.log(`✅ FASE 11 - CORRECCIÓN 4: Todos marcados como leídos en BD real`);
          
          // FASE 11: CORRECCIÓN 4 - Timeout realista para operaciones bulk (aumentado 60-120s)
          console.log('⏳ FASE 11 - CORRECCIÓN 4: Esperando propagación operación bulk BD (60-120s)...');
          await new Promise(resolve => setTimeout(resolve, 120000)); // 120 segundos para bulk
          
          // FASE 11: Validación BD directa con auto-corrección
          const isValid = await validatePersistence(currentCount, 'markAllAsRead');
          if (!isValid) {
            throw new Error(`FASE 11 - CORRECCIÓN 4: Post-validación BD directa falló para markAllAsRead`);
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
      console.log(`✅ FASE 11 - CORRECCIÓN 4: Todos marcados como leídos y validados BD directa via ${strategy}`);
      
    } catch (error) {
      console.error(`❌ FASE 11 - CORRECCIÓN 4: Error marcando todos como leídos via ${strategy}:`, error);
      throw error;
    } finally {
      processingRef.current = false;
    }
  }, [getStrategy, markAllAsReadInSupabase, saveToLocalStorage, messages, validatePersistence]);

  // FASE 11: CORRECCIÓN 1 - Limpiar chat con reset total real (timeout aumentado 60-120s)
  const clearChat = useCallback(async (): Promise<void> => {
    const strategy = getStrategy();
    console.log(`🗑️ FASE 11 - CORRECCIÓN 1: Limpiando chat via ${strategy} con confirmación BD`);
    
    if (processingRef.current) {
      throw new Error('Operación ya en progreso');
    }
    
    processingRef.current = true;
    
    try {
      switch (strategy) {
        case 'supabase':
          await clearChatInSupabase();
          console.log(`✅ FASE 11 - CORRECCIÓN 1: Chat limpiado en BD real`);
          
          // FASE 11: CORRECCIÓN 1 - Timeout realista para limpieza (aumentado 60-120s)
          console.log('⏳ FASE 11 - CORRECCIÓN 1: Esperando confirmación limpieza BD (60-120s)...');
          await new Promise(resolve => setTimeout(resolve, 90000)); // 90 segundos para limpieza
          
          // FASE 11: Validación BD directa con auto-corrección
          const isValid = await validatePersistence(0, 'clearChat');
          if (!isValid) {
            throw new Error(`FASE 11 - CORRECCIÓN 1: Post-validación BD directa falló para clearChat`);
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
      console.log(`✅ FASE 11 - CORRECCIÓN 1: Chat limpiado y validado BD directa via ${strategy}`);
      
    } catch (error) {
      console.error(`❌ FASE 11 - CORRECCIÓN 1: Error limpiando chat via ${strategy}:`, error);
      throw error;
    } finally {
      processingRef.current = false;
    }
  }, [getStrategy, clearChatInSupabase, clearLocalStorage, validatePersistence]);

  // FASE 11: CORRECCIÓN 3 - Inicialización con sincronización BD forzada
  useEffect(() => {
    if (!isInitialized) {
      console.log('🚀 FASE 11 - CORRECCIÓN 3: Inicializando con sincronización BD FORZADA...');
      
      loadMessages(true).then(() => {
        setIsInitialized(true);
        console.log('✅ FASE 11 - CORRECCIÓN 3: Sistema inicializado con sincronización BD forzada');
      }).catch(error => {
        console.error('❌ FASE 11 - CORRECCIÓN 3: Error inicializando:', error);
        setIsInitialized(true);
      });
    }
  }, [loadMessages, isInitialized]);

  // FASE 11: CORRECCIÓN 3 - Monitoreo automático de consistencia (intervalo aumentado)
  useEffect(() => {
    if (!isInitialized) return;
    
    const consistencyInterval = setInterval(async () => {
      const timeSinceLastSync = Date.now() - lastSyncRef.current;
      if (timeSinceLastSync > 120000) { // 120 segundos - aumentado significativamente
        console.log('🔄 FASE 11 - CORRECCIÓN 3: Verificación automática de consistencia BD-Estado...');
        await validateConsistency();
      }
    }, 60000); // Cada 60 segundos - aumentado
    
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
