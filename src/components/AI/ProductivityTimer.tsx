
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Square, Clock } from 'lucide-react';
import { useTaskSessions } from '@/hooks/useTaskSessions';
import { usePatternTracking } from '@/hooks/usePatternTracking';

interface ProductivityTimerProps {
  taskId?: string;
  taskTitle?: string;
}

const ProductivityTimer = ({ taskId, taskTitle }: ProductivityTimerProps) => {
  const [elapsed, setElapsed] = useState(0);
  const { activeSession, startSession, endSession, isStarting, isEnding } = useTaskSessions();
  const { trackWorkSession } = usePatternTracking();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (activeSession) {
      interval = setInterval(() => {
        const startTime = new Date(activeSession.started_at);
        const now = new Date();
        const elapsedSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000);
        setElapsed(elapsedSeconds);
      }, 1000);
    } else {
      setElapsed(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeSession]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    startSession(taskId);
  };

  const handleStop = () => {
    if (activeSession) {
      // Finalizar sesión y registrar patrón
      endSession({ 
        sessionId: activeSession.id,
        productivityScore: 4, // Valor por defecto
      });
      
      // Registrar patrón de trabajo
      const startTime = new Date(activeSession.started_at);
      const endTime = new Date();
      trackWorkSession(startTime, endTime, 4);
    }
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center">
        <CardTitle className="text-lg flex items-center justify-center gap-2">
          <Clock className="h-5 w-5" />
          Timer de Productividad
        </CardTitle>
        {taskTitle && (
          <Badge variant="outline" className="text-xs">
            {taskTitle}
          </Badge>
        )}
      </CardHeader>
      
      <CardContent className="text-center space-y-4">
        <div className="text-3xl font-mono font-bold text-blue-600">
          {formatTime(elapsed)}
        </div>
        
        <div className="flex justify-center gap-2">
          {!activeSession ? (
            <Button
              onClick={handleStart}
              disabled={isStarting}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600"
            >
              <Play className="h-4 w-4" />
              Iniciar
            </Button>
          ) : (
            <Button
              onClick={handleStop}
              disabled={isEnding}
              variant="destructive"
              className="flex items-center gap-2"
            >
              <Square className="h-4 w-4" />
              Detener
            </Button>
          )}
        </div>
        
        {activeSession && (
          <div className="text-xs text-muted-foreground">
            Sesión activa desde{' '}
            {new Date(activeSession.started_at).toLocaleTimeString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductivityTimer;
