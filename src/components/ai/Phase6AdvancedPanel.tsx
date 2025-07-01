import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Brain,
  TrendingUp,
  Target,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Settings,
  Lightbulb,
  Star,
  ArrowRight,
  RefreshCw,
  Filter,
  Sparkles
} from 'lucide-react';
import { useInsightGeneration } from '@/hooks/ai/useInsightGeneration';
import { useContextualDataCollector } from '@/hooks/ai/useContextualDataCollector';
import { useTasks } from '@/hooks/useTasks';
import { useTaskSessions } from '@/hooks/useTaskSessions';
import { defaultAdvancedContextEngine, AdvancedContext } from '@/utils/ai/AdvancedContextEngine';
import { defaultSmartRecommendationEngine, ActionableRecommendation } from '@/utils/ai/SmartRecommendationEngine';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const Phase6AdvancedPanel = () => {
  const { toast } = useToast();
  const { tasks } = useTasks();
  const { sessions } = useTaskSessions();
  const [advancedContext, setAdvancedContext] = useState<AdvancedContext | null>(null);
  const [smartRecommendations, setSmartRecommendations] = useState<ActionableRecommendation[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');

  const {
    insights,
    isGenerating: isGeneratingInsights,
    generateInsights,
  } = useInsightGeneration();

  const {
    contextualData,
    isCollecting,
    collectData,
    getProductivityTrends,
    getUserBehaviorTrends,
  } = useContextualDataCollector();

  // Generar contexto avanzado
  const generateAdvancedContext = async () => {
    if (tasks.length === 0) return;

    setIsGenerating(true);
    try {
      // Crear un objeto de datos contextuales agregados para el motor de contexto avanzado
      const aggregatedContextualData = {
        id: 'aggregated-context',
        type: 'productivity_metrics' as const,
        category: 'historical' as const,
        data: {
          totalDataPoints: contextualData.length,
          recentActivity: contextualData.slice(-10),
          productivityTrends: getProductivityTrends(),
          behaviorTrends: getUserBehaviorTrends(),
        },
        timestamp: new Date(),
        relevanceScore: 0.9,
        source: 'contextual-aggregator',
        metadata: {
          collectionMethod: 'automatic' as const,
          confidence: 0.85,
          dataSources: ['user_behavior', 'task_patterns', 'productivity_metrics'],
        },
      };

      const context = await defaultAdvancedContextEngine.generateAdvancedContext();
      setAdvancedContext(context);

      // Generar recomendaciones inteligentes
      const recommendations = await defaultSmartRecommendationEngine.generateSmartRecommendations();
      setSmartRecommendations(recommendations);

      toast({
        title: "Análisis completado",
        description: `Se generaron ${recommendations.length} recomendaciones personalizadas.`,
      });
    } catch (error) {
      console.error('Error generating advanced context:', error);
      toast({
        title: "Error en análisis",
        description: "No se pudo completar el análisis avanzado.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Auto-generar contexto cuando hay datos suficientes
  useEffect(() => {
    if (insights.length > 0 && tasks.length > 0 && !advancedContext && !isGenerating) {
      generateAdvancedContext();
    }
  }, [insights.length, tasks.length]);

  // Handler para el botón de recopilar datos
  const handleCollectData = async () => {
    try {
      await collectData();
    } catch (error) {
      console.error('Error collecting data:', error);
    }
  };

  // Handler para el botón de generar insights
  const handleGenerateInsights = async () => {
    try {
      await generateInsights();
    } catch (error) {
      console.error('Error generating insights:', error);
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Eficiencia General</p>
                <p className="text-2xl font-bold">
                  {advancedContext ? Math.round(advancedContext.workflowEfficiency.overallScore * 100) : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Recomendaciones Activas</p>
                <p className="text-2xl font-bold">{smartRecommendations.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Áreas de Enfoque</p>
                <p className="text-2xl font-bold">
                  {advancedContext?.predictiveInsights.recommendedFocusAreas.length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Horas Pico</p>
                <p className="text-2xl font-bold">
                  {advancedContext?.userBehaviorProfile.peakProductivityHours.length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recomendaciones urgentes */}
      {smartRecommendations.filter(r => r.urgency === 'critical' || r.urgency === 'high').length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Acciones Urgentes Requeridas
            </CardTitle>
            <CardDescription>
              Estas recomendaciones requieren atención inmediata para optimizar tu productividad.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {smartRecommendations
                .filter(r => r.urgency === 'critical' || r.urgency === 'high')
                .slice(0, 3)
                .map((rec) => (
                  <div key={rec.id} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex-shrink-0 mt-1">
                      <Badge variant={rec.urgency === 'critical' ? 'destructive' : 'secondary'}>
                        {rec.urgency}
                      </Badge>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{rec.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{rec.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>Impacto: {rec.impact}</span>
                        <span>Esfuerzo: {rec.effort}</span>
                        <span>~{rec.estimatedTimeToImplement} min</span>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </div>
                ))
              }
            </div>
          </CardContent>
        </Card>
      )}

      {/* Perfil de comportamiento */}
      {advancedContext && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              Perfil de Comportamiento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Horas de Trabajo</h4>
                <p className="text-sm text-muted-foreground">
                  {advancedContext.userBehaviorProfile.workingHours[0]}:00 - {advancedContext.userBehaviorProfile.workingHours[1]}:00
                </p>
                <div className="mt-2">
                  <p className="text-xs text-muted-foreground mb-1">Horas de Máxima Productividad</p>
                  <div className="flex gap-1">
                    {advancedContext.userBehaviorProfile.peakProductivityHours.map((hour) => (
                      <Badge key={hour} variant="outline">{hour}:00</Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Preferencias de Tareas</h4>
                <div className="space-y-1">
                  {advancedContext.userBehaviorProfile.preferredTaskTypes.slice(0, 4).map((type) => (
                    <div key={type} className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      {type}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderRecommendations = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Recomendaciones Inteligentes</h3>
          <p className="text-sm text-muted-foreground">
            Sugerencias personalizadas basadas en tu patrón de trabajo
          </p>
        </div>
        <Button onClick={generateAdvancedContext} disabled={isGenerating} size="sm">
          <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {smartRecommendations.map((rec) => (
          <Card key={rec.id} className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={
                      rec.urgency === 'critical' ? 'destructive' :
                      rec.urgency === 'high' ? 'secondary' : 'outline'
                    }>
                      {rec.urgency}
                    </Badge>
                    <Badge variant="outline">{rec.type.replace('_', ' ')}</Badge>
                    <Badge variant="outline">{rec.category}</Badge>
                  </div>
                  <CardTitle className="text-lg">{rec.title}</CardTitle>
                  <CardDescription className="mt-1">{rec.description}</CardDescription>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  <div>Confianza: {Math.round(rec.confidence * 100)}%</div>
                  <div>~{rec.estimatedTimeToImplement} min</div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h5 className="font-medium text-sm mb-2">Acciones Recomendadas:</h5>
                  <ul className="space-y-1">
                    {rec.actionItems.map((action, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-3 w-3 mt-1 text-green-500 flex-shrink-0" />
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>

                {rec.expectedResults.length > 0 && (
                  <div>
                    <h5 className="font-medium text-sm mb-2">Resultados Esperados:</h5>
                    <ul className="space-y-1">
                      {rec.expectedResults.map((result, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <Star className="h-3 w-3 mt-1 text-yellow-500 flex-shrink-0" />
                          {result}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Impacto: <strong>{rec.impact}</strong></span>
                    <span>Esfuerzo: <strong>{rec.effort}</strong></span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      Posponer
                    </Button>
                    <Button size="sm">
                      Implementar
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {smartRecommendations.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No hay recomendaciones disponibles</h3>
              <p className="text-muted-foreground mb-4">
                Necesitamos más datos de tu actividad para generar recomendaciones personalizadas.
              </p>
              <Button onClick={generateAdvancedContext} disabled={isGenerating}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
                Generar Recomendaciones
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      {advancedContext && (
        <>
          {/* Eficiencia del flujo de trabajo */}
          <Card>
            <CardHeader>
              <CardTitle>Análisis de Eficiencia</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Eficiencia General</span>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(advancedContext.workflowEfficiency.overallScore * 100)}%
                    </span>
                  </div>
                  <Progress value={advancedContext.workflowEfficiency.overallScore * 100} />
                </div>

                {advancedContext.workflowEfficiency.bottlenecks.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-3">Cuellos de Botella Identificados</h4>
                    <div className="space-y-2">
                      {advancedContext.workflowEfficiency.bottlenecks.map((bottleneck, index) => (
                        <div key={index} className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm">{bottleneck.area}</span>
                            <Badge variant="outline">
                              Severidad: {Math.round(bottleneck.severity * 100)}%
                            </Badge>
                          </div>
                          <ul className="text-xs text-muted-foreground space-y-1">
                            {bottleneck.suggestions.map((suggestion, i) => (
                              <li key={i}>• {suggestion}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Insights predictivos */}
          <Card>
            <CardHeader>
              <CardTitle>Insights Predictivos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {advancedContext.predictiveInsights.recommendedFocusAreas.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-3">Áreas de Enfoque Recomendadas</h4>
                    <div className="flex flex-wrap gap-2">
                      {advancedContext.predictiveInsights.recommendedFocusAreas.map((area) => (
                        <Badge key={area} variant="secondary">{area}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {advancedContext.predictiveInsights.riskFactors.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-3">Factores de Riesgo</h4>
                    <div className="space-y-2">
                      {advancedContext.predictiveInsights.riskFactors.map((risk, index) => (
                        <Alert key={index}>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            <div className="space-y-1">
                              <div className="font-medium">{risk.factor}</div>
                              <div className="text-sm">
                                Probabilidad: {Math.round(risk.probability * 100)}%
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Mitigación: {risk.mitigation}
                              </div>
                            </div>
                          </AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-purple-500" />
            Panel de Control Avanzado - Fase 6
          </h1>
          <p className="text-muted-foreground">
            Análisis inteligente completo y recomendaciones personalizadas
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleCollectData} 
            disabled={isCollecting} 
            variant="outline" 
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isCollecting ? 'animate-spin' : ''}`} />
            Recopilar Datos
          </Button>
          <Button 
            onClick={handleGenerateInsights} 
            disabled={isGeneratingInsights} 
            size="sm"
          >
            <Brain className={`h-4 w-4 mr-2 ${isGeneratingInsights ? 'animate-spin' : ''}`} />
            Generar Insights
          </Button>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Resumen General</TabsTrigger>
          <TabsTrigger value="recommendations">Recomendaciones</TabsTrigger>
          <TabsTrigger value="analytics">Análisis Avanzado</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {renderOverview()}
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          {renderRecommendations()}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {renderAnalytics()}
        </TabsContent>
      </Tabs>

      {isGenerating && (
        <Alert>
          <RefreshCw className="h-4 w-4 animate-spin" />
          <AlertDescription>
            Generando análisis avanzado y recomendaciones personalizadas...
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default Phase6AdvancedPanel;
