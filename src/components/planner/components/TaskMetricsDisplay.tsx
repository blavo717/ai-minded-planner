import React from 'react';

interface TaskMetricsDisplayProps {
  confidence: number;
  successProbability: number;
  estimatedDuration: number;
}

export const TaskMetricsDisplay: React.FC<TaskMetricsDisplayProps> = ({
  confidence,
  successProbability,
  estimatedDuration
}) => {
  return (
    <div className="grid grid-cols-3 gap-4 py-3 bg-gradient-to-r from-background to-muted/20 rounded-lg p-3">
      <div className="text-center">
        <div className="text-xl font-bold text-primary">{Math.round(confidence)}%</div>
        <div className="text-xs text-muted-foreground">Confianza IA</div>
      </div>
      <div className="text-center">
        <div className="text-xl font-bold text-success">{Math.round(successProbability)}%</div>
        <div className="text-xs text-muted-foreground">Prob. Éxito</div>
      </div>
      <div className="text-center">
        <div className="text-xl font-bold text-orange-600">{estimatedDuration}min</div>
        <div className="text-xs text-muted-foreground">Tiempo Est.</div>
      </div>
    </div>
  );
};