
import { ExtendedAIContext } from '@/types/ai-context';
import { ContextAnalysis } from '@/utils/ai/ContextAnalyzer';

export interface CacheEntry {
  context: ExtendedAIContext;
  analysis?: ContextAnalysis;
  timestamp: number;
  expiresAt: number;
  hits: number;
  userId: string;
  contextHash: string;
}

export interface CacheConfig {
  maxEntries: number;
  defaultTTL: number; // Time to live in milliseconds
  cleanupInterval: number;
  enableAnalyticsCache: boolean;
}

export interface CacheStats {
  totalEntries: number;
  hitRate: number;
  missRate: number;
  avgAge: number;
  memoryUsage: number;
}

export class ContextCache {
  private cache: Map<string, CacheEntry> = new Map();
  private hitCount: number = 0;
  private missCount: number = 0;
  private cleanupTimer: NodeJS.Timeout | null = null;
  private config: CacheConfig;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxEntries: 100,
      defaultTTL: 5 * 60 * 1000, // 5 minutos
      cleanupInterval: 60 * 1000, // 1 minuto
      enableAnalyticsCache: true,
      ...config,
    };

    this.startCleanupTimer();
  }

  // Generar hash del contexto para detectar cambios
  private generateContextHash(context: ExtendedAIContext): string {
    const key = {
      userId: context.userInfo.id,
      tasksCount: context.recentTasks.length,
      projectsCount: context.recentProjects.length,
      lastUpdate: context.recentActivity.lastTaskUpdate?.getTime(),
      workPattern: context.recentActivity.workPattern,
      timeOfDay: context.currentSession.timeOfDay,
    };
    
    return btoa(JSON.stringify(key)).slice(0, 16);
  }

  // Generar clave de cache
  private generateCacheKey(userId: string, contextType: string = 'default'): string {
    return `${userId}:${contextType}`;
  }

  // Obtener entrada del cache
  get(userId: string, contextType: string = 'default'): CacheEntry | null {
    const key = this.generateCacheKey(userId, contextType);
    const entry = this.cache.get(key);

    if (!entry) {
      this.missCount++;
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.missCount++;
      return null;
    }

    entry.hits++;
    this.hitCount++;
    return entry;
  }

  // Almacenar en cache
  set(
    userId: string, 
    context: ExtendedAIContext, 
    analysis?: ContextAnalysis,
    contextType: string = 'default',
    customTTL?: number
  ): void {
    const key = this.generateCacheKey(userId, contextType);
    const contextHash = this.generateContextHash(context);
    const ttl = customTTL || this.config.defaultTTL;
    
    // Verificar si el contexto ya existe y no ha cambiado
    const existing = this.cache.get(key);
    if (existing && existing.contextHash === contextHash) {
      // Solo actualizar timestamp y TTL
      existing.expiresAt = Date.now() + ttl;
      return;
    }

    const entry: CacheEntry = {
      context,
      analysis,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl,
      hits: 0,
      userId,
      contextHash,
    };

    // Aplicar límite de entradas
    if (this.cache.size >= this.config.maxEntries) {
      this.evictOldestEntry();
    }

    this.cache.set(key, entry);
  }

  // Verificar si el contexto está en cache y es válido
  has(userId: string, contextType: string = 'default'): boolean {
    const entry = this.get(userId, contextType);
    return entry !== null;
  }

  // Verificar si el contexto ha cambiado
  hasChanged(userId: string, context: ExtendedAIContext, contextType: string = 'default'): boolean {
    const entry = this.get(userId, contextType);
    if (!entry) return true;

    const currentHash = this.generateContextHash(context);
    return entry.contextHash !== currentHash;
  }

  // Obtener contexto con fallback
  getWithFallback(
    userId: string, 
    fallbackFn: () => Promise<ExtendedAIContext>,
    contextType: string = 'default'
  ): Promise<ExtendedAIContext> {
    const cached = this.get(userId, contextType);
    
    if (cached) {
      return Promise.resolve(cached.context);
    }

    return fallbackFn().then(context => {
      this.set(userId, context, undefined, contextType);
      return context;
    });
  }

  // Invalidar cache de usuario
  invalidate(userId: string, contextType?: string): void {
    if (contextType) {
      const key = this.generateCacheKey(userId, contextType);
      this.cache.delete(key);
    } else {
      // Invalidar todas las entradas del usuario
      const keysToDelete: string[] = [];
      for (const [key, entry] of this.cache.entries()) {
        if (entry.userId === userId) {
          keysToDelete.push(key);
        }
      }
      keysToDelete.forEach(key => this.cache.delete(key));
    }
  }

  // Limpiar cache completo
  clear(): void {
    this.cache.clear();
    this.hitCount = 0;
    this.missCount = 0;
  }

  // Obtener estadísticas del cache
  getStats(): CacheStats {
    const totalRequests = this.hitCount + this.missCount;
    const entries = Array.from(this.cache.values());
    const now = Date.now();

    const avgAge = entries.length > 0 ? 
      entries.reduce((sum, entry) => sum + (now - entry.timestamp), 0) / entries.length :
      0;

    // Estimación simple del uso de memoria
    const memoryUsage = entries.reduce((sum, entry) => {
      return sum + JSON.stringify(entry.context).length + 
        (entry.analysis ? JSON.stringify(entry.analysis).length : 0);
    }, 0);

    return {
      totalEntries: this.cache.size,
      hitRate: totalRequests > 0 ? (this.hitCount / totalRequests) * 100 : 0,
      missRate: totalRequests > 0 ? (this.missCount / totalRequests) * 100 : 0,
      avgAge: avgAge / 1000, // en segundos
      memoryUsage: Math.round(memoryUsage / 1024), // en KB
    };
  }

  // Obtener entradas más populares
  getPopularEntries(limit: number = 5): Array<{key: string, hits: number, age: number}> {
    return Array.from(this.cache.entries())
      .map(([key, entry]) => ({
        key,
        hits: entry.hits,
        age: (Date.now() - entry.timestamp) / 1000,
      }))
      .sort((a, b) => b.hits - a.hits)
      .slice(0, limit);
  }

  // Limpiar entradas expiradas
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));

    if (keysToDelete.length > 0) {
      console.log(`ContextCache: Cleaned up ${keysToDelete.length} expired entries`);
    }
  }

  // Remover entrada más antigua (LRU básico)
  private evictOldestEntry(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  // Iniciar timer de limpieza
  private startCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }

    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  // Detener timer de limpieza
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.clear();
  }
}

// Instancia singleton del cache
export const contextCache = new ContextCache({
  maxEntries: 50,
  defaultTTL: 5 * 60 * 1000, // 5 minutos
  cleanupInterval: 2 * 60 * 1000, // 2 minutos
  enableAnalyticsCache: true,
});
