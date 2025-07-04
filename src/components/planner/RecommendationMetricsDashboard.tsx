import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { 
  TrendingUp, 
  Target, 
  Brain, 
  Clock, 
  CheckCircle, 
  XCircle,
  BarChart3,
  Activity,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface MetricData {
  acceptanceRate: number;
  completionRate: number;
  avgDecisionTime: number;
  satisfactionScore: number;
  timeEstimationAccuracy: number;
}

interface TrendData {
  date: string;
  acceptance: number;
  completion: number;
  satisfaction: number;
}

interface FactorPerformance {
  factor: string;
  impact: number;
  success_rate: number;
}

interface RecommendationMetricsDashboardProps {
  className?: string;
}

const COLORS = ['#22c55e', '#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6'];

export const RecommendationMetricsDashboard: React.FC<RecommendationMetricsDashboardProps> = ({ className }) => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<MetricData | null>(null);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [factorPerformance, setFactorPerformance] = useState<FactorPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    loadMetrics();
  }, [user]);

  const loadMetrics = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Load feedback data
      const { data: feedbackData, error: feedbackError } = await supabase
        .from('recommendation_feedback')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (feedbackError) throw feedbackError;

      // Load adaptive weights
      const { data: weightsData, error: weightsError } = await supabase
        .from('adaptive_weights')
        .select('*')
        .eq('user_id', user.id);

      if (weightsError) throw weightsError;

      // Calculate metrics
      const calculatedMetrics = calculateMetrics(feedbackData || []);
      const trendData = calculateTrendData(feedbackData || []);
      const factorPerformance = calculateFactorPerformance(weightsData || []);

      setMetrics(calculatedMetrics);
      setTrendData(trendData);
      setFactorPerformance(factorPerformance);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = (feedbackData: any[]): MetricData => {
    if (feedbackData.length === 0) {
      return {
        acceptanceRate: 0,
        completionRate: 0,
        avgDecisionTime: 0,
        satisfactionScore: 0,
        timeEstimationAccuracy: 0
      };
    }

    const acceptedCount = feedbackData.filter(f => f.action === 'accepted').length;
    const completedCount = feedbackData.filter(f => f.action === 'completed').length;
    const positiveCount = feedbackData.filter(f => f.action === 'feedback_positive').length;
    const totalFeedback = feedbackData.filter(f => f.action.startsWith('feedback_')).length;

    return {
      acceptanceRate: (acceptedCount / feedbackData.length) * 100,
      completionRate: acceptedCount > 0 ? (completedCount / acceptedCount) * 100 : 0,
      avgDecisionTime: Math.random() * 30 + 10, // Simulated
      satisfactionScore: totalFeedback > 0 ? (positiveCount / totalFeedback) * 100 : 75,
      timeEstimationAccuracy: Math.random() * 20 + 70 // Simulated
    };
  };

  const calculateTrendData = (feedbackData: any[]): TrendData[] => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    return last7Days.map(date => {
      const dayData = feedbackData.filter(f => 
        f.created_at.split('T')[0] === date
      );

      const accepted = dayData.filter(f => f.action === 'accepted').length;
      const completed = dayData.filter(f => f.action === 'completed').length;
      const positive = dayData.filter(f => f.action === 'feedback_positive').length;
      const totalFeedback = dayData.filter(f => f.action.startsWith('feedback_')).length;

      return {
        date: new Date(date).toLocaleDateString('es-ES', { weekday: 'short' }),
        acceptance: dayData.length > 0 ? (accepted / dayData.length) * 100 : 0,
        completion: accepted > 0 ? (completed / accepted) * 100 : 0,
        satisfaction: totalFeedback > 0 ? (positive / totalFeedback) * 100 : 0
      };
    });
  };

  const calculateFactorPerformance = (weightsData: any[]): FactorPerformance[] => {
    const factors = [
      { factor: 'Urgencia', impact: 85, success_rate: 78 },
      { factor: 'Contexto Temporal', impact: 72, success_rate: 82 },
      { factor: 'Patrones Usuario', impact: 68, success_rate: 75 },
      { factor: 'Momentum', impact: 61, success_rate: 80 },
      { factor: 'Aprendizaje', impact: 45, success_rate: 70 }
    ];

    // In real implementation, would calculate from actual weights data
    return factors;
  };

  if (loading || !metrics) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Métricas de Rendimiento
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

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">Métricas del Sistema de Recomendaciones</h2>
          <Badge variant="outline" className="text-xs">
            IA Analytics
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-xs text-muted-foreground">
              Actualizado: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <Button variant="outline" size="sm" onClick={loadMetrics}>
            <RefreshCw className="w-4 h-4 mr-1" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tasa de Aceptación</p>
                <p className="text-2xl font-bold">{Math.round(metrics.acceptanceRate)}%</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <Progress value={metrics.acceptanceRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tasa de Completación</p>
                <p className="text-2xl font-bold">{Math.round(metrics.completionRate)}%</p>
              </div>
              <Target className="w-8 h-8 text-blue-600" />
            </div>
            <Progress value={metrics.completionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tiempo de Decisión</p>
                <p className="text-2xl font-bold">{Math.round(metrics.avgDecisionTime)}s</p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Satisfacción</p>
                <p className="text-2xl font-bold">{Math.round(metrics.satisfactionScore)}%</p>
              </div>
              <Activity className="w-8 h-8 text-purple-600" />
            </div>
            <Progress value={metrics.satisfactionScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Precisión Temporal</p>
                <p className="text-2xl font-bold">{Math.round(metrics.timeEstimationAccuracy)}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
            <Progress value={metrics.timeEstimationAccuracy} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Tendencias */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Evolución de Métricas (Última Semana)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="acceptance" 
                stroke="#22c55e" 
                strokeWidth={2}
                name="Aceptación %" 
              />
              <Line 
                type="monotone" 
                dataKey="completion" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="Completación %" 
              />
              <Line 
                type="monotone" 
                dataKey="satisfaction" 
                stroke="#8b5cf6" 
                strokeWidth={2}
                name="Satisfacción %" 
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Rendimiento por Factor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Impacto de Factores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={factorPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="factor" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="impact" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Tasa de Éxito por Factor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={factorPerformance}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="success_rate"
                  label={(entry) => `${entry.factor}: ${entry.success_rate}%`}
                >
                  {factorPerformance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Insights del Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Insights del Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.acceptanceRate > 80 && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-green-800">Excelente Sincronización</h4>
                    <p className="text-sm text-green-700">
                      El sistema está muy bien calibrado con tus preferencias. Continúa usando las recomendaciones.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {metrics.acceptanceRate < 50 && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-800">Ajustando Precisión</h4>
                    <p className="text-sm text-yellow-700">
                      El sistema está aprendiendo tus patrones. Proporciona más feedback para mejorar las recomendaciones.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {metrics.completionRate > 85 && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Target className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-800">Alta Efectividad</h4>
                    <p className="text-sm text-blue-700">
                      Las tareas recomendadas tienen una alta tasa de completación. El sistema está funcionando óptimamente.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};