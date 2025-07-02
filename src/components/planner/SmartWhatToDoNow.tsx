import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Play, 
  RotateCcw, 
  List, 
  Clock, 
  AlertTriangle, 
  ThumbsUp, 
  ThumbsDown,
  ChevronDown,
  ChevronUp,
  Brain,
  Zap,
  Target
} from 'lucide-react';
import { Task } from '@/hooks/useTasks';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { enhancedFactorsService, SmartRecommendation } from '@/services/enhancedFactorsService';

interface SmartWhatToDoNowProps {
  tasks: Task[];
  onWorkOnTask: (task: Task) => void;
  onShowAllTasks: () => void;
}

interface TaskAction {
  taskId: string;
  action: 'accepted' | 'skipped' | 'completed' | 'feedback_positive' | 'feedback_negative';
  timestamp: string;
}

const SmartWhatToDoNow: React.FC<SmartWhatToDoNowProps> = ({
  tasks,
  onWorkOnTask,
  onShowAllTasks
}) => {
  const [skippedTasks, setSkippedTasks] = useState<string[]>([]);
  const [userActions, setUserActions] = useState<TaskAction[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showAdvancedInfo, setShowAdvancedInfo] = useState(false);

  // Generar recomendación inteligente usando EnhancedFactorsService
  const smartRecommendation = useMemo((): SmartRecommendation | null => {
    const availableTasks = tasks.filter(task => 
      task.status !== 'completed' && 
      !task.is_archived && 
      !skippedTasks.includes(task.id)
    );

    if (availableTasks.length === 0) return null;

    const context = enhancedFactorsService.generateCurrentContext();
    
    // Calcular score para cada tarea
    const taskScores = availableTasks.map(task => {
      const factors = enhancedFactorsService.generateEnhancedFactors(task, context);
      const confidence = enhancedFactorsService.calculateConfidenceScore(factors);
      const successProbability = enhancedFactorsService.calculateSuccessProbability(task, context, factors);
      const finalScore = (confidence * 0.6) + (successProbability * 0.4);
      
      return {
        task,
        factors,
        confidence,
        successProbability,
        finalScore,
        context
      };
    });

    // Ordenar por score y tomar la mejor
    taskScores.sort((a, b) => b.finalScore - a.finalScore);
    const best = taskScores[0];

    if (!best) return null;

    // Generar razón principal
    const topFactors = best.factors.slice(0, 3);
    const reasoning = topFactors.length > 0 
      ? `${topFactors[0].description}. ${topFactors.length > 1 ? topFactors.slice(1).map(f => f.label).join(' y ') : ''}` 
      : 'Tarea bien posicionada para este momento';

    return {
      task: best.task,
      confidence: best.confidence,
      successProbability: best.successProbability,
      factors: best.factors,
      context: best.context,
      reasoning,
      estimatedDuration: enhancedFactorsService.estimateTaskDuration(best.task),
      energyMatch: best.context.userEnergyLevel
    };
  }, [tasks, skippedTasks]);

  // Tracking de acciones
  const trackAction = (action: TaskAction['action']) => {
    if (!smartRecommendation) return;
    
    const newAction: TaskAction = {
      taskId: smartRecommendation.task.id,
      action,
      timestamp: new Date().toISOString()
    };
    
    setUserActions(prev => [...prev, newAction]);
    
    // Persistir en localStorage para métricas MVP
    const savedActions = JSON.parse(localStorage.getItem('planner_mvp_actions') || '[]');
    savedActions.push(newAction);
    localStorage.setItem('planner_mvp_actions', JSON.stringify(savedActions));
  };

  const handleWorkOnTask = () => {
    if (!smartRecommendation) return;
    trackAction('accepted');
    onWorkOnTask(smartRecommendation.task);
  };

  const handleSkipTask = () => {
    if (!smartRecommendation) return;
    trackAction('skipped');
    // Añadir tarea actual a skipped para que no aparezca de nuevo
    setSkippedTasks(prev => [...prev, smartRecommendation.task.id]);
    setShowFeedback(true);
  };

  const handleFeedback = (positive: boolean) => {
    trackAction(positive ? 'feedback_positive' : 'feedback_negative');
    setShowFeedback(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  if (!smartRecommendation) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="text-6xl">🎉</div>
            <h3 className="text-xl font-semibold">¡Excelente trabajo!</h3>
            <p className="text-muted-foreground">
              No tienes tareas pendientes. Es momento de planificar nuevos objetivos.
            </p>
            <Button onClick={onShowAllTasks} variant="outline">
              <List className="w-4 h-4 mr-2" />
              Ver todas las tareas
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { task, confidence, successProbability, factors, reasoning, estimatedDuration } = smartRecommendation;

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg border-gradient-primary">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            ¿Qué hago ahora?
          </CardTitle>
          <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
            IA Recomendación
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Información de la tarea */}
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-lg leading-tight">
              {task.title}
            </h3>
            <Badge variant={getPriorityColor(task.priority)} className="ml-2">
              {task.priority}
            </Badge>
          </div>
          
          {task.description && (
            <p className="text-muted-foreground text-sm">
              {task.description}
            </p>
          )}

          {/* Grid de métricas */}
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
          
          {/* Razón de la sugerencia */}
          <Alert className="border-primary/20 bg-primary/5">
            <Brain className="w-4 h-4" />
            <AlertDescription className="text-primary font-medium">
              <span className="font-semibold">Por qué AHORA es perfecto:</span> {reasoning}
            </AlertDescription>
          </Alert>
          
          {/* Factores principales */}
          <div className="flex flex-wrap gap-2">
            {factors.slice(0, 3).map((factor) => (
              <Badge 
                key={factor.id} 
                variant={factor.type === 'positive' ? 'default' : factor.type === 'negative' ? 'destructive' : 'secondary'}
                className="text-xs"
              >
                {factor.icon} {factor.label}
              </Badge>
            ))}
          </div>

          {/* Información expandible */}
          <Collapsible open={showAdvancedInfo} onOpenChange={setShowAdvancedInfo}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full justify-between">
                <span className="text-sm">Información detallada</span>
                {showAdvancedInfo ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 pt-3 border-t">
              {/* Estado del usuario */}
              <div className="bg-muted/50 rounded-lg p-3">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Tu estado actual
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Energía: <span className="font-medium">{smartRecommendation.context.userEnergyLevel}</span></div>
                  <div>Momento: <span className="font-medium">{smartRecommendation.context.timeOfDay}</span></div>
                  <div>Completadas hoy: <span className="font-medium">{smartRecommendation.context.completedTasksToday}</span></div>
                  <div>Patrón: <span className="font-medium">{smartRecommendation.context.workPattern}</span></div>
                </div>
              </div>

              {/* Todos los factores */}
              <div className="space-y-2">
                <h4 className="font-medium">Todos los factores considerados:</h4>
                {factors.map((factor) => (
                  <div key={factor.id} className="flex items-center justify-between text-sm p-2 bg-muted/30 rounded">
                    <span className="flex items-center gap-2">
                      <span>{factor.icon}</span>
                      <span>{factor.label}</span>
                    </span>
                    <span className={`font-medium ${factor.type === 'positive' ? 'text-green-600' : factor.type === 'negative' ? 'text-red-600' : 'text-gray-600'}`}>
                      {factor.type === 'positive' ? '+' : factor.type === 'negative' ? '-' : ''}{factor.weight}
                    </span>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Metadata de la tarea */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {task.due_date && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Vence: {format(new Date(task.due_date), 'dd MMM', { locale: es })}
              </div>
            )}
            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3" />
              Energía requerida: {smartRecommendation.energyMatch}
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="space-y-2">
          <Button 
            onClick={handleWorkOnTask}
            className="w-full bg-primary hover:bg-primary/90 text-lg py-6"
          >
            <Play className="w-5 h-5 mr-2" />
            🚀 Empezar a trabajar
          </Button>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleSkipTask}
              variant="outline"
              className="flex-1"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Ver siguiente
            </Button>
            
            <Button 
              onClick={() => {/* TODO: programar recordatorio */}}
              variant="ghost"
              className="flex-1 text-xs"
            >
              <Clock className="w-4 h-4 mr-1" />
              No ahora (30 min)
            </Button>
          </div>
        </div>

        {/* Feedback rápido */}
        {showFeedback && (
          <div className="border-t pt-4">
            <p className="text-sm text-muted-foreground mb-3">
              ¿Esta sugerencia fue útil?
            </p>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => handleFeedback(true)}
              >
                <ThumbsUp className="w-4 h-4 mr-1" />
                👍 Útil
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => handleFeedback(false)}
              >
                <ThumbsDown className="w-4 h-4 mr-1" />
                👎 No útil
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SmartWhatToDoNow;