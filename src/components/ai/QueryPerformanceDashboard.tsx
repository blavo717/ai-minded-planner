
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Database, 
  TrendingUp, 
  Clock, 
  Zap,
  Package,
  Trash2,
  Play,
  Pause,
  RotateCcw,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { useQueryPerformance } from '@/hooks/ai/useQueryPerformance';

const QueryPerformanceDashboard = () => {
  const {
    metrics,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    updateMetrics,
    clearQueryCache,
  } = useQueryPerformance();

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'text-green-600 bg-green-100';
      case 'B': return 'text-blue-600 bg-blue-100';
      case 'C': return 'text-yellow-600 bg-yellow-100';
      case 'D': return 'text-orange-600 bg-orange-100';
      case 'F': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPerformanceIcon = (grade: string) => {
    if (['A', 'B'].includes(grade)) {
      return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    }
    return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
  };

  if (!metrics) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-center">
            <Database className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-500">Cargando métricas de queries...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header de controles */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Query Performance Dashboard
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={isMonitoring ? "default" : "secondary"}>
                {isMonitoring ? "Monitoreando" : "Pausado"}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={isMonitoring ? stopMonitoring : startMonitoring}
              >
                {isMonitoring ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={updateMetrics}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearQueryCache}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Calificación general */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium mb-2">Calificación General</h3>
              <div className="flex items-center gap-3">
                {getPerformanceIcon(metrics.performanceGrade)}
                <Badge className={`text-2xl font-bold px-4 py-2 ${getGradeColor(metrics.performanceGrade)}`}>
                  {metrics.performanceGrade}
                </Badge>
                <span className="text-sm text-gray-600">
                  {metrics.performanceGrade === 'A' && 'Excelente'}
                  {metrics.performanceGrade === 'B' && 'Bueno'}
                  {metrics.performanceGrade === 'C' && 'Aceptable'}
                  {metrics.performanceGrade === 'D' && 'Mejorable'}
                  {metrics.performanceGrade === 'F' && 'Crítico'}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Total Queries</p>
              <p className="text-2xl font-bold">{metrics.totalQueries}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tiempo de Respuesta */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <Badge variant={metrics.averageResponseTime < 200 ? "default" : "secondary"}>
                {metrics.averageResponseTime < 200 ? 'Rápido' : 
                 metrics.averageResponseTime < 500 ? 'Normal' : 'Lento'}
              </Badge>
            </div>
            <p className="text-sm font-medium text-gray-600">Tiempo Promedio</p>
            <p className="text-2xl font-bold">{metrics.averageResponseTime.toFixed(0)}ms</p>
            <Progress 
              value={Math.min((1000 - metrics.averageResponseTime) / 10, 100)} 
              className="mt-2" 
            />
          </CardContent>
        </Card>

        {/* Cache Hit Rate */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Zap className="h-5 w-5 text-green-600" />
              <Badge variant={metrics.cacheHitRate > 70 ? "default" : "secondary"}>
                {metrics.cacheHitRate > 70 ? 'Eficiente' : 'Mejorable'}
              </Badge>
            </div>
            <p className="text-sm font-medium text-gray-600">Cache Hit Rate</p>
            <p className="text-2xl font-bold">{metrics.cacheHitRate.toFixed(1)}%</p>
            <Progress value={metrics.cacheHitRate} className="mt-2" />
          </CardContent>
        </Card>

        {/* Batching Efficiency */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Package className="h-5 w-5 text-purple-600" />
              <Badge variant={metrics.batchingEfficiency > 60 ? "default" : "secondary"}>
                {metrics.batchingEfficiency > 60 ? 'Optimizado' : 'Sin batch'}
              </Badge>
            </div>
            <p className="text-sm font-medium text-gray-600">Batching</p>
            <p className="text-2xl font-bold">{metrics.batchingEfficiency.toFixed(1)}%</p>
            <Progress value={metrics.batchingEfficiency} className="mt-2" />
          </CardContent>
        </Card>

        {/* Queries Lentas */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              <Badge variant={metrics.slowQueries === 0 ? "default" : "destructive"}>
                {metrics.slowQueries === 0 ? 'Óptimo' : 'Revisar'}
              </Badge>
            </div>
            <p className="text-sm font-medium text-gray-600">Queries Lentas</p>
            <p className="text-2xl font-bold">{metrics.slowQueries}</p>
            <p className="text-xs text-gray-500 mt-1">
              {metrics.totalQueries > 0 ? 
                `${((metrics.slowQueries / metrics.totalQueries) * 100).toFixed(1)}% del total` :
                'No hay datos'
              }
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recomendaciones */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Recomendaciones de Optimización
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {metrics.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 mt-1">
                  {recommendation.includes('✅') ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  )}
                </div>
                <p className="text-sm">{recommendation}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas detalladas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Estadísticas Detalladas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600 font-medium">Queries Batcheadas</p>
              <p className="text-xl font-bold text-blue-800">{metrics.batchedQueries}</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-600 font-medium">Cache Size</p>
              <p className="text-xl font-bold text-green-800">{metrics.cacheSize}</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-600 font-medium">Optimizadas</p>
              <p className="text-xl font-bold text-purple-800">{metrics.optimizedQueries}</p>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <p className="text-sm text-orange-600 font-medium">Queries > 1s</p>
              <p className="text-xl font-bold text-orange-800">{metrics.slowQueries}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QueryPerformanceDashboard;
