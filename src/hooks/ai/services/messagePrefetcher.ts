
import { supabase } from '@/integrations/supabase/client';
import { queryOptimizer } from './queryOptimizer';
import { conversationCache } from './conversationCache';
import { EnhancedMessage } from '../types/enhancedAITypes';

// Configuración del prefetcher
interface PrefetcherConfig {
  maxPrefetchQueries: number;
  prefetchThreshold: number; // ms
  patternAnalysisDepth: number; // número de mensajes a analizar
  predictionAccuracyTarget: number; // %
  backgroundRefreshInterval: number; // ms
  enablePatternLearning: boolean;
  cachePredictiveData: boolean;
  maxPredictiveCache: number;
}

// Estadísticas del prefetcher
interface PrefetcherStats {
  totalPredictions: number;
  accuratePredictions: number;
  prefetchHits: number;
  prefetchMisses: number;
  averageResponseImprovement: number; // ms
  patternAccuracy: number; // %
  backgroundTasksCompleted: number;
  predictiveCacheSize: number;
  totalTimeSaved: number; // ms
}

// Patrón de usuario detectado
interface UserPattern {
  id: string;
  userId: string;
  sequence: string[]; // secuencia de tipos de queries
  frequency: number;
  lastSeen: number;
  confidence: number; // 0-1
  nextPredictedAction: string;
  contextualTriggers: string[];
}

// Cache predictivo
interface PredictiveCache {
  key: string;
  data: any;
  pattern: string;
  confidence: number;
  timestamp: number;
  usage: number;
  ttl: number;
}

class MessagePrefetcher {
  private config: PrefetcherConfig;
  private stats: PrefetcherStats;
  private userPatterns = new Map<string, UserPattern[]>();
  private predictiveCache = new Map<string, PredictiveCache>();
  private backgroundTasks = new Set<string>();
  private learningData = new Map<string, any[]>();
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor(config: Partial<PrefetcherConfig> = {}) {
    this.config = {
      maxPrefetchQueries: 3,
      prefetchThreshold: 200, // 200ms
      patternAnalysisDepth: 10,
      predictionAccuracyTarget: 85, // 85%
      backgroundRefreshInterval: 30000, // 30 segundos
      enablePatternLearning: true,
      cachePredictiveData: true,
      maxPredictiveCache: 50,
      ...config,
    };

    this.stats = {
      totalPredictions: 0,
      accuratePredictions: 0,
      prefetchHits: 0,
      prefetchMisses: 0,
      averageResponseImprovement: 0,
      patternAccuracy: 0,
      backgroundTasksCompleted: 0,
      predictiveCacheSize: 0,
      totalTimeSaved: 0,
    };

    this.startBackgroundTasks();
    console.log('🔮 MessagePrefetcher inicializado:', this.config);
  }

  // Analizar patrones de usuario
  private analyzeUserPatterns(userId: string, recentMessages: EnhancedMessage[]): UserPattern[] {
    if (!this.config.enablePatternLearning) return [];

    const patterns: UserPattern[] = [];
    const messageTypes = recentMessages.slice(-this.config.patternAnalysisDepth)
      .map(msg => this.categorizeMessage(msg));

    // Detectar secuencias frecuentes
    for (let i = 2; i <= 4; i++) { // secuencias de 2-4 pasos
      const sequences = this.extractSequences(messageTypes, i);
      
      for (const [sequence, frequency] of sequences.entries()) {
        if (frequency >= 2) { // mínimo 2 ocurrencias
          const pattern: UserPattern = {
            id: `${userId}_${sequence.join('_')}_${Date.now()}`,
            userId,
            sequence: sequence,
            frequency,
            lastSeen: Date.now(),
            confidence: Math.min(frequency / 5, 1), // max confidence = 1
            nextPredictedAction: this.predictNextAction(sequence),
            contextualTriggers: this.identifyTriggers(recentMessages, sequence),
          };
          patterns.push(pattern);
        }
      }
    }

    // Actualizar patrones del usuario
    this.userPatterns.set(userId, patterns);
    console.log(`🎯 Patrones detectados para usuario ${userId}:`, patterns.length);

    return patterns;
  }

  // Categorizar mensaje para análisis de patrones
  private categorizeMessage(message: EnhancedMessage): string {
    const content = message.content.toLowerCase();
    
    if (content.includes('tarea') || content.includes('task')) return 'task_query';
    if (content.includes('proyecto') || content.includes('project')) return 'project_query';
    if (content.includes('tiempo') || content.includes('plazo')) return 'time_query';
    if (content.includes('ayuda') || content.includes('cómo')) return 'help_query';
    if (content.includes('análisis') || content.includes('reporte')) return 'analysis_query';
    if (content.includes('prioridad') || content.includes('urgente')) return 'priority_query';
    
    return 'general_query';
  }

  // Extraer secuencias de tipos de mensajes
  private extractSequences(messageTypes: string[], length: number): Map<string[], number> {
    const sequences = new Map<string[], number>();
    
    for (let i = 0; i <= messageTypes.length - length; i++) {
      const sequence = messageTypes.slice(i, i + length);
      const key = sequence.join('_');
      
      // Buscar secuencia en el mapa
      let found = false;
      for (const [existingSequence, count] of sequences.entries()) {
        if (existingSequence.join('_') === key) {
          sequences.set(existingSequence, count + 1);
          found = true;
          break;
        }
      }
      
      if (!found) {
        sequences.set(sequence, 1);
      }
    }
    
    return sequences;
  }

  // Predecir próxima acción basada en secuencia
  private predictNextAction(sequence: string[]): string {
    const lastAction = sequence[sequence.length - 1];
    
    // Reglas de predicción basadas en patrones comunes
    const predictionRules: Record<string, string> = {
      'task_query': 'project_query',
      'project_query': 'time_query',
      'help_query': 'task_query',
      'analysis_query': 'priority_query',
      'priority_query': 'task_query',
      'time_query': 'analysis_query',
    };
    
    return predictionRules[lastAction] || 'general_query';
  }

  // Identificar triggers contextuales
  private identifyTriggers(messages: EnhancedMessage[], sequence: string[]): string[] {
    const triggers: string[] = [];
    
    // Buscar patrones temporales
    const timePatterns = messages.filter(msg => {
      const hour = new Date(msg.timestamp).getHours();
      return hour >= 9 && hour <= 17; // horario laboral
    });
    
    if (timePatterns.length > messages.length * 0.7) {
      triggers.push('work_hours');
    }
    
    // Buscar patrones de contenido
    const commonWords = this.extractCommonWords(messages);
    triggers.push(...commonWords.slice(0, 3)); // top 3 palabras
    
    return triggers;
  }

  // Extraer palabras comunes de mensajes
  private extractCommonWords(messages: EnhancedMessage[]): string[] {
    const wordFreq = new Map<string, number>();
    
    messages.forEach(msg => {
      const words = msg.content.toLowerCase()
        .split(/\s+/)
        .filter(word => word.length > 3 && !['para', 'esta', 'este', 'como', 'pero', 'todo'].includes(word));
      
      words.forEach(word => {
        wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
      });
    });
    
    return Array.from(wordFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);
  }

  // Ejecutar prefetch basado en predicciones
  async executePrefetch(userId: string, currentContext: any): Promise<void> {
    const patterns = this.userPatterns.get(userId) || [];
    if (patterns.length === 0) return;

    const highConfidencePatterns = patterns.filter(p => p.confidence > 0.6);
    
    for (const pattern of highConfidencePatterns.slice(0, this.config.maxPrefetchQueries)) {
      const prefetchKey = `${userId}_${pattern.nextPredictedAction}_${Date.now()}`;
      
      if (!this.backgroundTasks.has(prefetchKey)) {
        this.backgroundTasks.add(prefetchKey);
        
        // Ejecutar prefetch en background
        this.backgroundPrefetch(userId, pattern.nextPredictedAction, currentContext, prefetchKey)
          .catch(error => {
            console.warn('⚠️ Error en background prefetch:', error);
          })
          .finally(() => {
            this.backgroundTasks.delete(prefetchKey);
          });
      }
    }
  }

  // Prefetch en background
  private async backgroundPrefetch(
    userId: string, 
    predictedAction: string, 
    context: any, 
    prefetchKey: string
  ): Promise<void> {
    const startTime = Date.now();
    
    try {
      let prefetchedData: any = null;
      
      switch (predictedAction) {
        case 'task_query':
          prefetchedData = await queryOptimizer.optimizedTasksQuery(userId, { 
            status: 'pending', 
            limit: 10 
          });
          break;
          
        case 'project_query':
          prefetchedData = await queryOptimizer.optimizedProjectsQuery(userId);
          break;
          
        case 'time_query':
          prefetchedData = await this.prefetchTimeData(userId);
          break;
          
        case 'analysis_query':
          prefetchedData = await this.prefetchAnalysisData(userId);
          break;
          
        default:
          prefetchedData = await queryOptimizer.optimizedChatMessagesQuery(userId, 5);
      }
      
      // Cachear datos prefetched
      if (prefetchedData && this.config.cachePredictiveData) {
        this.setPredictiveCache(prefetchKey, prefetchedData, predictedAction, 0.8);
      }
      
      const responseTime = Date.now() - startTime;
      this.stats.backgroundTasksCompleted++;
      
      console.log(`🔮 Prefetch completado: ${predictedAction} en ${responseTime}ms`);
      
    } catch (error) {
      console.error('❌ Error en background prefetch:', error);
    }
  }

  // Prefetch de datos de tiempo
  private async prefetchTimeData(userId: string): Promise<any> {
    const { data, error } = await supabase
      .from('tasks')
      .select('id, title, due_date, priority, status')
      .eq('user_id', userId)
      .not('due_date', 'is', null)
      .order('due_date', { ascending: true })
      .limit(10);
    
    if (error) throw error;
    return data;
  }

  // Prefetch de datos de análisis
  private async prefetchAnalysisData(userId: string): Promise<any> {
    const { data, error } = await supabase
      .from('tasks')
      .select('id, title, status, priority, created_at, completed_at')
      .eq('user_id', userId)
      .limit(20);
    
    if (error) throw error;
    return data;
  }

  // Configurar cache predictivo
  private setPredictiveCache(key: string, data: any, pattern: string, confidence: number): void {
    if (this.predictiveCache.size >= this.config.maxPredictiveCache) {
      // Limpiar cache menos usado
      const leastUsed = Array.from(this.predictiveCache.entries())
        .sort((a, b) => a[1].usage - b[1].usage)[0];
      
      if (leastUsed) {
        this.predictiveCache.delete(leastUsed[0]);
      }
    }
    
    this.predictiveCache.set(key, {
      key,
      data: JSON.parse(JSON.stringify(data)), // Deep copy
      pattern,
      confidence,
      timestamp: Date.now(),
      usage: 0,
      ttl: 5 * 60 * 1000, // 5 minutos
    });
    
    this.stats.predictiveCacheSize = this.predictiveCache.size;
  }

  // Obtener datos prefetched
  getPrefetchedData(userId: string, queryType: string): any | null {
    const pattern = `${userId}_${queryType}`;
    
    for (const [key, cached] of this.predictiveCache.entries()) {
      if (key.includes(pattern) && !this.isCacheExpired(cached)) {
        cached.usage++;
        this.stats.prefetchHits++;
        
        const timeSaved = this.config.prefetchThreshold;
        this.stats.totalTimeSaved += timeSaved;
        
        console.log(`✅ Prefetch hit: ${queryType} - ${timeSaved}ms ahorrados`);
        return cached.data;
      }
    }
    
    this.stats.prefetchMisses++;
    return null;
  }

  // Verificar si cache está expirado
  private isCacheExpired(cached: PredictiveCache): boolean {
    return (Date.now() - cached.timestamp) > cached.ttl;
  }

  // Aprender de interacciones del usuario
  learnFromInteraction(userId: string, queryType: string, responseTime: number): void {
    if (!this.config.enablePatternLearning) return;
    
    const learningEntry = {
      queryType,
      responseTime,
      timestamp: Date.now(),
      context: 'user_interaction',
    };
    
    const userData = this.learningData.get(userId) || [];
    userData.push(learningEntry);
    
    // Mantener solo los últimos 50 registros
    if (userData.length > 50) {
      userData.splice(0, userData.length - 50);
    }
    
    this.learningData.set(userId, userData);
    
    // Actualizar estadísticas
    this.updatePredictionAccuracy(userId, queryType);
  }

  // Actualizar precisión de predicciones
  private updatePredictionAccuracy(userId: string, actualQueryType: string): void {
    const patterns = this.userPatterns.get(userId) || [];
    
    for (const pattern of patterns) {
      if (pattern.nextPredictedAction === actualQueryType) {
        this.stats.accuratePredictions++;
      }
    }
    
    this.stats.totalPredictions++;
    this.stats.patternAccuracy = (this.stats.accuratePredictions / this.stats.totalPredictions) * 100;
  }

  // Iniciar tareas en background
  private startBackgroundTasks(): void {
    // Limpieza periódica de caches
    this.cleanupTimer = setInterval(() => {
      this.cleanupExpiredCache();
      this.optimizePatterns();
    }, this.config.backgroundRefreshInterval);
  }

  // Limpiar cache expirado
  private cleanupExpiredCache(): void {
    let cleaned = 0;
    
    for (const [key, cached] of this.predictiveCache.entries()) {
      if (this.isCacheExpired(cached)) {
        this.predictiveCache.delete(key);
        cleaned++;
      }
    }
    
    this.stats.predictiveCacheSize = this.predictiveCache.size;
    
    if (cleaned > 0) {
      console.log(`🧹 MessagePrefetcher: Limpiados ${cleaned} caches expirados`);
    }
  }

  // Optimizar patrones de usuario
  private optimizePatterns(): void {
    for (const [userId, patterns] of this.userPatterns.entries()) {
      // Remover patrones antiguos con baja confianza
      const optimizedPatterns = patterns.filter(pattern => {
        const age = Date.now() - pattern.lastSeen;
        const maxAge = 24 * 60 * 60 * 1000; // 24 horas
        
        return age < maxAge && pattern.confidence > 0.3;
      });
      
      if (optimizedPatterns.length !== patterns.length) {
        this.userPatterns.set(userId, optimizedPatterns);
        console.log(`🎯 Patrones optimizados para ${userId}: ${patterns.length} → ${optimizedPatterns.length}`);
      }
    }
  }

  // Obtener estadísticas
  getStats(): PrefetcherStats & { 
    patternCount: number; 
    backgroundTasksActive: number;
    averageConfidence: number;
  } {
    const totalPatterns = Array.from(this.userPatterns.values())
      .reduce((total, patterns) => total + patterns.length, 0);
    
    const allPatterns = Array.from(this.userPatterns.values()).flat();
    const avgConfidence = allPatterns.length > 0 
      ? allPatterns.reduce((sum, p) => sum + p.confidence, 0) / allPatterns.length 
      : 0;
    
    // Calcular mejora promedio de tiempo de respuesta
    if (this.stats.prefetchHits > 0) {
      this.stats.averageResponseImprovement = this.stats.totalTimeSaved / this.stats.prefetchHits;
    }
    
    return {
      ...this.stats,
      patternCount: totalPatterns,
      backgroundTasksActive: this.backgroundTasks.size,
      averageConfidence: avgConfidence,
    };
  }

  // Procesar mensajes para análisis de patrones
  async processMessageForPrefetch(userId: string, message: EnhancedMessage): Promise<void> {
    try {
      // Obtener mensajes recientes para análisis
      const recentMessages = conversationCache.get(userId) || 
        await queryOptimizer.optimizedChatMessagesQuery(userId, this.config.patternAnalysisDepth);
      
      if (recentMessages.length >= 3) { // mínimo para análisis
        // Analizar patrones
        const patterns = this.analyzeUserPatterns(userId, [...(recentMessages as EnhancedMessage[]), message]);
        
        // Ejecutar prefetch si hay patrones confiables
        if (patterns.length > 0) {
          await this.executePrefetch(userId, { recentMessages, currentMessage: message });
        }
      }
      
    } catch (error) {
      console.error('❌ Error procesando mensaje para prefetch:', error);
    }
  }

  // Limpiar todos los datos
  clear(): void {
    this.userPatterns.clear();
    this.predictiveCache.clear();
    this.backgroundTasks.clear();
    this.learningData.clear();
    
    this.stats = {
      totalPredictions: 0,
      accuratePredictions: 0,
      prefetchHits: 0,
      prefetchMisses: 0,
      averageResponseImprovement: 0,
      patternAccuracy: 0,
      backgroundTasksCompleted: 0,
      predictiveCacheSize: 0,
      totalTimeSaved: 0,
    };
    
    console.log('🧹 MessagePrefetcher completamente limpiado');
  }

  // Destruir prefetcher
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.clear();
  }
}

// Instancia singleton del message prefetcher
export const messagePrefetcher = new MessagePrefetcher({
  maxPrefetchQueries: 2,
  prefetchThreshold: 150, // 150ms
  patternAnalysisDepth: 8,
  predictionAccuracyTarget: 80, // 80%
  backgroundRefreshInterval: 45000, // 45 segundos
  enablePatternLearning: true,
  cachePredictiveData: true,
  maxPredictiveCache: 30,
});

export default MessagePrefetcher;
