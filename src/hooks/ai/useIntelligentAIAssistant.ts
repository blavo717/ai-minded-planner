import { useState, useCallback, useRef, useEffect } from 'react';
import { useLLMService } from '@/hooks/useLLMService';
import { useAuth } from '@/hooks/useAuth';
import { useTasks } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';
// ✅ CHECKPOINT 2.2: Integración de hooks adicionales para contexto rico
import { useTaskLogs } from '@/hooks/useTaskLogs';
import { useTaskSessions } from '@/hooks/useTaskSessions';
import { useProductivityPreferences } from '@/hooks/useProductivityPreferences';
import { useTaskAssignments } from '@/hooks/useTaskAssignments';
import { OptimizedRecommendationEngine } from '@/services/optimizedRecommendationEngine';
import { UserBehaviorAnalyzer } from '@/services/userBehaviorAnalyzer';
import { FeedbackLearningSystem } from '@/services/feedbackLearningSystem';
import { performanceMonitor } from '@/utils/performanceMonitor';
import { BasicProactiveAlerts, DeadlineAlert } from '@/services/basicProactiveAlerts';
import { PersonalizedProactiveAlerts } from '@/services/personalizedProactiveAlerts';
import { IntelligentAssistantService } from '@/services/ai/intelligentAssistantService';
import { TimeBasedRecommendationEngine } from '@/services/ai/timeBasedRecommendationEngine';

interface IntelligentMessage {
  id: string;
  type: 'user' | 'assistant' | 'proactive_alert';
  content: string;
  timestamp: Date;
  context?: {
    taskRecommendation?: any;
    behaviorAnalysis?: any;
    performanceMetrics?: any;
    actionSuggestions?: string[];
  };
  proactiveAlert?: DeadlineAlert;
}

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export const useIntelligentAIAssistant = () => {
  const [messages, setMessages] = useState<IntelligentMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [conversationId] = useState(() => `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  
  const { user } = useAuth();
  const { makeLLMRequest, hasActiveConfiguration, activeModel } = useLLMService();
  const { tasks } = useTasks();
  const { projects } = useProjects();
  const { profile } = useProfile();
  const { toast } = useToast();
  
  // ✅ CHECKPOINT 2.2: Hooks adicionales para contexto rico
  const { sessions: taskSessions = [] } = useTaskSessions();
  const { preferences: productivityPreferences } = useProductivityPreferences();
  const { taskAssignments } = useTaskAssignments();
  
  const engineRef = useRef<OptimizedRecommendationEngine | null>(null);
  const behaviorAnalyzerRef = useRef<UserBehaviorAnalyzer | null>(null);
  const learningSystemRef = useRef<FeedbackLearningSystem | null>(null);
  
  // ✅ CHECKPOINT 1.2.1: Sistema de Asistente Inteligente Dinámico
  const intelligentAssistantRef = useRef<IntelligentAssistantService | null>(null);
  
  // ✅ CHECKPOINT 1.2.2: Motor de Recomendaciones Temporal
  const timeBasedEngineRef = useRef<TimeBasedRecommendationEngine | null>(null);
  
  // ✅ SPRINT 3: Sistema de alertas proactivas personalizadas
  const proactiveAlertsRef = useRef<PersonalizedProactiveAlerts | null>(null);

  // Initialize intelligent systems
  useEffect(() => {
    if (user) {
      engineRef.current = new OptimizedRecommendationEngine(user.id);
      behaviorAnalyzerRef.current = new UserBehaviorAnalyzer(user.id);
      learningSystemRef.current = new FeedbackLearningSystem(user.id);
      
      // ✅ CHECKPOINT 1.2.1: Inicializar sistema inteligente dinámico
      intelligentAssistantRef.current = new IntelligentAssistantService(user.id);
      
      // ✅ CHECKPOINT 1.2.2: Inicializar motor de recomendaciones temporal
      timeBasedEngineRef.current = new TimeBasedRecommendationEngine();
      
      // ✅ SPRINT 3: Inicializar sistema personalizado de alertas
      proactiveAlertsRef.current = new PersonalizedProactiveAlerts(user.id);
      proactiveAlertsRef.current.ensureDefaultPreferences();
      
      // Preload for better performance
      engineRef.current.preloadUserBehavior();
      setConnectionStatus(hasActiveConfiguration ? 'connected' : 'disconnected');
    }
  }, [user, hasActiveConfiguration]);

  // Generate intelligent context for the assistant
  const generateIntelligentContext = useCallback(async () => {
    if (!user || !engineRef.current || !behaviorAnalyzerRef.current) return null;

    performanceMonitor.startTimer('intelligent_context_generation');

    try {
      // Get current recommendation
      const recommendation = await engineRef.current.generateOptimizedRecommendation(tasks);
      
      // Get behavior analysis
      const behaviorAnalysis = await behaviorAnalyzerRef.current.analyzeUserBehavior();
      
      // Get performance metrics
      const performanceMetrics = performanceMonitor.getMetrics();
      
      // ✅ CHECKPOINT 1.2.2: Generar datos específicos de tareas
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      const urgentTasks = tasks.filter(t => {
        if (!t.due_date || t.status === 'completed') return false;
        const dueDate = new Date(t.due_date);
        return dueDate <= today;
      });

      const overdueTasks = tasks.filter(t => {
        if (!t.due_date || t.status === 'completed') return false;
        const dueDate = new Date(t.due_date);
        return dueDate < today;
      });

      const inProgressTasks = tasks.filter(t => t.status === 'in_progress' && !t.is_archived);
      const quickWinTasks = tasks.filter(t => 
        t.status === 'pending' && !t.is_archived && (t.estimated_duration || 30) <= 15
      );

      // ✅ CHECKPOINT 1.4: Contexto personal completo expandido
      const context = {
        user: {
          id: user.id,
          name: profile?.full_name || "Compañero",
          role: profile?.role || null,
          department: profile?.department || null,
          timezone: profile?.timezone || 'UTC',
          tasksCount: tasks.length,
          projectsCount: projects.length,
          completedTasksToday: tasks.filter(t => 
            t.status === 'completed' && 
            new Date(t.completed_at || '').toDateString() === new Date().toDateString()
          ).length,
          // ✅ CHECKPOINT 1.4: Datos históricos y patrones de trabajo
          lastActivity: generateLastActivity(tasks),
          workPatterns: generateWorkPatterns(tasks, behaviorAnalysis),
          personalizedReferences: generatePersonalizedReferences(profile, behaviorAnalysis)
        },
        // ✅ CHECKPOINT 2.1: Expandir contexto de tareas con jerarquía completa
        tasks: {
          hierarchy: await generateTaskHierarchy(tasks),
          urgentToday: urgentTasks,
          overdue: overdueTasks,
          inProgress: inProgressTasks,
          quickWins: quickWinTasks,
          specificTasks: {
            urgent: urgentTasks.map(t => ({
              id: t.id,
              title: t.title,
              dueDate: t.due_date,
              estimatedDuration: t.estimated_duration
            })),
            overdue: overdueTasks.map(t => ({
              id: t.id,
              title: t.title,
              daysOverdue: Math.ceil((now.getTime() - new Date(t.due_date!).getTime()) / (1000 * 60 * 60 * 24)),
              estimatedDuration: t.estimated_duration
            })),
            inProgress: inProgressTasks.map(t => ({
              id: t.id,
              title: t.title,
              estimatedDuration: t.estimated_duration
            })),
            quickWins: quickWinTasks.map(t => ({
              id: t.id,
              title: t.title,
              estimatedDuration: t.estimated_duration || 15
            }))
          }
        },
        // ✅ CHECKPOINT 2.2: Datos adicionales de contexto rico
        projects: {
          activeProjects: projects,
          projectsWithProgress: generateProjectsWithProgress(projects, tasks)
        },
        sessions: {
          recentSessions: taskSessions.slice(0, 10),
          totalSessions: taskSessions.length,
          sessionPatterns: generateSessionPatterns(taskSessions)
        },
        preferences: {
          productivity: productivityPreferences,
          workingHours: productivityPreferences ? 
            `${productivityPreferences.work_hours_start}:00 - ${productivityPreferences.work_hours_end}:00` : 
            'No configuradas',
          energySchedule: productivityPreferences?.energy_schedule
        },
        assignments: {
          taskAssignments: taskAssignments,
          totalAssignments: taskAssignments.length,
          collaborationLevel: generateCollaborationLevel(taskAssignments)
        },
        currentRecommendation: recommendation,
        behaviorInsights: behaviorAnalysis.insights,
        productivityProfile: behaviorAnalysis.profile,
        performanceMetrics: {
          averageRecommendationTime: performanceMetrics
            .filter(m => m.name === 'recommendation_generation')
            .reduce((sum, m) => sum + m.duration, 0) / Math.max(1, performanceMetrics.filter(m => m.name === 'recommendation_generation').length),
          totalMetrics: performanceMetrics.length
        },
        currentDateTime: new Date().toISOString(),
        actionSuggestions: generateActionSuggestions(tasks, projects, recommendation)
      };

      performanceMonitor.endTimer('intelligent_context_generation');
      return context;
    } catch (error) {
      performanceMonitor.endTimer('intelligent_context_generation');
      console.error('Error generating intelligent context:', error);
      return null;
    }
  }, [user, tasks, projects, profile, taskSessions, productivityPreferences, taskAssignments]);

  // ✅ CHECKPOINT 1.4: Generadores de contexto personal completo
  const generateLastActivity = useCallback((tasks: any[]) => {
    const recentTasks = tasks
      .filter(t => t.updated_at)
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 3);

    if (recentTasks.length === 0) return "Sin actividad reciente registrada";

    const lastTask = recentTasks[0];
    const timeDiff = new Date().getTime() - new Date(lastTask.updated_at).getTime();
    const hoursAgo = Math.floor(timeDiff / (1000 * 60 * 60));
    
    return {
      lastTaskWorked: lastTask.title,
      timeAgo: hoursAgo < 24 ? `hace ${hoursAgo}h` : `hace ${Math.floor(hoursAgo / 24)} días`,
      recentActivity: recentTasks.map(t => ({
        title: t.title,
        status: t.status,
        updated: new Date(t.updated_at).toLocaleDateString('es-ES')
      }))
    };
  }, []);

  const generateWorkPatterns = useCallback((tasks: any[], behaviorAnalysis: any) => {
    const completedTasks = tasks.filter(t => t.status === 'completed');
    const patterns = [];

    // Patrón de horarios productivos
    if (behaviorAnalysis?.profile?.optimalHours?.length > 0) {
      const hours = behaviorAnalysis.profile.optimalHours;
      patterns.push(`Más productivo entre las ${hours[0]}:00 y ${hours[hours.length-1]}:00`);
    }

    // Patrón de tipos de tareas preferidas
    if (behaviorAnalysis?.profile?.preferredTags?.length > 0) {
      patterns.push(`Prefiere tareas de tipo: ${behaviorAnalysis.profile.preferredTags.join(', ')}`);
    }

    // Patrón de duración promedio
    if (completedTasks.length > 0) {
      const avgDuration = completedTasks
        .filter(t => t.actual_duration)
        .reduce((sum, t) => sum + (t.actual_duration || 0), 0) / completedTasks.length;
      
      if (avgDuration > 0) {
        patterns.push(`Duración promedio de tareas: ${Math.round(avgDuration)} minutos`);
      }
    }

    return patterns.length > 0 ? patterns : ["Construyendo patrones de trabajo..."];
  }, []);

  const generatePersonalizedReferences = useCallback((profile: any, behaviorAnalysis: any) => {
    const references = [];

    // Referencias por rol
    if (profile?.role) {
      references.push(`Como ${profile.role.toLowerCase()} que eres`);
    }

    // Referencias por departamento
    if (profile?.department) {
      references.push(`En tu trabajo en ${profile.department}`);
    }

    // Referencias por patrones de productividad
    if (behaviorAnalysis?.profile?.optimalHours?.length > 0) {
      const hours = behaviorAnalysis.profile.optimalHours;
      if (hours.includes(new Date().getHours())) {
        references.push("En tu horario más productivo");
      }
    }

    // Referencias por comportamiento
    if (behaviorAnalysis?.insights?.length > 0) {
      const strengthInsights = behaviorAnalysis.insights.filter((i: any) => i.type === 'strength');
      if (strengthInsights.length > 0) {
        references.push(`Considerando tu fortaleza en ${strengthInsights[0].title.toLowerCase()}`);
      }
    }

    return references.length > 0 ? references : [""];
  }, []);

  // ✅ CHECKPOINT 2.1: Generador de jerarquía completa de tareas
  const generateTaskHierarchy = useCallback(async (tasks: any[]) => {
    // Organizar tareas por jerarquía: tareas principales -> subtareas -> microtareas
    const mainTasks = tasks.filter(t => t.task_level === 1);
    const subtasks = tasks.filter(t => t.task_level === 2);
    const microtasks = tasks.filter(t => t.task_level === 3);

    const hierarchy = mainTasks.map(mainTask => {
      // Encontrar subtareas de esta tarea principal
      const taskSubtasks = subtasks.filter(st => st.parent_task_id === mainTask.id);
      
      // Para cada subtarea, encontrar sus microtareas
      const subtasksWithMicros = taskSubtasks.map(subtask => {
        const taskMicrotasks = microtasks.filter(mt => mt.parent_task_id === subtask.id);
        
        return {
          ...subtask,
          microtasks: taskMicrotasks,
          microtaskCount: taskMicrotasks.length,
          completedMicrotasks: taskMicrotasks.filter(mt => mt.status === 'completed').length
        };
      });

      // Calcular progreso total
      const totalSubtasks = subtasksWithMicros.length;
      const completedSubtasks = subtasksWithMicros.filter(st => st.status === 'completed').length;
      const totalMicrotasks = subtasksWithMicros.reduce((sum, st) => sum + st.microtaskCount, 0);
      const completedMicrotasks = subtasksWithMicros.reduce((sum, st) => sum + st.completedMicrotasks, 0);

      return {
        ...mainTask,
        subtasks: subtasksWithMicros,
        subtaskCount: totalSubtasks,
        completedSubtasks,
        microtaskCount: totalMicrotasks,
        completedMicrotasks,
        progressPercent: totalSubtasks > 0 ? 
          Math.round(((completedSubtasks * 0.7) + (completedMicrotasks / Math.max(1, totalMicrotasks) * 0.3)) * 100) :
          mainTask.status === 'completed' ? 100 : 0
      };
    });

    return hierarchy;
  }, []);

  // ✅ CHECKPOINT 2.2: Generadores de contexto rico adicional
  const generateProjectsWithProgress = useCallback((projects: any[], tasks: any[]) => {
    return projects.map(project => {
      const projectTasks = tasks.filter(t => t.project_id === project.id);
      const completedTasks = projectTasks.filter(t => t.status === 'completed');
      const progressPercent = projectTasks.length > 0 ? 
        Math.round((completedTasks.length / projectTasks.length) * 100) : 0;
      
      return {
        ...project,
        taskCount: projectTasks.length,
        completedTaskCount: completedTasks.length,
        progressPercent,
        urgentTasks: projectTasks.filter(t => t.priority === 'high' || t.priority === 'urgent').length
      };
    });
  }, []);

  const generateSessionPatterns = useCallback((sessions: any[]) => {
    if (sessions.length === 0) return ["Sin sesiones registradas"];
    
    const patterns = [];
    
    // Promedio de productividad
    const avgProductivity = sessions
      .filter(s => s.productivity_score)
      .reduce((sum, s) => sum + s.productivity_score, 0) / Math.max(1, sessions.filter(s => s.productivity_score).length);
    
    if (avgProductivity > 0) {
      patterns.push(`Productividad promedio: ${Math.round(avgProductivity)}/10`);
    }
    
    // Duración promedio de sesiones
    const avgDuration = sessions
      .filter(s => s.duration_minutes)
      .reduce((sum, s) => sum + s.duration_minutes, 0) / Math.max(1, sessions.filter(s => s.duration_minutes).length);
    
    if (avgDuration > 0) {
      patterns.push(`Duración promedio de sesión: ${Math.round(avgDuration)} minutos`);
    }
    
    // Sesiones recientes
    const recentSessions = sessions.slice(0, 5).length;
    patterns.push(`${recentSessions} sesiones recientes registradas`);
    
    return patterns;
  }, []);

  const generateCollaborationLevel = useCallback((assignments: any[]) => {
    if (assignments.length === 0) return "Trabajo individual";
    
    const roles = assignments.map(a => a.role_in_task);
    const uniqueRoles = [...new Set(roles)];
    
    if (assignments.length >= 5) return "Alta colaboración";
    if (assignments.length >= 3) return "Colaboración moderada";
    if (assignments.length >= 1) return "Colaboración básica";
    
    return "Trabajo individual";
  }, []);

  const generateActionSuggestions = (tasks: any[], projects: any[], recommendation: any) => {
    const suggestions = [];
    
    if (recommendation) {
      suggestions.push(`Trabajar en "${recommendation.task.title}" (confianza ${Math.round(recommendation.confidence)}%)`);
    }
    
    const overdueTasks = tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed');
    if (overdueTasks.length > 0) {
      suggestions.push(`Revisar ${overdueTasks.length} tarea(s) vencida(s)`);
    }
    
    const highPriorityTasks = tasks.filter(t => t.priority === 'high' && t.status !== 'completed');
    if (highPriorityTasks.length > 0) {
      suggestions.push(`Priorizar ${highPriorityTasks.length} tarea(s) de alta prioridad`);
    }
    
    return suggestions;
  };

  // ✅ SPRINT 3: Funcionalidad proactiva personalizada para detectar deadlines
  const checkForProactiveAlerts = useCallback(async () => {
    if (!tasks.length || !proactiveAlertsRef.current) return;

    const alert = await proactiveAlertsRef.current.checkForPersonalizedDeadlineAlerts(tasks, conversationId);
    
    if (alert) {
      const proactiveMessage: IntelligentMessage = {
        id: `proactive-${Date.now()}`,
        type: 'proactive_alert',
        content: `📅 ${alert.title}\n\n${alert.message}`,
        timestamp: new Date(),
        proactiveAlert: alert,
      };

      setMessages(prev => [...prev, proactiveMessage]);
      
      console.log('✅ Alerta proactiva personalizada mostrada:', alert.title);
    }
  }, [tasks, conversationId]);

  const handleProactiveAction = useCallback(async (alert: DeadlineAlert) => {
    console.log('🎯 Acción proactiva ejecutada:', alert.actionType, alert.task.title);
    
    // ✅ SPRINT 3: Registrar efectividad de la alerta
    if (proactiveAlertsRef.current) {
      await proactiveAlertsRef.current.recordAlertEffectiveness({
        alert_id: alert.id,
        alert_type: alert.type,
        user_action: 'accepted',
        relevance_score: 5, // Máxima relevancia por aceptación
        context_data: {
          task_id: alert.task.id,
          severity: alert.severity,
          days_until_due: alert.daysUntilDue,
          action_type: alert.actionType
        }
      });
    }
    
    // Simular acción (en implementación real podría abrir modal de tarea o marcar como en progreso)
    toast({
      title: 'Acción ejecutada',
      description: `Tarea "${alert.task.title}" lista para trabajar.`,
    });
  }, [toast]);

  const handleProactiveDismiss = useCallback(async (alertId: string) => {
    console.log('❌ Alerta proactiva descartada:', alertId);
    
    // ✅ SPRINT 3: Registrar dismissal para aprendizaje
    if (proactiveAlertsRef.current) {
      await proactiveAlertsRef.current.recordAlertEffectiveness({
        alert_id: alertId,
        alert_type: 'deadline_warning',
        user_action: 'dismissed',
        relevance_score: 2, // Baja relevancia por dismissal
        context_data: {
          dismissed_at: new Date().toISOString()
        }
      });
    }
    
    toast({
      title: 'Alerta descartada',
      description: 'Te recordaré en la próxima sesión si sigue siendo relevante.',
    });
  }, [toast]);

  const sendMessage = useCallback(async (content: string) => {
    if (!hasActiveConfiguration) {
      toast({
        title: 'Configuración requerida',
        description: 'Ve a Configuración > LLM para configurar tu API key.',
        variant: 'destructive',
      });
      return;
    }

    if (!content.trim() || !intelligentAssistantRef.current) return;

    setConnectionStatus('connecting');
    setIsLoading(true);

    // Add user message to local state
    const userMessage: IntelligentMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      // ✅ CHECKPOINT 1.2.2: Detectar intención temporal y generar recomendaciones específicas
      const timeIntention = timeBasedEngineRef.current?.detectTimeIntention(content.trim()) || { hasTimeIntention: false };
      
      // ✅ CHECKPOINT 1.2.1: Usar sistema dinámico en lugar de prompt estático
      const intelligentContext = await generateIntelligentContext();
      
      // ✅ CHECKPOINT 1.2.2: Agregar recomendaciones basadas en tiempo si es relevante
      if (timeIntention.hasTimeIntention && timeBasedEngineRef.current && intelligentContext) {
        const timeBasedRecommendations = timeBasedEngineRef.current.generateTimeBasedRecommendations(
          tasks, 
          timeIntention.minutes || 30
        );
        
        (intelligentContext.tasks as any).timeBasedRecommendations = timeBasedRecommendations;
      }
      
      // Procesar mensaje con el sistema inteligente
      const response = await intelligentAssistantRef.current.processUserMessage(
        content.trim(),
        intelligentContext,
        makeLLMRequest
      );

      // Add assistant response - SIN INFORMACIÓN DE DEBUG
      const assistantMessage: IntelligentMessage = {
        id: `assistant-${Date.now()}`,
        type: 'assistant',
        content: response.content,
        timestamp: new Date(),
        // Sin contexto visible para el usuario - solo funcionalidad interna
      };

      setMessages(prev => [...prev, assistantMessage]);
      setConnectionStatus('connected');

      // Registrar feedback para aprendizaje
      if (learningSystemRef.current && intelligentContext?.currentRecommendation) {
        await learningSystemRef.current.processFeedback({
          user_id: user!.id,
          task_id: intelligentContext.currentRecommendation.task.id,
          action: 'feedback_positive',
          context_data: {
            query: content,
            response_length: response.content.length,
            confidence: response.confidence,
            was_repetitive: response.confidence < 0.8,
            interaction_type: 'dynamic_ai_chat'
          }
        });
      }

      // Verificar alertas proactivas después de respuesta
      checkForProactiveAlerts();

    } catch (error) {
      console.error('Error in dynamic intelligent assistant:', error);
      
      setConnectionStatus('error');
      
      toast({
        title: 'Error en el asistente',
        description: 'No se pudo procesar tu mensaje. Intenta de nuevo.',
        variant: 'destructive',
      });

      const errorMessage: IntelligentMessage = {
        id: `error-${Date.now()}`,
        type: 'assistant',
        content: 'Lo siento, hubo un error procesando tu mensaje. ¿Puedes intentar de nuevo?',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [hasActiveConfiguration, generateIntelligentContext, makeLLMRequest, user, toast, checkForProactiveAlerts]);

  const clearChat = useCallback(async () => {
    setMessages([]);
    setConnectionStatus(hasActiveConfiguration ? 'connected' : 'disconnected');
    
    // ✅ CHECKPOINT 1.2.1: Limpiar memoria conversacional del sistema dinámico
    if (intelligentAssistantRef.current) {
      await intelligentAssistantRef.current.clearConversation();
    }
    
    // ✅ SPRINT 3: Reset alertas proactivas para nueva sesión
    if (proactiveAlertsRef.current) {
      proactiveAlertsRef.current.resetSession();
    }
    
    toast({
      title: 'Chat limpiado',
      description: 'Nueva conversación iniciada.',
    });
  }, [hasActiveConfiguration, toast]);

  const exportConversation = useCallback(() => {
    const exportData = {
      conversationId,
      timestamp: new Date().toISOString(),
      messages,
      userContext: {
        userId: user?.id,
        tasksCount: tasks.length,
        projectsCount: projects.length,
      },
      activeModel,
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `intelligent-conversation-${conversationId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [conversationId, messages, user, tasks, projects, activeModel]);

  return {
    messages,
    isLoading,
    connectionStatus,
    sendMessage,
    clearChat,
    exportConversation,
    hasConfiguration: hasActiveConfiguration,
    conversationId,
    contextAvailable: true,
    messageCount: messages.length,
    activeModel,
    userContext: {
      tasksCount: tasks.length,
      projectsCount: projects.length,
      userId: user?.id,
    },
    // ✅ SPRINT 2: Funciones para manejo de alertas proactivas  
    handleProactiveAction,
    handleProactiveDismiss,
  };
};