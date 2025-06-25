
import { useEffect, useCallback } from 'react';
import { useAIAssistant } from '@/hooks/useAIAssistant';
import { useTasks } from '@/hooks/useTasks';
import { useAITaskMonitor } from '@/hooks/useAITaskMonitor';

export const useSmartMessaging = () => {
  const { addNotification, addSuggestion } = useAIAssistant();
  const { mainTasks, getTasksNeedingFollowup, getTasksWithoutRecentActivity } = useTasks();
  const { monitoringData } = useAITaskMonitor();

  // Detectar tareas que necesitan seguimiento
  const checkFollowupTasks = useCallback(() => {
    console.log('🔍 Checking followup tasks...');
    const followupTasks = getTasksNeedingFollowup();
    
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
    
    console.log('✅ No followup tasks found');
    return false;
  }, [getTasksNeedingFollowup, addNotification]);

  // Detectar tareas sin actividad reciente
  const checkInactiveTasks = useCallback(() => {
    console.log('🔍 Checking inactive tasks...');
    const inactiveTasks = getTasksWithoutRecentActivity(7);
    
    if (inactiveTasks.length > 0) {
      const taskTitles = inactiveTasks.slice(0, 2).map(t => t.title).join(', ');
      console.log(`📋 Found ${inactiveTasks.length} inactive tasks:`, inactiveTasks.map(t => t.title));
      
      addSuggestion(
        `💡 Algunas tareas llevan una semana sin actividad: ${taskTitles}. ¿Necesitas ayuda para priorizarlas?`,
        'medium',
        { type: 'inactive', tasks: inactiveTasks }
      );
      
      return true;
    }
    
    console.log('✅ No inactive tasks found');
    return false;
  }, [getTasksWithoutRecentActivity, addSuggestion]);

  // Detectar patrones de productividad
  const checkProductivityPatterns = useCallback(() => {
    console.log('🔍 Checking productivity patterns...');
    console.log(`📊 Available monitoring data: ${monitoringData.length} entries`);
    
    const healthChecks = monitoringData.filter(m => m.monitoring_type === 'health_check');
    console.log(`🏥 Health checks found: ${healthChecks.length}`);
    
    const recentHealthCheck = healthChecks[0];
    
    if (recentHealthCheck && recentHealthCheck.analysis_data) {
      try {
        console.log('📈 Processing health check analysis data...');
        // Verificar si analysis_data tiene insights
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
    } else {
      console.log('📊 No recent health check with analysis data found');
    }
    
    return false;
  }, [monitoringData, addSuggestion]);

  // Detectar deadlines próximos con mejor lógica
  const checkUpcomingDeadlines = useCallback(() => {
    console.log('🔍 Checking upcoming deadlines...');
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
    
    console.log(`⚠️ Urgent tasks (due within 24h): ${urgentTasks.length}`);
    console.log(`📅 Soon tasks (due within week): ${soonTasks.length}`);
    
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
    
    if (!notificationsAdded) {
      console.log('✅ No urgent or upcoming deadlines found');
    }
    
    return notificationsAdded;
  }, [mainTasks, addNotification, addSuggestion]);

  // Ejecutar chequeos periódicos con mejor lógica
  useEffect(() => {
    console.log('🔄 Setting up smart messaging intervals...');
    
    // Chequeo inicial después de 3 segundos (dar tiempo para cargar datos)
    const initialTimeout = setTimeout(() => {
      console.log('🚀 Running initial smart messaging checks...');
      const results = {
        followup: checkFollowupTasks(),
        deadlines: checkUpcomingDeadlines()
      };
      console.log('📊 Initial check results:', results);
    }, 3000);

    // Chequeos periódicos cada 5 minutos (más frecuente para testing)
    const interval = setInterval(() => {
      console.log('🔄 Running periodic smart messaging checks...');
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
  }, [checkFollowupTasks, checkInactiveTasks, checkUpcomingDeadlines, checkProductivityPatterns]);

  // Funciones para trigger manual de notificaciones
  const triggerTaskAnalysis = useCallback(() => {
    console.log('🎯 Manual task analysis triggered');
    const results = {
      followup: checkFollowupTasks(),
      inactive: checkInactiveTasks(),
      deadlines: checkUpcomingDeadlines()
    };
    console.log('📊 Manual analysis results:', results);
    
    // Si no hay notificaciones automáticas, generar una notificación de estado
    if (!results.followup && !results.inactive && !results.deadlines) {
      addSuggestion(
        '✅ Análisis completado: Tus tareas están al día. ¡Buen trabajo manteniéndote organizado!',
        'low',
        { type: 'analysis_complete', timestamp: new Date().toISOString() }
      );
    }
  }, [checkFollowupTasks, checkInactiveTasks, checkUpcomingDeadlines, addSuggestion]);

  const triggerProductivityAnalysis = useCallback(() => {
    console.log('🎯 Manual productivity analysis triggered');
    const result = checkProductivityPatterns();
    
    if (!result) {
      addSuggestion(
        '📊 Análisis de productividad: No hay insights nuevos disponibles. Ejecuta un análisis AI desde el panel de testing para generar datos.',
        'medium',
        { type: 'productivity_analysis', timestamp: new Date().toISOString() }
      );
    }
  }, [checkProductivityPatterns, addSuggestion]);

  return {
    triggerTaskAnalysis,
    triggerProductivityAnalysis,
  };
};
