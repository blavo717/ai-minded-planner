
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Brain, TrendingUp, Clock } from 'lucide-react';
import { Task } from '@/hooks/useTasks';
import { useTaskStateAndSteps } from '@/hooks/useTaskStateAndSteps';
import { useIntelligentActions } from '@/hooks/ai/useIntelligentActions';
import { SmartActionButtons } from './actions/SmartActionButtons';

interface AITaskSummaryProps {
  task: Task | undefined;
  className?: string;
}

export default function AITaskSummary({ task, className = '' }: AITaskSummaryProps) {
  const { summary, nextSteps, isLoading, error } = useTaskStateAndSteps(task?.id);
  
  const { 
    intelligentActions, 
    isGeneratingActions 
  } = useIntelligentActions(task, nextSteps || '', summary?.statusSummary || '');

  // Early return if no task
  if (!task) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="text-sm text-muted-foreground">
          No hay tarea seleccionada
        </div>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 animate-pulse text-blue-500" />
          <span className="text-sm text-muted-foreground">Analizando tarea con IA...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`p-4 border-red-200 ${className}`}>
        <div className="flex items-center gap-2 text-red-600">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-sm">Error al analizar la tarea</span>
        </div>
      </Card>
    );
  }

  if (!summary) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="text-sm text-muted-foreground">
          No hay análisis disponible
        </div>
      </Card>
    );
  }

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  return (
    <Card className={`p-4 space-y-4 ${className}`}>
      {/* Header con estado y riesgo */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-blue-500" />
          <h3 className="font-medium text-sm">Análisis IA</h3>
        </div>
        
        {summary.riskLevel && (
          <Badge 
            variant="outline" 
            className={getRiskBadgeColor(summary.riskLevel)}
          >
            Riesgo: {summary.riskLevel}
          </Badge>
        )}
      </div>

      {/* Resumen del estado */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-3 w-3 text-green-600" />
          <span className="text-xs font-medium text-muted-foreground">Estado Actual</span>
        </div>
        <p className="text-sm leading-relaxed">{summary.statusSummary}</p>
      </div>

      {/* Próximos pasos */}
      {nextSteps && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3 text-blue-600" />
            <span className="text-xs font-medium text-muted-foreground">Próximos Pasos</span>
          </div>
          <p className="text-sm leading-relaxed">{nextSteps}</p>
        </div>
      )}

      {/* Alertas críticas */}
      {summary.alerts && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="h-3 w-3 text-red-600" />
            <span className="text-xs font-medium text-red-800">Alerta</span>
          </div>
          <p className="text-sm text-red-700">{summary.alerts}</p>
        </div>
      )}

      {/* Insights adicionales */}
      {summary.insights && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-center gap-2 mb-1">
            <Brain className="h-3 w-3 text-blue-600" />
            <span className="text-xs font-medium text-blue-800">Insights</span>
          </div>
          <p className="text-sm text-blue-700">{summary.insights}</p>
        </div>
      )}

      {/* Acciones inteligentes */}
      {intelligentActions && intelligentActions.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Brain className="h-3 w-3 text-purple-600" />
            <span className="text-xs font-medium text-muted-foreground">Acciones Sugeridas</span>
          </div>
          <SmartActionButtons
            task={task}
            actions={intelligentActions}
            className="flex-wrap gap-1"
          />
        </div>
      )}

      {/* Loading de acciones */}
      {isGeneratingActions && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Brain className="h-3 w-3 animate-pulse" />
          <span className="text-xs">Generando acciones inteligentes...</span>
        </div>
      )}
    </Card>
  );
}
