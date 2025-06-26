
import { useAuth } from '@/hooks/useAuth';
import { useCallback } from 'react';
import type { ChatMessage } from '@/hooks/useAIAssistant';

export type PersistenceStrategy = 'supabase' | 'localStorage' | 'memory';

export const useAIPersistenceStrategy = () => {
  const { user } = useAuth();
  
  // FASE 9: PASO 1 - FORZAR SUPABASE SIEMPRE que hay usuario autenticado
  const getStrategy = useCallback((): PersistenceStrategy => {
    // FASE 9: CORRECCIÓN CRÍTICA - No detectar localhost, usar Supabase siempre con usuario
    if (user) {
      console.log('🔄 FASE 9 - PASO 1: Persistence strategy: supabase (user authenticated - FORCED)');
      return 'supabase';
    }
    
    // Solo en caso de no tener usuario, usar localStorage
    if (typeof window !== 'undefined') {
      console.log('🔄 FASE 9 - PASO 1: Persistence strategy: localStorage (no user)');
      return 'localStorage';
    }
    
    // Fallback final a memoria
    console.log('🔄 FASE 9 - PASO 1: Persistence strategy: memory (fallback mode)');
    return 'memory';
  }, [user]);

  const saveToLocalStorage = useCallback((messages: ChatMessage[]) => {
    try {
      const storageKey = 'ai-chat-messages';
      localStorage.setItem(storageKey, JSON.stringify(messages));
      console.log(`💾 FASE 9 - PASO 1: Saved ${messages.length} messages to localStorage`);
      return true;
    } catch (error) {
      console.error('❌ FASE 9 - PASO 1: Error saving to localStorage:', error);
      return false;
    }
  }, []);

  const loadFromLocalStorage = useCallback((): ChatMessage[] => {
    try {
      const storageKey = 'ai-chat-messages';
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const messages = JSON.parse(stored) as ChatMessage[];
        console.log(`📥 FASE 9 - PASO 1: Loaded ${messages.length} messages from localStorage`);
        return messages.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
      }
      return [];
    } catch (error) {
      console.error('❌ FASE 9 - PASO 1: Error loading from localStorage:', error);
      return [];
    }
  }, []);

  const clearLocalStorage = useCallback(() => {
    try {
      const storageKey = 'ai-chat-messages';
      localStorage.removeItem(storageKey);
      console.log('🗑️ FASE 9 - PASO 1: Cleared localStorage messages');
      return true;
    } catch (error) {
      console.error('❌ FASE 9 - PASO 1: Error clearing localStorage:', error);
      return false;
    }
  }, []);

  return {
    getStrategy,
    saveToLocalStorage,
    loadFromLocalStorage,
    clearLocalStorage
  };
};
