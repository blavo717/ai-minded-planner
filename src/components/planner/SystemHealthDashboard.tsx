import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  RefreshCw,
  Zap,
  Activity,
  TrendingUp,
  Clock
} from 'lucide-react';
import { SystemValidator } from '@/utils/systemValidator';

interface SystemHealthDashboardProps {
  onClose?: () => void;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  performance: { [key: string]: number };
}

interface CoherenceResult {
  isCoherent: boolean;
  issues: string[];
}

interface StressResult {
  passed: boolean;
  results: { [test: string]: { time: number; success: boolean } };
}

const SystemHealthDashboard: React.FC<SystemHealthDashboardProps> = ({ onClose }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [coherenceResult, setCoherenceResult] = useState<CoherenceResult | null>(null);
  const [stressResult, setStressResult] = useState<StressResult | null>(null);
  const [lastRun, setLastRun] = useState<Date | null>(null);

  const runCompleteTest = async () => {
    setIsRunning(true);
    
    try {
      // Ejecutar todas las validaciones
      const [validation, coherence, stress] = await Promise.all([
        SystemValidator.validateRecommendationSystem(),
        Promise.resolve(SystemValidator.testRecommendationCoherence()),
        SystemValidator.stressTest()
      ]);

      setValidationResult(validation);
      setCoherenceResult(coherence);
      setStressResult(stress);
      setLastRun(new Date());
    } catch (error) {
      console.error('Error running system tests:', error);
    } finally {
      setIsRunning(false);
    }
  };

  // Ejecutar test automáticamente al cargar
  useEffect(() => {
    runCompleteTest();
  }, []);

  const getSystemStatus = () => {
    if (!validationResult || !coherenceResult || !stressResult) {
      return { status: 'loading', color: 'bg-yellow-500', label: 'Analizando...' };
    }

    const hasErrors = validationResult.errors.length > 0 || !coherenceResult.isCoherent || !stressResult.passed;
    const hasWarnings = validationResult.warnings.length > 0;

    if (hasErrors) {
      return { status: 'error', color: 'bg-red-500', label: 'Sistema con errores' };
    } else if (hasWarnings) {
      return { status: 'warning', color: 'bg-yellow-500', label: 'Sistema estable con advertencias' };
    } else {
      return { status: 'healthy', color: 'bg-green-500', label: 'Sistema saludable' };
    }
  };

  const systemStatus = getSystemStatus();

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="w-6 h-6 text-blue-600" />
            Salud del Sistema
          </h2>
          <p className="text-gray-600">
            Monitoreo y validación de componentes del planificador IA
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={runCompleteTest}
            disabled={isRunning}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRunning ? 'animate-spin' : ''}`} />
            {isRunning ? 'Analizando...' : 'Ejecutar Tests'}
          </Button>
          {onClose && (
            <Button variant="outline" onClick={onClose} size="sm">
              Cerrar
            </Button>
          )}
        </div>
      </div>

      {/* Status General */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className={`w-4 h-4 rounded-full ${systemStatus.color}`}></div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold">{systemStatus.label}</h3>
              {lastRun && (
                <p className="text-sm text-gray-600">
                  Último análisis: {lastRun.toLocaleTimeString()}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {systemStatus.status === 'healthy' && <CheckCircle className="w-6 h-6 text-green-600" />}
              {systemStatus.status === 'warning' && <AlertTriangle className="w-6 h-6 text-yellow-600" />}
              {systemStatus.status === 'error' && <XCircle className="w-6 h-6 text-red-600" />}
              {systemStatus.status === 'loading' && <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resultados de Validación */}
      {validationResult && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Errores y Advertencias */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Validación del Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {validationResult.errors.length > 0 && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <p className="font-semibold">Errores críticos:</p>
                      {validationResult.errors.map((error, i) => (
                        <p key={i} className="text-sm">• {error}</p>
                      ))}
                    </div>
                  </AlertDescription>
                </Alert>
              )}
              
              {validationResult.warnings.length > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <p className="font-semibold">Advertencias:</p>
                      {validationResult.warnings.map((warning, i) => (
                        <p key={i} className="text-sm">• {warning}</p>
                      ))}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {validationResult.errors.length === 0 && validationResult.warnings.length === 0 && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">Todos los componentes funcionan correctamente</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Performance del Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(validationResult.performance).map(([component, time]) => (
                <div key={component} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium capitalize">
                      {component.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <Badge variant={time > 100 ? 'destructive' : time > 50 ? 'default' : 'secondary'}>
                      {time.toFixed(1)}ms
                    </Badge>
                  </div>
                  <Progress 
                    value={Math.min((time / 200) * 100, 100)} 
                    className="h-2"
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Coherencia y Stress Tests */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Test de Coherencia */}
        {coherenceResult && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Coherencia Lógica
              </CardTitle>
            </CardHeader>
            <CardContent>
              {coherenceResult.isCoherent ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">Las recomendaciones son lógicamente coherentes</span>
                </div>
              ) : (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <p className="font-semibold">Problemas de coherencia:</p>
                      {coherenceResult.issues.map((issue, i) => (
                        <p key={i} className="text-sm">• {issue}</p>
                      ))}
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* Stress Test */}
        {stressResult && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Test de Carga
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(stressResult.results).map(([test, result]) => (
                <div key={test} className="flex justify-between items-center">
                  <span className="text-sm font-medium capitalize">
                    {test.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge variant={result.success ? 'secondary' : 'destructive'}>
                      {result.time.toFixed(1)}ms
                    </Badge>
                    {result.success ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                </div>
              ))}
              
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Estado General:</span>
                  {stressResult.passed ? (
                    <Badge className="bg-green-100 text-green-700">Aprobado</Badge>
                  ) : (
                    <Badge variant="destructive">Fallido</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Métricas de Resumen */}
      {validationResult && coherenceResult && stressResult && (
        <Card>
          <CardHeader>
            <CardTitle>Resumen Ejecutivo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="space-y-2">
                <div className="text-2xl font-bold text-green-600">
                  {validationResult.errors.length === 0 ? '✓' : '✗'}
                </div>
                <div className="text-sm text-gray-600">Componentes</div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-blue-600">
                  {Object.values(validationResult.performance).reduce((sum, time) => sum + time, 0).toFixed(0)}ms
                </div>
                <div className="text-sm text-gray-600">Tiempo Total</div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-purple-600">
                  {coherenceResult.isCoherent ? '✓' : '✗'}
                </div>
                <div className="text-sm text-gray-600">Coherencia</div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-orange-600">
                  {stressResult.passed ? '✓' : '✗'}
                </div>
                <div className="text-sm text-gray-600">Stress Test</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SystemHealthDashboard;