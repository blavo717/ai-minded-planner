
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Brain, TrendingUp, Clock, Target, Zap, AlertCircle } from 'lucide-react';
import { Task } from '@/hooks/useTasks';
import { useTaskStateAndSteps } from '@/hooks/useTaskStateAndSteps';
import { useIntelligentActions } from '@/hooks/ai/useIntelligentActions';
import { SmartActionButtons } from './actions/SmartActionButtons';

interface AITaskSummaryProps {
  task: Task | undefined;
  className?: string;
}

export default function AITaskSummary({ task, className = '' }: AITaskSummaryProps) {
  const { statusSummary, nextSteps, alerts, insights, riskLevel, isLoading, error } = useTaskStateAndSteps(task?.id || '');
  
  const { 
    intelligentActions, 
    isGeneratingActions 
  } = useIntelligentActions(task, nextSteps || '', statusSummary || '');

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
          <span className="text-sm text-muted-foreground">Generando análisis inteligente contextual...</span>
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

  if (!statusSummary) {
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

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'high': return <AlertCircle className="h-3 w-3" />;
      case 'medium': return <AlertTriangle className="h-3 w-3" />;
      default: return <Target className="h-3 w-3" />;
    }
  };

  return (
    <Card className={`p-4 space-y-4 ${className} border-l-4 ${
      riskLevel === 'high' ? 'border-l-red-500' : 
      riskLevel === 'medium' ? 'border-l-yellow-500' : 
      'border-l-green-500'
    }`}>
      {/* Header mejorado con estado y riesgo */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-blue-500" />
          <h3 className="font-medium text-sm">Análisis IA Contextual</h3>
        </div>
        
        {riskLevel && (
          <Badge 
            variant="outline" 
            className={`${getRiskBadgeColor(riskLevel)} flex items-center gap-1`}
          >
            {getRiskIcon(riskLevel)}
            {riskLevel === 'high' ? 'Crítico' : 
             riskLevel === 'medium' ? 'Medio' : 'Bajo'}
          </Badge>
        )}
      </div>

      {/* Resumen del estado mejorado */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-3 w-3 text-green-600" />
          <span className="text-xs font-medium text-muted-foreground">Estado Específico</span>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <p className="text-sm leading-relaxed font-medium text-blue-900">{statusSummary}</p>
        </div>
      </div>

      {/* Próximos pasos mejorados */}
      {nextSteps && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3 text-blue-600" />
            <span className="text-xs font-medium text-muted-foreground">Acciones Específicas</span>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-md p-3">
            <p className="text-sm leading-relaxed text-green-800">{nextSteps}</p>
          </div>
        </div>
      )}

      {/* Alertas críticas mejoradas */}
      {alerts && (
        <div className="p-3 bg-red-50 border-l-4 border-red-400 rounded-md">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <span className="text-sm font-semibold text-red-800">Alerta Crítica</span>
          </div>
          <p className="text-sm text-red-700 leading-relaxed">{alerts}</p>
        </div>
      )}

      {/* Insights contextuales mejorados */}
      {insights && (
        <div className="p-3 bg-purple-50 border-l-4 border-purple-400 rounded-md">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-semibold text-purple-800">Insights Contextuales</span>
          </div>
          <div className="text-sm text-purple-700 leading-relaxed whitespace-pre-line">
            {insights}
          </div>
        </div>
      )}

      {/* Acciones inteligentes mejoradas */}
      {intelligentActions && intelligentActions.length > 0 && (
        <div className="space-y-3 pt-2 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <Zap className="h-3 w-3 text-purple-600" />
            <span className="text-xs font-medium text-muted-foreground">
              Acciones Inteligentes ({intelligentActions.length})
            </span>
          </div>
          <SmartActionButtons
            task={task}
            actions={intelligentActions}
            className="flex flex-wrap gap-2"
          />
        </div>
      )}

      {/* Loading de acciones mejorado */}
      {isGeneratingActions && (
        <div className="flex items-center gap-2 text-muted-foreground p-2 bg-gray-50 rounded-md">
          <Brain className="h-3 w-3 animate-pulse" />
          <span className="text-xs">Generando acciones contextual inteligentes...</span>
        </div>
      )}
    </Card>
  );
}
