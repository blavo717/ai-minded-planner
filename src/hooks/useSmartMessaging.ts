
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTasks } from '@/hooks/useTasks';
import { useAIAssistant } from '@/hooks/useAIAssistant';
import { useLLMConfigurations } from '@/hooks/useLLMConfigurations';

export const useSmartMessaging = () => {
  const { user } = useAuth();
  const { tasks } = useTasks();
  const { addNotification, addSuggestion, messages } = useAIAssistant();
  const { activeConfiguration } = useLLMConfigurations();
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  
  // FASE 14: DESACTIVAR COMPLETAMENTE Smart Messaging durante desarrollo
  const [isPermanentlyDisabled, setIsPermanentlyDisabled] = useState(true);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  console.log('🛑 FASE 14: Smart Messaging PERMANENTLY DISABLED for development');

  // FASE 14: Verificación anti-duplicados DESACTIVADA
  const checkForDuplicateMessage = useCallback(() => {
    console.log('🛑 FASE 14: checkForDuplicateMessage DISABLED');
    return false; // Nunca considera duplicados
  }, []);

  // FASE 14: pauseForTesting - NOOP ya que está desactivado
  const pauseForTesting = useCallback(() => {
    console.log('🛑 FASE 14: Smart Messaging already PERMANENTLY DISABLED');
  }, []);

  // FASE 14: resumeAfterTesting - NOOP ya que está desactivado
  const resumeAfterTesting = useCallback(() => {
    console.log('🛑 FASE 14: Smart Messaging remains PERMANENTLY DISABLED');
  }, []);

  // FASE 14: Todas las funciones de check DESACTIVADAS
  const checkFollowupTasks = useCallback(async () => {
    console.log('🛑 FASE 14: checkFollowupTasks DISABLED');
    return false;
  }, []);

  const checkInactiveTasks = useCallback(async () => {
    console.log('🛑 FASE 14: checkInactiveTasks DISABLED');
    return false;
  }, []);

  const checkUpcomingDeadlines = useCallback(async () => {
    console.log('🛑 FASE 14: checkUpcomingDeadlines DISABLED');
    return false;
  }, []);

  const triggerTaskAnalysis = useCallback(async () => {
    console.log('🛑 FASE 14: triggerTaskAnalysis DISABLED');
  }, []);

  // FASE 14: runSmartChecks DESACTIVADO
  const runSmartChecks = useCallback(async () => {
    console.log('🛑 FASE 14: runSmartChecks PERMANENTLY DISABLED');
  }, []);

  // FASE 14: NO configurar intervalos - todo desactivado
  useEffect(() => {
    console.log('🛑 FASE 14: Smart messaging intervals PERMANENTLY DISABLED');
    
    // Limpiar cualquier intervalo previo
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    setIsRunning(false);
  }, []);

  // Inicialización
  useEffect(() => {
    if (user && !isInitialized) {
      console.log('🛑 FASE 14: Smart Messaging initialized but PERMANENTLY DISABLED');
      setIsInitialized(true);
    }
  }, [user, isInitialized]);

  return {
    isInitialized,
    isRunning: false, // FASE 14: Siempre false
    isPaused: true, // FASE 14: Siempre pausado
    pausedByTest: true, // FASE 14: Siempre pausado por test
    triggerTaskAnalysis,
    pauseForTesting,
    resumeAfterTesting,
    // Debug info - todas las funciones desactivadas
    checkFollowupTasks,
    checkInactiveTasks,
    checkUpcomingDeadlines
  };
};
