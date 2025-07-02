import React from 'react';
import { Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';

interface ActiveWorkProgressProps {
  taskProgress: number;
  setTaskProgress: (progress: number) => void;
}

const ActiveWorkProgress: React.FC<ActiveWorkProgressProps> = ({
  taskProgress,
  setTaskProgress
}) => {
  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Progreso de la Tarea
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Bar Visual */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Avance General</span>
            <Badge variant="secondary" className="text-xs">
              {taskProgress}%
            </Badge>
          </div>
          <Progress 
            value={taskProgress} 
            className="h-3 animate-scale-in"
          />
        </div>
        
        {/* Slider para ajustar progreso */}
        <div className="space-y-3">
          <label className="text-sm font-medium">
            Ajustar progreso manualmente
          </label>
          <Slider
            value={[taskProgress]}
            onValueChange={(value) => setTaskProgress(value[0])}
            max={100}
            step={5}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0%</span>
            <span>25%</span>
            <span>50%</span>
            <span>75%</span>
            <span>100%</span>
          </div>
        </div>
        
        {/* Indicadores visuales */}
        <div className="grid grid-cols-4 gap-2">
          {[25, 50, 75, 100].map((milestone) => (
            <div 
              key={milestone}
              className={`text-center p-2 rounded-lg border transition-all ${
                taskProgress >= milestone 
                  ? 'bg-primary/10 border-primary text-primary' 
                  : 'bg-muted border-border text-muted-foreground'
              }`}
            >
              <div className="text-xs font-medium">{milestone}%</div>
              <div className="text-xs">
                {milestone === 25 && 'Iniciado'}
                {milestone === 50 && 'Avanzando'}
                {milestone === 75 && 'Casi listo'}
                {milestone === 100 && 'Completado'}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ActiveWorkProgress;