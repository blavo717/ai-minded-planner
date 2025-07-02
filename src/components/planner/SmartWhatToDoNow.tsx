import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Zap, Brain, Target } from 'lucide-react';
import { Task } from '@/hooks/useTasks';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { SmartRecommendationEngine, EnhancedSmartRecommendation } from '@/services/smartRecommendationEngine';
import { enhancedFactorsService } from '@/services/enhancedFactorsService';
import { useAuth } from '@/hooks/useAuth';
import { TaskMetricsDisplay } from './components/TaskMetricsDisplay';
import { TaskReasoningAlert } from './components/TaskReasoningAlert';
import { FactorsBadges } from './components/FactorsBadges';
import { AdvancedInfoSection } from './components/AdvancedInfoSection';
import { ActionButtons } from './components/ActionButtons';
import { FeedbackSection } from './components/FeedbackSection';

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
  const { user } = useAuth();
  const [skippedTasks, setSkippedTasks] = useState<string[]>([]);
  const [userActions, setUserActions] = useState<TaskAction[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showAdvancedInfo, setShowAdvancedInfo] = useState(false);

  // Generar recomendación inteligente usando EnhancedFactorsService
  const smartRecommendation = useMemo((): EnhancedSmartRecommendation | null => {
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
      score: best.finalScore,
      confidence: best.confidence,
      successProbability: best.successProbability,
      factors: best.factors,
      context: best.context,
      reasoning,
      estimatedDuration: enhancedFactorsService.estimateTaskDuration(best.task),
      energyMatch: best.context.userEnergyLevel,
      alternatives: taskScores.slice(1, 3).map(ts => ts.task),
      userProfile: {
        optimalHours: [9, 10, 11],
        optimalDays: ['lunes', 'martes'],
        avgTaskDuration: 60,
        completionRate: 75,
        preferredTags: [],
        procrastinationTriggers: [],
        energyPeakHours: [9, 14],
        productivePatterns: []
      },
      insights: [],
      timing: {
        isOptimalNow: true,
        reasoning: 'Momento adecuado para trabajar'
      },
      energy: {
        required: 'medium' as const,
        available: best.context.userEnergyLevel,
        match: 'good' as const,
        suggestion: 'Buena coincidencia de energía'
      }
    };
  }, [tasks, skippedTasks]);

  // Tracking de acciones con aprendizaje
  const trackAction = async (action: TaskAction['action']) => {
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

    // Enviar feedback al sistema de aprendizaje
    if (user) {
      try {
        const { FeedbackLearningSystem } = await import('@/services/feedbackLearningSystem');
        const learningSystem = new FeedbackLearningSystem(user.id);
        
        await learningSystem.processFeedback({
          user_id: user.id,
          task_id: smartRecommendation.task.id,
          action,
          context_data: {
            priority: smartRecommendation.task.priority,
            tags: smartRecommendation.task.tags,
            confidence: smartRecommendation.confidence,
            hour: new Date().getHours()
          }
        });
      } catch (error) {
        console.error('Error processing feedback:', error);
      }
    }
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
              <Target className="w-4 h-4 mr-2" />
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

          {/* Métricas usando componente */}
          <TaskMetricsDisplay 
            confidence={confidence}
            successProbability={successProbability}
            estimatedDuration={estimatedDuration}
          />
          
          {/* Razón usando componente */}
          <TaskReasoningAlert reasoning={reasoning} />
          
          {/* Factores usando componente */}
          <FactorsBadges factors={factors} maxVisible={3} />

          {/* Información avanzada usando componente */}
          <AdvancedInfoSection 
            showAdvanced={showAdvancedInfo}
            onToggle={setShowAdvancedInfo}
            context={smartRecommendation.context}
            factors={factors}
          />

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

        {/* Botones usando componente */}
        <ActionButtons 
          onWorkOnTask={handleWorkOnTask}
          onSkipTask={handleSkipTask}
          onRemindLater={() => {/* TODO: programar recordatorio */}}
        />

        {/* Feedback usando componente */}
        {showFeedback && <FeedbackSection onFeedback={handleFeedback} />}
      </CardContent>
    </Card>
  );
};

export default SmartWhatToDoNow;