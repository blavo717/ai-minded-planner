import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  Zap, 
  Brain, 
  Target, 
  Play, 
  SkipForward, 
  CheckCircle,
  ArrowRight,
  Info,
  BarChart3,
  Sparkles
} from 'lucide-react';
import { Task } from '@/hooks/useTasks';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { enhancedFactorsService } from '@/services/enhancedFactorsService';
import { useAuth } from '@/hooks/useAuth';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import ContextualRecommendations from './ContextualRecommendations';
import ProductivityDashboard from './ProductivityDashboard';

interface SimplifiedSmartPlannerProps {
  tasks: Task[];
  onWorkOnTask: (task: Task) => void;
  onShowAllTasks: () => void;
}

interface TaskAction {
  taskId: string;
  action: 'accepted' | 'skipped' | 'completed';
  timestamp: string;
}

const SimplifiedSmartPlanner: React.FC<SimplifiedSmartPlannerProps> = ({
  tasks,
  onWorkOnTask,
  onShowAllTasks
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [skippedTasks, setSkippedTasks] = useState<string[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [showProductivityDashboard, setShowProductivityDashboard] = useState(false);
  const [contextualReason, setContextualReason] = useState<string>('');

  // Generar recomendación simplificada
  const recommendation = useMemo(() => {
    const availableTasks = tasks.filter(task => 
      task.status !== 'completed' && 
      !task.is_archived && 
      !skippedTasks.includes(task.id)
    );

    if (availableTasks.length === 0 || !user) return null;

    const context = enhancedFactorsService.generateCurrentContext();
    
    // Cálculo simplificado de scores
    const taskScores = availableTasks.map(task => {
      const factors = enhancedFactorsService.generateEnhancedFactors(task, context);
      const urgencyScore = task.priority === 'urgent' ? 100 : 
                          task.priority === 'high' ? 80 : 
                          task.priority === 'medium' ? 60 : 40;
      
      const dueDateScore = task.due_date ? 
        (new Date(task.due_date).getTime() - Date.now()) < 86400000 ? 90 : 50 : 30;
      
      const energyScore = context.userEnergyLevel === 'high' ? 80 : 
                         context.userEnergyLevel === 'medium' ? 60 : 40;
      
      const finalScore = (urgencyScore * 0.4) + (dueDateScore * 0.3) + (energyScore * 0.3);
      
      return {
        task,
        score: finalScore,
        factors,
        context
      };
    });

    taskScores.sort((a, b) => b.score - a.score);
    const best = taskScores[0];

    if (!best) return null;

    // Generar razón simple y clara (será sobrescrita por ContextualRecommendations)
    const getSimpleReason = () => {
      if (best.task.priority === 'urgent') return "Es urgente y necesita atención inmediata";
      if (best.task.due_date && new Date(best.task.due_date).getTime() - Date.now() < 86400000) {
        return "Vence pronto, mejor completarla ahora";
      }
      if (context.userEnergyLevel === 'high') return "Tienes buena energía para esta tarea";
      return "Es el mejor momento para trabajar en esto";
    };

    const confidence = Math.min(95, Math.max(60, best.score));
    const estimatedMinutes = enhancedFactorsService.estimateTaskDuration(best.task);

    return {
      task: best.task,
      reason: contextualReason || getSimpleReason(),
      confidence: Math.round(confidence),
      estimatedMinutes,
      alternatives: taskScores.slice(1, 3).map(ts => ts.task),
      factors: best.factors
    };
  }, [tasks, skippedTasks, user, contextualReason]);

  const trackAction = useCallback(async (action: TaskAction['action']) => {
    if (!recommendation) return;
    
    const newAction: TaskAction = {
      taskId: recommendation.task.id,
      action,
      timestamp: new Date().toISOString()
    };
    
    // Guardar en localStorage para métricas
    const savedActions = JSON.parse(localStorage.getItem('planner_simple_actions') || '[]');
    savedActions.push(newAction);
    localStorage.setItem('planner_simple_actions', JSON.stringify(savedActions));
  }, [recommendation]);

  const handleStartTask = async () => {
    if (!recommendation) return;
    
    setIsStarting(true);
    await trackAction('accepted');
    
    // Pequeña animación antes de navegar
    setTimeout(() => {
      navigate(`/work/${recommendation.task.id}`);
    }, 500);
  };

  const handleSkipTask = async () => {
    if (!recommendation) return;
    
    await trackAction('skipped');
    setSkippedTasks(prev => [...prev, recommendation.task.id]);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-blue-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getTimeColor = (minutes: number) => {
    if (minutes <= 30) return 'text-green-600';
    if (minutes <= 60) return 'text-blue-600';
    return 'text-orange-600';
  };

  // Mostrar dashboard de productividad
  if (showProductivityDashboard) {
    return (
      <ProductivityDashboard onClose={() => setShowProductivityDashboard(false)} />
    );
  }

  // Estado vacío
  if (!recommendation) {
    return (
      <Card className="w-full max-w-2xl mx-auto shadow-lg">
        <CardContent className="pt-8 pb-8">
          <div className="text-center space-y-6">
            <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-gray-900">¡Todo listo!</h3>
              <p className="text-gray-600 text-lg">
                No tienes tareas pendientes en este momento
              </p>
            </div>
            <div className="flex gap-3">
              <Button onClick={onShowAllTasks} size="lg" className="text-lg px-8">
                <Target className="w-5 h-5 mr-2" />
                Ver todas las tareas
              </Button>
              <Button 
                onClick={() => setShowProductivityDashboard(true)} 
                variant="outline" 
                size="lg"
                className="text-lg px-8"
              >
                <BarChart3 className="w-5 h-5 mr-2" />
                Mi Productividad
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { task, reason, confidence, estimatedMinutes } = recommendation;

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl border-0 bg-gradient-to-br from-white to-blue-50/30">
      <CardHeader className="text-center space-y-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-center gap-3 flex-1">
            <Brain className="w-7 h-7" />
            <CardTitle className="text-2xl font-bold">Tu próxima tarea</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowProductivityDashboard(true)}
            className="text-white hover:bg-white/20"
          >
            <BarChart3 className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-blue-100 text-sm">
          Basado en tu productividad y prioridades
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6 p-8">
        {/* Tarea principal */}
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-xl font-bold leading-tight text-gray-900 flex-1">
              {task.title}
            </h3>
            <Badge className={`${getPriorityColor(task.priority)} px-3 py-1 text-sm font-medium`}>
              {task.priority}
            </Badge>
          </div>
          
          {task.description && (
            <p className="text-gray-600 leading-relaxed">
              {task.description}
            </p>
          )}
        </div>

        {/* Recomendaciones contextuales */}
        <ContextualRecommendations 
          task={task} 
          confidence={confidence}
          onReasonChange={setContextualReason}
        />

        {/* Métricas simples */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{confidence}%</div>
            <div className="text-sm text-gray-600">Recomendado</div>
            <Progress value={confidence} className="mt-2 h-2" />
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
            <div className={`text-2xl font-bold ${getTimeColor(estimatedMinutes)}`}>
              {estimatedMinutes}min
            </div>
            <div className="text-sm text-gray-600">Duración</div>
            <div className="flex items-center justify-center mt-2">
              <Clock className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Información adicional */}
        {task.due_date && (
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
            <Clock className="w-4 h-4" />
            <span>Vence: {format(new Date(task.due_date), 'dd \'de\' MMMM \'a las\' HH:mm', { locale: es })}</span>
          </div>
        )}

        {/* Botones de acción */}
        <div className="space-y-3">
          <Button 
            onClick={handleStartTask}
            className="w-full text-lg py-6 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:opacity-50"
            disabled={isStarting}
          >
            {isStarting ? (
              <>
                <div className="animate-spin w-5 h-5 mr-3 border-2 border-white border-t-transparent rounded-full"></div>
                Iniciando...
              </>
            ) : (
              <>
                <Play className="w-5 h-5 mr-3" />
                Empezar a trabajar
              </>
            )}
          </Button>
          
          <div className="flex gap-3">
            <Button 
              onClick={handleSkipTask}
              variant="outline" 
              className="flex-1 py-3"
            >
              <SkipForward className="w-4 h-4 mr-2" />
              Siguiente tarea
            </Button>
            
            <Button 
              onClick={() => setShowProductivityDashboard(true)}
              variant="outline" 
              className="flex-1 py-3"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Mi Progreso
            </Button>
            
            <Button 
              onClick={onShowAllTasks}
              variant="outline" 
              className="flex-1 py-3"
            >
              <Target className="w-4 h-4 mr-2" />
              Ver todas
            </Button>
          </div>
        </div>

        {/* Detalles expandibles */}
        <Collapsible open={showDetails} onOpenChange={setShowDetails}>
          <CollapsibleTrigger className="w-full">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors py-2">
              <Info className="w-4 h-4" />
              <span>{showDetails ? 'Menos detalles' : 'Más detalles'}</span>
              <ArrowRight className={`w-4 h-4 transition-transform ${showDetails ? 'rotate-90' : ''}`} />
            </div>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="space-y-3 pt-3 border-t border-gray-100">
            {recommendation.alternatives.length > 0 && (
              <div>
                <h5 className="font-medium text-gray-700 mb-2">Otras opciones:</h5>
                <div className="space-y-2">
                  {recommendation.alternatives.map((altTask, index) => (
                    <div key={altTask.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded text-sm">
                      <span className="text-gray-400">#{index + 2}</span>
                      <span className="flex-1">{altTask.title}</span>
                      <Badge variant="outline" className="text-xs">
                        {altTask.priority}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="text-xs text-gray-500 text-center">
              La recomendación se actualiza automáticamente según tu actividad
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};

export default SimplifiedSmartPlanner;