import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Clock, 
  Target, 
  Sparkles,
  TrendingUp,
  CheckCircle,
  Plus,
  RefreshCw,
  AlertCircle,
  Lightbulb,
  BarChart3,
  ArrowRight,
  Play
} from 'lucide-react';
import { useWeeklyPlanner } from '@/hooks/useWeeklyPlanner';
import { format, addDays } from 'date-fns';
import { es } from 'date-fns/locale';

interface WeeklyPlannerPanelProps {
  onClose?: () => void;
}

const WeeklyPlannerPanel: React.FC<WeeklyPlannerPanelProps> = ({ onClose }) => {
  const {
    weeklyPlan,
    recentPlans,
    isLoading,
    generatePlan,
    isGenerating,
    activatePlan,
    getTodaysTasks,
    getUpcomingTasks,
    getWeeklyStats,
    weekStartDate,
    weekEndDate
  } = useWeeklyPlanner();

  const [strategy, setStrategy] = useState<'balanced' | 'focused' | 'intensive'>('balanced');

  const todaysTasks = getTodaysTasks();
  const upcomingTasks = getUpcomingTasks();
  const weeklyStats = getWeeklyStats();

  const handleGeneratePlan = () => {
    generatePlan({
      weekStartDate,
      strategy
    });
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

  const getEnergyColor = (energy: string) => {
    switch (energy) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-blue-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const formatWeekRange = () => {
    return `${format(weekStartDate, 'dd MMM', { locale: es })} - ${format(weekEndDate, 'dd MMM', { locale: es })}`;
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="w-6 h-6 text-purple-600" />
            Planificador Semanal IA
          </h2>
          <p className="text-gray-600">
            Planificación automática inteligente para {formatWeekRange()}
          </p>
        </div>
        {onClose && (
          <Button variant="outline" onClick={onClose} size="sm">
            Volver al planner
          </Button>
        )}
      </div>

      {/* Stats Overview */}
      {weeklyStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-green-600" />
                <div>
                  <div className="text-2xl font-bold">{weeklyStats.completionRate}%</div>
                  <div className="text-sm text-gray-600">Tasa de completación</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Sparkles className="w-8 h-8 text-purple-600" />
                <div>
                  <div className="text-2xl font-bold">{weeklyStats.averageConfidence}%</div>
                  <div className="text-sm text-gray-600">Confianza IA promedio</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold">{weeklyStats.totalCompleted}</div>
                  <div className="text-sm text-gray-600">Planes completados</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-orange-600" />
                <div>
                  <div className={`text-2xl font-bold ${weeklyStats.improvementTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {weeklyStats.improvementTrend >= 0 ? '+' : ''}{weeklyStats.improvementTrend.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">Tendencia mejora</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="current" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="current">Plan Actual</TabsTrigger>
          <TabsTrigger value="generate">Generar Nuevo</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-6">
          {weeklyPlan ? (
            <>
              {/* Plan Overview */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        Plan Semanal {formatWeekRange()}
                        <Badge className={weeklyPlan.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}>
                          {weeklyPlan.status}
                        </Badge>
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        {weeklyPlan.planned_tasks.length} días planificados • {weeklyPlan.total_estimated_hours}h estimadas
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-purple-600">{weeklyPlan.ai_confidence}%</div>
                      <div className="text-sm text-gray-600">Confianza IA</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progreso de la semana</span>
                        <span>{weeklyPlan.actual_hours || 0}h / {weeklyPlan.total_estimated_hours}h</span>
                      </div>
                      <Progress value={(weeklyPlan.actual_hours || 0) / weeklyPlan.total_estimated_hours * 100} />
                    </div>

                    {weeklyPlan.status === 'draft' && (
                      <Button onClick={() => activatePlan(weeklyPlan.id)} className="w-full">
                        <Play className="w-4 h-4 mr-2" />
                        Activar Plan Semanal
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Today's Tasks */}
              {todaysTasks.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Tareas de Hoy
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {todaysTasks.map((task) => (
                        <div key={task.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="text-sm font-medium text-gray-500 min-w-[60px]">
                            {task.suggested_time}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{task.title}</div>
                            <div className="text-sm text-gray-600">{task.rationale}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getPriorityColor(task.priority)}>
                              {task.priority}
                            </Badge>
                            <div className={`text-sm ${getEnergyColor(task.energy_requirement)}`}>
                              {task.energy_requirement} energía
                            </div>
                            <div className="text-sm text-gray-500">
                              {task.estimated_duration}min
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Weekly Schedule */}
              <Card>
                <CardHeader>
                  <CardTitle>Cronograma Semanal</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {weeklyPlan.planned_tasks.map((dayPlan) => (
                      <div key={dayPlan.date} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-semibold">
                              {format(new Date(dayPlan.date), 'EEEE dd/MM', { locale: es })}
                            </h4>
                            <div className="text-sm text-gray-600">
                              {dayPlan.taskCount} tareas • {dayPlan.estimatedHours}h estimadas
                            </div>
                          </div>
                          <Progress 
                            value={Math.min((dayPlan.estimatedHours / 8) * 100, 100)} 
                            className="w-24"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          {dayPlan.tasks.map((task) => (
                            <div key={task.id} className="flex items-center gap-2 text-sm p-2 bg-gray-50 rounded">
                              <span className="text-gray-500 font-mono min-w-[50px]">
                                {task.suggested_time}
                              </span>
                              <span className="flex-1">{task.title}</span>
                              <Badge className={getPriorityColor(task.priority)}>
                                {task.priority}
                              </Badge>
                              <span className="text-gray-500">{task.estimated_duration}min</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-semibold mb-2">No hay plan para esta semana</h3>
                <p className="text-gray-600 mb-6">
                  Genera un plan semanal automático basado en tus tareas y preferencias
                </p>
                <Button onClick={() => handleGeneratePlan()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Generar Plan Semanal
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="generate" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Generar Plan Semanal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium mb-3 block">
                  Estrategia de planificación
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Button
                    variant={strategy === 'balanced' ? 'default' : 'outline'}
                    onClick={() => setStrategy('balanced')}
                    className="h-auto p-4 flex-col items-start"
                  >
                    <div className="font-semibold">⚖️ Equilibrado</div>
                    <div className="text-xs text-left">
                      Distribución uniforme de tareas y tiempo libre
                    </div>
                  </Button>
                  
                  <Button
                    variant={strategy === 'focused' ? 'default' : 'outline'}
                    onClick={() => setStrategy('focused')}
                    className="h-auto p-4 flex-col items-start"
                  >
                    <div className="font-semibold">🎯 Enfocado</div>
                    <div className="text-xs text-left">
                      Pocas tareas por día, máximo enfoque
                    </div>
                  </Button>
                  
                  <Button
                    variant={strategy === 'intensive' ? 'default' : 'outline'}
                    onClick={() => setStrategy('intensive')}
                    className="h-auto p-4 flex-col items-start"
                  >
                    <div className="font-semibold">🚀 Intensivo</div>
                    <div className="text-xs text-left">
                      Máxima productividad, más tareas por día
                    </div>
                  </Button>
                </div>
              </div>

              <div className="border-t pt-6">
                <Button 
                  onClick={handleGeneratePlan}
                  disabled={isGenerating}
                  size="lg"
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-5 h-5 mr-3 animate-spin" />
                      Generando plan inteligente...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-3" />
                      Generar Plan con IA
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Planes</CardTitle>
            </CardHeader>
            <CardContent>
              {recentPlans.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-600">No hay planes anteriores</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentPlans.map((plan) => (
                    <div key={plan.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold">
                            {format(new Date(plan.week_start_date), 'dd MMM', { locale: es })} - {' '}
                            {format(new Date(plan.week_end_date), 'dd MMM yyyy', { locale: es })}
                          </div>
                          <div className="text-sm text-gray-600">
                            {plan.planned_tasks.length} días • {plan.total_estimated_hours}h • {plan.ai_confidence}% confianza
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={plan.status === 'completed' ? 'bg-green-500' : 
                                          plan.status === 'active' ? 'bg-blue-500' : 'bg-gray-500'}>
                            {plan.status}
                          </Badge>
                          {plan.completion_rate !== undefined && (
                            <div className="text-sm text-gray-600">
                              {Math.round(plan.completion_rate)}% completado
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WeeklyPlannerPanel;