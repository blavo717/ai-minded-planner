import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { 
  Zap, 
  Clock, 
  TrendingUp, 
  Database,
  RefreshCw,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { performanceMonitor } from '@/utils/performanceMonitor';

interface PerformanceMetrics {
  recommendation_generation: number[];
  user_behavior_analysis: number[];
  component_render: number[];
  cache_operation: number[];
}

interface CacheStats {
  hitRate: number;
  size: number;
  hitCount: number;
  missCount: number;
}

interface PerformanceDashboardProps {
  className?: string;
}

export const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({ className }) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    recommendation_generation: [],
    user_behavior_analysis: [],
    component_render: [],
    cache_operation: []
  });
  const [cacheStats, setCacheStats] = useState<CacheStats>({
    hitRate: 0,
    size: 0,
    hitCount: 0,
    missCount: 0
  });
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      updateMetrics();
    }, 5000); // Update every 5 seconds

    updateMetrics(); // Initial load

    return () => clearInterval(interval);
  }, []);

  const updateMetrics = () => {
    const performanceMetrics = performanceMonitor.getMetrics();
    
    // Group metrics by name and get recent values
    const groupedMetrics: PerformanceMetrics = {
      recommendation_generation: [],
      user_behavior_analysis: [],
      component_render: [],
      cache_operation: []
    };

    performanceMetrics.forEach(metric => {
      if (metric.duration && groupedMetrics[metric.name as keyof PerformanceMetrics]) {
        groupedMetrics[metric.name as keyof PerformanceMetrics].push(metric.duration);
      }
    });

    // Keep only last 20 measurements for each metric
    Object.keys(groupedMetrics).forEach(key => {
      const metricKey = key as keyof PerformanceMetrics;
      groupedMetrics[metricKey] = groupedMetrics[metricKey].slice(-20);
    });

    setMetrics(groupedMetrics);
    setLastUpdated(new Date());
  };

  const getAverageTime = (times: number[]): number => {
    if (times.length === 0) return 0;
    return times.reduce((sum, time) => sum + time, 0) / times.length;
  };

  const getStatusIcon = (avgTime: number, threshold: number) => {
    if (avgTime <= threshold) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    } else if (avgTime <= threshold * 1.5) {
      return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    } else {
      return <AlertTriangle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusColor = (avgTime: number, threshold: number): string => {
    if (avgTime <= threshold) return 'text-green-600';
    if (avgTime <= threshold * 1.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const prepareChartData = (metricName: keyof PerformanceMetrics) => {
    return metrics[metricName].map((value, index) => ({
      index: index + 1,
      value: Math.round(value * 100) / 100
    }));
  };

  const thresholds = {
    recommendation_generation: 200,
    user_behavior_analysis: 5000,
    component_render: 16,
    cache_operation: 10
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">Performance Dashboard</h2>
          <Badge variant="outline" className="text-xs">
            Phase 4
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-xs text-muted-foreground">
              Actualizado: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <Button variant="outline" size="sm" onClick={updateMetrics}>
            <RefreshCw className="w-4 h-4 mr-1" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Performance Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Generación de Recomendaciones</p>
                <p className="text-2xl font-bold">
                  {Math.round(getAverageTime(metrics.recommendation_generation))}ms
                </p>
                <p className="text-xs text-muted-foreground">
                  Límite: {thresholds.recommendation_generation}ms
                </p>
              </div>
              {getStatusIcon(getAverageTime(metrics.recommendation_generation), thresholds.recommendation_generation)}
            </div>
            <Progress 
              value={Math.min(100, (getAverageTime(metrics.recommendation_generation) / thresholds.recommendation_generation) * 100)} 
              className="mt-2" 
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Análisis de Comportamiento</p>
                <p className="text-2xl font-bold">
                  {Math.round(getAverageTime(metrics.user_behavior_analysis))}ms
                </p>
                <p className="text-xs text-muted-foreground">
                  Límite: {thresholds.user_behavior_analysis}ms
                </p>
              </div>
              {getStatusIcon(getAverageTime(metrics.user_behavior_analysis), thresholds.user_behavior_analysis)}
            </div>
            <Progress 
              value={Math.min(100, (getAverageTime(metrics.user_behavior_analysis) / thresholds.user_behavior_analysis) * 100)} 
              className="mt-2" 
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Renderizado de Componentes</p>
                <p className="text-2xl font-bold">
                  {Math.round(getAverageTime(metrics.component_render))}ms
                </p>
                <p className="text-xs text-muted-foreground">
                  Límite: {thresholds.component_render}ms
                </p>
              </div>
              {getStatusIcon(getAverageTime(metrics.component_render), thresholds.component_render)}
            </div>
            <Progress 
              value={Math.min(100, (getAverageTime(metrics.component_render) / thresholds.component_render) * 100)} 
              className="mt-2" 
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Operaciones de Cache</p>
                <p className="text-2xl font-bold">
                  {Math.round(getAverageTime(metrics.cache_operation))}ms
                </p>
                <p className="text-xs text-muted-foreground">
                  Límite: {thresholds.cache_operation}ms
                </p>
              </div>
              {getStatusIcon(getAverageTime(metrics.cache_operation), thresholds.cache_operation)}
            </div>
            <Progress 
              value={Math.min(100, (getAverageTime(metrics.cache_operation) / thresholds.cache_operation) * 100)} 
              className="mt-2" 
            />
          </CardContent>
        </Card>
      </div>

      {/* Performance Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Tendencias de Rendimiento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={prepareChartData('recommendation_generation')}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="index" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  name="Tiempo de Generación (ms)" 
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Estadísticas de Cache
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Tasa de Aciertos</span>
                <span className="text-2xl font-bold text-green-600">
                  {Math.round(cacheStats.hitRate)}%
                </span>
              </div>
              <Progress value={cacheStats.hitRate} className="h-2" />
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Aciertos</p>
                  <p className="text-lg font-semibold">{cacheStats.hitCount}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Fallos</p>
                  <p className="text-lg font-semibold">{cacheStats.missCount}</p>
                </div>
              </div>
              
              <div>
                <p className="text-muted-foreground">Tamaño del Cache</p>
                <p className="text-lg font-semibold">{cacheStats.size} entradas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Insights de Rendimiento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {getAverageTime(metrics.recommendation_generation) <= thresholds.recommendation_generation && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-green-800">Rendimiento Óptimo</h4>
                    <p className="text-sm text-green-700">
                      Las recomendaciones se generan dentro del tiempo objetivo (&lt;200ms).
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {cacheStats.hitRate > 70 && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Database className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-800">Cache Eficiente</h4>
                    <p className="text-sm text-blue-700">
                      El sistema de cache está funcionando bien con {Math.round(cacheStats.hitRate)}% de aciertos.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {getAverageTime(metrics.recommendation_generation) > thresholds.recommendation_generation && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-800">Optimización Necesaria</h4>
                    <p className="text-sm text-yellow-700">
                      Las recomendaciones están tardando más de lo esperado. Considera limpiar el cache o revisar la lógica.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
