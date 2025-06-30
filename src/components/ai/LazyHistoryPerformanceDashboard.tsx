
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Database, 
  Clock, 
  Memory, 
  Zap, 
  TrendingUp, 
  Settings,
  RefreshCw,
  Trash2
} from 'lucide-react';

interface LazyHistoryPerformanceMetrics {
  cacheSize: number;
  loadedBatches: number;
  currentOffset: number;
  isLoading: boolean;
  hasMore: boolean;
  error: string | null;
}

interface LazyHistoryPerformanceDashboardProps {
  metrics: LazyHistoryPerformanceMetrics;
  onClearCache: () => void;
  onReset: () => void;
  onConfigure: (config: any) => void;
  className?: string;
}

export const LazyHistoryPerformanceDashboard: React.FC<LazyHistoryPerformanceDashboardProps> = ({
  metrics,
  onClearCache,
  onReset,
  onConfigure,
  className = ""
}) => {
  // Calcular métricas de rendimiento
  const memoryUsage = (metrics.cacheSize * 20) / 200 * 100; // Estimación
  const loadingEfficiency = metrics.loadedBatches > 0 ? 
    (metrics.currentOffset / (metrics.loadedBatches * 20)) * 100 : 0;
  
  const performanceGrade = getPerformanceGrade(memoryUsage, loadingEfficiency, metrics.error);
  const recommendations = getRecommendations(metrics);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">Lazy History Performance</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Badge 
                variant={performanceGrade === 'A' ? 'default' : 
                        performanceGrade === 'B' ? 'secondary' : 'destructive'}
                className="text-sm"
              >
                Grade: {performanceGrade}
              </Badge>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClearCache}
                  className="text-xs"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Clear
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onReset}
                  className="text-xs"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Reset
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Cache Size */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cache Size</p>
                <p className="text-2xl font-bold text-blue-600">{metrics.cacheSize}</p>
                <p className="text-xs text-gray-500">lotes en memoria</p>
              </div>
              <Memory className="h-8 w-8 text-blue-500" />
            </div>
            <div className="mt-2">
              <Progress value={memoryUsage} className="h-2" />
              <p className="text-xs text-gray-500 mt-1">{memoryUsage.toFixed(1)}% memoria</p>
            </div>
          </CardContent>
        </Card>

        {/* Loaded Batches */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Loaded Batches</p>
                <p className="text-2xl font-bold text-green-600">{metrics.loadedBatches}</p>
                <p className="text-xs text-gray-500">lotes cargados</p>
              </div>
              <Database className="h-8 w-8 text-green-500" />
            </div>
            <div className="mt-2">
              <Progress value={Math.min(metrics.loadedBatches * 2, 100)} className="h-2" />
              <p className="text-xs text-gray-500 mt-1">
                {metrics.hasMore ? 'Más disponible' : 'Completo'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Current Messages */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Messages Loaded</p>
                <p className="text-2xl font-bold text-purple-600">{metrics.currentOffset}</p>
                <p className="text-xs text-gray-500">mensajes totales</p>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
            <div className="mt-2">
              <Progress value={loadingEfficiency} className="h-2" />
              <p className="text-xs text-gray-500 mt-1">{loadingEfficiency.toFixed(1)}% eficiencia</p>
            </div>
          </CardContent>
        </Card>

        {/* Status */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Status</p>
                <p className={`text-2xl font-bold ${
                  metrics.error ? 'text-red-600' : 
                  metrics.isLoading ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {metrics.error ? 'Error' : 
                   metrics.isLoading ? 'Loading' : 'Ready'}
                </p>
                <p className="text-xs text-gray-500">
                  {metrics.error ? 'Con errores' : 
                   metrics.isLoading ? 'Cargando...' : 'Funcionando'}
                </p>
              </div>
              <Zap className={`h-8 w-8 ${
                metrics.error ? 'text-red-500' : 
                metrics.isLoading ? 'text-yellow-500' : 'text-green-500'
              }`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recomendaciones */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Recomendaciones de Optimización
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recommendations.map((rec, index) => (
              <div key={index} className="flex items-start gap-2 p-2 bg-blue-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                <p className="text-sm text-blue-800">{rec}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {metrics.error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-800">Error Detectado</p>
                <p className="text-xs text-red-600 mt-1">{metrics.error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Funciones auxiliares
function getPerformanceGrade(memoryUsage: number, loadingEfficiency: number, error: string | null): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (error) return 'F';
  
  let score = 100;
  
  // Penalizar por alto uso de memoria
  if (memoryUsage > 80) score -= 30;
  else if (memoryUsage > 60) score -= 15;
  
  // Penalizar por baja eficiencia
  if (loadingEfficiency < 70) score -= 20;
  else if (loadingEfficiency < 85) score -= 10;
  
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

function getRecommendations(metrics: LazyHistoryPerformanceMetrics): string[] {
  const recommendations: string[] = [];
  
  const memoryUsage = (metrics.cacheSize * 20) / 200 * 100;
  const loadingEfficiency = metrics.loadedBatches > 0 ? 
    (metrics.currentOffset / (metrics.loadedBatches * 20)) * 100 : 0;
  
  if (memoryUsage > 80) {
    recommendations.push('💾 Uso de memoria alto - considera limpiar cache o reducir tamaño de lote');
  }
  
  if (loadingEfficiency < 70) {
    recommendations.push('⚡ Eficiencia de carga baja - optimizar tamaño de lote');
  }
  
  if (metrics.cacheSize === 0 && metrics.loadedBatches > 0) {
    recommendations.push('🚀 Cache vacío - los lotes se están descargando demasiado pronto');
  }
  
  if (metrics.loadedBatches > 40) {
    recommendations.push('📚 Muchos lotes cargados - considera implementar límites más estrictos');
  }
  
  if (metrics.error) {
    recommendations.push('❌ Error activo - revisar conexión y configuración');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('✅ Lazy loading funcionando óptimamente - mantener configuración actual');
  }
  
  return recommendations;
}

export default LazyHistoryPerformanceDashboard;
