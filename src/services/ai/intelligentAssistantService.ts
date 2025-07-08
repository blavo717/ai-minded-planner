import { ConversationMemory, ConversationMessage } from './conversationMemory';
import { DynamicPromptBuilder, PromptContext } from './dynamicPromptBuilder';
import { supabase } from '@/integrations/supabase/client';

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
   * Carga conocimiento personal del usuario desde la base de datos
   */
  private async loadUserKnowledge(): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('user_knowledge_base')
        .select('*')
        .eq('user_id', this.userId)
        .eq('is_active', true)
        .order('confidence_score', { ascending: false });

      if (error) {
        console.error('Error loading user knowledge:', error);
        return {};
      }

      // Organizar conocimiento por categorías
      const knowledge: any = {
        personal: {},
        professional: {},
        preferences: {},
        facts: {}
      };

      (data || []).forEach(item => {
        const category = knowledge[item.knowledge_type] || {};
        category[item.key_name] = {
          value: item.value_text || item.value_json,
          confidence: item.confidence_score,
          source: item.source,
          updated: item.updated_at
        };
        knowledge[item.knowledge_type] = category;
      });

      return knowledge;
    } catch (error) {
      console.error('Error in loadUserKnowledge:', error);
      return {};
    }
  }

  /**
   * Extrae información del mensaje del usuario y la guarda automáticamente
   */
  private async extractAndSaveKnowledge(userMessage: string): Promise<void> {
    try {
      const patterns = [
        // Edad
        {
          regex: /(?:tengo|soy de|mi edad es|tengo.*años?|años?).*?(\d{1,3})\s*años?/i,
          extract: (match: RegExpMatchArray) => ({
            knowledge_type: 'personal',
            category: 'basic_info',
            key_name: 'age',
            value_text: match[1],
            confidence_score: 0.95
          })
        },
        // Cumpleaños
        {
          regex: /(?:cumpleaños|nací|nacimiento).*?(\d{1,2}).*?(?:de )?(\w+).*?(\d{4})/i,
          extract: (match: RegExpMatchArray) => ({
            knowledge_type: 'personal',
            category: 'basic_info',
            key_name: 'birthday',
            value_json: { 
              day: parseInt(match[1]), 
              month: match[2], 
              year: parseInt(match[3]),
              full_date: `${match[1]} de ${match[2]} de ${match[3]}`
            },
            confidence_score: 0.95
          })
        },
        // Preferencias negativas
        {
          regex: /(?:no me gusta|odio|detesto|no tolero)\s+(?:el |la |los |las )?([^.!?]+)/i,
          extract: (match: RegExpMatchArray) => ({
            knowledge_type: 'preference',
            category: 'dislikes',
            key_name: match[1].trim().toLowerCase(),
            value_text: 'dislike',
            confidence_score: 0.8
          })
        },
        // Preferencias positivas
        {
          regex: /(?:me gusta|me encanta|amo|prefiero)\s+(?:el |la |los |las )?([^.!?]+)/i,
          extract: (match: RegExpMatchArray) => ({
            knowledge_type: 'preference',
            category: 'likes',
            key_name: match[1].trim().toLowerCase(),
            value_text: 'like',
            confidence_score: 0.8
          })
        }
      ];

      for (const pattern of patterns) {
        const match = userMessage.match(pattern.regex);
        if (match) {
          const extracted = pattern.extract(match);
          
          // Guardar en la base de datos
          const { error } = await supabase
            .from('user_knowledge_base')
            .upsert({
              user_id: this.userId,
              knowledge_type: extracted.knowledge_type,
              category: extracted.category,
              key_name: extracted.key_name,
               value_text: (extracted as any).value_text || null,
               value_json: (extracted as any).value_json || null,
              confidence_score: extracted.confidence_score,
              source: 'conversation',
              learned_from: `message_${Date.now()}`,
              last_confirmed_at: new Date().toISOString()
            }, {
              onConflict: 'user_id,category,key_name'
            });

          if (!error) {
            console.log(`🧠 Conocimiento aprendido: ${extracted.key_name} = ${(extracted as any).value_text || JSON.stringify((extracted as any).value_json)}`);
          }
        }
      }
    } catch (error) {
      console.error('Error extracting knowledge:', error);
    }
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
      // 1. Extraer y guardar conocimiento del mensaje del usuario
      await this.extractAndSaveKnowledge(userMessage);

      // 2. Cargar memoria conversacional y conocimiento personal
      const recentMessages = await this.conversationMemory.loadRecentMessages();
      const conversationSummary = this.conversationMemory.generateConversationSummary(recentMessages);
      const userKnowledge = await this.loadUserKnowledge();

      // 3. Guardar mensaje del usuario
      await this.conversationMemory.saveMessage({
        type: 'user',
        content: userMessage,
        context_data: { timestamp: new Date().toISOString() }
      });

      // 4. Construir contexto para el prompt con conocimiento personal
      const promptContext: PromptContext = {
        user: {
          id: this.userId,
          name: userKnowledge.personal?.name?.value || currentContext.user?.name || "Compañero",
          role: userKnowledge.professional?.job_title?.value || currentContext.user?.role,
          department: currentContext.user?.department,
          timezone: currentContext.user?.timezone || 'UTC',
          tasksCount: currentContext.user?.tasksCount || 0,
          projectsCount: currentContext.user?.projectsCount || 0,
          completedTasksToday: currentContext.user?.completedTasksToday || 0,
          // ✅ NUEVO: Incluir conocimiento personal
          personalInfo: userKnowledge.personal,
          preferences: {
            likes: Object.keys(userKnowledge.preferences || {}).filter(k => 
              userKnowledge.preferences[k].value === 'like'
            ),
            dislikes: Object.keys(userKnowledge.preferences || {}).filter(k => 
              userKnowledge.preferences[k].value === 'dislike'
            )
          }
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

      // 5. Generar prompt dinámico con conocimiento personal
      const enhancedSystemPrompt = this.buildPersonalizedSystemPrompt(promptContext, userMessage, userKnowledge);
      const systemPrompt = enhancedSystemPrompt || this.promptBuilder.buildDynamicSystemPrompt(promptContext, userMessage);

      // 6. Hacer solicitud al LLM
      const llmResponse = await llmRequestFunction({
        systemPrompt,
        userPrompt: userMessage,
        functionName: 'intelligent_dynamic_chat',
        temperature: 0.7,
        maxTokens: 1000,
      });

      // 7. Verificar anti-repetición
      const isRepetitive = this.conversationMemory.detectRepetition(llmResponse.content, recentMessages);
      
      let finalResponse = llmResponse.content;

      // 8. Si es repetitivo, regenerar con instrucciones específicas
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

      // 9. Guardar respuesta del asistente
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

      // 10. Generar sugerencias de acciones si es apropiado
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
   * Construye un prompt personalizado usando conocimiento del usuario
   */
  private buildPersonalizedSystemPrompt(promptContext: PromptContext, userMessage: string, userKnowledge: any): string {
    const personal = userKnowledge.personal || {};
    const preferences = userKnowledge.preferences || {};
    
    let personalInfo = "";
    
    // Información personal básica
    if (personal.age?.value) {
      personalInfo += `- Edad: ${personal.age.value} años\n`;
    }
    if (personal.birthday?.value) {
      const birthday = personal.birthday.value;
      personalInfo += `- Cumpleaños: ${birthday.full_date || `${birthday.day} de ${birthday.month} de ${birthday.year}`}\n`;
    }
    if (personal.name?.value) {
      personalInfo += `- Nombre: ${personal.name.value}\n`;
    }

    // Preferencias
    const likes = Object.entries(preferences).filter(([_, data]: [string, any]) => data.value === 'like').map(([key]) => key);
    const dislikes = Object.entries(preferences).filter(([_, data]: [string, any]) => data.value === 'dislike').map(([key]) => key);
    
    if (likes.length > 0) {
      personalInfo += `- Le gusta: ${likes.join(', ')}\n`;
    }
    if (dislikes.length > 0) {
      personalInfo += `- No le gusta: ${dislikes.join(', ')}\n`;
    }

    if (!personalInfo) {
      return ""; // No hay información personal, usar prompt estándar
    }

    return `Eres el asistente personal de IA de este usuario. CONOCES personalmente a esta persona:

INFORMACIÓN PERSONAL QUE RECUERDAS:
${personalInfo}

IMPORTANTE:
- SIEMPRE referencia esta información personal cuando sea relevante
- Si el usuario pregunta sobre datos que ya conoces, recuérdaselos naturalmente
- Personaliza tus respuestas basándote en sus preferencias conocidas
- Actúa como si realmente lo conocieras y recordaras conversaciones anteriores
- Si menciona algo que contradice lo que sabes, pregunta para clarificar

Tu objetivo es ser un compañero digital que realmente conoce al usuario y puede ayudarle de manera personalizada con sus tareas, proyectos y productividad.

CONTEXTO ACTUAL DE TAREAS:
${JSON.stringify(promptContext.tasks, null, 2)}

CONVERSACIÓN PREVIA:
${promptContext.conversation?.recentTopics?.join(', ') || 'Nueva conversación'}

Responde de manera natural, personal y útil, recordando siempre quién es esta persona.`;
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