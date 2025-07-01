
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, SkipForward, X, Clock, Calendar, Flag } from 'lucide-react';
import { Task } from '@/hooks/useTasks';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { TaskWithReason } from '@/utils/taskPrioritization';
import { AITaskSummary } from './AITaskSummary';

interface WhatToDoNowCardProps {
  taskWithReason: TaskWithReason;
  onStartWorking: (task: Task) => void;
  onSkipToNext: () => void;
  onDismiss: () => void;
}

const WhatToDoNowCard = ({ taskWithReason, onStartWorking, onSkipToNext, onDismiss }: WhatToDoNowCardProps) => {
  const { task, reason } = taskWithReason;
  const [isAnimating, setIsAnimating] = useState(false);

  const handleStartWorking = () => {
    setIsAnimating(true);
    setTimeout(() => {
      onStartWorking(task);
    }, 150);
  };

  const getPriorityIcon = () => {
    switch (task.priority) {
      case 'urgent': return '🔥';
      case 'high': return '⭐';
      case 'medium': return '📋';
      case 'low': return '📝';
      default: return '📋';
    }
  };

  const getPriorityColor = () => {
    switch (task.priority) {
      case 'urgent': return 'from-red-50 to-red-100 border-red-200';
      case 'high': return 'from-orange-50 to-orange-100 border-orange-200';
      default: return 'from-blue-50 to-indigo-100 border-blue-200';
    }
  };

  return (
    <Card className={`bg-gradient-to-r ${getPriorityColor()} transition-all duration-300 ${
      isAnimating ? 'scale-95 opacity-75' : 'hover:shadow-md'
    }`}>
      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          {/* Contenido principal */}
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Indicador pulsante */}
            <div className="flex-shrink-0 mt-1">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            </div>

            {/* Información de la tarea */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-blue-900 text-sm">¿Qué hago ahora?</h3>
                <span className="text-lg">{getPriorityIcon()}</span>
              </div>
              
              <h4 className="font-medium text-gray-900 mb-1 truncate" title={task.title}>
                {task.title}
              </h4>
              
              <p className="text-sm text-blue-700 font-medium mb-2">
                {reason}
              </p>

              {/* Metadata de la tarea */}
              <div className="flex items-center gap-3 text-xs text-gray-600 mb-4">
                {task.due_date && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{format(new Date(task.due_date), 'dd MMM', { locale: es })}</span>
                  </div>
                )}
                
                {task.estimated_duration && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{task.estimated_duration}h</span>
                  </div>
                )}

                <Badge variant="outline" className="text-xs">
                  <Flag className="h-2 w-2 mr-1" />
                  {task.priority === 'urgent' ? 'Urgente' : 
                   task.priority === 'high' ? 'Alta' :
                   task.priority === 'medium' ? 'Media' : 'Baja'}
                </Badge>
              </div>

              {/* ✨ SECCIÓN IA - NUEVA INTEGRACIÓN */}
              <div className="border-t border-orange-200 pt-4">
                <AITaskSummary taskId={task.id} />
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button 
              size="sm" 
              className="bg-blue-600 hover:bg-blue-700 text-white gap-1"
              onClick={handleStartWorking}
              disabled={isAnimating}
            >
              <Play className="h-3 w-3" />
              Trabajar
            </Button>
            
            <Button 
              size="sm" 
              variant="outline"
              onClick={onSkipToNext}
              className="gap-1"
              disabled={isAnimating}
            >
              <SkipForward className="h-3 w-3" />
              Siguiente
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={onDismiss}
              className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default WhatToDoNowCard;
