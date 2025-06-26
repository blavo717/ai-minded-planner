
import { useAuth } from '@/hooks/useAuth';
import { useCallback } from 'react';
import type { ChatMessage } from '@/hooks/useAIAssistant';

export type PersistenceStrategy = 'supabase' | 'localStorage' | 'memory';

export const useAIPersistenceStrategy = () => {
  const { user } = useAuth();
  
  // Detectar automáticamente la estrategia basada en el entorno
  const getStrategy = useCallback((): PersistenceStrategy => {
    // En tests o si no hay usuario, usar localStorage
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost' && !user) {
      console.log('🔄 Persistence strategy: localStorage (test mode)');
      return 'localStorage';
    }
    
    // En producción con usuario, usar Supabase
    if (user) {
      console.log('🔄 Persistence strategy: supabase (production mode)');
      return 'supabase';
    }
    
    // Fallback a memoria
    console.log('🔄 Persistence strategy: memory (fallback mode)');
    return 'memory';
  }, [user]);

  const saveToLocalStorage = useCallback((messages: ChatMessage[]) => {
    try {
      const storageKey = 'ai-chat-messages';
      localStorage.setItem(storageKey, JSON.stringify(messages));
      console.log(`💾 Saved ${messages.length} messages to localStorage`);
      return true;
    } catch (error) {
      console.error('❌ Error saving to localStorage:', error);
      return false;
    }
  }, []);

  const loadFromLocalStorage = useCallback((): ChatMessage[] => {
    try {
      const storageKey = 'ai-chat-messages';
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const messages = JSON.parse(stored) as ChatMessage[];
        console.log(`📥 Loaded ${messages.length} messages from localStorage`);
        return messages.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
      }
      return [];
    } catch (error) {
      console.error('❌ Error loading from localStorage:', error);
      return [];
    }
  }, []);

  const clearLocalStorage = useCallback(() => {
    try {
      const storageKey = 'ai-chat-messages';
      localStorage.removeItem(storageKey);
      console.log('🗑️ Cleared localStorage messages');
      return true;
    } catch (error) {
      console.error('❌ Error clearing localStorage:', error);
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
