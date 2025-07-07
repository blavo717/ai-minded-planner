import { ConversationMemory, ConversationMessage } from './conversationMemory';
import { DynamicPromptBuilder, PromptContext } from './dynamicPromptBuilder';

export interface IntelligentResponse {
  content: string;
  shouldSave: boolean;
  confidence: number;
  reasoning?: string;
  suggestedActions?: string[];
}

/**
 * ✅ CHECKPOINT 1.2.1: Servicio Principal del Asistente Inteligente
 * Orquesta memoria, prompt dinámico y anti-repetición para conversaciones naturales
 */
export class IntelligentAssistantService {
  private conversationMemory: ConversationMemory;
  private promptBuilder: DynamicPromptBuilder;
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
    this.conversationMemory = new ConversationMemory(userId);
    this.promptBuilder = new DynamicPromptBuilder();
  }

  /**
   * Procesar mensaje del usuario y generar respuesta inteligente
   */
  async processUserMessage(
    userMessage: string,
    currentContext: any,
    llmRequestFunction: (params: any) => Promise<any>
  ): Promise<IntelligentResponse> {
    
    try {
      // 1. Cargar memoria conversacional
      const recentMessages = await this.conversationMemory.loadRecentMessages();
      const conversationSummary = this.conversationMemory.generateConversationSummary(recentMessages);

      // 2. Guardar mensaje del usuario
      await this.conversationMemory.saveMessage({
        type: 'user',
        content: userMessage,
        context_data: { timestamp: new Date().toISOString() }
      });

      // 3. Construir contexto para el prompt
      const promptContext: PromptContext = {
        user: {
          id: this.userId,
          name: currentContext.user?.name || "Compañero",
          role: currentContext.user?.role,
          department: currentContext.user?.department,
          timezone: currentContext.user?.timezone || 'UTC',
          tasksCount: currentContext.user?.tasksCount || 0,
          projectsCount: currentContext.user?.projectsCount || 0,
          completedTasksToday: currentContext.user?.completedTasksToday || 0
        },
        tasks: {
          hierarchy: currentContext.tasks?.hierarchy || [],
          urgentToday: currentContext.tasks?.urgentToday || [],
          overdue: currentContext.tasks?.overdue || [],
          inProgress: currentContext.tasks?.inProgress || [],
          quickWins: currentContext.tasks?.quickWins || [],
          specificTasks: currentContext.tasks?.specificTasks || {
            urgent: [],
            overdue: [],
            inProgress: [],
            quickWins: []
          },
          timeBasedRecommendations: currentContext.tasks?.timeBasedRecommendations || []
        },
        conversation: conversationSummary,
        currentRecommendation: currentContext.currentRecommendation,
        recentActivity: currentContext.recentActivity,
        behaviorInsights: currentContext.behaviorInsights,
        productivityProfile: currentContext.productivityProfile,
        performanceMetrics: currentContext.performanceMetrics
      };

      // 4. Generar prompt dinámico
      const systemPrompt = this.promptBuilder.buildDynamicSystemPrompt(promptContext, userMessage);

      // 5. Hacer solicitud al LLM
      const llmResponse = await llmRequestFunction({
        systemPrompt,
        userPrompt: userMessage,
        functionName: 'intelligent_dynamic_chat',
        temperature: 0.7,
        maxTokens: 1000,
      });

      // 6. Verificar anti-repetición
      const isRepetitive = this.conversationMemory.detectRepetition(llmResponse.content, recentMessages);
      
      let finalResponse = llmResponse.content;

      // 7. Si es repetitivo, regenerar con instrucciones específicas
      if (isRepetitive) {
        console.log('🔄 Respuesta repetitiva detectada, regenerando...');
        
        const antiRepetitionPrompt = `${systemPrompt}

ALERTA ANTI-REPETICIÓN:
La respuesta que ibas a dar es muy similar a respuestas recientes. 
Genera una respuesta completamente diferente, con:
• Estructura diferente
• Vocabulario variado
• Enfoque distinto al problema
• Sin frases motivadoras estándar
• Más específica y personalizada

MENSAJE ORIGINAL: ${userMessage}`;

        const retryResponse = await llmRequestFunction({
          systemPrompt: antiRepetitionPrompt,
          userPrompt: `Responde de manera completamente diferente y natural: ${userMessage}`,
          functionName: 'intelligent_dynamic_chat_retry',
          temperature: 0.8, // Más creatividad
          maxTokens: 1000,
        });

        finalResponse = retryResponse.content;
      }

      // 8. Guardar respuesta del asistente
      await this.conversationMemory.saveMessage({
        type: 'assistant',
        content: finalResponse,
        context_data: {
          was_repetitive: isRepetitive,
          conversation_flow: conversationSummary.conversationFlow,
          user_mood: conversationSummary.userMood,
          topics: conversationSummary.recentTopics
        }
      });

      // 9. Generar sugerencias de acciones si es apropiado
      const suggestedActions = this.generateActionSuggestions(userMessage, promptContext);

      return {
        content: finalResponse,
        shouldSave: true,
        confidence: isRepetitive ? 0.6 : 0.9,
        reasoning: isRepetitive ? 'Respuesta regenerada por ser repetitiva' : 'Respuesta natural generada',
        suggestedActions
      };

    } catch (error) {
      console.error('Error in intelligent assistant service:', error);
      
      return {
        content: 'Disculpa, hubo un problema procesando tu mensaje. ¿Puedes intentar de nuevo?',
        shouldSave: false,
        confidence: 0.1,
        reasoning: 'Error en el procesamiento'
      };
    }
  }

  /**
   * Limpiar historial de conversación
   */
  async clearConversation(): Promise<void> {
    await this.conversationMemory.clearConversationHistory();
  }

  /**
   * Obtener resumen de la conversación actual
   */
  async getConversationSummary(): Promise<any> {
    const recentMessages = await this.conversationMemory.loadRecentMessages();
    return this.conversationMemory.generateConversationSummary(recentMessages);
  }

  /**
   * Generar sugerencias de acciones contextuales
   */
  private generateActionSuggestions(userMessage: string, context: PromptContext): string[] {
    const suggestions: string[] = [];
    const msg = userMessage.toLowerCase();

    if (msg.includes('qué hago') || msg.includes('tarea')) {
      if (context.currentRecommendation) {
        suggestions.push(`Trabajar en "${context.currentRecommendation.task?.title}"`);
      }
      if (context.tasks.urgentToday.length > 0) {
        suggestions.push('Revisar tareas urgentes para hoy');
      }
    }

    if (msg.includes('progreso') || msg.includes('estado')) {
      suggestions.push('Ver análisis detallado de productividad');
      if (context.tasks.overdue.length > 0) {
        suggestions.push('Reagendar tareas vencidas');
      }
    }

    return suggestions.slice(0, 3); // Máximo 3 sugerencias
  }

  /**
   * Verificar si el asistente debería ofrecer ayuda proactiva
   */
  shouldOfferProactiveHelp(context: PromptContext): boolean {
    return (
      context.tasks.overdue.length > 2 ||
      context.tasks.urgentToday.length > 5 ||
      context.user.completedTasksToday === 0
    );
  }
}