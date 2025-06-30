
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Zap, 
  Clock, 
  Target,
  Activity,
  Trash2,
  Play,
  Pause,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Cpu,
  Timer
} from 'lucide-react';
import { usePrefetchPerformance } from '@/hooks/ai/usePrefetchPerformance';
import { useAuth } from '@/hooks/useAuth';

const PrefetchPerformanceDashboard = () => {
  const { user } = useAuth();
  const {
    metrics,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    updateMetrics,
    clearPrefetchCache,
    simulateUserPattern,
  } = usePrefetchPerformance();

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
            <Brain className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-500">Cargando métricas de prefetch...</p>
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
              <Brain className="h-5 w-5" />
              Prefetch Performance Dashboard
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
                onClick={clearPrefetchCache}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              {user && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => simulateUserPattern(user.id, 'productivity_flow')}
                >
                  <Activity className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Calificación general */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium mb-2">Calificación de Ahorro de Tiempo</h3>
              <div className="flex items-center gap-3">
                {getPerformanceIcon(metrics.timeSavingsGrade)}
                <Badge className={`text-2xl font-bold px-4 py-2 ${getGradeColor(metrics.timeSavingsGrade)}`}>
                  {metrics.timeSavingsGrade}
                </Badge>
                <span className="text-sm text-gray-600">
                  {metrics.timeSavingsGrade === 'A' && 'Excelente prefetch'}
                  {metrics.timeSavingsGrade === 'B' && 'Buen prefetch'}
                  {metrics.timeSavingsGrade === 'C' && 'Prefetch aceptable'}
                  {metrics.timeSavingsGrade === 'D' && 'Prefetch mejorable'}
                  {metrics.timeSavingsGrade === 'F' && 'Prefetch ineficiente'}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Tiempo Total Ahorrado</p>
              <p className="text-2xl font-bold">{(metrics.totalTimeSaved / 1000).toFixed(1)}s</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Precisión de Patrones */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Target className="h-5 w-5 text-blue-600" />
              <Badge variant={metrics.patternAccuracy > 75 ? "default" : "secondary"}>
                {metrics.patternAccuracy > 75 ? 'Preciso' : 'Aprendiendo'}
              </Badge>
            </div>
            <p className="text-sm font-medium text-gray-600">Precisión de Patrones</p>
            <p className="text-2xl font-bold">{metrics.patternAccuracy.toFixed(1)}%</p>
            <Progress value={metrics.patternAccuracy} className="mt-2" />
          </CardContent>
        </Card>

        {/* Eficiencia de Prefetch */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Zap className="h-5 w-5 text-green-600" />
              <Badge variant={metrics.prefetchEfficiency > 60 ? "default" : "secondary"}>
                {metrics.prefetchEfficiency > 60 ? 'Eficiente' : 'Optimizando'}
              </Badge>
            </div>
            <p className="text-sm font-medium text-gray-600">Eficiencia Prefetch</p>
            <p className="text-2xl font-bold">{metrics.prefetchEfficiency.toFixed(1)}%</p>
            <Progress value={metrics.prefetchEfficiency} className="mt-2" />
          </CardContent>
        </Card>

        {/* Mejora Promedio */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock className="h-5 w-5 text-purple-600" />
              <Badge variant={metrics.averageResponseImprovement > 100 ? "default" : "secondary"}>
                {metrics.averageResponseImprovement > 100 ? 'Rápido' : 'Lento'}
              </Badge>
            </div>
            <p className="text-sm font-medium text-gray-600">Mejora Promedio</p>
            <p className="text-2xl font-bold">{metrics.averageResponseImprovement.toFixed(0)}ms</p>
            <Progress 
              value={Math.min(metrics.averageResponseImprovement / 2, 100)} 
              className="mt-2" 
            />
          </CardContent>
        </Card>

        {/* Patrones Detectados */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Brain className="h-5 w-5 text-orange-600" />
              <Badge variant={metrics.patternCount > 0 ? "default" : "secondary"}>
                {metrics.patternCount > 0 ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>
            <p className="text-sm font-medium text-gray-600">Patrones Detectados</p>
            <p className="text-2xl font-bold">{metrics.patternCount}</p>
            <p className="text-xs text-gray-500 mt-1">
              Confianza: {(metrics.averageConfidence * 100).toFixed(0)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Estadísticas detalladas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Estadísticas de Prefetch */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Estadísticas de Prefetch
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-600 font-medium">Hits</p>
                <p className="text-xl font-bold text-green-800">{metrics.prefetchHits}</p>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <p className="text-sm text-red-600 font-medium">Misses</p>
                <p className="text-xl font-bold text-red-800">{metrics.prefetchMisses}</p>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-600 font-medium">Predicciones</p>
                <p className="text-xl font-bold text-blue-800">{metrics.totalPredictions}</p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-600 font-medium">Precisas</p>
                <p className="text-xl font-bold text-purple-800">{metrics.accuratePredictions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estado del Sistema */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Cpu className="h-5 w-5" />
              Estado del Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Tareas en Background</span>
                <Badge variant={metrics.backgroundTasksActive > 3 ? "destructive" : "default"}>
                  {metrics.backgroundTasksActive}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Cache Predictivo</span>
                <Badge variant="outline">
                  {metrics.predictiveCacheSize}/30
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Tareas Completadas</span>
                <Badge variant="outline">
                  {metrics.backgroundTasksCompleted}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Confianza Promedio</span>
                <Badge variant="outline">
                  {(metrics.averageConfidence * 100).toFixed(0)}%
                </Badge>
              </div>
            </div>
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

      {/* Métricas de Tiempo */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Timer className="h-5 w-5" />
            Análisis de Tiempo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {(metrics.totalTimeSaved / 1000).toFixed(1)}s
              </div>
              <p className="text-sm text-gray-600">Tiempo Total Ahorrado</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {metrics.averageResponseImprovement.toFixed(0)}ms
              </div>
              <p className="text-sm text-gray-600">Mejora Promedio</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {metrics.prefetchHits > 0 ? (metrics.totalTimeSaved / metrics.prefetchHits).toFixed(0) : 0}ms
              </div>
              <p className="text-sm text-gray-600">Ahorro por Hit</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrefetchPerformanceDashboard;
