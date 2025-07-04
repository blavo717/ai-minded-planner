import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Zap, Brain, Target } from 'lucide-react';
import { Task } from '@/hooks/useTasks';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { OptimizedRecommendationEngine } from '@/services/optimizedRecommendationEngine';
import { EnhancedSmartRecommendation } from '@/services/smartRecommendationEngine';
import { enhancedFactorsService } from '@/services/enhancedFactorsService';
import { useAuth } from '@/hooks/useAuth';
import { TaskMetricsDisplay } from './components/TaskMetricsDisplay';
import { TaskReasoningAlert } from './components/TaskReasoningAlert';
import { FactorsBadges } from './components/FactorsBadges';
import { AdvancedInfoSection } from './components/AdvancedInfoSection';
import { ActionButtons } from './components/ActionButtons';
import { FeedbackSection } from './components/FeedbackSection';
import { performanceMonitor, debounce } from '@/utils/performanceMonitor';

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

// Memoized sub-components for better performance
const MemoizedTaskMetricsDisplay = React.memo(TaskMetricsDisplay);
const MemoizedTaskReasoningAlert = React.memo(TaskReasoningAlert);
const MemoizedFactorsBadges = React.memo(FactorsBadges);
const MemoizedAdvancedInfoSection = React.memo(AdvancedInfoSection);
const MemoizedActionButtons = React.memo(ActionButtons);
const MemoizedFeedbackSection = React.memo(FeedbackSection);

const OptimizedSmartWhatToDoNow: React.FC<SmartWhatToDoNowProps> = React.memo(({
  tasks,
  onWorkOnTask,
  onShowAllTasks
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [skippedTasks, setSkippedTasks] = useState<string[]>([]);
  const [userActions, setUserActions] = useState<TaskAction[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showAdvancedInfo, setShowAdvancedInfo] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<EnhancedSmartRecommendation | null>(null);
  const [engine, setEngine] = useState<OptimizedRecommendationEngine | null>(null);

  // Initialize engine
  useEffect(() => {
    if (user) {
      const optimizedEngine = new OptimizedRecommendationEngine(user.id);
      setEngine(optimizedEngine);
      
      // Preload user behavior for faster recommendations
      optimizedEngine.preloadUserBehavior();
    }
  }, [user]);

  // Memoized filtered tasks
  const availableTasks = useMemo(() => {
    performanceMonitor.startTimer('task_filtering');
    const filtered = tasks.filter(task => 
      task.status !== 'completed' && 
      !task.is_archived && 
      !skippedTasks.includes(task.id)
    );
    performanceMonitor.endTimer('task_filtering');
    return filtered;
  }, [tasks, skippedTasks]);

  // Debounced recommendation generation
  const generateRecommendation = useCallback(
    debounce(async (tasksToAnalyze: Task[]) => {
      if (!engine || tasksToAnalyze.length === 0) {
        setRecommendation(null);
        return;
      }

      setIsLoading(true);
      try {
        const result = await engine.generateOptimizedRecommendation(tasksToAnalyze);
        setRecommendation(result);
      } catch (error) {
        console.error('Error generating recommendation:', error);
        setRecommendation(null);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    [engine]
  );

  // Generate recommendation when tasks change
  useEffect(() => {
    generateRecommendation(availableTasks);
  }, [availableTasks, generateRecommendation]);

  // Memoized fallback recommendation for immediate response
  const fallbackRecommendation = useMemo((): EnhancedSmartRecommendation | null => {
    if (availableTasks.length === 0 || !user) return null;

    performanceMonitor.startTimer('fallback_recommendation');
    
    const context = enhancedFactorsService.generateCurrentContext();
    
    // Quick scoring for immediate response
    const taskScores = availableTasks.map(task => {
      const factors = enhancedFactorsService.generateEnhancedFactors(task, context);
      const confidence = enhancedFactorsService.calculateConfidenceScore(factors);
      const successProbability = enhancedFactorsService.calculateSuccessProbability(task, context, factors);
      const finalScore = (confidence * 0.6) + (successProbability * 0.4);
      
      return { task, factors, confidence, successProbability, finalScore, context };
    });

    taskScores.sort((a, b) => b.finalScore - a.finalScore);
    const best = taskScores[0];

    if (!best) {
      performanceMonitor.endTimer('fallback_recommendation');
      return null;
    }

    const topFactors = best.factors.slice(0, 3);
    const reasoning = topFactors.length > 0 
      ? `${topFactors[0].description}. ${topFactors.length > 1 ? topFactors.slice(1).map(f => f.label).join(' y ') : ''}` 
      : 'Tarea bien posicionada para este momento';

    const result = {
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

    performanceMonitor.endTimer('fallback_recommendation');
    return result;
  }, [availableTasks, user]);

  // Use optimized recommendation or fallback
  const smartRecommendation = recommendation || fallbackRecommendation;

  // Optimized action tracking with debouncing
  const trackAction = useCallback(
    debounce(async (action: TaskAction['action']) => {
      if (!smartRecommendation) return;
      
      const newAction: TaskAction = {
        taskId: smartRecommendation.task.id,
        action,
        timestamp: new Date().toISOString()
      };
      
      setUserActions(prev => [...prev, newAction]);
      
      // Persist actions
      const savedActions = JSON.parse(localStorage.getItem('planner_mvp_actions') || '[]');
      savedActions.push(newAction);
      localStorage.setItem('planner_mvp_actions', JSON.stringify(savedActions));

      // Send feedback to learning system
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
    }, 100),
    [smartRecommendation, user]
  );

  const handleWorkOnTask = useCallback(() => {
    if (!smartRecommendation) return;
    trackAction('accepted');
    navigate(`/work/${smartRecommendation.task.id}`);
  }, [smartRecommendation, trackAction, navigate]);

  const handleSkipTask = useCallback(() => {
    if (!smartRecommendation) return;
    trackAction('skipped');
    setSkippedTasks(prev => [...prev, smartRecommendation.task.id]);
    setShowFeedback(true);
  }, [smartRecommendation, trackAction]);

  const handleFeedback = useCallback((positive: boolean) => {
    trackAction(positive ? 'feedback_positive' : 'feedback_negative');
    setShowFeedback(false);
  }, [trackAction]);

  const getPriorityColor = useCallback((priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  }, []);

  // Show loading state
  if (isLoading && !smartRecommendation) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="animate-spin text-4xl">🧠</div>
            <h3 className="text-lg font-semibold">Analizando tareas...</h3>
            <p className="text-muted-foreground text-sm">
              Generando la mejor recomendación para ti
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty state
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
            {isLoading && <div className="animate-pulse text-xs">(optimizando...)</div>}
          </CardTitle>
          <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
            IA Recomendación
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
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

          <MemoizedTaskMetricsDisplay 
            confidence={confidence}
            successProbability={successProbability}
            estimatedDuration={estimatedDuration}
          />
          
          <MemoizedTaskReasoningAlert reasoning={reasoning} />
          
          <MemoizedFactorsBadges factors={factors} maxVisible={3} />

          <MemoizedAdvancedInfoSection 
            showAdvanced={showAdvancedInfo}
            onToggle={setShowAdvancedInfo}
            context={smartRecommendation.context}
            factors={factors}
          />

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

        <MemoizedActionButtons 
          onWorkOnTask={handleWorkOnTask}
          onSkipTask={handleSkipTask}
          onRemindLater={() => {/* TODO: programar recordatorio */}}
        />

        {showFeedback && <MemoizedFeedbackSection onFeedback={handleFeedback} />}
      </CardContent>
    </Card>
  );
});

OptimizedSmartWhatToDoNow.displayName = 'OptimizedSmartWhatToDoNow';

export default OptimizedSmartWhatToDoNow;