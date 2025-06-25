
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  AlertCircle 
} from 'lucide-react';
import { useAITaskMonitor } from '@/hooks/useAITaskMonitor';

interface TaskHealthIndicatorProps {
  taskId: string;
  compact?: boolean;
}

const TaskHealthIndicator = ({ taskId, compact = false }: TaskHealthIndicatorProps) => {
  const { getTaskHealthStatus } = useAITaskMonitor();
  const healthStatus = getTaskHealthStatus(taskId);

  if (!healthStatus) {
    return compact ? null : (
      <Badge variant="outline" className="text-xs">
        <Clock className="h-3 w-3 mr-1" />
        Analizando...
      </Badge>
    );
  }

  const { health_score, bottleneck_detected, priority_score } = healthStatus;

  const getHealthIcon = () => {
    if (health_score >= 70) return <CheckCircle className="h-3 w-3 text-green-500" />;
    if (health_score >= 40) return <Clock className="h-3 w-3 text-yellow-500" />;
    return <AlertTriangle className="h-3 w-3 text-red-500" />;
  };

  const getHealthColor = () => {
    if (health_score >= 70) return 'text-green-700 bg-green-50';
    if (health_score >= 40) return 'text-yellow-700 bg-yellow-50';
    return 'text-red-700 bg-red-50';
  };

  const getHealthText = () => {
    if (health_score >= 70) return 'Saludable';
    if (health_score >= 40) return 'Atención';
    return 'Crítica';
  };

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        {getHealthIcon()}
        {bottleneck_detected && (
          <AlertCircle className="h-3 w-3 text-orange-500" />
        )}
        {priority_score > 70 && (
          <TrendingUp className="h-3 w-3 text-blue-500" />
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Badge className={`${getHealthColor()} text-xs`}>
        {getHealthIcon()}
        <span className="ml-1">{getHealthText()}</span>
      </Badge>
      
      {bottleneck_detected && (
        <Badge variant="outline" className="bg-orange-50 text-orange-700 text-xs">
          <AlertCircle className="h-3 w-3 mr-1" />
          Cuello de botella
        </Badge>
      )}
      
      {priority_score > 70 && (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 text-xs">
          <TrendingUp className="h-3 w-3 mr-1" />
          Alta prioridad
        </Badge>
      )}
    </div>
  );
};

export default TaskHealthIndicator;
