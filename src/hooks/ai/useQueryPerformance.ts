
import { useState, useEffect, useCallback } from 'react';
import { queryOptimizer } from './services/queryOptimizer';

interface QueryPerformanceMetrics {
  totalQueries: number;
  batchedQueries: number;
  averageResponseTime: number;
  cacheHitRate: number;
  slowQueries: number;
  optimizedQueries: number;
  cacheSize: number;
  batchingEfficiency: number;
  performanceGrade: 'A' | 'B' | 'C' | 'D' | 'F';
  recommendations: string[];
}

export const useQueryPerformance = (monitoringInterval: number = 30000) => {
  const [metrics, setMetrics] = useState<QueryPerformanceMetrics | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);

  const calculatePerformanceGrade = useCallback((stats: any): 'A' | 'B' | 'C' | 'D' | 'F' => {
    let score = 100;
    
    // Penalizar por tiempo de respuesta alto
    if (stats.averageResponseTime > 500) score -= 20;
    if (stats.averageResponseTime > 1000) score -= 30;
    
    // Penalizar por bajo cache hit rate
    if (stats.cacheHitRate < 60) score -= 15;
    if (stats.cacheHitRate < 30) score -= 25;
    
    // Penalizar por queries lentas
    const slowQueryRate = stats.totalQueries > 0 ? (stats.slowQueries / stats.totalQueries) * 100 : 0;
    if (slowQueryRate > 10) score -= 20;
    if (slowQueryRate > 25) score -= 35;
    
    // Bonus por buen batching
    if (stats.batchingEfficiency > 70) score += 10;
    if (stats.batchingEfficiency > 90) score += 15;
    
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }, []);

  const generateRecommendations = useCallback((stats: any): string[] => {
    const recommendations: string[] = [];
    
    if (stats.averageResponseTime > 500) {
      recommendations.push('⚡ Optimizar queries lentas - tiempo promedio alto');
    }
    
    if (stats.cacheHitRate < 60) {
      recommendations.push('💾 Mejorar estrategia de cache - hit rate bajo');
    }
    
    if (stats.batchingEfficiency < 50) {
      recommendations.push('📦 Implementar más batching - eficiencia baja');
    }
    
    const slowQueryRate = stats.totalQueries > 0 ? (stats.slowQueries / stats.totalQueries) * 100 : 0;
    if (slowQueryRate > 15) {
      recommendations.push('🐌 Revisar queries lentas - demasiadas queries > 1s');
    }
    
    if (stats.cacheSize > 100) {
      recommendations.push('🧹 Considerar limpiar cache - tamaño elevado');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('✅ Rendimiento óptimo - mantener estrategias actuales');
    }
    
    return recommendations;
  }, []);

  const updateMetrics = useCallback(() => {
    try {
      const stats = queryOptimizer.getStats();
      const performanceGrade = calculatePerformanceGrade(stats);
      const recommendations = generateRecommendations(stats);

      const newMetrics: QueryPerformanceMetrics = {
        ...stats,
        performanceGrade,
        recommendations,
      };

      setMetrics(newMetrics);
      
      console.log('📊 Query Performance Update:', {
        grade: performanceGrade,
        avgResponseTime: `${stats.averageResponseTime.toFixed(0)}ms`,
        cacheHitRate: `${stats.cacheHitRate.toFixed(1)}%`,
        batchingEfficiency: `${stats.batchingEfficiency.toFixed(1)}%`,
        totalQueries: stats.totalQueries,
      });

    } catch (error) {
      console.error('❌ Error updating query metrics:', error);
    }
  }, [calculatePerformanceGrade, generateRecommendations]);

  const startMonitoring = useCallback(() => {
    if (!isMonitoring) {
      setIsMonitoring(true);
      updateMetrics(); // Actualización inicial
      console.log('🔍 Iniciando monitoreo de query performance...');
    }
  }, [isMonitoring, updateMetrics]);

  const stopMonitoring = useCallback(() => {
    if (isMonitoring) {
      setIsMonitoring(false);
      console.log('⏹️ Deteniendo monitoreo de query performance...');
    }
  }, [isMonitoring]);

  const clearQueryCache = useCallback(() => {
    queryOptimizer.clear();
    updateMetrics();
    console.log('🧹 Cache de queries limpiado');
  }, [updateMetrics]);

  const runOptimizedQuery = useCallback(async (type: 'messages' | 'tasks' | 'projects', userId: string, params?: any) => {
    const startTime = Date.now();
    
    try {
      let result;
      
      switch (type) {
        case 'messages':
          result = await queryOptimizer.optimizedChatMessagesQuery(userId, params?.limit);
          break;
        case 'tasks':
          result = await queryOptimizer.optimizedTasksQuery(userId, params);
          break;
        case 'projects':
          result = await queryOptimizer.optimizedProjectsQuery(userId);
          break;
        default:
          throw new Error(`Tipo de query no soportado: ${type}`);
      }
      
      const responseTime = Date.now() - startTime;
      console.log(`⚡ Query optimizada completada: ${type} en ${responseTime}ms`);
      
      return result;
    } catch (error) {
      console.error(`❌ Error en query optimizada ${type}:`, error);
      throw error;
    }
  }, []);

  // Efecto para monitoreo automático
  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(updateMetrics, monitoringInterval);
    return () => clearInterval(interval);
  }, [isMonitoring, monitoringInterval, updateMetrics]);

  // Inicializar métricas al montar
  useEffect(() => {
    updateMetrics();
  }, [updateMetrics]);

  return {
    metrics,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    updateMetrics,
    clearQueryCache,
    runOptimizedQuery,
  };
};
