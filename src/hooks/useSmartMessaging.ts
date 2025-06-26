
import { useEffect, useCallback } from 'react';
import { useAIAssistant } from '@/hooks/useAIAssistant';
import { useTasks } from '@/hooks/useTasks';
import { useAITaskMonitor } from '@/hooks/useAITaskMonitor';

// FASE 3: Variable global para pausar smart messaging
declare global {
  var SMART_MESSAGING_PAUSED: boolean;
}

export const useSmartMessaging = () => {
  const { addNotification, addSuggestion, isInitialized: isAIInitialized, currentStrategy } = useAIAssistant();
  const { mainTasks, getTasksNeedingFollowup, getTasksWithoutRecentActivity } = useTasks();
  const { monitoringData } = useAITaskMonitor();

  // FASE 2: Timing optimizado para producción real
  const getIntervalTiming = useCallback(() => {
    return {
      initialDelay: 5000,   // 5 segundos para producción
      intervalTime: 30000,  // 30 segundos para producción
      testTimeout: 60000    // 60 segundos timeout para producción
    };
  }, []);

  const checkFollowupTasks = useCallback(async (): Promise<boolean> => {
    console.log('🔍 checkFollowupTasks: Starting analysis...');
    
    if (!isAIInitialized) {
      console.log('⏳ checkFollowupTasks: AI not initialized yet, skipping');
      return false;
    }
    
    // FASE 3: Verificar si está pausado
    if (typeof window !== 'undefined' && (window as any).SMART_MESSAGING_PAUSED) {
      console.log('⏸️ checkFollowupTasks: Smart messaging paused');
      return false;
    }
    
    const pendingTasks = mainTasks.filter(task => 
      task.status === 'pending' || task.status === 'in_progress'
    );
    
    const followupTasks = getTasksNeedingFollowup();
    
    console.log('📊 checkFollowupTasks stats:', {
      pendingCount: pendingTasks.length,
      followupCount: followupTasks.length,
      strategy: currentStrategy
    });
    
    if (followupTasks.length > 0) {
      const taskTitles = followupTasks.slice(0, 3).map(t => t.title).join(', ');
      console.log(`📋 Found ${followupTasks.length} tasks needing followup`);
      
      try {
        await addNotification(
          `🔔 Tienes ${followupTasks.length} tareas que necesitan seguimiento: ${taskTitles}${followupTasks.length > 3 ? '...' : ''}`,
          'high',
          { type: 'followup', tasks: followupTasks }
        );
        
        // FASE 2: Delay realista para persistencia
        await new Promise(resolve => setTimeout(resolve, 500));
        return true;
      } catch (error) {
        console.error('❌ Error creating followup notification:', error);
        return false;
      }
    }
    
    console.log('✅ checkFollowupTasks: No followup tasks found');
    return false;
  }, [getTasksNeedingFollowup, addNotification, mainTasks, isAIInitialized, currentStrategy]);

  const checkInactiveTasks = useCallback(async (): Promise<boolean> => {
    console.log('🔍 checkInactiveTasks: Starting analysis...');
    
    if (!isAIInitialized) {
      console.log('⏳ checkInactiveTasks: AI not initialized yet, skipping');
      return false;
    }
    
    // FASE 3: Verificar si está pausado
    if (typeof window !== 'undefined' && (window as any).SMART_MESSAGING_PAUSED) {
      console.log('⏸️ checkInactiveTasks: Smart messaging paused');
      return false;
    }
    
    const inactiveTasks = getTasksWithoutRecentActivity(3);
    
    console.log('📊 checkInactiveTasks stats:', {
      inactiveCount: inactiveTasks.length,
      totalTasks: mainTasks.length,
      strategy: currentStrategy
    });
    
    if (inactiveTasks.length > 0) {
      const taskTitles = inactiveTasks.slice(0, 2).map(t => t.title).join(', ');
      console.log(`📋 Found ${inactiveTasks.length} inactive tasks`);
      
      try {
        await addSuggestion(
          `💡 Algunas tareas llevan tiempo sin actividad: ${taskTitles}. ¿Necesitas ayuda para priorizarlas?`,
          'medium',
          { type: 'inactive', tasks: inactiveTasks }
        );
        
        // FASE 2: Delay realista para persistencia
        await new Promise(resolve => setTimeout(resolve, 500));
        return true;
      } catch (error) {
        console.error('❌ Error creating inactive suggestion:', error);
        return false;
      }
    }
    
    console.log('✅ checkInactiveTasks: No inactive tasks found');
    return false;
  }, [getTasksWithoutRecentActivity, addSuggestion, mainTasks, isAIInitialized, currentStrategy]);

  const checkProductivityPatterns = useCallback(async (): Promise<boolean> => {
    console.log('🔍 checkProductivityPatterns: Starting analysis...');
    
    if (!isAIInitialized) {
      console.log('⏳ checkProductivityPatterns: AI not initialized yet, skipping');
      return false;
    }
    
    // FASE 3: Verificar si está pausado
    if (typeof window !== 'undefined' && (window as any).SMART_MESSAGING_PAUSED) {
      console.log('⏸️ checkProductivityPatterns: Smart messaging paused');
      return false;
    }
    
    console.log(`📊 Available monitoring data: ${monitoringData.length} entries`);
    
    const healthChecks = monitoringData.filter(m => m.monitoring_type === 'health_check');
    console.log(`🏥 Health checks found: ${healthChecks.length}`);
    
    const recentHealthCheck = healthChecks[0];
    
    if (recentHealthCheck && recentHealthCheck.analysis_data) {
      try {
        console.log('📈 Processing health check analysis data...');
        const analysisData = recentHealthCheck.analysis_data as any;
        
        if (analysisData.insights && Array.isArray(analysisData.insights)) {
          console.log(`💡 Found ${analysisData.insights.length} insights`);
          
          const highPriorityInsights = analysisData.insights.filter((insight: any) => 
            insight.priority >= 2 && insight.insight_type !== 'general'
          );
          
          console.log(`⚠️ High priority insights: ${highPriorityInsights.length}`);
          
          for (const insight of highPriorityInsights) {
            console.log(`💡 Adding productivity insight: ${insight.title}`);
            try {
              await addSuggestion(
                `📊 ${insight.title}: ${insight.description}`,
                insight.priority >= 3 ? 'high' : 'medium',
                { type: 'productivity_insight', insight }
              );
              
              // FASE 2: Delay entre insights
              await new Promise(resolve => setTimeout(resolve, 200));
            } catch (error) {
              console.error('❌ Error creating productivity insight:', error);
            }
          }
          
          return highPriorityInsights.length > 0;
        }
      } catch (error) {
        console.error('❌ Error parsing analysis data:', error);
      }
    }
    
    console.log('📊 checkProductivityPatterns: No productivity patterns found');
    return false;
  }, [monitoringData, addSuggestion, isAIInitialized]);

  const checkUpcomingDeadlines = useCallback(async (): Promise<boolean> => {
    console.log('🔍 checkUpcomingDeadlines: Starting analysis...');
    
    if (!isAIInitialized) {
      console.log('⏳ checkUpcomingDeadlines: AI not initialized yet, skipping');
      return false;
    }
    
    // FASE 3: Verificar si está pausado
    if (typeof window !== 'undefined' && (window as any).SMART_MESSAGING_PAUSED) {
      console.log('⏸️ checkUpcomingDeadlines: Smart messaging paused');
      return false;
    }
    
    console.log(`📅 Total tasks to check: ${mainTasks.length}`);
    
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const urgentTasks = mainTasks.filter(task => {
      if (!task.due_date || task.status === 'completed') return false;
      const dueDate = new Date(task.due_date);
      return dueDate <= tomorrow && dueDate >= now;
    });
    
    const soonTasks = mainTasks.filter(task => {
      if (!task.due_date || task.status === 'completed') return false;
      const dueDate = new Date(task.due_date);
      return dueDate > tomorrow && dueDate <= nextWeek;
    });
    
    console.log('📊 checkUpcomingDeadlines stats:', {
      urgentCount: urgentTasks.length,
      soonCount: soonTasks.length
    });
    
    let notificationsAdded = false;
    
    if (urgentTasks.length > 0) {
      console.log('🚨 Adding urgent deadline notification');
      try {
        await addNotification(
          `⚠️ ${urgentTasks.length} tareas vencen pronto: ${urgentTasks[0].title}${urgentTasks.length > 1 ? ` y ${urgentTasks.length - 1} más` : ''}`,
          'urgent',
          { type: 'urgent_deadline', tasks: urgentTasks }
        );
        notificationsAdded = true;
        
        // FASE 2: Delay entre notificaciones
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (error) {
        console.error('❌ Error creating urgent deadline notification:', error);
      }
    }
    
    if (soonTasks.length > 0) {
      console.log('📅 Adding upcoming deadline suggestion');
      try {
        await addSuggestion(
          `📅 Tienes ${soonTasks.length} tareas con deadline esta semana. ¿Quieres que te ayude a planificarlas?`,
          'medium',
          { type: 'upcoming_deadline', tasks: soonTasks }
        );
        notificationsAdded = true;
        
        // FASE 2: Delay final
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (error) {
        console.error('❌ Error creating upcoming deadline suggestion:', error);
      }
    }
    
    if (!notificationsAdded) {
      console.log('✅ checkUpcomingDeadlines: No urgent or upcoming deadlines found');
    }
    
    return notificationsAdded;
  }, [mainTasks, addNotification, addSuggestion, isAIInitialized]);

  // FASE 3: Setup intervals con verificación de pausa
  useEffect(() => {
    if (!isAIInitialized) {
      console.log('⏳ Smart messaging waiting for AI initialization...');
      return;
    }
    
    console.log('🔄 Setting up smart messaging intervals (production mode)...');
    
    const { initialDelay, intervalTime } = getIntervalTiming();
    
    console.log(`⏰ Using production intervals: initial=${initialDelay}ms, recurring=${intervalTime}ms`);
    
    const runChecks = async () => {
      // FASE 3: Verificar pausa antes de ejecutar
      if (typeof window !== 'undefined' && (window as any).SMART_MESSAGING_PAUSED) {
        console.log('⏸️ Smart messaging checks paused, skipping');
        return;
      }
      
      console.log('🚀 Running smart messaging checks...');
      
      try {
        const results = {
          followup: await checkFollowupTasks(),
          inactive: await checkInactiveTasks(),
          deadlines: await checkUpcomingDeadlines()
        };
        console.log('📊 Check results:', results);
      } catch (error) {
        console.error('❌ Error running smart messaging checks:', error);
      }
    };

    const initialTimeout = setTimeout(runChecks, initialDelay);
    const interval = setInterval(runChecks, intervalTime);

    return () => {
      console.log('🛑 Cleaning up smart messaging intervals');
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [checkFollowupTasks, checkInactiveTasks, checkUpcomingDeadlines, isAIInitialized, getIntervalTiming]);

  // FASE 3: Trigger manual determinista
  const triggerTaskAnalysis = useCallback(async () => {
    console.log('🎯 Manual task analysis triggered (deterministic mode)');
    
    if (!isAIInitialized) {
      console.log('❌ Cannot trigger analysis: AI not initialized');
      return;
    }
    
    try {
      // FASE 3: Pausar automático temporalmente para evitar duplicados
      const wasAlreadyPaused = typeof window !== 'undefined' && (window as any).SMART_MESSAGING_PAUSED;
      if (!wasAlreadyPaused && typeof window !== 'undefined') {
        (window as any).SMART_MESSAGING_PAUSED = true;
      }
      
      const results = {
        followup: await checkFollowupTasks(),
        inactive: await checkInactiveTasks(),
        deadlines: await checkUpcomingDeadlines()
      };
      
      console.log('📊 Manual analysis results:', results);
      
      // FASE 2: Delay antes de generar respuesta final
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generar respuesta de confirmación
      if (!results.followup && !results.inactive && !results.deadlines) {
        const message = '✅ Análisis completado: Tus tareas están al día. ¡Buen trabajo manteniéndote organizado!';
          
        await addSuggestion(
          message,
          'low',
          { type: 'analysis_complete', timestamp: new Date().toISOString(), manual: true }
        );
        
        // FASE 2: Delay final
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Reactivar automático si no estaba pausado previamente
      if (!wasAlreadyPaused && typeof window !== 'undefined') {
        setTimeout(() => {
          (window as any).SMART_MESSAGING_PAUSED = false;
        }, 2000); // 2 segundos de gracia
      }
      
    } catch (error) {
      console.error('❌ Error in manual task analysis:', error);
      
      // Asegurar reactivación en caso de error
      if (typeof window !== 'undefined') {
        (window as any).SMART_MESSAGING_PAUSED = false;
      }
    }
  }, [checkFollowupTasks, checkInactiveTasks, checkUpcomingDeadlines, addSuggestion, isAIInitialized]);

  const triggerProductivityAnalysis = useCallback(async () => {
    console.log('🎯 Manual productivity analysis triggered');
    
    if (!isAIInitialized) {
      console.log('❌ Cannot trigger productivity analysis: AI not initialized');
      return;
    }
    
    try {
      // FASE 3: Pausar temporalmente para evitar duplicados
      const wasAlreadyPaused = typeof window !== 'undefined' && (window as any).SMART_MESSAGING_PAUSED;
      if (!wasAlreadyPaused && typeof window !== 'undefined') {
        (window as any).SMART_MESSAGING_PAUSED = true;
      }
      
      const hasPatterns = await checkProductivityPatterns();
      
      if (!hasPatterns) {
        const message = '📊 Análisis de productividad: No hay insights nuevos disponibles. Ejecuta un análisis AI desde el panel de testing para generar datos.';
        
        await addSuggestion(
          message,
          'medium',
          { type: 'productivity_analysis', timestamp: new Date().toISOString(), manual: true }
        );
        
        // FASE 2: Delay
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Reactivar automático si no estaba pausado previamente
      if (!wasAlreadyPaused && typeof window !== 'undefined') {
        setTimeout(() => {
          (window as any).SMART_MESSAGING_PAUSED = false;
        }, 2000);
      }
      
    } catch (error) {
      console.error('❌ Error in productivity analysis:', error);
      
      // Asegurar reactivación en caso de error
      if (typeof window !== 'undefined') {
        (window as any).SMART_MESSAGING_PAUSED = false;
      }
    }
  }, [checkProductivityPatterns, addSuggestion, isAIInitialized]);

  return {
    triggerTaskAnalysis,
    triggerProductivityAnalysis,
  };
};
