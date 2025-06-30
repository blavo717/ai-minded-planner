
import { supabase } from '@/integrations/supabase/client';

// Configuración del optimizador
interface QueryOptimizerConfig {
  batchSize: number;
  batchTimeout: number; // ms
  connectionPoolSize: number;
  queryTimeout: number; // ms
  enableQueryAnalysis: boolean;
  cacheQueries: boolean;
  cacheTTL: number; // ms
}

// Estadísticas de queries
interface QueryStats {
  totalQueries: number;
  batchedQueries: number;
  averageResponseTime: number;
  cacheHitRate: number;
  slowQueries: number;
  optimizedQueries: number;
}

// Batch de queries pendientes
interface QueryBatch {
  queries: Array<{
    id: string;
    query: () => Promise<any>;
    resolve: (value: any) => void;
    reject: (error: any) => void;
    timestamp: number;
    table: string;
    operation: string;
  }>;
  timer: NodeJS.Timeout | null;
}

// Cache de queries
interface QueryCacheEntry {
  data: any;
  timestamp: number;
  key: string;
  ttl: number;
}

class QueryOptimizer {
  private config: QueryOptimizerConfig;
  private stats: QueryStats;
  private queryBatch: QueryBatch;
  private queryCache = new Map<string, QueryCacheEntry>();
  private slowQueryThreshold = 1000; // 1 segundo
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor(config: Partial<QueryOptimizerConfig> = {}) {
    this.config = {
      batchSize: 5,
      batchTimeout: 100, // 100ms
      connectionPoolSize: 10,
      queryTimeout: 5000, // 5 segundos
      enableQueryAnalysis: true,
      cacheQueries: true,
      cacheTTL: 2 * 60 * 1000, // 2 minutos
      ...config,
    };

    this.stats = {
      totalQueries: 0,
      batchedQueries: 0,
      averageResponseTime: 0,
      cacheHitRate: 0,
      slowQueries: 0,
      optimizedQueries: 0,
    };

    this.queryBatch = {
      queries: [],
      timer: null,
    };

    this.startCleanupTimer();
    console.log('🚀 QueryOptimizer inicializado:', this.config);
  }

  // Generar clave de cache para query
  private generateCacheKey(table: string, operation: string, params?: any): string {
    const paramStr = params ? JSON.stringify(params) : '';
    return `${table}:${operation}:${btoa(paramStr).substring(0, 32)}`;
  }

  // Verificar cache de query
  private getCachedQuery(key: string): any | null {
    if (!this.config.cacheQueries) return null;

    const entry = this.queryCache.get(key);
    if (!entry) return null;

    const isExpired = (Date.now() - entry.timestamp) > entry.ttl;
    if (isExpired) {
      this.queryCache.delete(key);
      return null;
    }

    console.log('✅ Query cache hit:', key);
    return entry.data;
  }

  // Cachear resultado de query
  private setCachedQuery(key: string, data: any): void {
    if (!this.config.cacheQueries) return;

    this.queryCache.set(key, {
      data: JSON.parse(JSON.stringify(data)), // Deep copy
      timestamp: Date.now(),
      key,
      ttl: this.config.cacheTTL,
    });

    console.log('💾 Query cacheada:', key);
  }

  // Ejecutar batch de queries
  private async executeBatch(): Promise<void> {
    if (this.queryBatch.queries.length === 0) return;

    const queries = [...this.queryBatch.queries];
    this.queryBatch.queries = [];
    
    if (this.queryBatch.timer) {
      clearTimeout(this.queryBatch.timer);
      this.queryBatch.timer = null;
    }

    console.log(`⚡ Ejecutando batch de ${queries.length} queries`);
    
    // Ejecutar queries en paralelo (pero controlado)
    const batchPromises = queries.map(async (queryItem) => {
      const startTime = Date.now();
      
      try {
        const result = await Promise.race([
          queryItem.query(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Query timeout')), this.config.queryTimeout)
          )
        ]);

        const responseTime = Date.now() - startTime;
        this.updateStats(responseTime, false);

        queryItem.resolve(result);
        return { success: true, responseTime };
      } catch (error) {
        console.error('❌ Error en query batch:', error);
        queryItem.reject(error);
        return { success: false, responseTime: Date.now() - startTime };
      }
    });

    const results = await Promise.allSettled(batchPromises);
    this.stats.batchedQueries += queries.length;
    
    console.log(`✅ Batch completado: ${results.filter(r => r.status === 'fulfilled').length}/${queries.length} exitosas`);
  }

  // Actualizar estadísticas
  private updateStats(responseTime: number, fromCache: boolean): void {
    this.stats.totalQueries++;
    
    if (fromCache) {
      // Actualizar cache hit rate
      const totalNonCached = this.stats.totalQueries - Math.floor(this.stats.totalQueries * (this.stats.cacheHitRate / 100));
      this.stats.cacheHitRate = ((totalNonCached - 1) / this.stats.totalQueries) * 100;
    } else {
      // Actualizar tiempo promedio
      this.stats.averageResponseTime = (
        (this.stats.averageResponseTime * (this.stats.totalQueries - 1) + responseTime) / 
        this.stats.totalQueries
      );
      
      if (responseTime > this.slowQueryThreshold) {
        this.stats.slowQueries++;
      }
    }
  }

  // Query optimizada para ai_chat_messages
  async optimizedChatMessagesQuery(userId: string, limit: number = 100): Promise<any> {
    const cacheKey = this.generateCacheKey('ai_chat_messages', 'user_history', { userId, limit });
    
    // Verificar cache primero
    const cached = this.getCachedQuery(cacheKey);
    if (cached) {
      this.updateStats(0, true);
      return cached;
    }

    const queryFn = async () => {
      // Query optimizada con índices
      const { data, error } = await supabase
        .from('ai_chat_messages')
        .select('id, type, content, created_at, context_data')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
        .limit(limit);

      if (error) throw error;
      return data;
    };

    return this.addToBatch('ai_chat_messages', 'user_history', queryFn, cacheKey);
  }

  // Query optimizada para tareas
  async optimizedTasksQuery(userId: string, filters?: any): Promise<any> {
    const cacheKey = this.generateCacheKey('tasks', 'user_tasks', { userId, ...filters });
    
    const cached = this.getCachedQuery(cacheKey);
    if (cached) {
      this.updateStats(0, true);
      return cached;
    }

    const queryFn = async () => {
      let query = supabase
        .from('tasks')
        .select(`
          id, title, description, status, priority, due_date, 
          created_at, updated_at, completed_at,
          project:projects(id, name, status)
        `)
        .eq('user_id', userId);

      // Aplicar filtros si existen
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.priority) {
        query = query.eq('priority', filters.priority);
      }
      if (filters?.project_id) {
        query = query.eq('project_id', filters.project_id);
      }

      const { data, error } = await query
        .order('updated_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    };

    return this.addToBatch('tasks', 'user_tasks', queryFn, cacheKey);
  }

  // Query optimizada para proyectos
  async optimizedProjectsQuery(userId: string): Promise<any> {
    const cacheKey = this.generateCacheKey('projects', 'user_projects', { userId });
    
    const cached = this.getCachedQuery(cacheKey);
    if (cached) {
      this.updateStats(0, true);
      return cached;
    }

    const queryFn = async () => {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          id, name, description, status, priority,
          created_at, updated_at, due_date,
          tasks:tasks(count)
        `)
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data;
    };

    return this.addToBatch('projects', 'user_projects', queryFn, cacheKey);
  }

  // Agregar query al batch
  private addToBatch(table: string, operation: string, queryFn: () => Promise<any>, cacheKey?: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const queryId = `${table}_${operation}_${Date.now()}_${Math.random()}`;
      
      this.queryBatch.queries.push({
        id: queryId,
        query: async () => {
          const result = await queryFn();
          
          // Cachear resultado si tiene clave
          if (cacheKey && result) {
            this.setCachedQuery(cacheKey, result);
          }
          
          return result;
        },
        resolve,
        reject,
        timestamp: Date.now(),
        table,
        operation,
      });

      // Si alcanzamos el tamaño del batch, ejecutar inmediatamente
      if (this.queryBatch.queries.length >= this.config.batchSize) {
        this.executeBatch();
      } else {
        // Si no, programar ejecución después del timeout
        if (this.queryBatch.timer) {
          clearTimeout(this.queryBatch.timer);
        }
        
        this.queryBatch.timer = setTimeout(() => {
          this.executeBatch();
        }, this.config.batchTimeout);
      }
    });
  }

  // Limpiar cache expirado
  private cleanupCache(): void {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, entry] of this.queryCache.entries()) {
      if ((now - entry.timestamp) > entry.ttl) {
        this.queryCache.delete(key);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      console.log(`🧹 QueryOptimizer: Limpiadas ${cleaned} queries de cache expiradas`);
    }
  }

  // Iniciar timer de limpieza
  private startCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }

    this.cleanupTimer = setInterval(() => {
      this.cleanupCache();
    }, 5 * 60 * 1000); // Cada 5 minutos
  }

  // Obtener estadísticas
  getStats(): QueryStats & { cacheSize: number; batchingEfficiency: number } {
    const batchingEfficiency = this.stats.totalQueries > 0 ? 
      (this.stats.batchedQueries / this.stats.totalQueries) * 100 : 0;

    return {
      ...this.stats,
      cacheSize: this.queryCache.size,
      batchingEfficiency,
    };
  }

  // Limpiar todo
  clear(): void {
    this.queryCache.clear();
    this.queryBatch.queries = [];
    if (this.queryBatch.timer) {
      clearTimeout(this.queryBatch.timer);
      this.queryBatch.timer = null;
    }
    
    this.stats = {
      totalQueries: 0,
      batchedQueries: 0,
      averageResponseTime: 0,
      cacheHitRate: 0,
      slowQueries: 0,
      optimizedQueries: 0,
    };
    
    console.log('🧹 QueryOptimizer completamente limpiado');
  }

  // Destruir optimizador
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.clear();
  }
}

// Instancia singleton del query optimizer
export const queryOptimizer = new QueryOptimizer({
  batchSize: 3,
  batchTimeout: 150, // 150ms para mejor UX
  connectionPoolSize: 8,
  queryTimeout: 3000, // 3 segundos
  enableQueryAnalysis: true,
  cacheQueries: true,
  cacheTTL: 3 * 60 * 1000, // 3 minutos
});

export default QueryOptimizer;
