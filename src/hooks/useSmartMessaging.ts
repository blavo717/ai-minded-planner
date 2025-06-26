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
  // FASE 13: Control simplificado de pausas
  const [isPaused, setIsPaused] = useState(false);
  const [pausedByTest, setPausedByTest] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // FASE 13: Verificación anti-duplicados SIMPLIFICADA
  const checkForDuplicateMessage = useCallback((content: string, type: 'notification' | 'suggestion'): boolean => {
    const recentMessages = messages.filter(msg => 
      msg.type === type && 
      msg.content === content &&
      (Date.now() - msg.timestamp.getTime()) < 300000 // 5 minutos
    );
    
    const isDuplicate = recentMessages.length > 0;
    
    if (isDuplicate) {
      console.log(`🚫 FASE 13: Duplicate ${type} prevented: "${content.substring(0, 50)}..."`);
    }
    
    return isDuplicate;
  }, [messages]);

  // FASE 13: pauseForTesting SIMPLIFICADO pero EFECTIVO
  const pauseForTesting = useCallback(() => {
    console.log('⏸️ FASE 13: Smart Messaging PAUSADO para testing');
    setIsPaused(true);
    setPausedByTest(true);
    
    // Limpiar intervalos
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    setIsRunning(false);
    console.log('✅ FASE 13: Smart Messaging completamente pausado');
  }, []);

  // FASE 13: resumeAfterTesting SIMPLIFICADO
  const resumeAfterTesting = useCallback(() => {
    console.log('▶️ FASE 13: Smart Messaging REANUDADO después de testing');
    setIsPaused(false);
    setPausedByTest(false);
    
    // Reiniciar después de delay corto
    setTimeout(() => {
      if (user && activeConfiguration && !isPaused && !pausedByTest) {
        console.log('🔄 FASE 13: Reiniciando Smart Messaging');
        setIsRunning(true);
      }
    }, 5000); // 5 segundos
  }, [user, activeConfiguration, isPaused, pausedByTest]);

  // FASE 2: Verificar tareas que necesitan seguimiento (con anti-duplicados)
  const checkFollowupTasks = useCallback(async () => {
    if (isPaused || pausedByTest) {
      console.log('⏸️ FASE 13: checkFollowupTasks: Skipped (PAUSADO)');
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
      console.log('⏸️ FASE 13: checkInactiveTasks: Skipped (PAUSADO)');
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
      console.log('⏸️ FASE 13: checkUpcomingDeadlines: Skipped (PAUSADO)');
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
      console.log('⏸️ FASE 13: triggerTaskAnalysis: Skipped (pausado)');
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

  // FASE 13: runSmartChecks SIMPLIFICADO
  const runSmartChecks = useCallback(async () => {
    if (isPaused || pausedByTest) {
      console.log('⏸️ FASE 13: runSmartChecks: Skipped (pausado)');
      return;
    }
    
    if (!user || tasks.length === 0) {
      console.log('⏸️ FASE 13: runSmartChecks: Skipped (no user or tasks)');
      return;
    }
    
    console.log('🔄 FASE 13: Running smart checks...');
    
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
      
      console.log('📊 FASE 13: Check results:', checksResults);
      
    } catch (error) {
      console.error('❌ FASE 13: Error in smart checks:', error);
    }
  }, [user, tasks.length, checkFollowupTasks, checkInactiveTasks, checkUpcomingDeadlines, isPaused, pausedByTest]);

  // FASE 13: Configurar intervalos SIMPLIFICADOS
  useEffect(() => {
    if (!user || isPaused || pausedByTest) {
      console.log('🛑 FASE 13: Smart messaging intervals not started');
      return;
    }
    
    // Limpiar intervalos previos
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    const initialDelay = 10000; // 10 segundos
    const intervalDuration = 300000; // 5 minutos
    
    console.log('🔄 FASE 13: Setting up smart messaging intervals...');
    console.log(`⏰ FASE 13: Using intervals: initial=${initialDelay}ms, recurring=${intervalDuration}ms`);
    
    // Timeout inicial
    const initialTimeout = setTimeout(() => {
      if (!isPaused && !pausedByTest) {
        runSmartChecks();
        
        // Configurar intervalo recurrente
        const recurringInterval = setInterval(() => {
          if (!isPaused && !pausedByTest) {
            runSmartChecks();
          } else {
            console.log('⏸️ FASE 13: Interval check skipped (pausado)');
          }
        }, intervalDuration);
        
        intervalRef.current = recurringInterval;
        setIsRunning(true);
      }
    }, initialDelay);
    
    timeoutRef.current = initialTimeout;
    
    return () => {
      console.log('🛑 FASE 13: Cleaning up smart messaging intervals');
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setIsRunning(false);
    };
  }, [user, activeConfiguration, runSmartChecks, isPaused, pausedByTest]);

  // Inicialización
  useEffect(() => {
    if (user && !isInitialized) {
      console.log('🚀 FASE 13: Smart Messaging initialized');
      setIsInitialized(true);
    }
  }, [user, isInitialized]);

  return {
    isInitialized,
    isRunning,
    isPaused,
    pausedByTest,
    triggerTaskAnalysis,
    pauseForTesting,
    resumeAfterTesting,
    // Debug info
    checkFollowupTasks,
    checkInactiveTasks,
    checkUpcomingDeadlines
  };
};
