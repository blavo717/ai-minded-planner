
import { useState, useEffect, useCallback } from 'react';
import { messagePrefetcher } from './services/messagePrefetcher';

interface PrefetchPerformanceMetrics {
  totalPredictions: number;
  accuratePredictions: number;
  prefetchHits: number;
  prefetchMisses: number;
  averageResponseImprovement: number;
  patternAccuracy: number;
  backgroundTasksCompleted: number;
  predictiveCacheSize: number;
  totalTimeSaved: number;
  patternCount: number;
  backgroundTasksActive: number;
  averageConfidence: number;
  prefetchEfficiency: number;
  timeSavingsGrade: 'A' | 'B' | 'C' | 'D' | 'F';
  recommendations: string[];
}

export const usePrefetchPerformance = (monitoringInterval: number = 20000) => {
  const [metrics, setMetrics] = useState<PrefetchPerformanceMetrics | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);

  const calculateTimeSavingsGrade = useCallback((stats: any): 'A' | 'B' | 'C' | 'D' | 'F' => {
    let score = 100;
    
    // Penalizar por baja precisión de predicciones
    if (stats.patternAccuracy < 70) score -= 25;
    if (stats.patternAccuracy < 50) score -= 40;
    
    // Penalizar por pocas mejoras de tiempo
    if (stats.averageResponseImprovement < 100) score -= 20;
    if (stats.averageResponseImprovement < 50) score -= 35;
    
    // Penalizar por baja eficiencia de prefetch
    const hitRate = stats.prefetchHits + stats.prefetchMisses > 0 
      ? (stats.prefetchHits / (stats.prefetchHits + stats.prefetchMisses)) * 100 
      : 0;
    
    if (hitRate < 60) score -= 20;
    if (hitRate < 30) score -= 35;
    
    // Bonus por buen ahorro de tiempo
    if (stats.totalTimeSaved > 5000) score += 10; // 5+ segundos ahorrados
    if (stats.totalTimeSaved > 10000) score += 15; // 10+ segundos ahorrados
    
    // Bonus por alta confianza en patrones
    if (stats.averageConfidence > 0.7) score += 10;
    if (stats.averageConfidence > 0.8) score += 15;
    
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }, []);

  const generateRecommendations = useCallback((stats: any): string[] => {
    const recommendations: string[] = [];
    
    if (stats.patternAccuracy < 70) {
      recommendations.push('🎯 Mejorar detección de patrones - precisión baja');
    }
    
    if (stats.averageResponseImprovement < 100) {
      recommendations.push('⚡ Optimizar prefetch - mejoras de tiempo insuficientes');
    }
    
    const hitRate = stats.prefetchHits + stats.prefetchMisses > 0 
      ? (stats.prefetchHits / (stats.prefetchHits + stats.prefetchMisses)) * 100 
      : 0;
    
    if (hitRate < 60) {
      recommendations.push('🎲 Ajustar algoritmo de predicción - bajo hit rate');
    }
    
    if (stats.averageConfidence < 0.6) {
      recommendations.push('🧠 Aumentar profundidad de análisis - confianza baja');
    }
    
    if (stats.backgroundTasksActive > 5) {
      recommendations.push('🔄 Reducir tareas en background - sobrecarga detectada');
    }
    
    if (stats.predictiveCacheSize < 10 && stats.patternCount > 5) {
      recommendations.push('💾 Aumentar cache predictivo - patrones desaprovechados');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('✅ Prefetch funcionando óptimamente - mantener configuración');
    }
    
    return recommendations;
  }, []);

  const updateMetrics = useCallback(() => {
    try {
      const stats = messagePrefetcher.getStats();
      
      // Calcular eficiencia de prefetch
      const prefetchEfficiency = stats.prefetchHits + stats.prefetchMisses > 0 
        ? (stats.prefetchHits / (stats.prefetchHits + stats.prefetchMisses)) * 100 
        : 0;
      
      const timeSavingsGrade = calculateTimeSavingsGrade(stats);
      const recommendations = generateRecommendations(stats);

      const newMetrics: PrefetchPerformanceMetrics = {
        ...stats,
        prefetchEfficiency,
        timeSavingsGrade,
        recommendations,
      };

      setMetrics(newMetrics);
      
      console.log('🔮 Prefetch Performance Update:', {
        grade: timeSavingsGrade,
        patternAccuracy: `${stats.patternAccuracy.toFixed(1)}%`,
        avgImprovement: `${stats.averageResponseImprovement.toFixed(0)}ms`,
        prefetchEfficiency: `${prefetchEfficiency.toFixed(1)}%`,
        totalTimeSaved: `${(stats.totalTimeSaved / 1000).toFixed(1)}s`,
        patternCount: stats.patternCount,
      });

    } catch (error) {
      console.error('❌ Error updating prefetch metrics:', error);
    }
  }, [calculateTimeSavingsGrade, generateRecommendations]);

  const startMonitoring = useCallback(() => {
    if (!isMonitoring) {
      setIsMonitoring(true);
      updateMetrics(); // Actualización inicial
      console.log('🔮 Iniciando monitoreo de prefetch performance...');
    }
  }, [isMonitoring, updateMetrics]);

  const stopMonitoring = useCallback(() => {
    if (isMonitoring) {
      setIsMonitoring(false);
      console.log('⏹️ Deteniendo monitoreo de prefetch performance...');
    }
  }, [isMonitoring]);

  const clearPrefetchCache = useCallback(() => {
    messagePrefetcher.clear();
    updateMetrics();
    console.log('🧹 Cache de prefetch limpiado');
  }, [updateMetrics]);

  const simulateUserPattern = useCallback(async (userId: string, patternType: string) => {
    console.log(`🎭 Simulando patrón de usuario: ${patternType}`);
    
    // Simular secuencia de mensajes para testing
    const mockMessages = [
      { id: '1', type: 'user' as const, content: 'Necesito ayuda con mis tareas', timestamp: new Date(), metadata: {} },
      { id: '2', type: 'user' as const, content: 'Muéstrame mis proyectos activos', timestamp: new Date(), metadata: {} },
      { id: '3', type: 'user' as const, content: 'Analiza mi productividad', timestamp: new Date(), metadata: {} },
    ];
    
    // Procesar mensajes para generar patrones
    for (const message of mockMessages) {
      await messagePrefetcher.processMessageForPrefetch(userId, message);
      await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
    }
    
    updateMetrics();
  }, [updateMetrics]);

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
    clearPrefetchCache,
    simulateUserPattern,
  };
};
