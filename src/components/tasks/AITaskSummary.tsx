
import { Loader2, Sparkles, ArrowRight, AlertCircle } from 'lucide-react';
import { useTaskStateAndSteps } from '@/hooks/useTaskStateAndSteps';

interface AITaskSummaryProps {
  taskId: string;
  className?: string;
}

export function AITaskSummary({ taskId, className = '' }: AITaskSummaryProps) {
  const { 
    statusSummary, 
    nextSteps, 
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
      <div className={`space-y-3 ${className}`}>
        <div className="animate-pulse">
          <div className="flex items-center gap-2 mb-2">
            <Loader2 className="h-3 w-3 animate-spin text-orange-600" />
            <div className="h-3 bg-orange-200 rounded w-24"></div>
          </div>
          <div className="h-3 bg-orange-200 rounded w-full mb-1"></div>
          <div className="h-3 bg-orange-200 rounded w-3/4 mb-3"></div>
          <div className="h-3 bg-orange-200 rounded w-20 mb-1"></div>
          <div className="h-3 bg-orange-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  if (error || !hasAI) {
    return (
      <div className={`text-sm text-orange-700 ${className}`}>
        <div className="flex items-center gap-2">
          <Sparkles className="h-3 w-3" />
          <span>Analizando estado de la tarea...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Resumen Estado */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <h4 className="text-xs font-semibold text-orange-700 uppercase tracking-wide flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            Resumen estado
          </h4>
          {currentModel && (
            <span className="text-xs text-orange-600 font-medium">
              {getModelDisplayName(currentModel)}
            </span>
          )}
        </div>
        <p className="text-sm text-orange-800 leading-relaxed">
          {statusSummary}
        </p>
      </div>
      
      {/* Próximos Pasos */}
      <div>
        <h4 className="text-xs font-semibold text-orange-700 mb-1 uppercase tracking-wide flex items-center gap-1">
          <ArrowRight className="h-3 w-3" />
          Próximos pasos
        </h4>
        <p className="text-sm text-orange-700 leading-relaxed font-medium">
          {nextSteps}
        </p>
      </div>
    </div>
  );
}
