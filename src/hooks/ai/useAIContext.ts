import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTasks } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import { useGeneralStats } from '@/hooks/analytics/useGeneralStats';
import { useProductivityMetrics } from '@/hooks/analytics/useProductivityMetrics';
import { useWorkPatterns } from '@/hooks/analytics/useWorkPatterns';
import { SmartPromptContext } from '@/types/ai-prompts';

export interface AIContextConfig {
  enableRealtimeUpdates?: boolean;
  contextRefreshInterval?: number; // en segundos
  includeProductivityMetrics?: boolean;
  includeWorkPatterns?: boolean;
  maxRecentTasks?: number;
  maxRecentProjects?: number;
}

export interface ExtendedAIContext extends SmartPromptContext {
  productivity?: {
    weeklyScore: number;
    trendsData: any[];
    completionRate: number;
    averageTaskDuration: number;
  };
  workPatterns?: {
    mostProductiveHours: number[];
    preferredWorkDays: string[];
    averageSessionLength: number;
    peakPerformanceTimes: string[];
  };
  recentTasks: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
    updated_at: string;
  }>;
  recentProjects: Array<{
    id: string;
    name: string;
    status: string;
    progress: number;
  }>;
}

const DEFAULT_CONFIG: AIContextConfig = {
  enableRealtimeUpdates: true,
  contextRefreshInterval: 300, // 5 minutos
  includeProductivityMetrics: true,
  includeWorkPatterns: true,
  maxRecentTasks: 10,
  maxRecentProjects: 5,
};

export const useAIContext = (config: AIContextConfig = {}) => {
  const { user } = useAuth();
  const { mainTasks, getSubtasksForTask } = useTasks();
  const { projects } = useProjects();
  const { data: generalStats } = useGeneralStats();
  const { data: productivityMetrics } = useProductivityMetrics('week');
  const { data: workPatterns } = useWorkPatterns('week');

  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  const [contextCache, setContextCache] = useState<ExtendedAIContext | null>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());
  const [isUpdating, setIsUpdating] = useState(false);

  // Generar contexto base del usuario
  const generateUserContext = useCallback((): SmartPromptContext['userInfo'] => {
    if (!user || !generalStats) {
      return {
        id: '',
        hasActiveTasks: false,
        hasActiveProjects: false,
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
      };
    }

    return {
      id: user.id,
      hasActiveTasks: (generalStats.pendingTasks || 0) > 0,
      hasActiveProjects: (generalStats.activeProjects || 0) > 0,
      totalTasks: generalStats.totalTasks || 0,
      completedTasks: generalStats.completedTasks || 0,
      pendingTasks: generalStats.pendingTasks || 0,
    };
  }, [user, generalStats]);

  // Generar contexto de la sesión actual
  const generateSessionContext = useCallback((): SmartPromptContext['currentSession'] => {
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.toLocaleDateString('es-ES', { weekday: 'long' });
    
    let timeOfDay: SmartPromptContext['currentSession']['timeOfDay'];
    if (hour >= 6 && hour < 12) timeOfDay = 'morning';
    else if (hour >= 12 && hour < 18) timeOfDay = 'afternoon';
    else if (hour >= 18 && hour < 22) timeOfDay = 'evening';
    else timeOfDay = 'night';

    return {
      timeOfDay,
      dayOfWeek,
      isWeekend: [0, 6].includes(now.getDay()),
    };
  }, []);

  // Analizar actividad reciente
  const generateRecentActivity = useCallback((): SmartPromptContext['recentActivity'] => {
    if (!mainTasks.length) {
      return {
        recentCompletions: 0,
        workPattern: 'inactive',
      };
    }

    const now = new Date();
    const today = now.toDateString();

    // Tareas completadas hoy
    const completedToday = mainTasks.filter(task => 
      task.status === 'completed' && 
      task.completed_at && 
      new Date(task.completed_at).toDateString() === today
    ).length;

    // Última actualización de tarea
    const lastTaskUpdate = mainTasks.length > 0 ? 
      new Date(Math.max(...mainTasks.map(t => new Date(t.updated_at).getTime()))) : 
      undefined;

    // Determinar patrón de trabajo
    let workPattern: SmartPromptContext['recentActivity']['workPattern'] = 'inactive';
    if (completedToday >= 5) workPattern = 'productive';
    else if (completedToday >= 3) workPattern = 'moderate';
    else if (completedToday >= 1) workPattern = 'low';

    return {
      lastTaskUpdate,
      recentCompletions: completedToday,
      workPattern,
    };
  }, [mainTasks]);

  // Obtener tareas recientes relevantes
  const getRecentTasks = useCallback(() => {
    if (!mainTasks.length) return [];

    return mainTasks
      .slice(0, finalConfig.maxRecentTasks)
      .map(task => ({
        id: task.id,
        title: task.title,
        status: task.status,
        priority: task.priority,
        updated_at: task.updated_at,
      }));
  }, [mainTasks, finalConfig.maxRecentTasks]);

  // Obtener proyectos recientes relevantes
  const getRecentProjects = useCallback(() => {
    if (!projects.length) return [];

    return projects
      .filter(p => p.status === 'active')
      .slice(0, finalConfig.maxRecentProjects)
      .map(project => ({
        id: project.id,
        name: project.name,
        status: project.status || 'active',
        progress: project.progress || 0,
      }));
  }, [projects, finalConfig.maxRecentProjects]);

  // Generar contexto de productividad extendido
  const generateProductivityContext = useCallback(() => {
    if (!finalConfig.includeProductivityMetrics || !productivityMetrics) return undefined;

    return {
      weeklyScore: productivityMetrics.completionRate || 0,
      trendsData: [], // Simplificado ya que 'trends' no existe en el tipo
      completionRate: productivityMetrics.completionRate || 0,
      averageTaskDuration: productivityMetrics.averageTaskTime || 0,
    };
  }, [finalConfig.includeProductivityMetrics, productivityMetrics]);

  // Generar contexto de patrones de trabajo
  const generateWorkPatternsContext = useCallback(() => {
    if (!finalConfig.includeWorkPatterns || !workPatterns || !Array.isArray(workPatterns)) return undefined;

    // Procesar el array de WorkPattern para extraer patrones útiles
    const mostProductiveHours = workPatterns
      .sort((a, b) => b.productivity_score - a.productivity_score)
      .slice(0, 3)
      .map(pattern => pattern.hour);

    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const preferredWorkDays = workPatterns
      .sort((a, b) => b.tasks_completed - a.tasks_completed)
      .slice(0, 3)
      .map(pattern => dayNames[pattern.day_of_week]);

    const totalSessions = workPatterns.reduce((sum, pattern) => sum + pattern.total_sessions, 0);
    const averageSessionLength = totalSessions > 0 ? 
      workPatterns.reduce((sum, pattern) => sum + pattern.total_sessions, 0) / workPatterns.length : 0;

    const peakPerformanceTimes = mostProductiveHours.map(hour => 
      `${hour}:00 - ${hour + 1}:00`
    );

    return {
      mostProductiveHours,
      preferredWorkDays,
      averageSessionLength,
      peakPerformanceTimes,
    };
  }, [finalConfig.includeWorkPatterns, workPatterns]);

  // Generar contexto completo
  const generateFullContext = useCallback((): ExtendedAIContext => {
    const baseContext: SmartPromptContext = {
      userInfo: generateUserContext(),
      currentSession: generateSessionContext(),
      recentActivity: generateRecentActivity(),
    };

    return {
      ...baseContext,
      productivity: generateProductivityContext(),
      workPatterns: generateWorkPatternsContext(),
      recentTasks: getRecentTasks(),
      recentProjects: getRecentProjects(),
    };
  }, [
    generateUserContext,
    generateSessionContext,
    generateRecentActivity,
    generateProductivityContext,
    generateWorkPatternsContext,
    getRecentTasks,
    getRecentProjects,
  ]);

  // Actualizar contexto
  const updateContext = useCallback(async () => {
    setIsUpdating(true);
    try {
      const newContext = generateFullContext();
      setContextCache(newContext);
      setLastUpdateTime(new Date());
    } catch (error) {
      console.error('Error updating AI context:', error);
    } finally {
      setIsUpdating(false);
    }
  }, [generateFullContext]);

  // Forzar actualización del contexto
  const refreshContext = useCallback(() => {
    updateContext();
  }, [updateContext]);

  // Verificar si el contexto necesita actualización
  const needsUpdate = useMemo(() => {
    if (!contextCache) return true;
    
    const timeSinceUpdate = new Date().getTime() - lastUpdateTime.getTime();
    const updateInterval = finalConfig.contextRefreshInterval! * 1000;
    
    return timeSinceUpdate > updateInterval;
  }, [contextCache, lastUpdateTime, finalConfig.contextRefreshInterval]);

  // Obtener contexto optimizado (con cache)
  const getOptimizedContext = useCallback((): ExtendedAIContext => {
    if (needsUpdate || !contextCache) {
      // Si necesita actualización, generar contexto fresco
      return generateFullContext();
    }
    
    // Usar contexto en cache pero actualizar información temporal
    return {
      ...contextCache,
      currentSession: generateSessionContext(),
    };
  }, [needsUpdate, contextCache, generateFullContext, generateSessionContext]);

  // Auto-actualización periódica
  useEffect(() => {
    if (!finalConfig.enableRealtimeUpdates) return;

    const interval = setInterval(() => {
      if (needsUpdate) {
        updateContext();
      }
    }, 30000); // Verificar cada 30 segundos

    return () => clearInterval(interval);
  }, [finalConfig.enableRealtimeUpdates, needsUpdate, updateContext]);

  // Actualización inicial
  useEffect(() => {
    updateContext();
  }, [user?.id]); // Solo cuando cambie el usuario

  // Detectar cambios en datos relevantes
  useEffect(() => {
    if (finalConfig.enableRealtimeUpdates) {
      updateContext();
    }
  }, [mainTasks.length, projects.length, generalStats, updateContext, finalConfig.enableRealtimeUpdates]);

  // API para componentes externos
  const contextAPI = {
    // Contexto actual
    currentContext: getOptimizedContext(),
    
    // Estado de actualización
    isUpdating,
    lastUpdateTime,
    
    // Controles manuales
    refreshContext,
    
    // Información de configuración
    config: finalConfig,
    
    // Utilidades de contexto
    getBaseContext: () => ({
      userInfo: generateUserContext(),
      currentSession: generateSessionContext(),
      recentActivity: generateRecentActivity(),
    }),
    
    // Verificaciones de estado
    hasActiveContext: !!contextCache,
    needsUpdate,
    
    // Contexto simplificado para prompts básicos
    getSimpleContext: (): SmartPromptContext => ({
      userInfo: generateUserContext(),
      currentSession: generateSessionContext(),
      recentActivity: generateRecentActivity(),
    }),
  };

  return contextAPI;
};

// Hook simplificado para casos básicos
export const useSimpleAIContext = (): SmartPromptContext => {
  const { getSimpleContext } = useAIContext({ 
    enableRealtimeUpdates: false,
    includeProductivityMetrics: false,
    includeWorkPatterns: false,
  });
  
  return getSimpleContext();
};

// Utilidad para crear contexto manual
export const createManualContext = (overrides: Partial<SmartPromptContext> = {}): SmartPromptContext => {
  const now = new Date();
  const hour = now.getHours();
  
  let timeOfDay: SmartPromptContext['currentSession']['timeOfDay'];
  if (hour >= 6 && hour < 12) timeOfDay = 'morning';
  else if (hour >= 12 && hour < 18) timeOfDay = 'afternoon';
  else if (hour >= 18 && hour < 22) timeOfDay = 'evening';
  else timeOfDay = 'night';

  const defaultContext: SmartPromptContext = {
    userInfo: {
      id: '',
      hasActiveTasks: false,
      hasActiveProjects: false,
      totalTasks: 0,
      completedTasks: 0,
      pendingTasks: 0,
    },
    currentSession: {
      timeOfDay,
      dayOfWeek: now.toLocaleDateString('es-ES', { weekday: 'long' }),
      isWeekend: [0, 6].includes(now.getDay()),
    },
    recentActivity: {
      recentCompletions: 0,
      workPattern: 'inactive',
    },
  };

  return { ...defaultContext, ...overrides };
};
