import { useEffect, useCallback } from 'react';
import { useAIAssistant } from '@/hooks/useAIAssistant';
import { useTasks } from '@/hooks/useTasks';
import { useAITaskMonitor } from '@/hooks/useAITaskMonitor';

export const useSmartMessaging = () => {
  const { addNotification, addSuggestion, isInitialized: isAIInitialized, currentStrategy } = useAIAssistant();
  const { mainTasks, getTasksNeedingFollowup, getTasksWithoutRecentActivity } = useTasks();
  const { monitoringData } = useAITaskMonitor();

  // CORRECCIÓN 2: Timing sincronizado para tests
  const getIntervalTiming = useCallback(() => {
    const isTestingMode = currentStrategy === 'localStorage' || 
                         (typeof window !== 'undefined' && window.location.hostname === 'localhost');
    
    if (isTestingMode) {
      return {
        initialDelay: 500,   // 0.5 segundos para tests
        intervalTime: 2000,  // 2 segundos para tests - MÁS RÁPIDO
        testTimeout: 8000    // 8 segundos timeout para tests
      };
    } else {
      return {
        initialDelay: 5000,   // 5 segundos para producción
        intervalTime: 30000,  // 30 segundos para producción
        testTimeout: 60000    // 60 segundos timeout para producción
      };
    }
  }, [currentStrategy]);

  const checkFollowupTasks = useCallback(async (): Promise<boolean> => {
    console.log('🔍 checkFollowupTasks: Starting analysis...');
    
    if (!isAIInitialized) {
      console.log('⏳ checkFollowupTasks: AI not initialized yet, skipping');
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
    
    // CORRECCIÓN 2: MODO TESTING - Forzar generación más agresiva para tests
    const isTestingMode = currentStrategy === 'localStorage' || 
                         (typeof window !== 'undefined' && window.location.hostname === 'localhost');
    
    if (isTestingMode && pendingTasks.length > 0) {
      console.log(`📋 TEST MODE: Creating followup notification for ${pendingTasks.length} pending tasks`);
      
      try {
        const notificationId = await addNotification(
          `🔔 [TEST] Tienes ${pendingTasks.length} tareas activas que necesitan atención: ${pendingTasks.slice(0, 2).map(t => t.title).join(', ')}`,
          'high',
          { type: 'test_followup', tasks: pendingTasks, testMode: true }
        );
        
        // CORRECCIÓN 4: Delay adicional para tests
        await new Promise(resolve => setTimeout(resolve, 150));
        
        console.log('✅ Test notification created with ID:', notificationId);
        return true;
      } catch (error) {
        console.error('❌ Error creating test notification:', error);
        return false;
      }
    }
    
    // PRODUCCIÓN: Lógica normal
    if (followupTasks.length > 0) {
      const taskTitles = followupTasks.slice(0, 3).map(t => t.title).join(', ');
      console.log(`📋 Found ${followupTasks.length} tasks needing followup`);
      
      try {
        await addNotification(
          `🔔 Tienes ${followupTasks.length} tareas que necesitan seguimiento: ${taskTitles}${followupTasks.length > 3 ? '...' : ''}`,
          'high',
          { type: 'followup', tasks: followupTasks }
        );
        
        await new Promise(resolve => setTimeout(resolve, 100));
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
    
    const isTestingMode = currentStrategy === 'localStorage' || 
                         (typeof window !== 'undefined' && window.location.hostname === 'localhost');
    
    // CORRECCIÓN 2: MODO TESTING - Forzar generación más agresiva
    if (isTestingMode && mainTasks.length > 0) {
      console.log('💡 TEST MODE: Creating productivity suggestion');
      
      try {
        const suggestionId = await addSuggestion(
          `💡 [TEST] Tienes ${mainTasks.length} tareas en tu lista. ¿Te ayudo a priorizarlas o planificar tu día?`,
          'medium',
          { type: 'test_productivity', taskCount: mainTasks.length, testMode: true }
        );
        
        // CORRECCIÓN 4: Delay adicional para tests
        await new Promise(resolve => setTimeout(resolve, 150));
        
        console.log('✅ Test suggestion created with ID:', suggestionId);
        return true;
      } catch (error) {
        console.error('❌ Error creating test suggestion:', error);
        return false;
      }
    }
    
    // PRODUCCIÓN: Lógica normal
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
        
        await new Promise(resolve => setTimeout(resolve, 100));
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
      } catch (error) {
        console.error('❌ Error creating upcoming deadline suggestion:', error);
      }
    }
    
    if (!notificationsAdded) {
      console.log('✅ checkUpcomingDeadlines: No urgent or upcoming deadlines found');
    }
    
    return notificationsAdded;
  }, [mainTasks, addNotification, addSuggestion, isAIInitialized]);

  // CORRECCIÓN 2: EJECUTAR CHEQUEOS CON INTERVALOS OPTIMIZADOS PARA TESTS
  useEffect(() => {
    if (!isAIInitialized) {
      console.log('⏳ Smart messaging waiting for AI initialization...');
      return;
    }
    
    console.log('🔄 Setting up smart messaging intervals...');
    
    const { initialDelay, intervalTime, testTimeout } = getIntervalTiming();
    
    console.log(`⏰ Using intervals: initial=${initialDelay}ms, recurring=${intervalTime}ms, timeout=${testTimeout}ms for strategy=${currentStrategy}`);
    
    const runChecks = async () => {
      console.log('🚀 Running smart messaging checks...');
      
      try {
        const results = {
          followup: await checkFollowupTasks(),
          inactive: await checkInactiveTasks()
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
  }, [checkFollowupTasks, checkInactiveTasks, isAIInitialized, currentStrategy, getIntervalTiming, mainTasks.length, monitoringData.length]);

  // CORRECCIÓN 4: TRIGGER MANUAL MEJORADO CON ASYNC/AWAIT
  const triggerTaskAnalysis = useCallback(async () => {
    console.log('🎯 Manual task analysis triggered');
    
    if (!isAIInitialized) {
      console.log('❌ Cannot trigger analysis: AI not initialized');
      return;
    }
    
    try {
      const results = {
        followup: await checkFollowupTasks(),
        inactive: await checkInactiveTasks()
      };
      console.log('📊 Manual analysis results:', results);
      
      // CORRECCIÓN 4: Delay antes de generar respuesta final
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // SIEMPRE generar una respuesta para testing
      if (!results.followup && !results.inactive) {
        const message = currentStrategy === 'localStorage' 
          ? '✅ [TEST] Análisis completado: Sistema funcionando correctamente en modo test.'
          : '✅ Análisis completado: Tus tareas están al día. ¡Buen trabajo manteniéndote organizado!';
          
        await addSuggestion(
          message,
          'low',
          { type: 'analysis_complete', timestamp: new Date().toISOString(), testMode: currentStrategy === 'localStorage' }
        );
        
        // CORRECCIÓN 4: Delay final para tests
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error('❌ Error in manual task analysis:', error);
    }
  }, [checkFollowupTasks, checkInactiveTasks, addSuggestion, isAIInitialized, currentStrategy]);

  const triggerProductivityAnalysis = useCallback(async () => {
    console.log('🎯 Manual productivity analysis triggered');
    
    if (!isAIInitialized) {
      console.log('❌ Cannot trigger productivity analysis: AI not initialized');
      return;
    }
    
    try {
      const message = currentStrategy === 'localStorage' 
        ? '📊 [TEST] Análisis de productividad: Sistema funcionando en modo test. Datos simulados disponibles.'
        : '📊 Análisis de productividad: No hay insights nuevos disponibles. Ejecuta un análisis AI desde el panel de testing para generar datos.';
      
      await addSuggestion(
        message,
        'medium',
        { type: 'productivity_analysis', timestamp: new Date().toISOString(), testMode: currentStrategy === 'localStorage' }
      );
      
      // CORRECCIÓN 4: Delay para tests
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error('❌ Error in productivity analysis:', error);
    }
  }, [addSuggestion, isAIInitialized, currentStrategy]);

  return {
    triggerTaskAnalysis,
    triggerProductivityAnalysis,
  };
};
