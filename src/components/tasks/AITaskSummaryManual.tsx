
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, Play, RefreshCw, AlertTriangle, TrendingUp, Target } from 'lucide-react';
import { Task } from '@/hooks/useTasks';
import { useTaskStateAndStepsEnhanced } from '@/hooks/useTaskStateAndStepsEnhanced';

interface AITaskSummaryManualProps {
  task: Task | undefined;
  className?: string;
}

export default function AITaskSummaryManual({ task, className = '' }: AITaskSummaryManualProps) {
  const { 
    statusSummary, 
    nextSteps, 
    alerts, 
    riskLevel,
    isLoading, 
    error,
    hasAnalysis,
    hasConfiguration,
    canExecute,
    executeAnalysis
  } = useTaskStateAndStepsEnhanced(task?.id || '');

  if (!task) {
    return null;
  }

  if (!hasConfiguration) {
    return (
      <Card className={`p-3 border-yellow-200 ${className}`}>
        <div className="flex items-center gap-2 text-yellow-600 text-sm">
          <AlertTriangle className="h-4 w-4" />
          Configurar LLM para análisis IA
        </div>
      </Card>
    );
  }

  // Compact button when no analysis
  if (!hasAnalysis && !isLoading) {
    return (
      <Card className={`p-3 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium">Análisis IA</span>
          </div>
          <Button 
            onClick={executeAnalysis}
            disabled={!canExecute}
            size="sm"
            variant="outline"
          >
            <Play className="h-3 w-3 mr-1" />
            Analizar
          </Button>
        </div>
      </Card>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <Card className={`p-3 ${className}`}>
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
          <span className="text-sm">Analizando tarea...</span>
        </div>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className={`p-3 border-red-200 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm">Error en análisis</span>
          </div>
          <Button onClick={executeAnalysis} variant="outline" size="sm">
            Reintentar
          </Button>
        </div>
      </Card>
    );
  }

  // Compact results display
  return (
    <Card className={`p-3 space-y-3 ${className} ${
      riskLevel === 'high' ? 'border-l-4 border-l-red-500' : 
      riskLevel === 'medium' ? 'border-l-4 border-l-yellow-500' : 
      'border-l-4 border-l-blue-500'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-medium">Análisis IA</span>
          {riskLevel && (
            <Badge variant={riskLevel === 'high' ? 'destructive' : 'secondary'} className="text-xs">
              {riskLevel === 'high' ? 'Alto' : riskLevel === 'medium' ? 'Medio' : 'Bajo'}
            </Badge>
          )}
        </div>
        <Button onClick={executeAnalysis} variant="ghost" size="sm" className="h-6 w-6 p-0">
          <RefreshCw className="h-3 w-3" />
        </Button>
      </div>

      {statusSummary && (
        <div className="space-y-1">
          <div className="flex items-center gap-1">
            <Target className="h-3 w-3 text-blue-600" />
            <span className="text-xs font-medium text-muted-foreground">Estado</span>
          </div>
          <p className="text-sm text-blue-900 bg-blue-50 p-2 rounded border">{statusSummary}</p>
        </div>
      )}

      {nextSteps && (
        <div className="space-y-1">
          <div className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3 text-green-600" />
            <span className="text-xs font-medium text-muted-foreground">Próximos Pasos</span>
          </div>
          <p className="text-sm text-green-800 bg-green-50 p-2 rounded border">{nextSteps}</p>
        </div>
      )}

      {alerts && (
        <div className="p-2 bg-red-50 border-l-4 border-red-400 rounded">
          <p className="text-sm text-red-700 font-medium">{alerts}</p>
        </div>
      )}
    </Card>
  );
}
