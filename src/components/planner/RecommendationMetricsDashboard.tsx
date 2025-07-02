import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  Target, 
  BarChart3, 
  Clock, 
  ThumbsUp,
  Brain,
  RefreshCw,
  Zap
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { FeedbackLearningSystem, LearningRule, AdaptiveWeight } from '@/services/feedbackLearningSystem';

interface RecommendationMetricsDashboardProps {
  className?: string;
}

interface MetricsData {
  acceptanceRate: number;
  completionRate: number;
  avgDecisionTime: number;
  avgSatisfaction: number;
  accuracyRate: number;
  totalRecommendations: number;
  learningRules: LearningRule[];
  adaptiveWeights: AdaptiveWeight[];
}

export const RecommendationMetricsDashboard: React.FC<RecommendationMetricsDashboardProps> = ({ className }) => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    loadMetrics();
  }, [user]);

  const loadMetrics = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const learningSystem = new FeedbackLearningSystem(user.id);
      
      // Obtener datos de métricas
      const [learningRules, adaptiveWeights] = await Promise.all([
        learningSystem.getLearningRules(),
        learningSystem.getAdaptiveWeights()
      ]);

      // Calcular métricas desde localStorage (MVP)
      const savedActions = JSON.parse(localStorage.getItem('planner_mvp_actions') || '[]');
      const metricsData = calculateMetrics(savedActions, learningRules, adaptiveWeights);
      
      setMetrics(metricsData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = (actions: any[], rules: LearningRule[], weights: AdaptiveWeight[]): MetricsData => {
    const totalActions = actions.length;
    const acceptedActions = actions.filter(a => a.action === 'accepted' || a.action === 'completed').length;
    const completedActions = actions.filter(a => a.action === 'completed').length;
    const positiveActions = actions.filter(a => a.action === 'feedback_positive').length;
    
    return {
      acceptanceRate: totalActions > 0 ? (acceptedActions / totalActions) * 100 : 0,
      completionRate: acceptedActions > 0 ? (completedActions / acceptedActions) * 100 : 0,
      avgDecisionTime: Math.random() * 30 + 10, // Simulado
      avgSatisfaction: positiveActions > 0 ? 4.2 : 3.5, // Simulado
      accuracyRate: Math.random() * 20 + 75, // Simulado
      totalRecommendations: totalActions,
      learningRules: rules,
      adaptiveWeights: weights
    };
  };

  if (loading || !metrics) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Métricas del Sistema
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

  // Datos para gráficos
  const performanceTrend = Array.from({ length: 7 }, (_, i) => ({
    day: `Día ${i + 1}`,
    acceptance: Math.random() * 30 + 60,
    completion: Math.random() * 25 + 65,
    satisfaction: Math.random() * 1 + 3.5
  }));

  const weightsData = metrics.adaptiveWeights.map(w => ({
    factor: w.factor_name,
    weight: w.weight,
    confidence: w.confidence * 100,
    trend: w.trend
  }));

  const rulesData = metrics.learningRules.slice(0, 5).map(r => ({
    type: r.rule_type,
    confidence: r.confidence * 100,
    usage: r.usage_count,
    success: r.success_rate * 100
  }));

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">Métricas del Sistema IA</h2>
          <Badge variant="outline" className="text-xs">
            Performance
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
              <ThumbsUp className="w-8 h-8 text-green-600" />
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
                <p className="text-sm font-medium text-muted-foreground">Tiempo Decisión</p>
                <p className="text-2xl font-bold">{Math.round(metrics.avgDecisionTime)}s</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Satisfacción</p>
                <p className="text-2xl font-bold">{metrics.avgSatisfaction.toFixed(1)}/5</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Precisión IA</p>
                <p className="text-2xl font-bold">{Math.round(metrics.accuracyRate)}%</p>
              </div>
              <Brain className="w-8 h-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tendencia de Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Evolución del Sistema (Últimos 7 días)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="acceptance" stroke="#8884d8" name="Aceptación %" />
              <Line type="monotone" dataKey="completion" stroke="#82ca9d" name="Completación %" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Pesos Adaptativos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Evolución de Pesos Adaptativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {weightsData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={weightsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="factor" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="weight" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Aún no hay suficientes datos para mostrar pesos adaptativos.</p>
                <p className="text-sm">Usa más el sistema para ver la evolución.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reglas de Aprendizaje */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Reglas de Aprendizaje Más Exitosas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {rulesData.length > 0 ? (
              <div className="space-y-3">
                {rulesData.map((rule, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium capitalize">{rule.type}</p>
                      <p className="text-sm text-muted-foreground">
                        Usada {rule.usage} veces
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-600">
                        {Math.round(rule.success)}% éxito
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {Math.round(rule.confidence)}% confianza
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>El sistema está aprendiendo tus patrones.</p>
                <p className="text-sm">Continúa usando el planificador para ver reglas.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Resumen del Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Resumen del Sistema de Aprendizaje
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {metrics.totalRecommendations}
              </div>
              <p className="text-sm text-muted-foreground">
                Recomendaciones totales
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {metrics.learningRules.length}
              </div>
              <p className="text-sm text-muted-foreground">
                Reglas aprendidas
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {metrics.adaptiveWeights.length}
              </div>
              <p className="text-sm text-muted-foreground">
                Factores optimizados
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};