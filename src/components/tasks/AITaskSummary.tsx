
import { Loader2, Sparkles, ArrowRight, AlertCircle, AlertTriangle, TrendingUp } from 'lucide-react';
import { useTaskStateAndSteps } from '@/hooks/useTaskStateAndSteps';

interface AITaskSummaryProps {
  taskId: string;
  className?: string;
}

export function AITaskSummary({ taskId, className = '' }: AITaskSummaryProps) {
  const { 
    statusSummary, 
    nextSteps, 
    alerts,
    insights,
    riskLevel,
    isLoading, 
    hasAI, 
    hasConfiguration,
    error,
    currentModel 
  } = useTaskStateAndSteps(taskId);

  const getModelDisplayName = (model: string): string => {
    if (model?.includes('gemini')) return 'Gemini';
    if (model?.includes('gpt')) return 'GPT';
    if (model?.includes('claude')) return 'Claude';
    return 'IA';
  };

  const getRiskColor = (risk?: string) => {
    switch (risk) {
      case 'high': return 'text-red-700 border-red-200 bg-red-50';
      case 'medium': return 'text-orange-700 border-orange-200 bg-orange-50';
      default: return 'text-green-700 border-green-200 bg-green-50';
    }
  };

  if (!hasConfiguration) {
    return (
      <div className={`text-sm text-orange-700 ${className}`}>
        <div className="flex items-center gap-2">
          <AlertCircle className="h-3 w-3" />
          <span>Configura tu API de IA en Configuración → LLM para activar resúmenes inteligentes</span>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="animate-pulse">
          <div className="flex items-center gap-2 mb-2">
            <Loader2 className="h-4 w-4 animate-spin text-orange-600" />
            <div className="h-3 bg-orange-200 rounded w-32"></div>
          </div>
          <div className="h-4 bg-orange-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-orange-200 rounded w-3/4 mb-4"></div>
          <div className="h-3 bg-blue-200 rounded w-24 mb-2"></div>
          <div className="h-4 bg-blue-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  if (error || !hasAI) {
    return (
      <div className={`text-sm text-orange-700 ${className}`}>
        <div className="flex items-center gap-2">
          <Sparkles className="h-3 w-3" />
          <span>Analizando estado avanzado de la tarea...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Resumen Estado Mejorado con Indicador de Riesgo */}
      <div className={`p-3 rounded-lg border ${getRiskColor(riskLevel)}`}>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-semibold uppercase tracking-wide flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Resumen estado
            {riskLevel === 'high' && <AlertTriangle className="h-4 w-4 text-red-600" />}
          </h4>
          {currentModel && (
            <span className="text-xs font-medium opacity-70">
              {getModelDisplayName(currentModel)}
            </span>
          )}
        </div>
        <p className="text-sm leading-relaxed font-medium">
          {statusSummary}
        </p>
      </div>
      
      {/* Próximos Pasos */}
      <div>
        <h4 className="text-xs font-semibold text-orange-700 uppercase tracking-wide flex items-center gap-2 mb-2">
          <ArrowRight className="h-4 w-4" />
          Próximos pasos
        </h4>
        <p className="text-sm text-orange-800 leading-relaxed">
          {nextSteps}
        </p>
      </div>
      
      {/* NUEVA: Alertas Críticas */}
      {alerts && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <h4 className="text-xs font-semibold text-red-700 uppercase tracking-wide flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4" />
            Alertas críticas
          </h4>
          <p className="text-sm text-red-800 leading-relaxed font-medium">
            {alerts}
          </p>
        </div>
      )}
      
      {/* NUEVA: Análisis Predictivo */}
      {insights && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-xs font-semibold text-blue-700 uppercase tracking-wide flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4" />
            Análisis predictivo
          </h4>
          <p className="text-sm text-blue-800 leading-relaxed">
            {insights}
          </p>
        </div>
      )}
    </div>
  );
}
