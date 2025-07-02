import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { 
  Brain, 
  Clock, 
  Target, 
  TrendingUp, 
  BarChart3, 
  Lightbulb,
  Zap,
  Calendar,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { UserBehaviorAnalyzer, UserProductivityProfile, BehaviorInsight } from '@/services/userBehaviorAnalyzer';

interface UserAnalyticsDashboardProps {
  className?: string;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00'];

export const UserAnalyticsDashboard: React.FC<UserAnalyticsDashboardProps> = ({ className }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProductivityProfile | null>(null);
  const [insights, setInsights] = useState<BehaviorInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    loadUserAnalytics();
  }, [user]);

  const loadUserAnalytics = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const analyzer = new UserBehaviorAnalyzer(user.id);
      const analysis = await analyzer.analyzeUserBehavior();
      
      setProfile(analysis.profile);
      setInsights(analysis.insights);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading user analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !profile) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Análisis de Productividad
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Preparar datos para gráficos
  const hourlyData = profile.optimalHours.map(hour => ({
    hour: `${hour}:00`,
    productivity: Math.random() * 100 + 50 // Simulated data
  }));

  const dailyData = profile.optimalDays.map((day, index) => ({
    day: day.slice(0, 3),
    tasks: Math.floor(Math.random() * 10) + 5,
    fill: COLORS[index % COLORS.length]
  }));

  const completionTrend = Array.from({ length: 7 }, (_, i) => ({
    day: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES', { weekday: 'short' }),
    completion: Math.random() * 100
  }));

  const getInsightIcon = (type: BehaviorInsight['type']) => {
    switch (type) {
      case 'strength': return '💪';
      case 'weakness': return '⚠️';
      case 'opportunity': return '🚀';
      case 'trend': return '📈';
      default: return '💡';
    }
  };

  const getInsightColor = (type: BehaviorInsight['type']) => {
    switch (type) {
      case 'strength': return 'bg-green-100 text-green-800 border-green-200';
      case 'weakness': return 'bg-red-100 text-red-800 border-red-200';
      case 'opportunity': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'trend': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">Dashboard de Productividad</h2>
          <Badge variant="outline" className="text-xs">
            Análisis IA
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-xs text-muted-foreground">
              Actualizado: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <Button variant="outline" size="sm" onClick={loadUserAnalytics}>
            <RefreshCw className="w-4 h-4 mr-1" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tasa de Completación</p>
                <p className="text-2xl font-bold">{Math.round(profile.completionRate)}%</p>
              </div>
              <Target className="w-8 h-8 text-green-600" />
            </div>
            <Progress value={profile.completionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Duración Promedio</p>
                <p className="text-2xl font-bold">{Math.round(profile.avgTaskDuration)}min</p>
              </div>
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Horas Óptimas</p>
                <p className="text-2xl font-bold">{profile.optimalHours.length}</p>
              </div>
              <Zap className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Días Productivos</p>
                <p className="text-2xl font-bold">{profile.optimalDays.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Productividad por Hora */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Horarios Más Productivos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="productivity" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribución por Días */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Días Más Productivos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={dailyData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="tasks"
                  label={(entry) => entry.day}
                >
                  {dailyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tendencia de Completación */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Tendencia de Completación (Última Semana)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={completionTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="completion" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Insights Accionables */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Insights Accionables
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No hay suficientes datos para generar insights. Completa más tareas para obtener análisis personalizados.
              </p>
            ) : (
              insights.map((insight, index) => (
                <div key={index} className={`border rounded-lg p-4 ${getInsightColor(insight.type)}`}>
                  <div className="flex items-start gap-3">
                    <span className="text-lg">{getInsightIcon(insight.type)}</span>
                    <div className="flex-1">
                      <h4 className="font-semibold">{insight.title}</h4>
                      <p className="text-sm mt-1">{insight.description}</p>
                      <Separator className="my-2" />
                      <p className="text-sm font-medium">💡 Sugerencia: {insight.actionableSuggestion}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          Confianza: {insight.confidence}%
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {insight.dataPoints} datos
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Patrones Productivos */}
      {profile.productivePatterns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Patrones Identificados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {profile.productivePatterns.map((pattern, index) => (
                <div key={index} className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                  <span className="text-green-600">✓</span>
                  <span className="text-sm">{pattern}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};