import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, Target, TrendingUp } from 'lucide-react';

interface WorkSessionSummaryProps {
  elapsedTime: number;
  taskProgress: number;
  taskTitle: string;
  isActive: boolean;
}

const WorkSessionSummary: React.FC<WorkSessionSummaryProps> = ({
  elapsedTime,
  taskProgress,
  taskTitle,
  isActive
}) => {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProductivityLevel = () => {
    const timeInMinutes = elapsedTime / 60;
    if (timeInMinutes < 15) return { level: 'Iniciando', color: 'bg-blue-500' };
    if (timeInMinutes < 45) return { level: 'Enfocado', color: 'bg-green-500' };
    if (timeInMinutes < 90) return { level: 'En Flow', color: 'bg-purple-500' };
    return { level: 'Sesión Larga', color: 'bg-orange-500' };
  };

  const productivity = getProductivityLevel();

  return (
    <Card className="mb-6 border-l-4 border-l-primary">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium text-muted-foreground">
            Sesión Actual
          </CardTitle>
          <Badge 
            variant={isActive ? "default" : "secondary"}
            className={`text-xs ${isActive ? 'animate-pulse' : ''}`}
          >
            {isActive ? 'Activa' : 'Pausada'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="grid grid-cols-4 gap-4">
          {/* Tiempo transcurrido */}
          <div className="text-center">
            <div className="flex flex-col items-center gap-1">
              <Clock className="w-5 h-5 text-primary" />
              <div className="text-lg font-mono font-bold text-primary">
                {formatTime(elapsedTime)}
              </div>
              <div className="text-xs text-muted-foreground">Tiempo</div>
            </div>
          </div>

          {/* Progreso */}
          <div className="text-center">
            <div className="flex flex-col items-center gap-1">
              <Target className="w-5 h-5 text-green-600" />
              <div className="text-lg font-bold text-green-600">
                {taskProgress}%
              </div>
              <div className="text-xs text-muted-foreground">Progreso</div>
            </div>
          </div>

          {/* Productividad */}
          <div className="text-center">
            <div className="flex flex-col items-center gap-1">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <div className="text-sm font-medium text-purple-600">
                {productivity.level}
              </div>
              <div className="text-xs text-muted-foreground">Estado</div>
            </div>
          </div>

          {/* Completitud */}
          <div className="text-center">
            <div className="flex flex-col items-center gap-1">
              <CheckCircle className={`w-5 h-5 ${taskProgress >= 100 ? 'text-green-500' : 'text-muted-foreground'}`} />
              <div className="text-sm font-medium">
                {taskProgress >= 100 ? 'Listo' : 'En proceso'}
              </div>
              <div className="text-xs text-muted-foreground">Estado</div>
            </div>
          </div>
        </div>

        {/* Barra de progreso visual */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>Progreso de sesión</span>
            <span>{Math.round((elapsedTime / 60 / 90) * 100)}% del tiempo óptimo</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${productivity.color}`}
              style={{ 
                width: `${Math.min(100, (elapsedTime / 60 / 90) * 100)}%` 
              }}
            />
          </div>
        </div>

        {/* Motivación */}
        {elapsedTime > 0 && (
          <div className="mt-3 p-2 bg-primary/5 rounded-lg">
            <p className="text-xs text-center text-primary font-medium">
              {elapsedTime < 900 ? '🚀 ¡Excelente inicio! Mantén el enfoque' : 
               elapsedTime < 2700 ? '⚡ ¡En racha productiva! Sigue así' :
               elapsedTime < 5400 ? '🎯 ¡Sesión intensa! Considera un descanso pronto' :
               '🏆 ¡Sesión épica! Has superado el tiempo recomendado'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WorkSessionSummary;