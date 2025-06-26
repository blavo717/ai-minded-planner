
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
  // FASE 11: CORRECCIÓN 5 - Control AGRESIVO de pausas para aislamiento TOTAL
  const [isPaused, setIsPaused] = useState(false);
  const [pausedByTest, setPausedByTest] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const allIntervalsRef = useRef<Set<NodeJS.Timeout>>(new Set());
  const allTimeoutsRef = useRef<Set<NodeJS.Timeout>>(new Set());

  // FASE 2: Verificación anti-duplicados
  const checkForDuplicateMessage = useCallback((content: string, type: 'notification' | 'suggestion'): boolean => {
    const recentMessages = messages.filter(msg => 
      msg.type === type && 
      msg.content === content &&
      (Date.now() - msg.timestamp.getTime()) < 300000 // 5 minutos
    );
    
    const isDuplicate = recentMessages.length > 0;
    
    if (isDuplicate) {
      console.log(`🚫 Duplicate ${type} prevented: "${content.substring(0, 50)}..."`);
    }
    
    return isDuplicate;
  }, [messages]);

  // FASE 11: CORRECCIÓN 5 - Pausar Smart Messaging AGRESIVO para tests con limpieza TOTAL
  const pauseForTesting = useCallback(() => {
    console.log('⏸️ FASE 11 - CORRECCIÓN 5: Smart Messaging PAUSADO AGRESIVO para testing');
    setIsPaused(true);
    setPausedByTest(true);
    
    // FASE 11: CORRECCIÓN 5 - Limpieza AGRESIVA de TODOS los intervalos y timeouts
    console.log('🛑 FASE 11 - CORRECCIÓN 5: Limpieza AGRESIVA de todos los timers...');
    
    // Limpiar intervalos principales
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      console.log('🛑 FASE 11 - CORRECCIÓN 5: Interval principal limpiado');
    }
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      console.log('🛑 FASE 11 - CORRECCIÓN 5: Timeout inicial limpiado');
    }
    
    // FASE 11: CORRECCIÓN 5 - Limpiar TODOS los intervalos registrados
    allIntervalsRef.current.forEach(interval => {
      clearInterval(interval);
    });
    allIntervalsRef.current.clear();
    console.log('🛑 FASE 11 - CORRECCIÓN 5: Todos los intervalos registrados limpiados');
    
    // FASE 11: CORRECCIÓN 5 - Limpiar TODOS los timeouts registrados
    allTimeoutsRef.current.forEach(timeout => {
      clearTimeout(timeout);
    });
    allTimeoutsRef.current.clear();
    console.log('🛑 FASE 11 - CORRECCIÓN 5: Todos los timeouts registrados limpiados');
    
    setIsRunning(false);
    console.log('✅ FASE 11 - CORRECCIÓN 5: Smart Messaging completamente desactivado AGRESIVAMENTE para testing');
    
    // FASE 11: Verificación adicional después de 2 segundos
    setTimeout(() => {
      console.log('🔍 FASE 11 - CORRECCIÓN 5: Verificación post-pausado:', {
        isPaused: true,
        pausedByTest: true,
        isRunning: false,
        intervalsActive: allIntervalsRef.current.size,
        timeoutsActive: allTimeoutsRef.current.size
      });
    }, 2000);
  }, []);

  // FASE 11: CORRECCIÓN 5 - Reanudar Smart Messaging después de tests con confirmación
  const resumeAfterTesting = useCallback(() => {
    console.log('▶️ FASE 11 - CORRECCIÓN 5: Smart Messaging REANUDADO después de testing');
    setIsPaused(false);
    setPausedByTest(false);
    
    // FASE 11: CORRECCIÓN 5 - Reiniciar con delay aumentado para evitar conflictos
    setTimeout(() => {
      if (user && activeConfiguration && !isPaused && !pausedByTest) {
        console.log('🔄 FASE 11 - CORRECCIÓN 5: Reiniciando Smart Messaging con configuración válida');
        setIsRunning(true);
      }
    }, 10000); // Delay aumentado significativamente
  }, [user, activeConfiguration, isPaused, pausedByTest]);

  // FASE 2: Verificar tareas que necesitan seguimiento (con anti-duplicados)
  const checkFollowupTasks = useCallback(async () => {
    if (isPaused || pausedByTest) {
      console.log('⏸️ FASE 11 - CORRECCIÓN 5: checkFollowupTasks: Skipped (PAUSADO AGRESIVAMENTE)');
      return false;
    }
    
    console.log('🔍 checkFollowupTasks: Starting analysis...');
    
    const followupTasks = tasks.filter(task => 
      task.needs_followup && 
      task.status !== 'completed' && 
      task.status !== 'cancelled'
    );
    
    console.log(`📊 checkFollowupTasks stats: {
      followupCount: ${followupTasks.length},
      totalTasks: ${tasks.length},
      isPaused: ${isPaused}
    }`);
    
    if (followupTasks.length > 0) {
      const taskNames = followupTasks.slice(0, 3).map(t => t.title).join(', ');
      const content = `🔔 Tienes ${followupTasks.length} tareas que necesitan seguimiento: ${taskNames}`;
      
      // FASE 2: Verificar duplicados antes de crear
      if (!checkForDuplicateMessage(content, 'notification')) {
        console.log(`📬 Adding followup notification for ${followupTasks.length} tasks`);
        try {
          await addNotification(content, 'medium', {
            taskIds: followupTasks.map(t => t.id),
            type: 'followup',
            count: followupTasks.length
          });
          console.log('✅ Followup notification added successfully');
          return true;
        } catch (error) {
          console.error('❌ Error adding followup notification:', error);
        }
      }
    } else {
      console.log('✅ checkFollowupTasks: No tasks need followup');
    }
    
    return false;
  }, [tasks, addNotification, checkForDuplicateMessage, isPaused, pausedByTest]);

  // FASE 2: Verificar tareas inactivas (con anti-duplicados)
  const checkInactiveTasks = useCallback(async () => {
    if (isPaused || pausedByTest) {
      console.log('⏸️ FASE 11 - CORRECCIÓN 5: checkInactiveTasks: Skipped (PAUSADO AGRESIVAMENTE)');
      return false;
    }
    
    console.log('🔍 checkInactiveTasks: Starting analysis...');
    
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    const inactiveTasks = tasks.filter(task => 
      task.status === 'in_progress' &&
      task.last_worked_at &&
      new Date(task.last_worked_at) < oneDayAgo
    );
    
    console.log(`📊 checkInactiveTasks stats: {
      inactiveCount: ${inactiveTasks.length},
      totalTasks: ${tasks.length},
      strategy: ${activeConfiguration ? 'supabase' : 'localStorage'}
    }`);
    
    if (inactiveTasks.length > 0) {
      console.log(`📋 Found ${inactiveTasks.length} inactive tasks`);
      const taskNames = inactiveTasks.slice(0, 3).map(t => t.title).join(', ');
      const content = `💡 Algunas tareas llevan tiempo sin actividad: ${taskNames}`;
      
      // FASE 2: Verificar duplicados antes de crear
      if (!checkForDuplicateMessage(content, 'suggestion')) {
        console.log(`💡 Adding inactivity suggestion for ${inactiveTasks.length} tasks`);
        try {
          await addSuggestion(content, 'medium', {
            taskIds: inactiveTasks.map(t => t.id),
            type: 'inactivity',
            count: inactiveTasks.length
          });
          console.log('✅ Inactivity suggestion added successfully');
          return true;
        } catch (error) {
          console.error('❌ Error adding inactivity suggestion:', error);
        }
      }
    } else {
      console.log('✅ checkInactiveTasks: No inactive tasks found');
    }
    
    return false;
  }, [tasks, addSuggestion, checkForDuplicateMessage, isPaused, pausedByTest, activeConfiguration]);

  // FASE 2: Verificar próximos deadlines (con anti-duplicados)
  const checkUpcomingDeadlines = useCallback(async () => {
    if (isPaused || pausedByTest) {
      console.log('⏸️ FASE 11 - CORRECCIÓN 5: checkUpcomingDeadlines: Skipped (PAUSADO AGRESIVAMENTE)');
      return false;
    }
    
    console.log('🔍 checkUpcomingDeadlines: Starting analysis...');
    
    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const tasksWithDeadlines = tasks.filter(task => 
      task.due_date && 
      task.status !== 'completed' && 
      task.status !== 'cancelled'
    );
    
    console.log(`📅 Total tasks to check: ${tasksWithDeadlines.length}`);
    
    const urgentTasks = tasksWithDeadlines.filter(task => 
      new Date(task.due_date!) <= tomorrow
    );
    
    const soonTasks = tasksWithDeadlines.filter(task => 
      new Date(task.due_date!) > tomorrow && 
      new Date(task.due_date!) <= nextWeek
    );
    
    console.log(`📊 checkUpcomingDeadlines stats: {
      urgentCount: ${urgentTasks.length},
      soonCount: ${soonTasks.length}
    }`);
    
    let notificationAdded = false;
    
    if (urgentTasks.length > 0) {
      const taskNames = urgentTasks.slice(0, 2).map(t => t.title).join(', ');
      const content = `⚠️ ¡Urgente! Tienes ${urgentTasks.length} tareas con deadline muy próximo: ${taskNames}`;
      
      // FASE 2: Verificar duplicados antes de crear
      if (!checkForDuplicateMessage(content, 'notification')) {
        console.log(`🚨 Adding urgent deadline notification for ${urgentTasks.length} tasks`);
        try {
          await addNotification(content, 'urgent', {
            taskIds: urgentTasks.map(t => t.id),
            type: 'urgent_deadline',
            count: urgentTasks.length
          });
          notificationAdded = true;
        } catch (error) {
          console.error('❌ Error adding urgent deadline notification:', error);
        }
      }
    } else if (soonTasks.length > 0) {
      const taskNames = soonTasks.slice(0, 2).map(t => t.title).join(', ');
      const content = `📅 Tienes ${soonTasks.length} tareas con deadline esta semana: ${taskNames}`;
      
      // FASE 2: Verificar duplicados antes de crear
      if (!checkForDuplicateMessage(content, 'notification')) {
        console.log(`📅 Adding upcoming deadline notification for ${soonTasks.length} tasks`);
        try {
          await addNotification(content, 'high', {
            taskIds: soonTasks.map(t => t.id),
            type: 'upcoming_deadline',
            count: soonTasks.length
          });
          notificationAdded = true;
        } catch (error) {
          console.error('❌ Error adding upcoming deadline notification:', error);
        }
      }
    } else {
      console.log('✅ checkUpcomingDeadlines: No urgent or upcoming deadlines found');
    }
    
    return notificationAdded;
  }, [tasks, addNotification, checkForDuplicateMessage, isPaused, pausedByTest]);

  // FASE 2: Análisis de productividad (con anti-duplicados)
  const triggerTaskAnalysis = useCallback(async () => {
    if (!activeConfiguration) {
      console.log('⚠️ triggerTaskAnalysis: No active LLM configuration');
      return;
    }
    
    if (isPaused || pausedByTest) {
      console.log('⏸️ FASE 11 - CORRECCIÓN 5: triggerTaskAnalysis: Skipped (PAUSADO AGRESIVAMENTE)');
      return;
    }
    
    console.log('📊 triggerTaskAnalysis: Starting productivity analysis...');
    
    const content = '📊 He detectado actividad en tus tareas. ¿Quieres que analice tus patrones de productividad?';
    
    // FASE 2: Verificar duplicados antes de crear
    if (!checkForDuplicateMessage(content, 'suggestion')) {
      console.log('💡 Adding productivity analysis suggestion');
      try {
        await addSuggestion(content, 'low', {
          type: 'productivity_analysis',
          taskCount: tasks.length,
          timestamp: new Date().toISOString()
        });
        console.log('✅ Productivity analysis suggestion added');
      } catch (error) {
        console.error('❌ Error adding productivity analysis suggestion:', error);
      }
    }
  }, [addSuggestion, activeConfiguration, checkForDuplicateMessage, tasks.length, isPaused, pausedByTest]);

  // FASE 11: CORRECCIÓN 5 - Ejecutar todas las verificaciones con control AGRESIVO de pausas
  const runSmartChecks = useCallback(async () => {
    if (isPaused || pausedByTest) {
      console.log('⏸️ FASE 11 - CORRECCIÓN 5: runSmartChecks: Skipped (sistema PAUSADO AGRESIVAMENTE)');
      return;
    }
    
    if (!user || tasks.length === 0) {
      console.log('⏸️ runSmartChecks: Skipped (no user or tasks)');
      return;
    }
    
    console.log('🔄 FASE 11 - CORRECCIÓN 5: Running smart checks...');
    
    try {
      const results = await Promise.allSettled([
        checkFollowupTasks(),
        checkInactiveTasks(),
        checkUpcomingDeadlines()
      ]);
      
      const checksResults = {
        followup: results[0].status === 'fulfilled' ? results[0].value : false,
        inactive: results[1].status === 'fulfilled' ? results[1].value : false,
        deadlines: results[2].status === 'fulfilled' ? results[2].value : false
      };
      
      console.log('📊 FASE 11 - CORRECCIÓN 5: Check results:', checksResults);
      
    } catch (error) {
      console.error('❌ FASE 11 - CORRECCIÓN 5: Error in smart checks:', error);
    }
  }, [user, tasks.length, checkFollowupTasks, checkInactiveTasks, checkUpcomingDeadlines, isPaused, pausedByTest]);

  // FASE 11: CORRECCIÓN 5 - Configurar intervalos con control AGRESIVO de pausas y registro de timers
  useEffect(() => {
    if (!user || isPaused || pausedByTest) {
      console.log('🛑 FASE 11 - CORRECCIÓN 5: Smart messaging intervals not started (no user, paused, or test mode)');
      return;
    }
    
    // FASE 11: CORRECCIÓN 5 - Limpiar intervalos previos de forma AGRESIVA
    if (intervalRef.current) {
      console.log('🛑 FASE 11 - CORRECCIÓN 5: Cleaning up smart messaging intervals AGGRESSIVELY');
      clearInterval(intervalRef.current);
      allIntervalsRef.current.delete(intervalRef.current);
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      allTimeoutsRef.current.delete(timeoutRef.current);
    }
    
    const isProduction = activeConfiguration && !window.location.hostname.includes('localhost');
    const initialDelay = 15000; // FASE 11: Delay inicial aumentado significativamente
    const intervalDuration = isProduction ? 900000 : 120000; // FASE 11: 15 min prod, 2 min dev - aumentado significativamente
    
    console.log('🔄 FASE 11 - CORRECCIÓN 5: Setting up smart messaging intervals (production mode)...');
    console.log(`⏰ FASE 11 - CORRECCIÓN 5: Using production intervals: initial=${initialDelay}ms, recurring=${intervalDuration}ms`);
    
    // FASE 11: CORRECCIÓN 5 - Timeout inicial con registro
    const initialTimeout = setTimeout(() => {
      if (!isPaused && !pausedByTest) {
        runSmartChecks();
        
        // FASE 11: CORRECCIÓN 5 - Configurar intervalo recurrente con registro
        const recurringIntervalTimer = setInterval(() => {
          if (!isPaused && !pausedByTest) {
            runSmartChecks();
          } else {
            console.log('⏸️ FASE 11 - CORRECCIÓN 5: Interval check skipped (pausado AGRESIVAMENTE)');
          }
        }, intervalDuration);
        
        intervalRef.current = recurringIntervalTimer;
        allIntervalsRef.current.add(recurringIntervalTimer);
        
        setIsRunning(true);
      }
    }, initialDelay);
    
    timeoutRef.current = initialTimeout;
    allTimeoutsRef.current.add(initialTimeout);
    
    return () => {
      console.log('🛑 FASE 11 - CORRECCIÓN 5: Cleaning up smart messaging intervals AGGRESSIVELY');
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        allIntervalsRef.current.delete(intervalRef.current);
        intervalRef.current = null;
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        allTimeoutsRef.current.delete(timeoutRef.current);
        timeoutRef.current = null;
      }
      setIsRunning(false);
    };
  }, [user, activeConfiguration, runSmartChecks, isPaused, pausedByTest]);

  // Inicialización
  useEffect(() => {
    if (user && !isInitialized) {
      console.log('🚀 FASE 11 - CORRECCIÓN 5: Smart Messaging initialized');
      setIsInitialized(true);
    }
  }, [user, isInitialized]);

  return {
    isInitialized,
    isRunning,
    isPaused,
    pausedByTest,
    triggerTaskAnalysis,
    // FASE 11: CORRECCIÓN 5 - Exponer controles AGRESIVOS para tests
    pauseForTesting,
    resumeAfterTesting,
    // Debug info
    checkFollowupTasks,
    checkInactiveTasks,
    checkUpcomingDeadlines
  };
};
