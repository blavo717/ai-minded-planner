
import { useEffect, useCallback } from 'react';
import { useAIAssistant } from '@/hooks/useAIAssistant';
import { useTasks } from '@/hooks/useTasks';
import { useAITaskMonitor } from '@/hooks/useAITaskMonitor';

export const useSmartMessaging = () => {
  const { addNotification, addSuggestion, isInitialized: isAIInitialized } = useAIAssistant();
  const { mainTasks, getTasksNeedingFollowup, getTasksWithoutRecentActivity } = useTasks();
  const { monitoringData } = useAITaskMonitor();

  // Debug: estado actual
  console.log('🎯 useSmartMessaging state:', {
    isAIInitialized,
    taskCount: mainTasks.length,
    monitoringDataCount: monitoringData.length,
    hasFollowupTasks: getTasksNeedingFollowup().length > 0
  });

  // Detectar tareas que necesitan seguimiento (más permisivo para testing)
  const checkFollowupTasks = useCallback(() => {
    console.log('🔍 checkFollowupTasks: Starting analysis...');
    
    if (!isAIInitialized) {
      console.log('⏳ checkFollowupTasks: AI not initialized yet, skipping');
      return false;
    }
    
    // Lógica más permisiva para generar notificaciones durante testing
    const pendingTasks = mainTasks.filter(task => 
      task.status === 'pending' || task.status === 'in_progress'
    );
    
    const followupTasks = getTasksNeedingFollowup();
    
    console.log('📊 checkFollowupTasks stats:', {
      pendingCount: pendingTasks.length,
      followupCount: followupTasks.length,
      pendingTasks: pendingTasks.map(t => ({ id: t.id, title: t.title, status: t.status })),
      followupTasks: followupTasks.map(t => ({ id: t.id, title: t.title, needs_followup: t.needs_followup }))
    });
    
    // Si hay tareas pendientes pero no hay followup específicos, crear una notificación general
    if (pendingTasks.length > 0 && followupTasks.length === 0) {
      console.log(`📋 Creating general followup for ${pendingTasks.length} pending tasks`);
      
      addNotification(
        `🔔 Tienes ${pendingTasks.length} tareas activas que podrían necesitar atención: ${pendingTasks.slice(0, 2).map(t => t.title).join(', ')}`,
        'medium',
        { type: 'general_followup', tasks: pendingTasks }
      );
      
      return true;
    }
    
    if (followupTasks.length > 0) {
      const taskTitles = followupTasks.slice(0, 3).map(t => t.title).join(', ');
      console.log(`📋 Found ${followupTasks.length} tasks needing followup:`, followupTasks.map(t => t.title));
      
      addNotification(
        `🔔 Tienes ${followupTasks.length} tareas que necesitan seguimiento: ${taskTitles}${followupTasks.length > 3 ? '...' : ''}`,
        'high',
        { type: 'followup', tasks: followupTasks }
      );
      
      return true;
    }
    
    console.log('✅ checkFollowupTasks: No followup tasks found');
    return false;
  }, [getTasksNeedingFollowup, addNotification, mainTasks, isAIInitialized]);

  // Detectar tareas sin actividad reciente (más permisivo)
  const checkInactiveTasks = useCallback(() => {
    console.log('🔍 checkInactiveTasks: Starting analysis...');
    
    if (!isAIInitialized) {
      console.log('⏳ checkInactiveTasks: AI not initialized yet, skipping');
      return false;
    }
    
    // Lógica más permisiva: buscar tareas de más de 3 días en lugar de 7
    const inactiveTasks = getTasksWithoutRecentActivity(3);
    
    console.log('📊 checkInactiveTasks stats:', {
      inactiveCount: inactiveTasks.length,
      totalTasks: mainTasks.length,
      inactiveTasks: inactiveTasks.map(t => ({ 
        id: t.id, 
        title: t.title, 
        last_worked_at: t.last_worked_at 
      }))
    });
    
    if (inactiveTasks.length > 0) {
      const taskTitles = inactiveTasks.slice(0, 2).map(t => t.title).join(', ');
      console.log(`📋 Found ${inactiveTasks.length} inactive tasks:`, inactiveTasks.map(t => t.title));
      
      addSuggestion(
        `💡 Algunas tareas llevan tiempo sin actividad: ${taskTitles}. ¿Necesitas ayuda para priorizarlas?`,
        'medium',
        { type: 'inactive', tasks: inactiveTasks }
      );
      
      return true;
    }
    
    // Si no hay tareas inactivas específicas, crear sugerencia general si hay tareas
    if (mainTasks.length > 0) {
      console.log('💡 Creating general productivity suggestion');
      
      addSuggestion(
        `💡 Tienes ${mainTasks.length} tareas en tu lista. ¿Te ayudo a priorizarlas o planificar tu día?`,
        'low',
        { type: 'general_productivity', taskCount: mainTasks.length }
      );
      
      return true;
    }
    
    console.log('✅ checkInactiveTasks: No inactive tasks found');
    return false;
  }, [getTasksWithoutRecentActivity, addSuggestion, mainTasks, isAIInitialized]);

  // Detectar patrones de productividad (más robusto)
  const checkProductivityPatterns = useCallback(() => {
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
          
          // Buscar insights de alta prioridad
          const highPriorityInsights = analysisData.insights.filter((insight: any) => 
            insight.priority >= 2 && insight.insight_type !== 'general'
          );
          
          console.log(`⚠️ High priority insights: ${highPriorityInsights.length}`);
          
          highPriorityInsights.forEach((insight: any) => {
            console.log(`💡 Adding productivity insight: ${insight.title}`);
            addSuggestion(
              `📊 ${insight.title}: ${insight.description}`,
              insight.priority >= 3 ? 'high' : 'medium',
              { type: 'productivity_insight', insight }
            );
          });
          
          return highPriorityInsights.length > 0;
        } else {
          console.log('📊 No insights array found in analysis data');
        }
      } catch (error) {
        console.error('❌ Error parsing analysis data:', error);
      }
    }
    
    // Si hay datos de monitoreo pero no insights, crear sugerencia general
    if (monitoringData.length > 0) {
      console.log('📊 Creating general analysis suggestion');
      
      addSuggestion(
        `📊 He detectado actividad en tus tareas. ¿Quieres que analice tus patrones de productividad?`,
        'low',
        { type: 'general_analysis', dataCount: monitoringData.length }
      );
      
      return true;
    }
    
    console.log('📊 checkProductivityPatterns: No productivity patterns found');
    return false;
  }, [monitoringData, addSuggestion, isAIInitialized]);

  // Detectar deadlines próximos (más agresivo para testing)
  const checkUpcomingDeadlines = useCallback(() => {
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
    
    // Tareas sin deadline pero importantes
    const highPriorityTasks = mainTasks.filter(task => 
      task.priority === 'high' && task.status !== 'completed' && !task.due_date
    );
    
    console.log('📊 checkUpcomingDeadlines stats:', {
      urgentCount: urgentTasks.length,
      soonCount: soonTasks.length,
      highPriorityCount: highPriorityTasks.length,
      urgentTasks: urgentTasks.map(t => ({ id: t.id, title: t.title, due_date: t.due_date })),
      soonTasks: soonTasks.map(t => ({ id: t.id, title: t.title, due_date: t.due_date }))
    });
    
    let notificationsAdded = false;
    
    if (urgentTasks.length > 0) {
      console.log('🚨 Adding urgent deadline notification');
      addNotification(
        `⚠️ ${urgentTasks.length} tareas vencen pronto: ${urgentTasks[0].title}${urgentTasks.length > 1 ? ` y ${urgentTasks.length - 1} más` : ''}`,
        'urgent',
        { type: 'urgent_deadline', tasks: urgentTasks }
      );
      notificationsAdded = true;
    }
    
    if (soonTasks.length > 0) {
      console.log('📅 Adding upcoming deadline suggestion');
      addSuggestion(
        `📅 Tienes ${soonTasks.length} tareas con deadline esta semana. ¿Quieres que te ayude a planificarlas?`,
        'medium',
        { type: 'upcoming_deadline', tasks: soonTasks }
      );
      notificationsAdded = true;
    }
    
    if (highPriorityTasks.length > 0 && !notificationsAdded) {
      console.log('🔥 Adding high priority tasks suggestion');
      addSuggestion(
        `🔥 Tienes ${highPriorityTasks.length} tareas de alta prioridad sin fecha límite. ¿Las revisamos?`,
        'high',
        { type: 'high_priority_no_deadline', tasks: highPriorityTasks }
      );
      notificationsAdded = true;
    }
    
    if (!notificationsAdded) {
      console.log('✅ checkUpcomingDeadlines: No urgent or upcoming deadlines found');
    }
    
    return notificationsAdded;
  }, [mainTasks, addNotification, addSuggestion, isAIInitialized]);

  // Ejecutar chequeos con lógica mejorada
  useEffect(() => {
    // Solo ejecutar si AI está inicializado
    if (!isAIInitialized) {
      console.log('⏳ Smart messaging waiting for AI initialization...');
      return;
    }
    
    console.log('🔄 Setting up smart messaging intervals...');
    console.log('📊 Current data state:', {
      taskCount: mainTasks.length,
      monitoringDataCount: monitoringData.length,
      isAIInitialized
    });
    
    // Chequeo inicial después de 3 segundos (dar tiempo a que todo esté listo)
    const initialTimeout = setTimeout(() => {
      console.log('🚀 Running initial smart messaging checks...');
      console.log('📊 Data available for analysis:', {
        tasks: mainTasks.length,
        monitoringData: monitoringData.length
      });
      
      const results = {
        followup: checkFollowupTasks(),
        deadlines: checkUpcomingDeadlines(),
        productivity: checkProductivityPatterns()
      };
      console.log('📊 Initial check results:', results);
    }, 3000);

    // Chequeos periódicos cada 5 minutos (más espaciado para evitar spam)
    const interval = setInterval(() => {
      console.log('🔄 Running periodic smart messaging checks...');
      console.log('📊 Current state for periodic check:', {
        tasks: mainTasks.length,
        monitoringData: monitoringData.length,
        isAIInitialized
      });
      
      const results = {
        followup: checkFollowupTasks(),
        inactive: checkInactiveTasks(),
        deadlines: checkUpcomingDeadlines(),
        productivity: checkProductivityPatterns()
      };
      console.log('📊 Periodic check results:', results);
    }, 5 * 60 * 1000);

    return () => {
      console.log('🛑 Cleaning up smart messaging intervals');
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [checkFollowupTasks, checkInactiveTasks, checkUpcomingDeadlines, checkProductivityPatterns, isAIInitialized]);

  // Funciones para trigger manual
  const triggerTaskAnalysis = useCallback(() => {
    console.log('🎯 Manual task analysis triggered');
    
    if (!isAIInitialized) {
      console.log('❌ Cannot trigger analysis: AI not initialized');
      return;
    }
    
    const results = {
      followup: checkFollowupTasks(),
      inactive: checkInactiveTasks(),
      deadlines: checkUpcomingDeadlines()
    };
    console.log('📊 Manual analysis results:', results);
    
    // Siempre generar una respuesta para testing
    if (!results.followup && !results.inactive && !results.deadlines) {
      addSuggestion(
        '✅ Análisis completado: Tus tareas están al día. ¡Buen trabajo manteniéndote organizado!',
        'low',
        { type: 'analysis_complete', timestamp: new Date().toISOString() }
      );
    }
  }, [checkFollowupTasks, checkInactiveTasks, checkUpcomingDeadlines, addSuggestion, isAIInitialized]);

  const triggerProductivityAnalysis = useCallback(() => {
    console.log('🎯 Manual productivity analysis triggered');
    
    if (!isAIInitialized) {
      console.log('❌ Cannot trigger productivity analysis: AI not initialized');
      return;
    }
    
    const result = checkProductivityPatterns();
    
    if (!result) {
      addSuggestion(
        '📊 Análisis de productividad: No hay insights nuevos disponibles. Ejecuta un análisis AI desde el panel de testing para generar datos.',
        'medium',
        { type: 'productivity_analysis', timestamp: new Date().toISOString() }
      );
    }
  }, [checkProductivityPatterns, addSuggestion, isAIInitialized]);

  return {
    triggerTaskAnalysis,
    triggerProductivityAnalysis,
  };
};
