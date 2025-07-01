
import { useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { IntelligentAction, IntelligentActionContext, DraftEmailContent } from '@/types/intelligent-actions';
import { usePhase6Advanced } from './usePhase6Advanced';
import { usePatternTracking } from '@/hooks/usePatternTracking';
import { useLLMService } from '@/hooks/useLLMService';
import { useProactiveNotifications } from './useProactiveNotifications';
import { Task } from '@/hooks/useTasks';

export const useIntelligentActions = (task: Task, nextSteps: string, statusSummary: string) => {
  const [isGeneratingActions, setIsGeneratingActions] = useState(false);
  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false);
  
  const { makeLLMRequest, hasActiveConfiguration } = useLLMService();
  const { smartRecommendations, advancedContext } = usePhase6Advanced();
  const { trackTaskCreation } = usePatternTracking();
  const { processInsights } = useProactiveNotifications();

  // Obtener patrones del usuario para personalización
  const { data: userPatterns } = useQuery({
    queryKey: ['user-patterns', task.user_id],
    queryFn: async () => {
      // Simular obtención de patrones del usuario
      return [
        { type: 'task_creation', preferredTime: '09:00', frequency: 'daily' },
        { type: 'communication', preferredLanguage: 'es', tone: 'professional' },
        { type: 'productivity', peakHours: [9, 10, 11, 14, 15] }
      ];
    },
    staleTime: 30 * 60 * 1000, // 30 minutos
  });

  // Generar acciones inteligentes basadas en contexto
  const generateIntelligentActions = useCallback(async (
    context: IntelligentActionContext
  ): Promise<IntelligentAction[]> => {
    if (!hasActiveConfiguration) return [];

    setIsGeneratingActions(true);
    
    try {
      const systemPrompt = `Eres un asistente experto en análisis de tareas que genera acciones inteligentes.

Analiza el contexto de la tarea y genera acciones específicas en formato JSON:
{
  "actions": [
    {
      "type": "create_subtask" | "create_reminder" | "draft_email",
      "label": "Texto del botón (máximo 25 caracteres)",
      "priority": "high" | "medium" | "low",
      "confidence": 0.0-1.0,
      "suggestedData": {
        "title": "Título sugerido",
        "content": "Contenido o descripción",
        "scheduledFor": "2024-12-XX 10:00:00",
        "language": "es" | "en",
        "estimatedDuration": 30
      },
      "basedOnPatterns": ["patron1", "patron2"]
    }
  ]
}

CRITERIOS:
- create_subtask: Si nextSteps menciona "crear", "añadir", "desarrollar", "implementar"
- create_reminder: Si nextSteps menciona "recordar", "seguimiento", "revisar", "controlar"
- draft_email: Si nextSteps menciona "contactar", "enviar", "comunicar", "informar"

PERSONALIZACIÓN:
- Usa patrones del usuario para timing y preferencias
- Prioriza acciones basadas en urgencia de la tarea
- Ajusta language preferences según historial`;

      const userPrompt = `CONTEXTO DE LA TAREA:
Tarea: ${context.task.title}
Estado: ${context.task.status}
Prioridad: ${context.task.priority}
Próximos pasos: ${context.nextSteps}
Resumen: ${context.statusSummary}

PATRONES DEL USUARIO:
${JSON.stringify(context.userPatterns, null, 2)}

ACTIVIDAD RECIENTE:
${JSON.stringify(context.recentActivity, null, 2)}

PRODUCTIVIDAD ACTUAL: ${context.productivityScore}/5

Genera máximo 3 acciones inteligentes más relevantes:`;

      const response = await makeLLMRequest({
        systemPrompt,
        userPrompt,
        functionName: 'generate_intelligent_actions',
        temperature: 0.7
      });

      const parsed = JSON.parse(response.content);
      const actions: IntelligentAction[] = parsed.actions.map((action: any, index: number) => ({
        id: `action-${task.id}-${index}`,
        type: action.type,
        label: action.label,
        priority: action.priority,
        confidence: action.confidence,
        suggestedData: action.suggestedData,
        basedOnPatterns: action.basedOnPatterns,
        recommendation: smartRecommendations.find(r => 
          r.type.includes(action.type) || r.title.toLowerCase().includes(action.type)
        )
      }));

      return actions;
    } catch (error) {
      console.error('Error generating intelligent actions:', error);
      return [];
    } finally {
      setIsGeneratingActions(false);
    }
  }, [hasActiveConfiguration, makeLLMRequest, smartRecommendations, task.id]);

  // Generar draft de email inteligente
  const generateDraftEmail = useCallback(async (
    context: IntelligentActionContext,
    language: 'es' | 'en'
  ): Promise<DraftEmailContent> => {
    if (!hasActiveConfiguration) {
      throw new Error('No LLM configuration available');
    }

    setIsGeneratingEmail(true);

    try {
      const systemPrompt = `Eres un asistente experto en redacción de emails profesionales.

Genera un draft de email en formato JSON:
{
  "subject": "Asunto del email (máximo 60 caracteres)",
  "body": "Cuerpo del email profesional y claro",
  "tone": "professional" | "friendly" | "formal",
  "language": "${language}",
  "confidence": 0.0-1.0
}

DIRECTRICES:
- ${language === 'es' ? 'Español profesional y claro' : 'Professional and clear English'}
- Incluir contexto relevante de la tarea
- Tono apropiado para comunicación empresarial
- Call-to-action específico
- Formato listo para copiar y pegar`;

      const userPrompt = `CONTEXTO:
Tarea: ${context.task.title}
Descripción: ${context.task.description || 'Sin descripción'}
Próximos pasos: ${context.nextSteps}
Prioridad: ${context.task.priority}

INFORMACIÓN ADICIONAL:
- Usuario tiende a usar tono: ${userPatterns?.[1]?.tone || 'professional'}
- Contexto de comunicación: ${context.statusSummary}

Genera un email draft en ${language.toUpperCase()} para contactar sobre esta tarea:`;

      const response = await makeLLMRequest({
        systemPrompt,
        userPrompt,
        functionName: 'generate_draft_email',
        temperature: 0.8
      });

      const parsed = JSON.parse(response.content);
      return {
        subject: parsed.subject,
        body: parsed.body,
        tone: parsed.tone,
        language: parsed.language,
        confidence: parsed.confidence
      };
    } catch (error) {
      console.error('Error generating draft email:', error);
      throw error;
    } finally {
      setIsGeneratingEmail(false);
    }
  }, [hasActiveConfiguration, makeLLMRequest, userPatterns]);

  // Memoizar contexto para acciones inteligentes
  const actionContext = useMemo((): IntelligentActionContext => ({
    task,
    nextSteps,
    statusSummary,
    userPatterns: userPatterns || [],
    recentActivity: advancedContext?.userBehaviorProfile?.recentActivity || [],
    productivityScore: advancedContext?.userBehaviorProfile?.currentProductivityScore || 3
  }), [task, nextSteps, statusSummary, userPatterns, advancedContext]);

  // Query para generar acciones inteligentes
  const { data: intelligentActions, isLoading: isLoadingActions } = useQuery({
    queryKey: ['intelligent-actions', task.id, nextSteps, statusSummary],
    queryFn: () => generateIntelligentActions(actionContext),
    enabled: !!task && !!nextSteps && hasActiveConfiguration,
    staleTime: 10 * 60 * 1000, // 10 minutos
    retry: 1
  });

  return {
    intelligentActions: intelligentActions || [],
    isGeneratingActions: isLoadingActions || isGeneratingActions,
    isGeneratingEmail,
    generateDraftEmail,
    actionContext,
    hasConfiguration: hasActiveConfiguration,
    
    // Funciones de tracking
    trackActionUsage: (actionType: string) => {
      trackTaskCreation(task.priority, undefined, task.project_id, actionType);
    },
    
    // Procesar insights después de acción
    triggerInsightUpdate: () => {
      processInsights();
    }
  };
};
