import { useMemo, useCallback } from 'react';

/**
 * Optimizador de performance para cálculos pesados
 */
export class PerformanceOptimizer {
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();

  /**
   * Cachear resultados con TTL
   */
  memoizeWithTTL<T>(key: string, fn: () => T, ttlMs: number = 300000): T {
    const cached = this.cache.get(key);
    const now = Date.now();

    if (cached && now - cached.timestamp < cached.ttl) {
      return cached.data;
    }

    const result = fn();
    this.cache.set(key, {
      data: result,
      timestamp: now,
      ttl: ttlMs
    });

    return result;
  }

  /**
   * Limpiar cache expirado
   */
  cleanExpiredCache(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp >= value.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Debounce para operaciones frecuentes
   */
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  /**
   * Throttle para limitar frecuencia de ejecución
   */
  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  /**
   * Medidor de performance de funciones
   */
  static measurePerformance<T>(label: string, fn: () => T): T {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    
    if (end - start > 100) { // Solo logear si toma más de 100ms
      console.warn(`Performance warning: ${label} took ${(end - start).toFixed(2)}ms`);
    }
    
    return result;
  }
}

// Singleton instance
export const performanceOptimizer = new PerformanceOptimizer();

/**
 * Hook optimizado para cálculos de recomendaciones
 */
export const useOptimizedRecommendations = () => {
  const memoizedCalculations = useMemo(() => {
    return {
      calculateTaskScore: (task: any, context: any) => {
        return performanceOptimizer.memoizeWithTTL(
          `task-score-${task.id}-${JSON.stringify(context)}`,
          () => {
            // Cálculo simplificado pero efectivo
            let score = 50; // Base score
            
            // Factor urgencia (30% del peso)
            if (task.priority === 'high') score += 20;
            if (task.priority === 'medium') score += 10;
            if (task.due_date) {
              const daysUntilDue = Math.ceil((new Date(task.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
              if (daysUntilDue <= 1) score += 25;
              else if (daysUntilDue <= 3) score += 15;
              else if (daysUntilDue <= 7) score += 5;
            }
            
            // Factor contexto temporal (25% del peso)
            const hour = new Date().getHours();
            if (context.preferredHours?.includes(hour)) score += 15;
            if (context.energyLevel === 'high' && hour >= 9 && hour <= 11) score += 10;
            
            // Factor patrón usuario (20% del peso)
            if (task.tags?.some(tag => context.preferredTags?.includes(tag))) score += 12;
            
            // Factor momentum (15% del peso)
            if (task.status === 'in_progress') score += 15;
            
            // Factor aprendizaje (10% del peso)
            if (context.recentSuccessTasks?.includes(task.id)) score += 8;
            
            return Math.min(Math.max(score, 0), 100);
          },
          60000 // Cache por 1 minuto
        );
      },

      generateContextualMessage: (task: any, score: number) => {
        return performanceOptimizer.memoizeWithTTL(
          `context-message-${task.id}-${score}`,
          () => {
            const hour = new Date().getHours();
            const timeOfDay = hour < 12 ? 'mañana' : hour < 18 ? 'tarde' : 'noche';
            
            if (score > 80) {
              return `Momento perfecto para "${task.title}". Tu energía y el contexto actual están alineados.`;
            } else if (score > 60) {
              return `Buena opción para esta ${timeOfDay}. "${task.title}" encaja bien con tu ritmo actual.`;
            } else {
              return `Considera "${task.title}" cuando tengas un momento. Es una tarea importante en tu lista.`;
            }
          },
          300000 // Cache por 5 minutos
        );
      }
    };
  }, []);

  const debouncedUpdate = useCallback(
    PerformanceOptimizer.debounce((callback: () => void) => {
      callback();
    }, 500),
    []
  );

  return {
    calculateTaskScore: memoizedCalculations.calculateTaskScore,
    generateContextualMessage: memoizedCalculations.generateContextualMessage,
    debouncedUpdate
  };
};

/**
 * Hook para optimizar consultas a Supabase
 */
export const useOptimizedQueries = () => {
  const batchQueries = useCallback(async (queries: (() => Promise<any>)[]) => {
    return Promise.allSettled(queries.map(query => query()));
  }, []);

  const memoizedQuery = useCallback(<T>(
    key: string,
    queryFn: () => Promise<T>,
    ttl: number = 300000
  ): Promise<T> => {
    return performanceOptimizer.memoizeWithTTL(key, queryFn, ttl);
  }, []);

  return {
    batchQueries,
    memoizedQuery
  };
};