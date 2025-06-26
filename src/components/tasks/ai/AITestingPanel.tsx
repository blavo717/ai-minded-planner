import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';  
import { 
  Play, 
  Database, 
  CheckCircle, 
  AlertTriangle,
  RefreshCw,
  BarChart3,
  Brain,
  Activity,
  Info,
  Settings,
  MessageCircle,
  Bot
} from 'lucide-react';
import { useAITaskMonitor } from '@/hooks/useAITaskMonitor';
import { useTasks } from '@/hooks/useTasks';
import { useLLMConfigurations } from '@/hooks/useLLMConfigurations';
import { toast } from '@/hooks/use-toast';

const AITestingPanel = () => {
  const { runAnalysis, isAnalyzing, monitoringData } = useAITaskMonitor();
  const { mainTasks } = useTasks();
  const { activeConfiguration, isLoading: llmLoading } = useLLMConfigurations();
  
  const [activePhase, setActivePhase] = useState<'overview' | 'phase5-test'>('overview');

  const handleRunFullAnalysis = () => {
    if (!activeConfiguration) {
      toast({
        title: "Configuración LLM requerida",
        description: "Ve a Configuración > LLM para configurar OpenRouter API key.",
        variant: "destructive"
      });
      return;
    }
    
    if (mainTasks.length === 0) {
      toast({
        title: "No hay tareas",
        description: "Crea algunas tareas primero para poder analizarlas.",
        variant: "destructive"
      });
      return;
    }

    runAnalysis({});
    toast({
      title: "Análisis iniciado",
      description: `Analizando ${mainTasks.length} tareas...`
    });
  };

  const handleRunSpecificAnalysis = (analysisType: string) => {
    if (!activeConfiguration) {
      toast({
        title: "Configuración LLM requerida",
        description: "Ve a Configuración > LLM para configurar OpenRouter API key.",
        variant: "destructive"
      });
      return;
    }
    
    if (mainTasks.length === 0) {
      toast({
        title: "No hay tareas",
        description: "Crea algunas tareas primero para poder analizarlas.",
        variant: "destructive"
      });
      return;
    }

    runAnalysis({ analysisType: analysisType as any });
    toast({
      title: `Análisis ${analysisType} iniciado`,
      description: `Procesando ${mainTasks.length} tareas...`
    });
  };

  const getAnalysisStats = () => {
    const stats = {
      total: monitoringData.length,
      health_checks: monitoringData.filter(m => m.monitoring_type === 'health_check').length,
      bottlenecks: monitoringData.filter(m => m.monitoring_type === 'bottleneck_detection').length,
      priorities: monitoringData.filter(m => m.monitoring_type === 'priority_analysis').length,
      predictions: monitoringData.filter(m => m.monitoring_type === 'completion_prediction').length,
    };
    return stats;
  };

  const stats = getAnalysisStats();
  const systemReady = activeConfiguration && mainTasks.length > 0;

  if (activePhase === 'phase5-test') {
    const Phase5TestingSuite = React.lazy(() => import('@/components/testing/Phase5TestingSuite'));
    
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => setActivePhase('overview')}
            size="sm"
          >
            ← Volver al Panel Principal
          </Button>
        </div>
        <React.Suspense fallback={<div className="animate-pulse">Cargando Phase 5 Testing...</div>}>
          <Phase5TestingSuite />
        </React.Suspense>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-600" />
            Panel de Testing AI - FASE 10 CORRECCIÓN DEFINITIVA
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* FASE 10 Status Alert */}
          <Alert className="border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription>
              <div className="font-medium mb-2 text-blue-800">FASE 10 - CORRECCIÓN DEFINITIVA IMPLEMENTADA:</div>
              <ul className="list-disc list-inside text-sm space-y-1 text-blue-700">
                <li>✅ Validación BD directa SIEMPRE (no estado local)</li>
                <li>✅ Reset total REAL con confirmación BD</li>
                <li>✅ Timeouts realistas 45-90 segundos para BD producción</li>
                <li>✅ Aislamiento TOTAL de tests con Smart Messaging OFF</li>
                <li>✅ Monitoreo y auto-corrección BD-Estado tiempo real</li>
                <li>✅ Tests independientes con ambiente BD limpio</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Alertas de estado del sistema */}
          {!systemReady && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <div className="font-medium mb-2">Sistema no está listo:</div>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {!activeConfiguration && (
                    <li>Configurar LLM (ir a Configuración {' > '} LLM)</li>
                  )}
                  {mainTasks.length === 0 && (
                    <li>Crear al menos 1 tarea para poder analizarla</li>
                  )}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Estado actual */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg border">
              <div className="text-2xl font-bold text-blue-600">{mainTasks.length}</div>
              <div className="text-sm text-muted-foreground">Tareas totales</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg border">
              <div className="text-2xl font-bold text-green-600">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Análisis realizados</div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg border">
              <div className="text-2xl font-bold text-orange-600">{stats.health_checks}</div>
              <div className="text-sm text-muted-foreground">Chequeos de salud</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg border">
              <div className="text-2xl font-bold text-purple-600">{stats.bottlenecks}</div>
              <div className="text-sm text-muted-foreground">Análisis cuellos</div>
            </div>
          </div>

          {/* Estado de configuración LLM */}
          <div className={`flex items-center gap-3 p-4 rounded-lg border ${
            activeConfiguration ? 'bg-green-50' : 'bg-red-50'
          }`}>
            {activeConfiguration ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <div className="font-medium text-sm">Configuración LLM activa</div>
                  <div className="text-xs text-muted-foreground">
                    Modelo: {activeConfiguration.model_name}
                  </div>
                </div>
              </>
            ) : (
              <>
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <div className="flex-1">
                  <div className="font-medium text-sm">Configuración LLM requerida</div>
                  <div className="text-xs text-muted-foreground">
                    Necesitas configurar OpenRouter API key para usar las funciones AI
                  </div>
                </div>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Configurar
                </Button>
              </>
            )}
          </div>

          {/* Phase 5 Testing Section - Updated for FASE 10 */}
          <div className="border-t pt-6">
            <h4 className="font-medium text-lg mb-4 flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-blue-600" />
              Phase 5: Testing Suite - FASE 10 CORRECCIÓN DEFINITIVA
            </h4>
            
            <div className="grid grid-cols-1 gap-4">
              <Button 
                onClick={() => setActivePhase('phase5-test')}
                variant="outline"
                className="flex items-center gap-2 justify-start p-6 h-auto border-blue-200 hover:bg-blue-50"
              >
                <Bot className="h-5 w-5 text-blue-500" />
                <div className="text-left">
                  <div className="font-medium">Testing Suite Phase 5: FASE 10 CORRECCIÓN DEFINITIVA</div>
                  <div className="text-sm text-muted-foreground">
                    Tests con validación BD directa, timeouts realistas (45-90s), reset total REAL y aislamiento completo
                  </div>
                </div>
              </Button>
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-sm text-blue-800">
                <strong>FASE 10 - CORRECCIONES IMPLEMENTADAS:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li><strong>Validación BD Directa:</strong> SIEMPRE consultar Supabase, nunca estado local</li>
                  <li><strong>Reset Total REAL:</strong> Limpieza completa BD + confirmación directa</li>
                  <li><strong>Timeouts Realistas:</strong> 45-90 segundos para BD en producción</li>
                  <li><strong>Aislamiento TOTAL:</strong> Smart Messaging OFF, tests independientes</li>
                  <li><strong>Monitoreo Tiempo Real:</strong> Auto-corrección cuando BD ≠ Estado Local</li>
                  <li><strong>Tests BD Directos:</strong> Cada test valida contra BD real, no memoria</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Acciones de testing */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Brain className="h-5 w-5 text-blue-500" />
                <div>
                  <h4 className="font-medium">Análisis Completo</h4>
                  <p className="text-sm text-muted-foreground">
                    Ejecuta todos los tipos de análisis disponibles
                  </p>
                </div>
              </div>
              <Button 
                onClick={handleRunFullAnalysis}
                disabled={isAnalyzing || !systemReady}
                className="flex items-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Analizando...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Ejecutar Análisis
                  </>
                )}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleRunSpecificAnalysis('health_check')}
                disabled={isAnalyzing || !systemReady}
                className="flex items-center gap-2 justify-start p-4 h-auto"
              >
                <Activity className="h-4 w-4 text-green-500" />
                <div className="text-left">
                  <div className="font-medium">Chequeo de Salud</div>
                  <div className="text-xs text-muted-foreground">
                    Analiza el estado de las tareas
                  </div>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleRunSpecificAnalysis('bottleneck_detection')}
                disabled={isAnalyzing || !systemReady}
                className="flex items-center gap-2 justify-start p-4 h-auto"
              >
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <div className="text-left">
                  <div className="font-medium">Detectar Cuellos</div>
                  <div className="text-xs text-muted-foreground">
                    Identifica bloqueos en el flujo
                  </div>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleRunSpecificAnalysis('priority_analysis')}
                disabled={isAnalyzing || !systemReady}
                className="flex items-center gap-2 justify-start p-4 h-auto"
              >
                <BarChart3 className="h-4 w-4 text-blue-500" />
                <div className="text-left">
                  <div className="font-medium">Análisis de Prioridad</div>
                  <div className="text-xs text-muted-foreground">
                    Calcula prioridades inteligentes
                  </div>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleRunSpecificAnalysis('completion_prediction')}
                disabled={isAnalyzing || !systemReady}
                className="flex items-center gap-2 justify-start p-4 h-auto"
              >
                <CheckCircle className="h-4 w-4 text-purple-500" />
                <div className="text-left">
                  <div className="font-medium">Predicción</div>
                  <div className="text-xs text-muted-foreground">
                    Estima fechas de finalización
                  </div>
                </div>
              </Button>
            </div>
          </div>

          {/* Instrucciones para testing */}
          <div className="border-t pt-4">
            <h5 className="font-medium text-sm mb-2">Guía de Testing Completo FASE 10:</h5>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>1. Configurar OpenRouter API key (Configuración {' > '} LLM)</p>
              <p>2. Crear varias tareas con diferentes prioridades y estados</p>
              <p>3. Añadir subtareas y microtareas para probar la jerarquía</p>
              <p>4. Ejecutar el análisis completo para poblar datos AI</p>
              <p>5. Usar Testing Suite Phase 5 para validación BD directa completa</p>
              <p>6. Verificar timeouts realistas (45-90s) y sincronización BD-Estado</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AITestingPanel;
