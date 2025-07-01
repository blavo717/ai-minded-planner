
import { useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { IntelligentAction, IntelligentActionContext, DraftEmailContent, UserPattern } from '@/types/intelligent-actions';
import { usePhase6Advanced } from './usePhase6Advanced';
import { usePatternTracking } from '@/hooks/usePatternTracking';
import { useLLMService } from '@/hooks/useLLMService';
import { useProactiveNotifications } from './useProactiveNotifications';
import { Task } from '@/hooks/useTasks';

/**
 * Parser seguro específico para intelligent actions
 */
function parseIntelligentActionsJSON(content: string): any[] {
  console.log('🔍 Parsing intelligent actions JSON');
  
  try {
    // Limpiar contenido problemático
    const cleaned = content
      .replace(/,(\s*[}\]])/g, '$1') // Remover comas antes de } ]
      .replace(/,(\s*,)/g, ',') // Remover comas dobles
      .replace(/['']/g, '"') // Normalizar comillas
      .replace(/```json/gi, '') // Remover markdown
      .replace(/```/g, '') // Remover backticks
      .replace(/\n/g, ' ') // Remover saltos de línea
      .trim();
    
    const parsed = JSON.parse(cleaned);
    
    // Asegurar que sea array
    if (Array.isArray(parsed)) {
      return parsed.slice(0, 3); // Máximo 3 acciones
    } else if (parsed && typeof parsed === 'object') {
      return [parsed]; // Convertir objeto single a array
    }
    
    return [];
  } catch (error) {
    console.error('❌ Error parsing intelligent actions:', error);
    console.log('🔄 Usando fallback de acciones');
    
    // Fallback: acciones básicas siempre útiles
    return [
      {
        type: 'create_subtask',
        label: 'Crear subtarea',
        priority: 'medium',
        confidence: 0.8,
        suggestedData: {
          title: 'Nueva subtarea específica',
          content: 'Definir próximo paso concreto'
        },
        basedOnPatterns: ['task_progression']
      }
    ];
  }
}

export const useIntelligentActions = (task: Task | undefined, nextSteps: string, statusSummary: string) => {
  const [isGeneratingActions, setIsGeneratingActions] = useState(false);
  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false);
  
  const { makeLLMRequest, hasActiveConfiguration } = useLLMService();
  const { smartRecommendations, advancedContext } = usePhase6Advanced();
  const { trackTaskCreation } = usePatternTracking();
  const { processInsights } = useProactiveNotifications();

  // Early return if task is undefined
  if (!task) {
    return {
      intelligentActions: [],
      isGeneratingActions: false,
      isGeneratingEmail: false,
      generateDraftEmail: async () => {
        throw new Error('No task available');
      },
      actionContext: null,
      hasConfiguration: hasActiveConfiguration,
      trackActionUsage: () => {},
      triggerInsightUpdate: () => {},
    };
  }

  // Obtener patrones del usuario para personalización
  const { data: userPatterns } = useQuery({
    queryKey: ['user-patterns', task.user_id],
    queryFn: async (): Promise<UserPattern[]> => {
      // Simular obtención de patrones del usuario
      return [
        { 
          type: 'task_creation', 
          preferredTime: '09:00', 
          frequency: 'daily',
          workingHours: [9, 17],
          peakHours: [9, 10, 11, 14, 15]
        },
        { 
          type: 'communication', 
          preferredLanguage: 'es', 
          tone: 'professional' 
        },
        { 
          type: 'productivity', 
          peakHours: [9, 10, 11, 14, 15],
          averageTaskDuration: 120,
          multitaskingTendency: 0.7
        }
      ];
    },
    staleTime: 30 * 60 * 1000, // 30 minutos
  });

  // Generar acciones inteligentes basadas en contexto - VERSIÓN CORREGIDA
  const generateIntelligentActions = useCallback(async (
    context: IntelligentActionContext
  ): Promise<IntelligentAction[]> => {
    if (!hasActiveConfiguration || !context.task) return [];

    setIsGeneratingActions(true);
    
    try {
      console.log('🎯 Generando intelligent actions para:', context.task.title);
      
      // Prompt ultra-simple para evitar JSON complejo
      const prompt = `Basado en la tarea "${context.task.title}" con progreso actual, genera máximo 2 acciones útiles.

Responde SOLO con JSON válido, sin texto extra:
[
  {
    "type": "create_subtask",
    "label": "Crear subtarea específica",
    "priority": "medium",
    "confidence": 0.8,
    "suggestedData": {
      "title": "Título específico de la subtarea",
      "content": "Descripción breve"
    },
    "basedOnPatterns": ["task_progression"]
  }
]

REGLAS ESTRICTAS:
- Solo JSON válido
- Sin comas al final de propiedades
- Máximo 2 acciones
- Tipos permitidos: "create_subtask", "create_reminder", "draft_email"`;

      const response = await makeLLMRequest({
        systemPrompt: "Eres un generador de acciones que responde SOLO con JSON válido.",
        userPrompt: prompt,
        functionName: 'generate_intelligent_actions',
        temperature: 0.1, // Ultra bajo para consistencia
        maxTokens: 400
      });

      if (!response?.content) {
        console.warn('⚠️ Sin respuesta para intelligent actions');
        return parseIntelligentActionsJSON('[]');
      }

      console.log('📝 Raw intelligent actions response:', response.content);

      // ✅ USAR PARSER SEGURO
      const parsed = parseIntelligentActionsJSON(response.content);
      
      // Convertir a formato IntelligentAction
      const actions: IntelligentAction[] = parsed.map((action: any, index: number) => ({
        id: `action-${task.id}-${index}`,
        type: action.type || 'create_subtask',
        label: action.label || 'Acción inteligente',
        priority: action.priority || 'medium',
        confidence: action.confidence || 0.7,
        suggestedData: {
          ...action.suggestedData,
          scheduledFor: action.suggestedData?.scheduledFor ? new Date(action.suggestedData.scheduledFor) : undefined
        },
        basedOnPatterns: action.basedOnPatterns || ['general'],
        recommendation: smartRecommendations.find(r => 
          r.type.includes(action.type) || r.title.toLowerCase().includes(action.type)
        )
      }));

      console.log('✅ Intelligent actions procesadas:', actions.length);
      return actions;

    } catch (error) {
      console.error('❌ Error en intelligent actions:', error);
      
      // ✅ FALLBACK SEGURO SIEMPRE
      return parseIntelligentActionsJSON('[]');
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

    if (!context.task) {
      throw new Error('No task available');
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

  // Query para generar acciones inteligentes - CON ERROR HANDLING MEJORADO
  const { data: intelligentActions, isLoading: isLoadingActions } = useQuery({
    queryKey: ['intelligent-actions', task.id, nextSteps, statusSummary],
    queryFn: () => generateIntelligentActions(actionContext),
    enabled: !!task && !!nextSteps && hasActiveConfiguration,
    staleTime: 10 * 60 * 1000, // 10 minutos
    retry: 1,
    retryDelay: 2000,
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
