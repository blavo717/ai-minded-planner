
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
    const followupTasks = getTasksNeedingFollowup();
    
    if (followupTasks.length > 0) {
      const taskTitles = followupTasks.slice(0, 3).map(t => t.title).join(', ');
      addNotification(
        `🔔 Tienes ${followupTasks.length} tareas que necesitan seguimiento: ${taskTitles}${followupTasks.length > 3 ? '...' : ''}`,
        'high',
        { type: 'followup', tasks: followupTasks }
      );
    }
  }, [getTasksNeedingFollowup, addNotification]);

  // Detectar tareas sin actividad reciente
  const checkInactiveTasks = useCallback(() => {
    const inactiveTasks = getTasksWithoutRecentActivity(7);
    
    if (inactiveTasks.length > 0) {
      const taskTitles = inactiveTasks.slice(0, 2).map(t => t.title).join(', ');
      addSuggestion(
        `💡 Algunas tareas llevan una semana sin actividad: ${taskTitles}. ¿Necesitas ayuda para priorizarlas?`,
        'medium',
        { type: 'inactive', tasks: inactiveTasks }
      );
    }
  }, [getTasksWithoutRecentActivity, addSuggestion]);

  // Detectar patrones de productividad
  const checkProductivityPatterns = useCallback(() => {
    const healthChecks = monitoringData.filter(m => m.monitoring_type === 'health_check');
    const recentHealthCheck = healthChecks[0];
    
    if (recentHealthCheck && recentHealthCheck.analysis_data) {
      try {
        // Verificar si analysis_data tiene insights
        const analysisData = recentHealthCheck.analysis_data as any;
        if (analysisData.insights && Array.isArray(analysisData.insights)) {
          // Buscar insights de alta prioridad
          const highPriorityInsights = analysisData.insights.filter((insight: any) => 
            insight.priority >= 2 && insight.insight_type !== 'general'
          );
          
          highPriorityInsights.forEach((insight: any) => {
            addSuggestion(
              `📊 ${insight.title}: ${insight.description}`,
              insight.priority >= 3 ? 'high' : 'medium',
              { type: 'productivity_insight', insight }
            );
          });
        }
      } catch (error) {
        console.error('Error parsing analysis data:', error);
      }
    }
  }, [monitoringData, addSuggestion]);

  // Detectar deadlines próximos
  const checkUpcomingDeadlines = useCallback(() => {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const urgentTasks = mainTasks.filter(task => {
      if (!task.due_date || task.status === 'completed') return false;
      const dueDate = new Date(task.due_date);
      return dueDate <= tomorrow;
    });
    
    const soonTasks = mainTasks.filter(task => {
      if (!task.due_date || task.status === 'completed') return false;
      const dueDate = new Date(task.due_date);
      return dueDate > tomorrow && dueDate <= nextWeek;
    });
    
    if (urgentTasks.length > 0) {
      addNotification(
        `⚠️ ${urgentTasks.length} tareas vencen pronto: ${urgentTasks[0].title}${urgentTasks.length > 1 ? ` y ${urgentTasks.length - 1} más` : ''}`,
        'urgent',
        { type: 'urgent_deadline', tasks: urgentTasks }
      );
    }
    
    if (soonTasks.length > 0) {
      addSuggestion(
        `📅 Tienes ${soonTasks.length} tareas con deadline esta semana. ¿Quieres que te ayude a planificarlas?`,
        'medium',
        { type: 'upcoming_deadline', tasks: soonTasks }
      );
    }
  }, [mainTasks, addNotification, addSuggestion]);

  // Ejecutar chequeos periódicos
  useEffect(() => {
    // Chequeo inicial después de 2 segundos
    const initialTimeout = setTimeout(() => {
      checkFollowupTasks();
      checkUpcomingDeadlines();
    }, 2000);

    // Chequeos periódicos cada 10 minutos
    const interval = setInterval(() => {
      checkFollowupTasks();
      checkInactiveTasks();
      checkUpcomingDeadlines();
      checkProductivityPatterns();
    }, 10 * 60 * 1000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [checkFollowupTasks, checkInactiveTasks, checkUpcomingDeadlines, checkProductivityPatterns]);

  // Funciones para trigger manual de notificaciones
  const triggerTaskAnalysis = useCallback(() => {
    checkFollowupTasks();
    checkInactiveTasks();
    checkUpcomingDeadlines();
  }, [checkFollowupTasks, checkInactiveTasks, checkUpcomingDeadlines]);

  const triggerProductivityAnalysis = useCallback(() => {
    checkProductivityPatterns();
  }, [checkProductivityPatterns]);

  return {
    triggerTaskAnalysis,
    triggerProductivityAnalysis,
  };
};
