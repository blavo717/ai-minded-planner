import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Timer, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ActiveWorkHeaderProps {
  elapsedTime: number;
  isStarting: boolean;
}

const ActiveWorkHeader: React.FC<ActiveWorkHeaderProps> = ({ elapsedTime, isStarting }) => {
  const navigate = useNavigate();

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/planner')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Planificador
            </Button>
            
            <div className="flex items-center gap-2">
              <Target className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold">Modo Trabajo Activo</h1>
              <Badge variant="secondary" className="text-xs">
                En Progreso
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Timer className="w-5 h-5 text-primary" />
            <span className="text-lg font-mono text-primary font-semibold">
              {formatTime(elapsedTime)}
            </span>
            {isStarting && (
              <Badge variant="outline" className="text-xs">
                Iniciando...
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActiveWorkHeader;