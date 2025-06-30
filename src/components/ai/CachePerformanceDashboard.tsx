
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Database, 
  TrendingUp, 
  MemoryStick, 
  Timer, 
  Trash2,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { useCachePerformance } from '@/hooks/ai/useCachePerformance';

const CachePerformanceDashboard = () => {
  const {
    metrics,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    updateMetrics,
    clearAllCaches,
    getPopularConversations,
  } = useCachePerformance();

  const popularConversations = getPopularConversations();

  const getPerformanceColor = (value: number, thresholds: [number, number] = [50, 80]) => {
    if (value >= thresholds[1]) return 'text-green-600';
    if (value >= thresholds[0]) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceBadge = (value: number, thresholds: [number, number] = [50, 80]) => {
    if (value >= thresholds[1]) return 'bg-green-100 text-green-800';
    if (value >= thresholds[0]) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  if (!metrics) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-center">
            <Database className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-500">Cargando métricas del cache...</p>
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
              Cache Performance Dashboard
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
                onClick={clearAllCaches}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Hit Rate */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Hit Rate</p>
                <p className={`text-2xl font-bold ${getPerformanceColor(metrics.conversationCache.hitRate)}`}>
                  {metrics.conversationCache.hitRate.toFixed(1)}%
                </p>
              </div>
              <TrendingUp className={`h-8 w-8 ${getPerformanceColor(metrics.conversationCache.hitRate)}`} />
            </div>
            <Badge className={`mt-2 ${getPerformanceBadge(metrics.conversationCache.hitRate)}`}>
              {metrics.conversationCache.hitRate >= 80 ? 'Excelente' : 
               metrics.conversationCache.hitRate >= 50 ? 'Bueno' : 'Mejorable'}
            </Badge>
          </CardContent>
        </Card>

        {/* Memory Usage */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Memoria</p>
                <p className="text-2xl font-bold">
                  {metrics.overallPerformance.totalMemoryUsage}KB
                </p>
              </div>
              <MemoryStick className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {metrics.conversationCache.totalMessages} mensajes
            </p>
          </CardContent>
        </Card>

        {/* Conversations */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversaciones</p>
                <p className="text-2xl font-bold">
                  {metrics.conversationCache.totalEntries}
                </p>
              </div>
              <Database className="h-8 w-8 text-purple-600" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {metrics.conversationCache.avgConversationSize.toFixed(0)} msg/conv promedio
            </p>
          </CardContent>
        </Card>

        {/* Efficiency */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Eficiencia</p>
                <p className={`text-2xl font-bold ${getPerformanceColor(metrics.overallPerformance.cacheEfficiency * 100)}`}>
                  {(metrics.overallPerformance.cacheEfficiency * 100).toFixed(1)}%
                </p>
              </div>
              <Timer className={`h-8 w-8 ${getPerformanceColor(metrics.overallPerformance.cacheEfficiency * 100)}`} />
            </div>
            <Badge className={`mt-2 ${getPerformanceBadge(metrics.overallPerformance.cacheEfficiency * 100)}`}>
              {metrics.overallPerformance.cacheEfficiency >= 0.8 ? 'Óptima' : 
               metrics.overallPerformance.cacheEfficiency >= 0.5 ? 'Buena' : 'Mejorable'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Conversaciones populares */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Conversaciones Más Populares</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {popularConversations.length > 0 ? (
              popularConversations.map((conv, index) => (
                <div key={conv.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{index + 1}</Badge>
                    <div>
                      <p className="font-medium">{conv.key}</p>
                      <p className="text-sm text-gray-500">
                        {conv.messageCount} mensajes • {conv.hitCount} accesos
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary">
                      {new Date(conv.lastAccessed).toLocaleTimeString()}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-4">
                No hay conversaciones en cache
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CachePerformanceDashboard;
