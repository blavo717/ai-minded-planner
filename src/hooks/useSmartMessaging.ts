
import { useState, useEffect, useCallback } from 'react';

export const useSmartMessaging = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  
  // OPCIÓN B: Smart Messaging PERMANENTEMENTE DESACTIVADO
  console.log('🛑 OPCIÓN B: Smart Messaging PERMANENTLY DISABLED - Simplified chatbot only');

  // Todas las funciones son NOOPs - no hacen nada
  const checkForDuplicateMessage = useCallback(() => {
    console.log('🛑 OPCIÓN B: Smart Messaging disabled - no duplicate checks');
    return false;
  }, []);

  const pauseForTesting = useCallback(() => {
    console.log('🛑 OPCIÓN B: Smart Messaging disabled - no pause needed');
  }, []);

  const resumeAfterTesting = useCallback(() => {
    console.log('🛑 OPCIÓN B: Smart Messaging disabled - no resume needed');
  }, []);

  const checkFollowupTasks = useCallback(async () => {
    console.log('🛑 OPCIÓN B: No followup task checks');
    return false;
  }, []);

  const checkInactiveTasks = useCallback(async () => {
    console.log('🛑 OPCIÓN B: No inactive task checks');
    return false;
  }, []);

  const checkUpcomingDeadlines = useCallback(async () => {
    console.log('🛑 OPCIÓN B: No deadline checks');
    return false;
  }, []);

  const triggerTaskAnalysis = useCallback(async () => {
    console.log('🛑 OPCIÓN B: No automatic task analysis');
  }, []);

  const runSmartChecks = useCallback(async () => {
    console.log('🛑 OPCIÓN B: No smart checks - simple chatbot only');
  }, []);

  useEffect(() => {
    console.log('🛑 OPCIÓN B: Smart Messaging permanently disabled for simplified chatbot');
    setIsInitialized(true);
  }, []);

  return {
    isInitialized,
    isRunning: false, // Siempre false
    isPaused: true, // Siempre pausado
    pausedByTest: false, // No hay tests complejos
    triggerTaskAnalysis,
    pauseForTesting,
    resumeAfterTesting,
    checkFollowupTasks,
    checkInactiveTasks,
    checkUpcomingDeadlines
  };
};
