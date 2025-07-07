import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Target, 
  Clock, 
  Zap, 
  Calendar,
  Award,
  BarChart3,
  Activity,
  Settings,
  Sparkles,
  Star,
  ChevronRight,
  Trophy,
  Flame,
  CheckCircle
} from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { useAuth } from '@/hooks/useAuth';
import { useUserAchievements } from '@/hooks/useUserAchievements';
import { useProductivityPreferences } from '@/hooks/useProductivityPreferences';
import { format, subDays, startOfWeek, endOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import ProductivityPreferencesModal from './ProductivityPreferencesModal';

interface ProductivityDashboardProps {
  onClose?: () => void;
}

interface ProductivityStats {
  completedToday: number;
  completedThisWeek: number;
  averageTaskDuration: number;
  mostProductiveHour: number;
  completionRate: number;
  currentStreak: number;
  totalTasks: number;
  highPriorityCompleted: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: 'streak' | 'completion' | 'efficiency' | 'consistency';
  isUnlocked: boolean;
  progress: number;
  maxProgress: number;
  unlockedAt?: Date;
}

const ProductivityDashboard: React.FC<ProductivityDashboardProps> = ({ onClose }) => {
  const { tasks } = useTasks();
  const { user } = useAuth();
  const { getAchievementsWithDefinitions } = useUserAchievements();
  const { preferences, getWorkingHoursText, getWorkingDaysText } = useProductivityPreferences();
  const [selectedTab, setSelectedTab] = useState('overview');
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);

  // Calcular estadísticas de productividad
  const stats = useMemo((): ProductivityStats => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = startOfWeek(now, { locale: es });
    const weekEnd = endOfWeek(now, { locale: es });
    
    const completedTasks = tasks.filter(task => task.status === 'completed');
    const completedToday = completedTasks.filter(task => 
      task.completed_at && new Date(task.completed_at) >= today
    ).length;
    
    const completedThisWeek = completedTasks.filter(task => 
      task.completed_at && 
      new Date(task.completed_at) >= weekStart && 
      new Date(task.completed_at) <= weekEnd
    ).length;

    // Calcular duración promedio
    const tasksWithDuration = completedTasks.filter(task => task.actual_duration);
    const averageTaskDuration = tasksWithDuration.length > 0 
      ? tasksWithDuration.reduce((sum, task) => sum + (task.actual_duration || 0), 0) / tasksWithDuration.length
      : 30; // Default 30 minutos

    // Encontrar hora más productiva (simulado)
    const mostProductiveHour = 10; // 10 AM como default

    // Tasa de completación
    const totalTasks = tasks.filter(task => !task.is_archived).length;
    const completionRate = totalTasks > 0 ? (completedTasks.length / totalTasks) * 100 : 0;

    // Racha actual (simulado por ahora)
    const currentStreak = Math.min(completedToday + 3, 15); // Ejemplo

    // Tareas de alta prioridad completadas
    const highPriorityCompleted = completedTasks.filter(task => 
      task.priority === 'high' || task.priority === 'urgent'
    ).length;

    return {
      completedToday,
      completedThisWeek,
      averageTaskDuration: Math.round(averageTaskDuration),
      mostProductiveHour,
      completionRate: Math.round(completionRate),
      currentStreak,
      totalTasks,
      highPriorityCompleted
    };
  }, [tasks]);

  // Obtener logros del nuevo sistema
  const achievements = getAchievementsWithDefinitions();

  const unlockedAchievements = achievements.filter(a => a.isUnlocked);
  const nextAchievement = achievements.find(a => !a.isUnlocked);

  const getStreakColor = (streak: number) => {
    if (streak >= 14) return 'text-purple-600';
    if (streak >= 7) return 'text-orange-600';
    if (streak >= 3) return 'text-blue-600';
    return 'text-green-600';
  };

  const getCompletionRateColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-blue-600';
    if (rate >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            Mi Productividad
          </h2>
          <p className="text-gray-600">
            Patrones, logros y métricas personales
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowPreferencesModal(true)}
          >
            <Settings className="w-4 h-4 mr-2" />
            Configurar
          </Button>
          {onClose && (
            <Button variant="outline" onClick={onClose} size="sm">
              <ChevronRight className="w-4 h-4 mr-2" />
              Volver al planner
            </Button>
          )}
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Resumen
          </TabsTrigger>
          <TabsTrigger value="achievements" className="flex items-center gap-2">
            <Award className="w-4 h-4" />
            Logros
          </TabsTrigger>
          <TabsTrigger value="patterns" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Patrones
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Métricas principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-green-600">{stats.completedToday}</div>
                <div className="text-sm text-gray-600">Completadas hoy</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Flame className={`w-8 h-8 ${getStreakColor(stats.currentStreak)}`} />
                </div>
                <div className={`text-2xl font-bold ${getStreakColor(stats.currentStreak)}`}>
                  {stats.currentStreak}
                </div>
                <div className="text-sm text-gray-600">Días de racha</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Target className={`w-8 h-8 ${getCompletionRateColor(stats.completionRate)}`} />
                </div>
                <div className={`text-2xl font-bold ${getCompletionRateColor(stats.completionRate)}`}>
                  {stats.completionRate}%
                </div>
                <div className="text-sm text-gray-600">Tasa completación</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Clock className="w-8 h-8 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-blue-600">{stats.averageTaskDuration}min</div>
                <div className="text-sm text-gray-600">Duración promedio</div>
              </CardContent>
            </Card>
          </div>

          {/* Progreso semanal */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Progreso Esta Semana
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Tareas completadas</span>
                  <span className="text-sm text-gray-600">{stats.completedThisWeek} / {Math.max(stats.completedThisWeek + 2, 7)}</span>
                </div>
                <Progress 
                  value={(stats.completedThisWeek / Math.max(stats.completedThisWeek + 2, 7)) * 100} 
                  className="h-2" 
                />
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-lg font-bold text-blue-600">{stats.completedThisWeek}</div>
                    <div className="text-xs text-blue-700">Esta semana</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-lg font-bold text-green-600">{stats.highPriorityCompleted}</div>
                    <div className="text-xs text-green-700">Alta prioridad</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          {/* Logros desbloqueados */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-600" />
                Logros Desbloqueados ({unlockedAchievements.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {unlockedAchievements.map((achievement) => (
                  <div key={achievement.id} className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="text-2xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <div className="font-semibold text-green-800">{achievement.title}</div>
                      <div className="text-sm text-green-700">{achievement.description}</div>
                      {achievement.unlockedAt && (
                        <div className="text-xs text-green-600 mt-1">
                          Desbloqueado: {format(achievement.unlockedAt, 'dd MMM', { locale: es })}
                        </div>
                      )}
                    </div>
                    <Sparkles className="w-5 h-5 text-yellow-500" />
                  </div>
                ))}
              </div>

              {unlockedAchievements.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Trophy className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>¡Aún no has desbloqueado logros!</p>
                  <p className="text-sm">Completa tareas para ganar tus primeros logros</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Próximo logro */}
          {nextAchievement && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  Próximo Logro
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-3xl opacity-50">{nextAchievement.icon}</div>
                  <div className="flex-1">
                    <div className="font-semibold text-blue-800">{nextAchievement.title}</div>
                    <div className="text-sm text-blue-700 mb-2">{nextAchievement.description}</div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span>Progreso</span>
                        <span>{nextAchievement.progress} / {nextAchievement.maxProgress}</span>
                      </div>
                      <Progress 
                        value={(nextAchievement.progress / nextAchievement.maxProgress) * 100} 
                        className="h-2" 
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Todos los logros */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Todos los Logros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {achievements.map((achievement) => (
                  <div key={achievement.id} className={`flex items-center gap-3 p-3 border rounded-lg ${
                    achievement.isUnlocked 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className={`text-2xl ${achievement.isUnlocked ? '' : 'opacity-30'}`}>
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <div className={`font-medium ${
                        achievement.isUnlocked ? 'text-green-800' : 'text-gray-600'
                      }`}>
                        {achievement.title}
                      </div>
                      <div className={`text-sm ${
                        achievement.isUnlocked ? 'text-green-700' : 'text-gray-500'
                      }`}>
                        {achievement.description}
                      </div>
                      {!achievement.isUnlocked && (
                        <div className="mt-2 space-y-1">
                          <Progress 
                            value={(achievement.progress / achievement.maxProgress) * 100} 
                            className="h-1" 
                          />
                          <div className="text-xs text-gray-500">
                            {achievement.progress} / {achievement.maxProgress}
                          </div>
                        </div>
                      )}
                    </div>
                    {achievement.isUnlocked && (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-6">
          {/* Patrones de trabajo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Patrones de Tiempo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <div className="font-medium">Hora más productiva</div>
                    <div className="text-sm text-gray-600">Basado en tareas completadas</div>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.mostProductiveHour}:00
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <div className="font-medium">Duración promedio</div>
                    <div className="text-sm text-gray-600">Por tarea completada</div>
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {stats.averageTaskDuration}min
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div>
                    <div className="font-medium">Horario de trabajo</div>
                    <div className="text-sm text-gray-600">Configurado por ti</div>
                  </div>
                  <div className="text-lg font-bold text-purple-600">
                    {getWorkingHoursText()}
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div>
                    <div className="font-medium">Días laborales</div>
                    <div className="text-sm text-gray-600">Preferencias actuales</div>
                  </div>
                  <div className="text-sm font-bold text-orange-600">
                    {getWorkingDaysText()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recomendaciones personalizadas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Recomendaciones Personales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.mostProductiveHour < 10 && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Zap className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div>
                        <div className="font-medium text-yellow-800">Aprovecha las mañanas</div>
                        <div className="text-sm text-yellow-700">
                          Eres más productivo en la mañana. Programa tareas importantes antes de las 10 AM.
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {stats.currentStreak >= 3 && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Flame className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <div className="font-medium text-green-800">¡Mantén la racha!</div>
                        <div className="text-sm text-green-700">
                          Llevas {stats.currentStreak} días siendo consistente. ¡Sigue así!
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {stats.completionRate < 60 && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Target className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <div className="font-medium text-blue-800">Enfócate en menos tareas</div>
                        <div className="text-sm text-blue-700">
                          Tu tasa de completación es {stats.completionRate}%. Intenta crear menos tareas pero más específicas.
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de preferencias */}
      <ProductivityPreferencesModal 
        open={showPreferencesModal}
        onOpenChange={setShowPreferencesModal}
      />
    </div>
  );
};

export default ProductivityDashboard;