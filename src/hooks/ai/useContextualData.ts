
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTasks } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import { useGeneralStats } from '@/hooks/analytics/useGeneralStats';
import { useProductivityMetrics } from '@/hooks/analytics/useProductivityMetrics';
import { useWorkPatterns } from '@/hooks/analytics/useWorkPatterns';
import { ExtendedAIContext } from '@/types/ai-context';
import { ContextAnalyzer, ContextAnalysis } from '@/utils/ai/ContextAnalyzer';
import { useEnhancedContextualData } from './useEnhancedContextualData';

export interface ContextualDataConfig {
  enableAnalysis?: boolean;
  refreshInterval?: number;
  priorityThreshold?: number;
  maxDataPoints?: number;
}

export interface ContextualDataState {
  context: ExtendedAIContext | null;
  analysis: ContextAnalysis | null;
  isLoading: boolean;
  lastUpdate: Date | null;
  dataQuality: number;
  recommendations: string[];
}

const DEFAULT_CONFIG: ContextualDataConfig = {
  enableAnalysis: true,
  refreshInterval: 60000, // 1 minuto
  priorityThreshold: 50,
  maxDataPoints: 50,
};

export const useContextualData = (config: ContextualDataConfig = {}) => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const { user } = useAuth();
  const { mainTasks } = useTasks();
  const { projects } = useProjects();
  const { data: generalStats } = useGeneralStats();
  const { data: productivityMetrics } = useProductivityMetrics('week');
  const { data: workPatterns } = useWorkPatterns('week');
  
  // Usar el sistema mejorado como fuente de datos enriquecidos
  const { contextData: enhancedContext, dataQuality: enhancedQuality } = useEnhancedContextualData();

  const [state, setState] = useState<ContextualDataState>({
    context: null,
    analysis: null,
    isLoading: true,
    lastUpdate: null,
    dataQuality: 0,
    recommendations: [],
  });

  // Generar contexto enriquecido
  const generateEnrichedContext = useCallback((): ExtendedAIContext => {
    const now = new Date();
    const hour = now.getHours();
    
    let timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
    if (hour >= 6 && hour < 12) timeOfDay = 'morning';
    else if (hour >= 12 && hour < 18) timeOfDay = 'afternoon';
    else if (hour >= 18 && hour < 22) timeOfDay = 'evening';
    else timeOfDay = 'night';

    // Datos de usuario
    const userInfo = {
      id: user?.id || '',
      hasActiveTasks: (generalStats?.pendingTasks || 0) > 0,
      hasActiveProjects: (generalStats?.activeProjects || 0) > 0,
      totalTasks: generalStats?.totalTasks || 0,
      completedTasks: generalStats?.completedTasks || 0,
      pendingTasks: generalStats?.pendingTasks || 0,
    };

    // Sesión actual
    const currentSession = {
      timeOfDay,
      dayOfWeek: now.toLocaleDateString('es-ES', { weekday: 'long' }),
      isWeekend: [0, 6].includes(now.getDay()),
    };

    // Actividad reciente mejorada
    const completedToday = mainTasks.filter(task => 
      task.status === 'completed' && 
      task.completed_at && 
      new Date(task.completed_at).toDateString() === now.toDateString()
    ).length;

    const lastTaskUpdate = mainTasks.length > 0 ? 
      new Date(Math.max(...mainTasks.map(t => new Date(t.updated_at).getTime()))) : 
      undefined;

    let workPattern: 'productive' | 'moderate' | 'low' | 'inactive' = 'inactive';
    if (completedToday >= 5) workPattern = 'productive';
    else if (completedToday >= 3) workPattern = 'moderate';
    else if (completedToday >= 1) workPattern = 'low';

    const recentActivity = {
      lastTaskUpdate,
      recentCompletions: completedToday,
      workPattern,
    };

    // Tareas recientes priorizadas
    const recentTasks = mainTasks
      .sort((a, b) => {
        // Priorizar por urgencia y fecha de actualización
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 1;
        const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 1;
        
        if (aPriority !== bPriority) return bPriority - aPriority;
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      })
      .slice(0, finalConfig.maxDataPoints || 50)
      .map(task => ({
        id: task.id,
        title: task.title,
        status: task.status,
        priority: task.priority,
        updated_at: task.updated_at,
      }));

    // Proyectos activos priorizados
    const recentProjects = projects
      .filter(p => p.status === 'active')
      .sort((a, b) => {
        // Priorizar por progreso y fecha de actualización
        const aProgress = a.progress || 0;
        const bProgress = b.progress || 0;
        
        if (aProgress !== bProgress) return bProgress - aProgress;
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      })
      .slice(0, Math.floor((finalConfig.maxDataPoints || 50) / 2))
      .map(project => ({
        id: project.id,
        name: project.name,
        status: project.status || 'active',
        progress: project.progress || 0,
      }));

    // Métricas de productividad enriquecidas
    const productivity = productivityMetrics ? {
      weeklyScore: productivityMetrics.completionRate || 0,
      trendsData: [], // Simplificado
      completionRate: productivityMetrics.completionRate || 0,
      averageTaskDuration: productivityMetrics.averageTaskTime || 0,
    } : undefined;

    // Patrones de trabajo enriquecidos
    const workPatternsData = workPatterns && Array.isArray(workPatterns) ? {
      mostProductiveHours: workPatterns
        .sort((a, b) => b.productivity_score - a.productivity_score)
        .slice(0, 3)
        .map(pattern => pattern.hour),
      preferredWorkDays: workPatterns
        .sort((a, b) => b.tasks_completed - a.tasks_completed)
        .slice(0, 3)
        .map(pattern => ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][pattern.day_of_week]),
      averageSessionLength: workPatterns.length > 0 ? 
        workPatterns.reduce((sum, pattern) => sum + pattern.total_sessions, 0) / workPatterns.length : 0,
      peakPerformanceTimes: workPatterns
        .sort((a, b) => b.productivity_score - a.productivity_score)
        .slice(0, 3)
        .map(pattern => `${pattern.hour}:00 - ${pattern.hour + 1}:00`),
    } : undefined;

    return {
      userInfo,
      currentSession,
      recentActivity,
      productivity,
      workPatterns: workPatternsData,
      recentTasks,
      recentProjects,
    };
  }, [
    user,
    mainTasks,
    projects,
    generalStats,
    productivityMetrics,
    workPatterns,
    finalConfig.maxDataPoints,
  ]);

  // Actualizar datos contextuales - MEJORADO con sistema enhanced
  const updateContextualData = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // Priorizar datos del sistema mejorado si están disponibles
      let context: ExtendedAIContext;
      let dataQuality: number;
      
      if (enhancedContext && enhancedQuality > 70) {
        console.log('🚀 Usando datos MEJORADOS del sistema enhanced');
        
        // Usar datos enhanced directamente (compatibilidad simplificada)
        context = {
          userInfo: {
            id: enhancedContext.user.id,
            hasActiveTasks: enhancedContext.user.activeTasks > 0,
            hasActiveProjects: enhancedContext.projects.activeProjects.length > 0,
            totalTasks: enhancedContext.user.totalTasks,
            completedTasks: enhancedContext.user.completedToday,
            pendingTasks: enhancedContext.user.activeTasks,
          },
          currentSession: {
            timeOfDay: 'morning' as const,
            dayOfWeek: new Date().toLocaleDateString('es-ES', { weekday: 'long' }),
            isWeekend: [0, 6].includes(new Date().getDay()),
          },
          recentActivity: {
            lastTaskUpdate: enhancedContext.recentActivity.lastTaskWorked?.updated_at ? new Date(enhancedContext.recentActivity.lastTaskWorked.updated_at) : undefined,
            recentCompletions: enhancedContext.recentActivity.recentCompletions.length,
            workPattern: enhancedContext.insights.workPattern,
          },
          recentTasks: enhancedContext.taskHierarchy.mainTasks.slice(0, 10).map(h => ({
            id: h.mainTask.id,
            title: h.mainTask.title,
            status: h.mainTask.status,
            priority: h.mainTask.priority,
            updated_at: h.mainTask.updated_at,
          })),
          recentProjects: enhancedContext.projects.activeProjects.slice(0, 5).map(p => ({
            id: p.id,
            name: p.name,
            status: p.status || 'active',
            progress: p.progress || 0,
          })),
        };
        dataQuality = enhancedQuality;
      } else {
        console.log('📊 Usando sistema de contexto legacy');
        context = generateEnrichedContext();
        dataQuality = calculateDataQuality(context);
      }

      let analysis: ContextAnalysis | null = null;
      if (finalConfig.enableAnalysis) {
        analysis = ContextAnalyzer.analyzeSituation(context);
      }

      const recommendations = analysis ? 
        generateSmartRecommendations(analysis, context) : 
        enhancedContext?.insights.recommendations || [];

      setState({
        context,
        analysis,
        isLoading: false,
        lastUpdate: new Date(),
        dataQuality,
        recommendations,
      });
      
      console.log('✅ Contexto actualizado:', {
        source: enhancedContext ? 'enhanced' : 'legacy',
        quality: dataQuality,
        recommendations: recommendations.length
      });
      
    } catch (error) {
      console.error('Error updating contextual data:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [generateEnrichedContext, finalConfig.enableAnalysis, enhancedContext, enhancedQuality]);

  // Calcular calidad de datos
  const calculateDataQuality = useCallback((context: ExtendedAIContext): number => {
    let quality = 0;

    // Datos básicos del usuario (25%)
    if (context.userInfo.id) quality += 25;

    // Datos de tareas (35%)
    if (context.recentTasks.length > 0) quality += 20;
    if (context.userInfo.totalTasks > 0) quality += 15;

    // Datos de proyectos (20%)
    if (context.recentProjects.length > 0) quality += 20;

    // Datos de actividad (20%)
    if (context.recentActivity.lastTaskUpdate) quality += 10;
    if (context.recentActivity.workPattern !== 'inactive') quality += 10;

    return Math.min(quality, 100);
  }, []);

  // Generar recomendaciones inteligentes
  const generateSmartRecommendations = useCallback((
    analysis: ContextAnalysis,
    context: ExtendedAIContext
  ): string[] => {
    const recommendations: string[] = [];

    // Basadas en análisis de situación
    recommendations.push(...analysis.recommendedActions);

    // Basadas en contexto temporal
    const hour = new Date().getHours();
    if (context.currentSession.timeOfDay === 'morning' && context.userInfo.pendingTasks > 0) {
      recommendations.push('Planifica las 3 tareas más importantes para hoy');
    }

    if (context.currentSession.timeOfDay === 'evening' && analysis.urgencyScore < 30) {
      recommendations.push('Revisa el progreso del día y prepara el plan para mañana');
    }

    // Basadas en patrones de trabajo
    if (context.workPatterns?.mostProductiveHours.includes(hour)) {
      recommendations.push('Aprovecha esta hora productiva para tareas complejas');
    }

    return recommendations.slice(0, 6); // Máximo 6 recomendaciones
  }, []);

  // Obtener contexto priorizado
  const getPrioritizedContext = useCallback(() => {
    if (!state.context || !state.analysis) return state.context;

    const prioritizedContext = { ...state.context };

    // Filtrar tareas por prioridad si está configurado
    if (finalConfig.priorityThreshold && finalConfig.priorityThreshold > 0) {
      const priorityOrder = { urgent: 100, high: 75, medium: 50, low: 25 };
      prioritizedContext.recentTasks = state.context.recentTasks.filter(task => {
        const taskPriority = priorityOrder[task.priority as keyof typeof priorityOrder] || 25;
        return taskPriority >= finalConfig.priorityThreshold!;
      });
    }

    return prioritizedContext;
  }, [state.context, state.analysis, finalConfig.priorityThreshold]);

  // Auto actualización
  useEffect(() => {
    updateContextualData();

    if (finalConfig.refreshInterval && finalConfig.refreshInterval > 0) {
      const interval = setInterval(updateContextualData, finalConfig.refreshInterval);
      return () => clearInterval(interval);
    }
  }, [updateContextualData, finalConfig.refreshInterval]);

  // Detectar cambios en dependencias críticas
  useEffect(() => {
    updateContextualData();
  }, [mainTasks.length, projects.length, generalStats]);

  return {
    ...state,
    updateContextualData,
    getPrioritizedContext,
    config: finalConfig,
    
    // Utilidades adicionales
    hasHighQualityData: state.dataQuality >= 70,
    needsMoreData: state.dataQuality < 50,
    isStale: state.lastUpdate ? 
      (new Date().getTime() - state.lastUpdate.getTime()) > (finalConfig.refreshInterval || 60000) * 2 :
      true,
  };
};
