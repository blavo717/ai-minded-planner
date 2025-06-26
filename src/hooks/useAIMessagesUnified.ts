
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

  console.log('🎯 FASE 10 - useAIMessagesUnified state:', {
    user: user?.id || 'none',
    messagesCount: messages.length,
    isInitialized,
    strategy: getStrategy(),
    isSupabaseLoading,
    processing: processingRef.current
  });

  // FASE 10: PASO 1 - Reset completo REAL con confirmación BD
  const forceFullReset = useCallback(async (): Promise<void> => {
    console.log('🔄 FASE 10 - PASO 1: Iniciando RESET TOTAL REAL con confirmación BD...');
    
    try {
      setIsLoading(true);
      processingRef.current = true;
      
      // 1. Limpiar BD real (Supabase) con confirmación
      console.log('🗑️ FASE 10 - PASO 1: Limpiando BD real (Supabase)...');
      await clearChatInSupabase();
      await new Promise(resolve => setTimeout(resolve, 8000)); // FASE 10: Más tiempo para BD real
      
      // 2. FASE 10: Confirmar limpieza BD directamente
      console.log('🔍 FASE 10 - PASO 1: Confirmando limpieza BD directa...');
      const confirmMessages = await loadFromSupabase();
      if (confirmMessages.length > 0) {
        console.error(`❌ FASE 10 - PASO 1: BD no está limpia! Encontrados ${confirmMessages.length} mensajes`);
        throw new Error(`BD no está limpia después del reset: ${confirmMessages.length} mensajes restantes`);
      }
      
      // 3. Limpiar localStorage
      console.log('🗑️ FASE 10 - PASO 1: Limpiando localStorage...');
      clearLocalStorage();
      
      // 4. Limpiar memoria
      console.log('🗑️ FASE 10 - PASO 1: Limpiando memoria...');
      memoryStore.current = [];
      
      // 5. Resetear estado React
      console.log('🗑️ FASE 10 - PASO 1: Reseteando estado React...');
      setMessages([]);
      
      // 6. Forzar sincronización completa
      lastSyncRef.current = Date.now();
      
      console.log('✅ FASE 10 - PASO 1: RESET TOTAL REAL completado y confirmado');
      
    } catch (error) {
      console.error('❌ FASE 10 - PASO 1: Error en reset total real:', error);
      throw error;
    } finally {
      processingRef.current = false;
      setIsLoading(false);
    }
  }, [clearChatInSupabase, clearLocalStorage, loadFromSupabase]);

  // FASE 10: PASO 1 - Validación DIRECTA contra BD real (NO estado local)
  const validatePersistence = useCallback(async (expectedCount: number, operation: string): Promise<boolean> => {
    const strategy = getStrategy();
    console.log(`🔍 FASE 10 - PASO 1: Validación BD DIRECTA para ${operation}, esperado: ${expectedCount}, estrategia: ${strategy}`);
    
    try {
      let actualMessages: ChatMessage[] = [];
      
      switch (strategy) {
        case 'supabase':
          // FASE 10: CORRECCIÓN CRÍTICA - SIEMPRE cargar desde BD, NUNCA estado local
          console.log('📥 FASE 10 - PASO 1: Cargando DIRECTAMENTE desde BD real (NO estado local)...');
          actualMessages = await loadFromSupabase();
          console.log(`📊 FASE 10 - PASO 1: BD real contiene ${actualMessages.length} mensajes, esperado: ${expectedCount}`);
          break;
        case 'localStorage':
          actualMessages = loadFromLocalStorage();
          break;
        case 'memory':
          actualMessages = memoryStore.current;
          break;
      }
      
      const isValid = actualMessages.length === expectedCount;
      console.log(`🔍 FASE 10 - PASO 1: Validación BD directa resultado:`, {
        operation,
        expected: expectedCount,
        actual: actualMessages.length,
        isValid,
        strategy,
        desync: Math.abs(actualMessages.length - expectedCount)
      });
      
      if (isValid) {
        // FASE 10: Actualizar estado solo si validación exitosa
        setMessages(actualMessages);
        lastSyncRef.current = Date.now();
        console.log(`✅ FASE 10 - PASO 1: Sincronización exitosa BD → Estado Local`);
      } else {
        console.error(`❌ FASE 10 - PASO 1: DESINCRONIZACIÓN CRÍTICA DETECTADA - BD: ${actualMessages.length}, Esperado: ${expectedCount}, Diff: ${Math.abs(actualMessages.length - expectedCount)}`);
      }
      
      return isValid;
    } catch (error) {
      console.error(`❌ FASE 10 - PASO 1: Error en validación BD directa:`, error);
      return false;
    }
  }, [getStrategy, loadFromSupabase, loadFromLocalStorage]);

  // FASE 10: PASO 2 - Consistencia automática con auto-corrección REAL
  const validateConsistency = useCallback(async (): Promise<boolean> => {
    const strategy = getStrategy();
    console.log(`🔍 FASE 10 - PASO 2: Validando consistencia BD-Estado con estrategia: ${strategy}`);
    
    try {
      let realMessages: ChatMessage[] = [];
      
      switch (strategy) {
        case 'supabase':
          // FASE 10: SIEMPRE cargar desde BD real para consistencia
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
        console.warn(`⚠️ FASE 10 - PASO 2: INCONSISTENCIA CRÍTICA DETECTADA:`, {
          real: realMessages.length,
          local: messages.length,
          strategy,
          diff: diff,
          severity: diff > 50 ? 'CRÍTICA' : diff > 10 ? 'ALTA' : 'MEDIA'
        });
        
        // FASE 10: Auto-corrección inmediata
        console.log('🔧 FASE 10 - PASO 2: Aplicando auto-corrección inmediata...');
        setMessages(realMessages);
        lastSyncRef.current = Date.now();
        return false;
      }
      
      console.log(`✅ FASE 10 - PASO 2: Consistencia verificada - ${realMessages.length} mensajes sincronizados`);
      return true;
      
    } catch (error) {
      console.error(`❌ FASE 10 - PASO 2: Error validando consistencia:`, error);
      return false;
    }
  }, [getStrategy, loadFromSupabase, loadFromLocalStorage, messages.length]);

  // FASE 10: PASO 1 - Cargar mensajes con sincronización forzada BD
  const loadMessages = useCallback(async (forceSync: boolean = false): Promise<ChatMessage[]> => {
    const strategy = getStrategy();
    console.log(`📥 FASE 10 - PASO 1: Cargando mensajes BD directa - estrategia: ${strategy}, forceSync: ${forceSync}`);
    
    setIsLoading(true);
    
    try {
      let loadedMessages: ChatMessage[] = [];
      
      switch (strategy) {
        case 'supabase':
          // FASE 10: SIEMPRE cargar desde BD para asegurar sincronización real
          console.log('📥 FASE 10 - PASO 1: Carga BD DIRECTA desde Supabase...');
          loadedMessages = await loadFromSupabase();
          console.log(`📊 FASE 10 - PASO 1: Cargados ${loadedMessages.length} mensajes desde BD real`);
          break;
        case 'localStorage':
          loadedMessages = loadFromLocalStorage();
          break;
        case 'memory':
          loadedMessages = memoryStore.current;
          break;
      }
      
      console.log(`✅ FASE 10 - PASO 1: Cargados ${loadedMessages.length} mensajes via ${strategy}`);
      setMessages(loadedMessages);
      lastSyncRef.current = Date.now();
      
      return loadedMessages;
      
    } catch (error) {
      console.error(`❌ FASE 10 - PASO 1: Error cargando mensajes via ${strategy}:`, error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [getStrategy, loadFromSupabase, loadFromLocalStorage]);

  // FASE 10: PASO 3 - Guardar con validación BD directa (timeouts aumentados)
  const saveMessage = useCallback(async (message: ChatMessage): Promise<void> => {
    const strategy = getStrategy();
    console.log(`💾 FASE 10 - PASO 3: Guardando mensaje via ${strategy}:`, {
      id: message.id,
      type: message.type,
      contentPreview: message.content.substring(0, 50)
    });
    
    if (processingRef.current) {
      console.log('⚠️ FASE 10 - PASO 3: Operación ya en progreso, rechazando');
      throw new Error('Operación ya en progreso');
    }
    
    processingRef.current = true;
    
    try {
      const preCount = messages.length;
      const expectedCount = preCount + 1;
      
      console.log(`📊 FASE 10 - PASO 3: Pre-validación: ${preCount} → ${expectedCount}`);
      
      switch (strategy) {
        case 'supabase':
          await saveToSupabase(message);
          console.log(`✅ FASE 10 - PASO 3: Guardado en BD real`);
          
          // FASE 10: PASO 3 - Timeout realista para BD en producción (aumentado significativamente)
          console.log('⏳ FASE 10 - PASO 3: Esperando propagación BD (tiempo aumentado)...');
          await new Promise(resolve => setTimeout(resolve, 8000)); // 8 segundos para BD real
          
          // FASE 10: Validación BD directa
          const isValid = await validatePersistence(expectedCount, 'saveMessage');
          if (!isValid) {
            throw new Error(`FASE 10 - PASO 3: Post-validación BD directa falló para saveMessage`);
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
      console.log(`✅ FASE 10 - PASO 3: Mensaje guardado y validado exitosamente via ${strategy}`);
      
    } catch (error) {
      console.error(`❌ FASE 10 - PASO 3: Error guardando mensaje via ${strategy}:`, error);
      throw error;
    } finally {
      processingRef.current = false;
    }
  }, [getStrategy, saveToSupabase, saveToLocalStorage, messages, validatePersistence]);

  // FASE 10: PASO 3 - Actualizar con validación BD directa (timeout aumentado)
  const updateMessage = useCallback(async (messageId: string, updates: Partial<ChatMessage>): Promise<void> => {
    const strategy = getStrategy();
    console.log(`🔄 FASE 10 - PASO 3: Actualizando mensaje ${messageId} via ${strategy}`);
    
    if (processingRef.current) {
      throw new Error('Operación ya en progreso');
    }
    
    processingRef.current = true;
    
    try {
      const currentCount = messages.length;
      
      switch (strategy) {
        case 'supabase':
          await updateInSupabase(messageId, updates);
          console.log(`✅ FASE 10 - PASO 3: Actualizado en BD real`);
          
          // FASE 10: PASO 3 - Timeout realista aumentado
          console.log('⏳ FASE 10 - PASO 3: Esperando propagación actualización BD...');
          await new Promise(resolve => setTimeout(resolve, 6000)); // 6 segundos
          
          // FASE 10: Validación BD directa
          const isValid = await validatePersistence(currentCount, 'updateMessage');
          if (!isValid) {
            throw new Error(`FASE 10 - PASO 3: Post-validación BD directa falló para updateMessage`);
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
      console.log(`✅ FASE 10 - PASO 3: Mensaje actualizado y validado BD directa via ${strategy}`);
      
    } catch (error) {
      console.error(`❌ FASE 10 - PASO 3: Error actualizando mensaje via ${strategy}:`, error);
      throw error;
    } finally {
      processingRef.current = false;
    }
  }, [getStrategy, updateInSupabase, saveToLocalStorage, messages, validatePersistence]);

  // FASE 10: PASO 3 - Marcar todos como leídos con validación BD directa (timeout aumentado)
  const markAllAsRead = useCallback(async (): Promise<void> => {
    const strategy = getStrategy();
    console.log(`👁️ FASE 10 - PASO 3: Marcando todos como leídos via ${strategy}`);
    
    if (processingRef.current) {
      throw new Error('Operación ya en progreso');
    }
    
    processingRef.current = true;
    
    try {
      const currentCount = messages.length;
      
      switch (strategy) {
        case 'supabase':
          await markAllAsReadInSupabase();
          console.log(`✅ FASE 10 - PASO 3: Todos marcados como leídos en BD real`);
          
          // FASE 10: PASO 3 - Timeout realista para operaciones bulk (aumentado significativamente)
          console.log('⏳ FASE 10 - PASO 3: Esperando propagación operación bulk BD...');
          await new Promise(resolve => setTimeout(resolve, 10000)); // 10 segundos para bulk
          
          // FASE 10: Validación BD directa
          const isValid = await validatePersistence(currentCount, 'markAllAsRead');
          if (!isValid) {
            throw new Error(`FASE 10 - PASO 3: Post-validación BD directa falló para markAllAsRead`);
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
      console.log(`✅ FASE 10 - PASO 3: Todos marcados como leídos y validados BD directa via ${strategy}`);
      
    } catch (error) {
      console.error(`❌ FASE 10 - PASO 3: Error marcando todos como leídos via ${strategy}:`, error);
      throw error;
    } finally {
      processingRef.current = false;
    }
  }, [getStrategy, markAllAsReadInSupabase, saveToLocalStorage, messages, validatePersistence]);

  // FASE 10: PASO 1 - Limpiar chat con reset total real (timeout aumentado)
  const clearChat = useCallback(async (): Promise<void> => {
    const strategy = getStrategy();
    console.log(`🗑️ FASE 10 - PASO 1: Limpiando chat via ${strategy} con confirmación BD`);
    
    if (processingRef.current) {
      throw new Error('Operación ya en progreso');
    }
    
    processingRef.current = true;
    
    try {
      switch (strategy) {
        case 'supabase':
          await clearChatInSupabase();
          console.log(`✅ FASE 10 - PASO 1: Chat limpiado en BD real`);
          
          // FASE 10: PASO 1 - Timeout realista para limpieza (aumentado)
          console.log('⏳ FASE 10 - PASO 1: Esperando confirmación limpieza BD...');
          await new Promise(resolve => setTimeout(resolve, 8000)); // 8 segundos para limpieza
          
          // FASE 10: Validación BD directa
          const isValid = await validatePersistence(0, 'clearChat');
          if (!isValid) {
            throw new Error(`FASE 10 - PASO 1: Post-validación BD directa falló para clearChat`);
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
      console.log(`✅ FASE 10 - PASO 1: Chat limpiado y validado BD directa via ${strategy}`);
      
    } catch (error) {
      console.error(`❌ FASE 10 - PASO 1: Error limpiando chat via ${strategy}:`, error);
      throw error;
    } finally {
      processingRef.current = false;
    }
  }, [getStrategy, clearChatInSupabase, clearLocalStorage, validatePersistence]);

  // FASE 10: PASO 1 - Inicialización con sincronización BD forzada
  useEffect(() => {
    if (!isInitialized) {
      console.log('🚀 FASE 10 - PASO 1: Inicializando con sincronización BD FORZADA...');
      
      loadMessages(true).then(() => {
        setIsInitialized(true);
        console.log('✅ FASE 10 - PASO 1: Sistema inicializado con sincronización BD forzada');
      }).catch(error => {
        console.error('❌ FASE 10 - PASO 1: Error inicializando:', error);
        setIsInitialized(true);
      });
    }
  }, [loadMessages, isInitialized]);

  // FASE 10: PASO 2 - Monitoreo automático de consistencia (intervalo aumentado)
  useEffect(() => {
    if (!isInitialized) return;
    
    const consistencyInterval = setInterval(async () => {
      const timeSinceLastSync = Date.now() - lastSyncRef.current;
      if (timeSinceLastSync > 60000) { // 60 segundos - aumentado significativamente
        console.log('🔄 FASE 10 - PASO 2: Verificación automática de consistencia BD-Estado...');
        await validateConsistency();
      }
    }, 30000); // Cada 30 segundos - aumentado
    
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
