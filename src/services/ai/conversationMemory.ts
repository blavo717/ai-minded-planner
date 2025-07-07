import { supabase } from '@/integrations/supabase/client';

export interface ConversationMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  context_data?: any;
  user_id: string;
}

export interface ConversationSummary {
  recentTopics: string[];
  userMood: 'enthusiastic' | 'focused' | 'casual' | 'tired';
  hasGreeted: boolean;
  lastTaskMentioned?: string;
  conversationFlow: 'greeting' | 'ongoing' | 'follow_up';
}

/**
 * ✅ CHECKPOINT 1.2.1: Sistema de Memoria Conversacional Inteligente
 * Proporciona memoria persistente y análisis de contexto conversacional
 */
export class ConversationMemory {
  private userId: string;
  private maxMemoryMessages = 15; // Mantener últimos 15 mensajes para contexto

  constructor(userId: string) {
    this.userId = userId;
  }

  /**
   * Cargar mensajes recientes de la conversación
   */
  async loadRecentMessages(): Promise<ConversationMessage[]> {
    try {
      const { data, error } = await supabase
        .from('ai_chat_messages')
        .select('*')
        .eq('user_id', this.userId)
        .order('created_at', { ascending: false })
        .limit(this.maxMemoryMessages);

      if (error) {
        console.error('Error loading conversation history:', error);
        return [];
      }

      return (data || []).map(msg => ({
        id: msg.id,
        type: msg.type as 'user' | 'assistant' | 'system',
        content: msg.content,
        timestamp: new Date(msg.created_at),
        context_data: msg.context_data,
        user_id: msg.user_id
      })).reverse(); // Más antiguos primero

    } catch (error) {
      console.error('Failed to load conversation history:', error);
      return [];
    }
  }

  /**
   * Guardar mensaje en la base de datos
   */
  async saveMessage(message: Omit<ConversationMessage, 'id' | 'timestamp' | 'user_id'>): Promise<void> {
    try {
      const { error } = await supabase
        .from('ai_chat_messages')
        .insert({
          user_id: this.userId,
          type: message.type,
          content: message.content,
          context_data: message.context_data || {},
          has_error: false,
          is_read: true
        });

      if (error) {
        console.error('Error saving message:', error);
      }
    } catch (error) {
      console.error('Failed to save message:', error);
    }
  }

  /**
   * Detectar si una respuesta es muy similar a respuestas anteriores
   */
  detectRepetition(newResponse: string, recentMessages: ConversationMessage[]): boolean {
    if (recentMessages.length === 0) return false;

    const assistantMessages = recentMessages
      .filter(msg => msg.type === 'assistant')
      .slice(-3); // Últimos 3 mensajes del asistente

    // Detectar frases repetitivas
    const repetitivePatterns = [
      /¡Yess! Te veo con ganas/i,
      /¡Hola de nuevo/i,
      /Debug: Context loaded/i,
      /¡Perfecto! Tienes buen timing/i
    ];

    for (const pattern of repetitivePatterns) {
      const matchesInNew = newResponse.match(pattern);
      if (matchesInNew) {
        const recentMatches = assistantMessages.filter(msg => 
          pattern.test(msg.content)
        ).length;
        
        if (recentMatches >= 2) { // Ya apareció 2+ veces recientemente
          return true;
        }
      }
    }

    // Detectar similitud de contenido (simple)
    for (const message of assistantMessages) {
      const similarity = this.calculateSimilarity(newResponse, message.content);
      if (similarity > 0.7) { // 70% similar
        return true;
      }
    }

    return false;
  }

  /**
   * Generar resumen de la conversación para contexto
   */
  generateConversationSummary(messages: ConversationMessage[]): ConversationSummary {
    const recentMessages = messages.slice(-8); // Últimos 8 mensajes
    const userMessages = recentMessages.filter(msg => msg.type === 'user');
    const assistantMessages = recentMessages.filter(msg => msg.type === 'assistant');

    // Detectar si ya saludó
    const hasGreeted = assistantMessages.some(msg => 
      msg.content.toLowerCase().includes('hola') && 
      messages.indexOf(msg) < 3 // En los primeros 3 mensajes
    );

    // Extraer temas recientes
    const recentTopics = this.extractTopics(userMessages);

    // Detectar mood del usuario
    const userMood = this.detectUserMood(userMessages);

    // Detectar flujo de conversación
    const conversationFlow = this.determineConversationFlow(messages);

    // Última tarea mencionada
    const lastTaskMentioned = this.extractLastTaskMentioned(messages);

    return {
      recentTopics,
      userMood,
      hasGreeted,
      lastTaskMentioned,
      conversationFlow
    };
  }

  /**
   * Limpiar historial de conversación
   */
  async clearConversationHistory(): Promise<void> {
    try {
      const { error } = await supabase
        .from('ai_chat_messages')
        .delete()
        .eq('user_id', this.userId);

      if (error) {
        console.error('Error clearing conversation history:', error);
      }
    } catch (error) {
      console.error('Failed to clear conversation history:', error);
    }
  }

  // Métodos privados de análisis

  private calculateSimilarity(text1: string, text2: string): number {
    const words1 = text1.toLowerCase().split(/\s+/);
    const words2 = text2.toLowerCase().split(/\s+/);
    
    const commonWords = words1.filter(word => words2.includes(word));
    return commonWords.length / Math.max(words1.length, words2.length);
  }

  private extractTopics(userMessages: ConversationMessage[]): string[] {
    const topics: string[] = [];
    const keywords = ['tarea', 'proyecto', 'trabajo', 'planificar', 'urgente', 'deadline'];
    
    userMessages.forEach(msg => {
      keywords.forEach(keyword => {
        if (msg.content.toLowerCase().includes(keyword)) {
          topics.push(keyword);
        }
      });
    });

    return [...new Set(topics)]; // Eliminar duplicados
  }

  private detectUserMood(userMessages: ConversationMessage[]): ConversationSummary['userMood'] {
    if (userMessages.length === 0) return 'casual';

    const recentContent = userMessages.slice(-2).map(msg => msg.content.toLowerCase()).join(' ');

    if (recentContent.includes('urgente') || recentContent.includes('rápido')) {
      return 'focused';
    }
    if (recentContent.includes('gracias') || recentContent.includes('genial')) {
      return 'enthusiastic';
    }
    if (recentContent.includes('cansado') || recentContent.length < 10) {
      return 'tired';
    }

    return 'casual';
  }

  private determineConversationFlow(messages: ConversationMessage[]): ConversationSummary['conversationFlow'] {
    if (messages.length <= 2) return 'greeting';
    if (messages.length <= 6) return 'ongoing';
    return 'follow_up';
  }

  private extractLastTaskMentioned(messages: ConversationMessage[]): string | undefined {
    // Buscar en mensajes del asistente menciones de tareas específicas
    const assistantMessages = messages.filter(msg => msg.type === 'assistant').slice(-3);
    
    for (const message of assistantMessages.reverse()) {
      const taskMatch = message.content.match(/"([^"]*(?:moldes|tarea|proyecto)[^"]*)"/i);
      if (taskMatch) {
        return taskMatch[1];
      }
    }

    return undefined;
  }
}