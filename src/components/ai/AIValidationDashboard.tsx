
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Shield,
  CheckCircle,
  AlertTriangle,
  Activity,
  Brain,
  Target,
  Zap,
  TrendingUp,
  Clock,
  RefreshCw,
  FileCheck,
  Database,
  Settings
} from 'lucide-react';
import { useAITesting } from '@/hooks/ai/useAITesting';
import { usePhase6Advanced } from '@/hooks/ai/usePhase6Advanced';
import { useInsightGeneration } from '@/hooks/ai/useInsightGeneration';
import { useContextualDataCollector } from '@/hooks/ai/useContextualDataCollector';

const AIValidationDashboard = () => {
  const [validationStatus, setValidationStatus] = useState<'idle' | 'running' | 'completed'>('idle');
  const [systemHealth, setSystemHealth] = useState<Record<string, any>>({});
  
  const {
    isRunning,
    testResults,
    runHighPriorityTests,
    runTestSuite,
    getTestSummary
  } = useAITesting();

  const phase6 = usePhase6Advanced();
  const insights = useInsightGeneration();
  const contextualData = useContextualDataCollector();

  // Evaluar salud del sistema
  useEffect(() => {
    const evaluateSystemHealth = () => {
      const health = {
        aiCore: {
          status: 'healthy',
          components: {
            advancedContext: !!phase6.advancedContext,
            smartRecommendations: phase6.smartRecommendations.length > 0,
            contextMetrics: !!phase6.getContextMetrics()
          }
        },
        insights: {
          status: 'healthy',
          components: {
            patternAnalysis: !!insights.patternAnalysis,
            generatedInsights: insights.insights.length > 0,
            criticalInsights: insights.criticalInsights.length > 0
          }
        },
        dataCollection: {
          status: 'healthy',
          components: {
            contextualDataPoints: contextualData.contextualData.length,
            productivityTrends: contextualData.getProductivityTrends().length > 0,
            behaviorTrends: contextualData.getUserBehaviorTrends().length > 0
          }
        },
        performance: {
          status: 'monitoring',
          metrics: {
            contextGenerating: phase6.isGeneratingContext,
            insightsGenerating: insights.isGenerating,
            dataCollecting: contextualData.isCollecting
          }
        }
      };

      // Evaluar estado general
      Object.keys(health).forEach(key => {
        const component = health[key as keyof typeof health];
        if (key === 'performance') return; // Performance siempre en monitoring
        
        const componentValues = Object.values(component.components);
        const healthyCount = componentValues.filter(v => 
          typeof v === 'boolean' ? v : v > 0
        ).length;
        
        if (healthyCount === componentValues.length) {
          component.status = 'healthy';
        } else if (healthyCount > componentValues.length / 2) {
          component.status = 'warning';
        } else {
          component.status = 'error';
        }
      });

      setSystemHealth(health);
    };

    evaluateSystemHealth();
    const interval = setInterval(evaluateSystemHealth, 10000); // Cada 10 segundos
    
    return () => clearInterval(interval);
  }, [phase6, insights, contextualData]);

  const runFullValidation = async () => {
    setValidationStatus('running');
    
    try {
      await runHighPriorityTests();
      setValidationStatus('completed');
    } catch (error) {
      console.error('Error during validation:', error);
      setValidationStatus('idle');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'error':
        return 'text-red-600 bg-red-100';
      case 'monitoring':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4" />;
      case 'monitoring':
        return <Activity className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const testSummary = getTestSummary();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-green-600" />
            Dashboard de Validación de IA
          </h1>
          <p className="text-muted-foreground">
            Monitoreo en tiempo real y validación del sistema de inteligencia artificial
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={() => runTestSuite(['performance'])}
            disabled={isRunning}
            variant="outline"
            size="sm"
          >
            <Zap className="h-4 w-4 mr-2" />
            Test Performance
          </Button>
          <Button 
            onClick={runFullValidation}
            disabled={isRunning || validationStatus === 'running'}
          >
            {validationStatus === 'running' ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Validando...
              </>
            ) : (
              <>
                <FileCheck className="h-4 w-4 mr-2" />
                Validación Completa
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Estado general del sistema */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Object.entries(systemHealth).map(([key, component]) => (
          <Card key={key}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {key === 'aiCore' && <Brain className="h-5 w-5 text-purple-500" />}
                  {key === 'insights' && <Target className="h-5 w-5 text-blue-500" />}
                  {key === 'dataCollection' && <Database className="h-5 w-5 text-green-500" />}
                  {key === 'performance' && <Activity className="h-5 w-5 text-orange-500" />}
                  <span className="font-medium capitalize">
                    {key === 'aiCore' ? 'IA Core' : 
                     key === 'dataCollection' ? 'Datos' : 
                     key}
                  </span>
                </div>
                <Badge className={getStatusColor(component.status)}>
                  {getStatusIcon(component.status)}
                  <span className="ml-1 capitalize">{component.status}</span>
                </Badge>
              </div>
              
              <div className="space-y-1">
                {Object.entries(component.components || component.metrics || {}).map(([subKey, value]) => (
                  <div key={subKey} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground capitalize">
                      {subKey.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </span>
                    <span className={typeof value === 'boolean' 
                      ? (value ? 'text-green-600' : 'text-red-600')
                      : 'text-blue-600'
                    }>
                      {typeof value === 'boolean' 
                        ? (value ? '✓' : '✗')
                        : typeof value === 'number' 
                          ? value 
                          : value ? '✓' : '✗'
                      }
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Resumen de tests */}
      {testSummary.totalTests > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Resumen de Validación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {testSummary.successCount}
                </div>
                <div className="text-sm text-muted-foreground">Tests Exitosos</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {testSummary.failureCount}
                </div>
                <div className="text-sm text-muted-foreground">Tests Fallidos</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {testSummary.successRate.toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">Tasa de Éxito</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {testSummary.averageDuration.toFixed(0)}ms
                </div>
                <div className="text-sm text-muted-foreground">Tiempo Promedio</div>
              </div>
            </div>
            
            <Progress value={testSummary.successRate} className="mb-2" />
            <p className="text-sm text-muted-foreground text-center">
              {testSummary.totalTests} tests ejecutados - Última validación completada
            </p>
          </CardContent>
        </Card>
      )}

      {/* Alertas y recomendaciones */}
      <div className="space-y-4">
        {Object.entries(systemHealth).map(([key, component]) => {
          if (component.status === 'error' || component.status === 'warning') {
            return (
              <Alert key={key} variant={component.status === 'error' ? 'destructive' : 'default'}>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-medium mb-1">
                    {component.status === 'error' ? 'Error' : 'Advertencia'} en {key}
                  </div>
                  <div className="text-sm">
                    Se detectaron problemas en algunos componentes. 
                    Ejecuta una validación completa para obtener más detalles.
                  </div>
                </AlertDescription>
              </Alert>
            );
          }
          return null;
        })}
        
        {validationStatus === 'completed' && testSummary.successRate === 100 && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="font-medium">Sistema completamente validado</div>
              <div className="text-sm">
                Todas las pruebas han pasado exitosamente. El sistema de IA está funcionando correctamente.
              </div>
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Métricas en tiempo real */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-gray-500" />
            Métricas en Tiempo Real
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h4 className="font-medium mb-2">Procesamiento Activo</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Generando Contexto</span>
                  <Badge variant={phase6.isGeneratingContext ? 'default' : 'outline'}>
                    {phase6.isGeneratingContext ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Generando Insights</span>
                  <Badge variant={insights.isGenerating ? 'default' : 'outline'}>
                    {insights.isGenerating ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Recolectando Datos</span>
                  <Badge variant={contextualData.isCollecting ? 'default' : 'outline'}>
                    {contextualData.isCollecting ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Datos Disponibles</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Insights Generados</span>
                  <span className="font-medium">{insights.insights.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Recomendaciones</span>
                  <span className="font-medium">{phase6.smartRecommendations.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Datos Contextuales</span>
                  <span className="font-medium">{contextualData.contextualData.length}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Estado del Sistema</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Contexto Avanzado</span>
                  <Badge variant={phase6.advancedContext ? 'default' : 'outline'}>
                    {phase6.advancedContext ? 'Disponible' : 'Pendiente'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Análisis de Patrones</span>
                  <Badge variant={insights.patternAnalysis ? 'default' : 'outline'}>
                    {insights.patternAnalysis ? 'Disponible' : 'Pendiente'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Trends de Productividad</span>
                  <Badge variant={contextualData.getProductivityTrends().length > 0 ? 'default' : 'outline'}>
                    {contextualData.getProductivityTrends().length > 0 ? 'Disponible' : 'Pendiente'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIValidationDashboard;
