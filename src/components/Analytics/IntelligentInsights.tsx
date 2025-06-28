import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Lightbulb, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Target,
  Zap
} from 'lucide-react';
import { useAdvancedMetrics } from '@/hooks/analytics/useAdvancedMetrics';
import { useGeneralStats } from '@/hooks/analytics/useGeneralStats';

interface IntelligentInsightsProps {
  period: 'week' | 'month' | 'quarter' | 'year';
}

interface Insight {
  type: 'success' | 'warning' | 'info' | 'tip';
  title: string;
  description: string;
  action?: string;
  priority: number;
}

const IntelligentInsights = ({ period }: IntelligentInsightsProps) => {
  const { data: advancedMetrics } = useAdvancedMetrics(period);
  const { data: generalStats } = useGeneralStats();

  const generateInsights = (): Insight[] => {
    const insights: Insight[] = [];

    if (!advancedMetrics || !generalStats?.hasAnyData) {
      return [{
        type: 'info',
        title: 'Comenzando tu viaje de productividad',
        description: 'Continúa registrando trabajo para desbloquear insights personalizados.',
        action: 'Crea tu primer proyecto y comienza a trackear tiempo',
        priority: 1
      }];
    }

    // Insight de velocidad
    if (advancedMetrics.velocity.tasksPerWeek >= 5) {
      insights.push({
        type: 'success',
        title: '🚀 Excelente velocidad de trabajo',
        description: `Estás completando ${advancedMetrics.velocity.tasksPerWeek} tareas por semana. ¡Mantén este ritmo!`,
        priority: 1
      });
    } else if (advancedMetrics.velocity.tasksPerWeek < 1) {
      insights.push({
        type: 'warning',
        title: '⚠️ Velocidad de trabajo baja',
        description: 'Considera dividir tareas grandes en subtareas más manejables.',
        action: 'Revisa tu planificación semanal',
        priority: 2
      });
    }

    // Insight de calidad
    if (advancedMetrics.quality.onTimeCompletion >= 80) {
      insights.push({
        type: 'success',
        title: '✅ Excelente puntualidad',
        description: `${advancedMetrics.quality.onTimeCompletion}% de tus tareas se completan a tiempo.`,
        priority: 1
      });
    } else if (advancedMetrics.quality.onTimeCompletion < 50) {
      insights.push({
        type: 'warning',
        title: '⏰ Mejora la estimación de tiempo',
        description: 'Muchas tareas se retrasan. Considera ser más realista con los plazos.',
        action: 'Revisa tus estimaciones de tiempo',
        priority: 2
      });
    }

    // Insight de engagement
    if (advancedMetrics.engagement.longestStreak >= 7) {
      insights.push({
        type: 'success',
        title: '🔥 Gran consistencia',
        description: `Tu racha más larga es de ${advancedMetrics.engagement.longestStreak} días. ¡Excelente disciplina!`,
        priority: 1
      });
    } else if (advancedMetrics.engagement.workConsistency < 40) {
      insights.push({
        type: 'tip',
        title: '📅 Mejora la consistencia',
        description: 'Trabajar de manera más regular puede mejorar significativamente tu productividad.',
        action: 'Establece una rutina diaria de trabajo',
        priority: 2
      });
    }

    // Insight sobre tiempo promedio por tarea
    if (advancedMetrics.velocity.averageTaskTime > 0) {
      if (advancedMetrics.velocity.averageTaskTime > 120) { // Más de 2 horas
        insights.push({
          type: 'tip',
          title: '🎯 Divide tareas grandes',
          description: `Tiempo promedio por tarea: ${Math.round(advancedMetrics.velocity.averageTaskTime)} min. Considera dividir tareas complejas.`,
          action: 'Crea subtareas más específicas',
          priority: 3
        });
      } else if (advancedMetrics.velocity.averageTaskTime < 30) {
        insights.push({
          type: 'info',
          title: '⚡ Tareas bien dimensionadas',
          description: 'Tus tareas tienen un tamaño ideal para mantener el foco.',
          priority: 3
        });
      }
    }

    // Insight financiero
    if (advancedMetrics.financial.budgetEfficiency > 90) {
      insights.push({
        type: 'success',
        title: '💰 Excelente control presupuestario',
        description: `${advancedMetrics.financial.budgetEfficiency}% de eficiencia en el uso del presupuesto.`,
        priority: 2
      });
    } else if (advancedMetrics.financial.budgetEfficiency < 50 && advancedMetrics.financial.budgetEfficiency > 0) {
      insights.push({
        type: 'warning',
        title: '💸 Revisa el presupuesto',
        description: 'El uso del presupuesto está por encima de lo planificado.',
        action: 'Analiza los gastos por proyecto',
        priority: 2
      });
    }

    return insights.sort((a, b) => a.priority - b.priority);
  };

  const insights = generateInsights();

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'tip': return <Lightbulb className="h-4 w-4 text-blue-500" />;
      default: return <Zap className="h-4 w-4 text-purple-500" />;
    }
  };

  const getInsightVariant = (type: string) => {
    switch (type) {
      case 'warning': return 'destructive';
      default: return 'default'; // This covers success, tip, and info
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Insights Inteligentes
          </CardTitle>
          <Badge variant="outline">IA</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.map((insight, index) => (
          <Alert key={index} variant={getInsightVariant(insight.type)}>
            <div className="flex items-start gap-3">
              {getInsightIcon(insight.type)}
              <div className="flex-1">
                <h4 className="font-semibold text-sm mb-1">{insight.title}</h4>
                <AlertDescription className="text-sm">
                  {insight.description}
                </AlertDescription>
                {insight.action && (
                  <div className="mt-2">
                    <Badge variant="outline" className="text-xs">
                      💡 {insight.action}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </Alert>
        ))}

        {insights.length === 0 && (
          <div className="text-center py-4 text-muted-foreground">
            <Zap className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Los insights inteligentes aparecerán a medida que uses más la plataforma.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default IntelligentInsights;
