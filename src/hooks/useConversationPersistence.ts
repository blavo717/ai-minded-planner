import { useCallback, useEffect, useRef, useMemo } from 'react';

export interface PersistedMessage {
  id: string;
  type: 'user' | 'assistant' | 'proactive_alert';
  content: string;
  timestamp: Date;
  context?: any;
  proactiveAlert?: any;
}

export interface ConversationData {
  messages: PersistedMessage[];
  lastSaved: string;
  conversationId: string;
  messageCount: number;
}

/**
 * ✅ CHECKPOINT 3.2: Hook para persistencia de conversaciones con LocalStorage
 * Guarda automáticamente cada mensaje y restaura las últimas 30 conversaciones
 */
export const useConversationPersistence = (conversationId: string) => {
  // ✅ PASO 2: Estabilizar storageKey para evitar recreaciones
  const storageKey = useMemo(() => `ai_conversation_${conversationId}`, [conversationId]);
  const lastSaveRef = useRef<number>(Date.now());
  const cleanupExecutedRef = useRef<boolean>(false);

  /**
   * Guarda la conversación completa en localStorage
   */
  const saveConversation = useCallback((messages: PersistedMessage[]) => {
    try {
      // Limitar a los últimos 30 mensajes para evitar sobrecarga
      const messagesToSave = messages.slice(-30);
      
      const conversationData: ConversationData = {
        messages: messagesToSave,
        lastSaved: new Date().toISOString(),
        conversationId,
        messageCount: messages.length
      };

      localStorage.setItem(storageKey, JSON.stringify(conversationData));
      lastSaveRef.current = Date.now();
      
      console.log(`✅ Conversación guardada: ${messagesToSave.length} mensajes`);
    } catch (error) {
      console.warn('Error guardando conversación:', error);
      // Si localStorage está lleno, limpiar conversaciones antiguas
      cleanOldConversations();
    }
  }, [storageKey, conversationId]);

  /**
   * Carga la conversación desde localStorage
   */
  const loadConversation = useCallback((): PersistedMessage[] => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (!stored) return [];

      const data: ConversationData = JSON.parse(stored);
      
      // Validar estructura de datos
      if (!data.messages || !Array.isArray(data.messages)) {
        return [];
      }

      // Convertir timestamps a objetos Date
      const messages = data.messages.map(msg => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));

      console.log(`📥 Conversación cargada: ${messages.length} mensajes`);
      return messages;
    } catch (error) {
      console.warn('Error cargando conversación:', error);
      return [];
    }
  }, [storageKey]);

  /**
   * Limpia la conversación actual del localStorage
   */
  const clearConversation = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
      console.log('🗑️ Conversación limpiada del almacenamiento');
    } catch (error) {
      console.warn('Error limpiando conversación:', error);
    }
  }, [storageKey]);

  /**
   * Auto-guarda un mensaje individual inmediatamente
   */
  const autoSaveMessage = useCallback((messages: PersistedMessage[]) => {
    // Throttle: solo guardar si han pasado al menos 500ms desde el último guardado
    const now = Date.now();
    if (now - lastSaveRef.current >= 500) {
      saveConversation(messages);
    }
  }, [saveConversation]);

  /**
   * Obtiene estadísticas de la conversación
   */
  const getConversationStats = useCallback(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (!stored) return null;

      const data: ConversationData = JSON.parse(stored);
      return {
        messageCount: data.messageCount || 0,
        lastSaved: data.lastSaved ? new Date(data.lastSaved) : null,
        conversationId: data.conversationId
      };
    } catch (error) {
      return null;
    }
  }, [storageKey]);

  /**
   * Limpia conversaciones antiguas para liberar espacio
   */
  const cleanOldConversations = useCallback(() => {
    try {
      const keys = Object.keys(localStorage).filter(key => 
        key.startsWith('ai_conversation_')
      );

      // Ordenar por fecha de modificación y mantener solo las últimas 10 conversaciones
      const conversations = keys.map(key => {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '{}');
          return {
            key,
            lastSaved: new Date(data.lastSaved || 0).getTime()
          };
        } catch {
          return { key, lastSaved: 0 };
        }
      }).sort((a, b) => b.lastSaved - a.lastSaved);

      // Eliminar conversaciones antiguas (mantener solo las 10 más recientes)
      const toDelete = conversations.slice(10);
      toDelete.forEach(conv => {
        localStorage.removeItem(conv.key);
      });

      if (toDelete.length > 0) {
        console.log(`🧹 ${toDelete.length} conversaciones antiguas eliminadas`);
      }
    } catch (error) {
      console.warn('Error limpiando conversaciones antiguas:', error);
    }
  }, []);

  /**
   * Exporta la conversación actual a un archivo JSON
   */
  const exportConversation = useCallback(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (!stored) return null;

      const data: ConversationData = JSON.parse(stored);
      const blob = new Blob([JSON.stringify(data, null, 2)], { 
        type: 'application/json' 
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `conversation_${conversationId}_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);

      return data;
    } catch (error) {
      console.warn('Error exportando conversación:', error);
      return null;
    }
  }, [storageKey, conversationId]);

  /**
   * Obtiene el tamaño aproximado de almacenamiento usado
   */
  const getStorageSize = useCallback(() => {
    try {
      const keys = Object.keys(localStorage).filter(key => 
        key.startsWith('ai_conversation_')
      );
      
      const totalSize = keys.reduce((size, key) => {
        const value = localStorage.getItem(key) || '';
        return size + key.length + value.length;
      }, 0);

      return {
        totalSize,
        conversationCount: keys.length,
        sizeInKB: Math.round(totalSize / 1024 * 100) / 100
      };
    } catch (error) {
      return { totalSize: 0, conversationCount: 0, sizeInKB: 0 };
    }
  }, []);

  // ✅ PASO 2: Limpiar conversaciones antiguas al inicializar (solo una vez)
  useEffect(() => {
    if (!cleanupExecutedRef.current) {
      cleanupExecutedRef.current = true;
      cleanOldConversations();
    }
  }, []); // Sin dependencias para ejecutar solo una vez

  // ✅ PASO 2: Memoizar objeto de retorno con dependencias estabilizadas
  return useMemo(() => ({
    saveConversation,
    loadConversation,
    clearConversation,
    autoSaveMessage,
    getConversationStats,
    exportConversation,
    getStorageSize,
    cleanOldConversations
  }), [storageKey, conversationId]); // Dependencias simplificadas y estables
};