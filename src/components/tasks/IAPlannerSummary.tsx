
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Target, TrendingUp, AlertTriangle, CheckCircle, Clock, Zap } from 'lucide-react';
import { Task } from '@/hooks/useTasks';
import { useTaskStateAndStepsEnhanced } from '@/hooks/useTaskStateAndStepsEnhanced';

interface IAPlannerSummaryProps {
  task: Task | undefined;
  className?: string;
}

export default function IAPlannerSummary({ task, className = '' }: IAPlannerSummaryProps) {
  const { 
    statusSummary, 
    nextSteps, 
    alerts, 
    riskLevel,
    methodology,
    specificActions,
    riskAssessment,
    isLoading, 
    error,
    isPlannerActive
  } = useTaskStateAndStepsEnhanced(task?.id || '');

  // Early return if no task
  if (!task) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="text-sm text-muted-foreground">
          No hay tarea seleccionada para análisis del IA Planner
        </div>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 animate-pulse text-purple-500" />
          <span className="text-sm text-muted-foreground">IA Planner analizando...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`p-4 border-red-200 ${className}`}>
        <div className="flex items-center gap-2 text-red-600">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-sm">Error en análisis del IA Planner</span>
        </div>
      </Card>
    );
  }

  if (!statusSummary) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="text-sm text-muted-foreground">
          IA Planner no disponible - verificar configuración
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
      case 'high': return <AlertTriangle className="h-3 w-3" />;
      case 'medium': return <Clock className="h-3 w-3" />;
      default: return <CheckCircle className="h-3 w-3" />;
    }
  };

  return (
    <Card className={`p-4 space-y-4 ${className} border-l-4 ${
      riskLevel === 'high' ? 'border-l-red-500' : 
      riskLevel === 'medium' ? 'border-l-yellow-500' : 
      'border-l-purple-500'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-purple-500" />
          <h3 className="font-medium text-sm">IA Planner</h3>
          {methodology && (
            <Badge variant="outline" className="text-xs">
              {methodology}
            </Badge>
          )}
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

      {/* Status Analysis */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Target className="h-3 w-3 text-purple-600" />
          <span className="text-xs font-medium text-muted-foreground">Estado Específico</span>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-md p-3">
          <p className="text-sm leading-relaxed font-medium text-purple-900">{statusSummary}</p>
        </div>
      </div>

      {/* Next Steps */}
      {nextSteps && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-3 w-3 text-green-600" />
            <span className="text-xs font-medium text-muted-foreground">Próximos Pasos</span>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-md p-3">
            <p className="text-sm leading-relaxed text-green-800">{nextSteps}</p>
          </div>
        </div>
      )}

      {/* Specific Actions */}
      {specificActions && specificActions.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Zap className="h-3 w-3 text-blue-600" />
            <span className="text-xs font-medium text-muted-foreground">
              Acciones Específicas ({specificActions.length})
            </span>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <ul className="space-y-1">
              {specificActions.map((action, index) => (
                <li key={index} className="text-sm text-blue-800 flex items-start gap-2">
                  <span className="text-blue-600 font-medium">{index + 1}.</span>
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Alerts */}
      {alerts && (
        <div className="p-3 bg-red-50 border-l-4 border-red-400 rounded-md">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <span className="text-sm font-semibold text-red-800">Alerta Crítica</span>
          </div>
          <p className="text-sm text-red-700 leading-relaxed">{alerts}</p>
        </div>
      )}

      {/* Planner status */}
      {isPlannerActive && (
        <div className="text-center pt-2 border-t border-gray-100">
          <span className="text-xs text-purple-600 font-medium">
            ✨ Análisis específico completado por IA Planner
          </span>
        </div>
      )}
    </Card>
  );
}
