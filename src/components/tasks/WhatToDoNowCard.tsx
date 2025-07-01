
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  SkipForward, 
  X, 
  Clock, 
  AlertTriangle, 
  Target,
  Brain,
  TrendingUp
} from 'lucide-react';
import { Task } from '@/hooks/useTasks';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export interface TaskWithReason {
  task: Task;
  reason: string;
  priority: number;
  urgencyScore: number;
  contextualFactors: string[];
  estimatedDuration?: number;
}

interface WhatToDoNowCardProps {
  taskWithReason: TaskWithReason;
  onStartWorking: (task: Task) => void;
  onSkipToNext: () => void;
  onDismiss: () => void;
  className?: string;
}

export default function WhatToDoNowCard({
  taskWithReason,
  onStartWorking,
  onSkipToNext,
  onDismiss,
  className = ''
}: WhatToDoNowCardProps) {
  const { task, reason, urgencyScore, contextualFactors, estimatedDuration } = taskWithReason;

  const getUrgencyColor = (score: number) => {
    if (score >= 8) return 'text-red-600 bg-red-50 border-red-200';
    if (score >= 6) return 'text-orange-600 bg-orange-50 border-orange-200';
    if (score >= 4) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-blue-600 bg-blue-50 border-blue-200';
  };

  const getUrgencyIcon = (score: number) => {
    if (score >= 8) return <AlertTriangle className="h-4 w-4" />;
    if (score >= 6) return <Clock className="h-4 w-4" />;
    return <Target className="h-4 w-4" />;
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent': return <Badge variant="destructive">Urgente</Badge>;
      case 'high': return <Badge variant="secondary" className="bg-red-100 text-red-800">Alta</Badge>;
      case 'medium': return <Badge variant="secondary">Media</Badge>;
      case 'low': return <Badge variant="outline">Baja</Badge>;
      default: return <Badge variant="outline">Sin prioridad</Badge>;
    }
  };

  return (
    <Card className={`${className} border-l-4 border-l-purple-500`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="h-4 w-4 text-purple-600" />
              <CardTitle className="text-base">¿Qué hago ahora?</CardTitle>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full border text-xs font-medium ${getUrgencyColor(urgencyScore)}`}>
                {getUrgencyIcon(urgencyScore)}
                Urgencia: {urgencyScore}/10
              </div>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-purple-900">{task.title}</h3>
              {getPriorityBadge(task.priority || 'medium')}
            </div>
          </div>
          <Button 
            onClick={onDismiss}
            variant="ghost" 
            size="sm"
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* AI Reasoning */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-3 w-3 text-purple-600" />
            <span className="text-sm font-medium text-purple-800">Recomendación IA</span>
          </div>
          <p className="text-sm text-purple-700 leading-relaxed">{reason}</p>
        </div>

        {/* Task Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          {task.due_date && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Vence:</span>
              <span className="font-medium">
                {format(new Date(task.due_date), 'PPP', { locale: es })}
              </span>
            </div>
          )}
          
          {estimatedDuration && (
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Duración estimada:</span>
              <span className="font-medium">{estimatedDuration} min</span>
            </div>
          )}
        </div>

        {/* Contextual Factors */}
        {contextualFactors && contextualFactors.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Factores considerados:</h4>
            <div className="flex flex-wrap gap-1">
              {contextualFactors.map((factor, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {factor}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Task Description */}
        {task.description && (
          <div className="bg-gray-50 rounded-lg p-3">
            <h4 className="text-sm font-medium mb-1">Descripción:</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {task.description}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button 
            onClick={() => onStartWorking(task)}
            className="flex-1 bg-purple-600 hover:bg-purple-700"
          >
            <Play className="h-4 w-4 mr-2" />
            Empezar a trabajar
          </Button>
          
          <Button 
            onClick={onSkipToNext}
            variant="outline"
            className="flex-1"
          >
            <SkipForward className="h-4 w-4 mr-2" />
            Ver siguiente
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
