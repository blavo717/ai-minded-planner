
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Shield,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  FileCheck,
  Settings
} from 'lucide-react';
import { useAITesting } from '@/hooks/ai/useAITesting';
import { usePhase6Advanced } from '@/hooks/ai/usePhase6Advanced';
import { useInsightGeneration } from '@/hooks/ai/useInsightGeneration';
import { useContextualDataCollector } from '@/hooks/ai/useContextualDataCollector';
import SystemHealthCard from './validation/SystemHealthCard';
import { SystemHealthComponent } from '@/types/testing';

const AIValidationDashboard = () => {
  const [validationStatus, setValidationStatus] = useState<'idle' | 'running' | 'completed'>('idle');
  const [systemHealth, setSystemHealth] = useState<Record<string, SystemHealthComponent>>({});
  
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
      const health: Record<string, SystemHealthComponent> = {
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
            productivityTrends: contextualData.getProductivityTrends().dataPoints > 0,
            behaviorTrends: contextualData.getUserBehaviorTrends().dataPoints > 0
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
        const component = health[key];
        if (key === 'performance') return; // Performance siempre en monitoring
        
        if (component.components) {
          const componentValues = Object.values(component.components);
          const healthyCount = componentValues.filter(v => 
            typeof v === 'boolean' ? v : (typeof v === 'number' && v > 0)
          ).length;
          
          if (healthyCount === componentValues.length) {
            component.status = 'healthy';
          } else if (healthyCount > componentValues.length / 2) {
            component.status = 'warning';
          } else {
            component.status = 'error';
          }
        }
      });

      setSystemHealth(health);
    };

    evaluateSystemHealth();
    const interval = setInterval(evaluateSystemHealth, 10000);
    
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
          <SystemHealthCard key={key} healthKey={key} component={component} />
        ))}
      </div>

      {/* Resumen de tests */}
      {testSummary.totalTests > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
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
    </div>
  );
};

export default AIValidationDashboard;
