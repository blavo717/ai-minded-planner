import { useState, useCallback, useRef, useEffect } from 'react';
import { useLLMService } from '@/hooks/useLLMService';
import { useAuth } from '@/hooks/useAuth';
import { useTasks } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import { useToast } from '@/hooks/use-toast';
import { OptimizedRecommendationEngine } from '@/services/optimizedRecommendationEngine';
import { UserBehaviorAnalyzer } from '@/services/userBehaviorAnalyzer';
import { FeedbackLearningSystem } from '@/services/feedbackLearningSystem';
import { performanceMonitor } from '@/utils/performanceMonitor';

interface IntelligentMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  context?: {
    taskRecommendation?: any;
    behaviorAnalysis?: any;
    performanceMetrics?: any;
    actionSuggestions?: string[];
  };
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
  const { toast } = useToast();
  
  const engineRef = useRef<OptimizedRecommendationEngine | null>(null);
  const behaviorAnalyzerRef = useRef<UserBehaviorAnalyzer | null>(null);
  const learningSystemRef = useRef<FeedbackLearningSystem | null>(null);

  // Initialize intelligent systems
  useEffect(() => {
    if (user) {
      engineRef.current = new OptimizedRecommendationEngine(user.id);
      behaviorAnalyzerRef.current = new UserBehaviorAnalyzer(user.id);
      learningSystemRef.current = new FeedbackLearningSystem(user.id);
      
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
      
      // Generate contextual insights
      const context = {
        user: {
          id: user.id,
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

  const sendMessage = useCallback(async (content: string) => {
    if (!hasActiveConfiguration) {
      toast({
        title: 'Configuración requerida',
        description: 'Ve a Configuración > LLM para configurar tu API key.',
        variant: 'destructive',
      });
      return;
    }

    if (!content.trim()) return;

    setConnectionStatus('connecting');
    setIsLoading(true);

    // Add user message
    const userMessage: IntelligentMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      // Generate intelligent context
      const intelligentContext = await generateIntelligentContext();

      // Create enhanced system prompt
      const systemPrompt = `Eres un asistente de IA inteligente y contextual especializado en productividad y gestión de tareas. 

CONTEXTO DEL USUARIO:
${intelligentContext ? JSON.stringify(intelligentContext, null, 2) : 'Contexto no disponible'}

CAPACIDADES ESPECÍFICAS:
- Analizar patrones de productividad del usuario
- Generar recomendaciones inteligentes de tareas
- Proporcionar insights basados en comportamiento histórico
- Sugerir optimizaciones de flujo de trabajo
- Responder preguntas sobre proyectos y tareas actuales

INSTRUCCIONES:
1. Usa el contexto proporcionado para dar respuestas personalizadas y relevantes
2. Si el usuario pregunta sobre su productividad, usa los datos de comportamiento
3. Si pregunta qué hacer ahora, usa la recomendación actual
4. Si pregunta por sus tareas o proyectos, usa los datos actuales
5. Proporciona sugerencias actionables cuando sea apropiado
6. Mantén un tono profesional pero amigable
7. Si detectas patrones interesantes, compártelos

Fecha actual: ${new Date().toLocaleDateString('es-ES')}
Hora actual: ${new Date().toLocaleTimeString('es-ES')}`;

      const response = await makeLLMRequest({
        systemPrompt,
        userPrompt: content,
        functionName: 'intelligent_assistant_chat',
        temperature: 0.7,
        maxTokens: 1500,
      });

      // Add assistant response with context
      const assistantMessage: IntelligentMessage = {
        id: `assistant-${Date.now()}`,
        type: 'assistant',
        content: response.content,
        timestamp: new Date(),
        context: intelligentContext,
      };

      setMessages(prev => [...prev, assistantMessage]);
      setConnectionStatus('connected');

      // Record feedback for learning (using 'feedback_positive' as default for AI interactions)
      if (learningSystemRef.current && intelligentContext?.currentRecommendation) {
        await learningSystemRef.current.processFeedback({
          user_id: user!.id,
          task_id: intelligentContext.currentRecommendation.task.id,
          action: 'feedback_positive',
          context_data: {
            query: content,
            response_length: response.content.length,
            context_available: !!intelligentContext,
            interaction_type: 'ai_chat'
          }
        });
      }

    } catch (error) {
      console.error('Error in intelligent assistant:', error);
      
      setConnectionStatus('error');
      
      toast({
        title: 'Error en el asistente',
        description: 'No se pudo procesar tu mensaje. Intenta de nuevo.',
        variant: 'destructive',
      });

      const errorMessage: IntelligentMessage = {
        id: `error-${Date.now()}`,
        type: 'assistant',
        content: 'Lo siento, hubo un error procesando tu mensaje. Por favor intenta de nuevo.',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [hasActiveConfiguration, generateIntelligentContext, makeLLMRequest, user, toast]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setConnectionStatus(hasActiveConfiguration ? 'connected' : 'disconnected');
    toast({
      title: 'Chat limpiado',
      description: 'La conversación se ha limpiado correctamente.',
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
  };
};