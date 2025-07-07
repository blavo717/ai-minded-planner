import { useState, useCallback, useRef, useEffect } from 'react';
import { useLLMService } from '@/hooks/useLLMService';
import { useAuth } from '@/hooks/useAuth';
import { useTasks } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';
import { OptimizedRecommendationEngine } from '@/services/optimizedRecommendationEngine';
import { UserBehaviorAnalyzer } from '@/services/userBehaviorAnalyzer';
import { FeedbackLearningSystem } from '@/services/feedbackLearningSystem';
import { performanceMonitor } from '@/utils/performanceMonitor';
import { BasicProactiveAlerts, DeadlineAlert } from '@/services/basicProactiveAlerts';
import { PersonalizedProactiveAlerts } from '@/services/personalizedProactiveAlerts';
import { IntelligentAssistantService } from '@/services/ai/intelligentAssistantService';

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
  
  const engineRef = useRef<OptimizedRecommendationEngine | null>(null);
  const behaviorAnalyzerRef = useRef<UserBehaviorAnalyzer | null>(null);
  const learningSystemRef = useRef<FeedbackLearningSystem | null>(null);
  
  // ✅ CHECKPOINT 1.2.1: Sistema de Asistente Inteligente Dinámico
  const intelligentAssistantRef = useRef<IntelligentAssistantService | null>(null);
  
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
      
      // ✅ CHECKPOINT 1.1: Contexto personal expandido con datos del perfil
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
  }, [user, tasks, projects]);

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
      // ✅ CHECKPOINT 1.2.1: Usar sistema dinámico en lugar de prompt estático
      const intelligentContext = await generateIntelligentContext();
      
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