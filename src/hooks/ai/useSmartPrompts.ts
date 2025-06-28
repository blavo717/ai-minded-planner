
import { useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTasks } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import { useGeneralStats } from '@/hooks/analytics/useGeneralStats';

export interface SmartPromptContext {
  userInfo: {
    id: string;
    hasActiveTasks: boolean;
    hasActiveProjects: boolean;
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
  };
  currentSession: {
    timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
    dayOfWeek: string;
    isWeekend: boolean;
  };
  recentActivity: {
    lastTaskUpdate?: Date;
    recentCompletions: number;
    workPattern: 'productive' | 'moderate' | 'low' | 'inactive';
  };
}

export interface SmartPromptOptions {
  type: 'general' | 'task-focused' | 'project-planning' | 'productivity-analysis' | 'quick-help';
  includeData?: boolean;
  maxDataPoints?: number;
  tone?: 'professional' | 'friendly' | 'motivational' | 'analytical';
}

export const useSmartPrompts = () => {
  const { user } = useAuth();
  const { mainTasks } = useTasks();
  const { projects } = useProjects();
  const { data: generalStats } = useGeneralStats();
  
  const [lastGeneratedPrompt, setLastGeneratedPrompt] = useState<string>('');

  // Generar contexto actual del usuario
  const generateContext = useCallback((): SmartPromptContext => {
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.toLocaleDateString('es-ES', { weekday: 'long' });
    
    // Determinar momento del día
    let timeOfDay: SmartPromptContext['currentSession']['timeOfDay'];
    if (hour >= 6 && hour < 12) timeOfDay = 'morning';
    else if (hour >= 12 && hour < 18) timeOfDay = 'afternoon';
    else if (hour >= 18 && hour < 22) timeOfDay = 'evening';
    else timeOfDay = 'night';

    // Analizar actividad reciente
    const completedToday = mainTasks.filter(task => 
      task.status === 'completed' && 
      task.completed_at && 
      new Date(task.completed_at).toDateString() === now.toDateString()
    ).length;

    const lastTaskUpdate = mainTasks.length > 0 ? 
      new Date(Math.max(...mainTasks.map(t => new Date(t.updated_at).getTime()))) : 
      undefined;

    let workPattern: SmartPromptContext['recentActivity']['workPattern'] = 'inactive';
    if (completedToday >= 5) workPattern = 'productive';
    else if (completedToday >= 3) workPattern = 'moderate';
    else if (completedToday >= 1) workPattern = 'low';

    return {
      userInfo: {
        id: user?.id || '',
        hasActiveTasks: (generalStats?.pendingTasks || 0) > 0,
        hasActiveProjects: (generalStats?.activeProjects || 0) > 0,
        totalTasks: generalStats?.totalTasks || 0,
        completedTasks: generalStats?.completedTasks || 0,
        pendingTasks: generalStats?.pendingTasks || 0,
      },
      currentSession: {
        timeOfDay,
        dayOfWeek,
        isWeekend: [0, 6].includes(now.getDay()),
      },
      recentActivity: {
        lastTaskUpdate,
        recentCompletions: completedToday,
        workPattern,
      }
    };
  }, [user, mainTasks, generalStats]);

  // Generar prompt base según el contexto
  const generateBasePrompt = useCallback((context: SmartPromptContext, options: SmartPromptOptions): string => {
    const { userInfo, currentSession, recentActivity } = context;
    const { type, tone = 'friendly' } = options;

    // Saludo contextual
    let greeting = '';
    switch (currentSession.timeOfDay) {
      case 'morning':
        greeting = '¡Buenos días!';
        break;
      case 'afternoon':
        greeting = '¡Buenas tardes!';
        break;
      case 'evening':
        greeting = '¡Buenas tardes!';
        break;
      case 'night':
        greeting = '¡Buenas noches!';
        break;
    }

    // Contexto de productividad
    let productivityContext = '';
    switch (recentActivity.workPattern) {
      case 'productive':
        productivityContext = 'Veo que has sido muy productivo hoy. ¡Excelente trabajo!';
        break;
      case 'moderate':
        productivityContext = 'Has tenido un buen ritmo de trabajo hoy.';
        break;
      case 'low':
        productivityContext = 'Has comenzado a trabajar en tus tareas hoy.';
        break;
      case 'inactive':
        productivityContext = currentSession.timeOfDay === 'morning' ? 
          '¡Es un buen momento para comenzar el día!' : 
          'Aún hay tiempo para avanzar en tus objetivos.';
        break;
    }

    // Contexto de tareas
    let taskContext = '';
    if (userInfo.hasActiveTasks) {
      taskContext = `Tienes ${userInfo.pendingTasks} tareas pendientes`;
      if (userInfo.hasActiveProjects) {
        taskContext += ` distribuidas en tus proyectos activos`;
      }
    } else {
      taskContext = '¡Parece que tienes todo al día!';
    }

    // Prompt base según tipo
    let basePrompt = `${greeting} Soy tu asistente de productividad personal. `;
    
    switch (type) {
      case 'general':
        basePrompt += `${productivityContext} ${taskContext}. ¿En qué puedo ayudarte hoy?`;
        break;
      case 'task-focused':
        basePrompt += `Te ayudo con la gestión de tareas. ${taskContext}. `;
        break;
      case 'project-planning':
        basePrompt += `Soy especialista en planificación de proyectos. `;
        if (userInfo.hasActiveProjects) {
          basePrompt += `Veo que tienes proyectos en curso. `;
        }
        break;
      case 'productivity-analysis':
        basePrompt += `Analicemos tu productividad. ${productivityContext} `;
        break;
      case 'quick-help':
        basePrompt += `¿Necesitas ayuda rápida? `;
        break;
    }

    return basePrompt;
  }, []);

  // Enriquecer prompt con datos específicos
  const enrichPromptWithData = useCallback((basePrompt: string, context: SmartPromptContext, options: SmartPromptOptions): string => {
    if (!options.includeData) return basePrompt;

    const { userInfo } = context;
    const maxPoints = options.maxDataPoints || 3;
    
    let dataContext = '\n\nDatos relevantes:\n';
    let dataPoints = 0;

    // Agregar información de tareas si es relevante
    if (userInfo.hasActiveTasks && dataPoints < maxPoints) {
      dataContext += `• Tareas pendientes: ${userInfo.pendingTasks}\n`;
      dataPoints++;
    }

    if (userInfo.completedTasks > 0 && dataPoints < maxPoints) {
      dataContext += `• Tareas completadas: ${userInfo.completedTasks}\n`;
      dataPoints++;
    }

    // Agregar información de proyectos
    if (userInfo.hasActiveProjects && dataPoints < maxPoints) {
      const activeProjects = projects.filter(p => p.status === 'active');
      if (activeProjects.length > 0) {
        dataContext += `• Proyectos activos: ${activeProjects.map(p => p.name).join(', ')}\n`;
        dataPoints++;
      }
    }

    return dataPoints > 0 ? basePrompt + dataContext : basePrompt;
  }, [projects]);

  // Función principal para generar prompts inteligentes
  const generateSmartPrompt = useCallback((options: SmartPromptOptions): string => {
    const context = generateContext();
    const basePrompt = generateBasePrompt(context, options);
    const enrichedPrompt = enrichPromptWithData(basePrompt, context, options);
    
    setLastGeneratedPrompt(enrichedPrompt);
    return enrichedPrompt;
  }, [generateContext, generateBasePrompt, enrichPromptWithData]);

  // Obtener prompt contextual para diferentes situaciones
  const getContextualSystemPrompt = useCallback((): string => {
    const context = generateContext();
    
    let systemPrompt = `Eres un asistente de productividad inteligente especializado en ayudar con tareas y proyectos. `;
    
    // Contexto del usuario actual
    systemPrompt += `El usuario tiene ${context.userInfo.totalTasks} tareas en total, `;
    systemPrompt += `${context.userInfo.completedTasks} completadas y ${context.userInfo.pendingTasks} pendientes. `;
    
    if (context.userInfo.hasActiveProjects) {
      systemPrompt += `Tiene proyectos activos en los que está trabajando. `;
    }

    // Contexto temporal
    systemPrompt += `Es ${context.currentSession.dayOfWeek} por la ${context.currentSession.timeOfDay}`;
    if (context.currentSession.isWeekend) {
      systemPrompt += ` (fin de semana)`;
    }
    systemPrompt += `. `;

    // Contexto de productividad
    switch (context.recentActivity.workPattern) {
      case 'productive':
        systemPrompt += `El usuario ha sido muy productivo hoy. `;
        break;
      case 'moderate':
        systemPrompt += `El usuario ha tenido actividad moderada hoy. `;
        break;
      case 'low':
        systemPrompt += `El usuario ha tenido poca actividad hoy. `;
        break;
      case 'inactive':
        systemPrompt += `El usuario no ha registrado actividad hoy. `;
        break;
    }

    systemPrompt += `Proporciona respuestas útiles, concisas y adaptadas a su situación actual. `;
    systemPrompt += `Si el usuario pregunta sobre sus tareas o proyectos, usa la información de contexto disponible.`;

    return systemPrompt;
  }, [generateContext]);

  // Memoizar el contexto actual para optimización
  const currentContext = useMemo(() => generateContext(), [generateContext]);

  return {
    generateSmartPrompt,
    getContextualSystemPrompt,
    currentContext,
    lastGeneratedPrompt,
  };
};
