
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  TrendingUp, 
  Clock, 
  Target, 
  AlertCircle,
  CheckCircle2,
  Lightbulb
} from 'lucide-react';
import { Task } from '@/hooks/useTasks';
import { useTaskStateAndStepsEnhanced } from '@/hooks/useTaskStateAndStepsEnhanced';

interface TaskAISummaryProps {
  task: Task;
}

const TaskAISummary = ({ task }: TaskAISummaryProps) => {
  const { taskAnalysis, isLoading, error } = useTaskStateAndStepsEnhanced(task.id);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <Brain className="h-8 w-8 mx-auto mb-2 text-gray-400 animate-pulse" />
            <p className="text-gray-500">Analizando tarea con IA...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 text-red-400" />
            <p className="text-red-600">Error al cargar análisis IA</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const analysis = taskAnalysis || {
    currentState: 'Sin análisis disponible',
    completionPercentage: 0,
    nextSteps: [],
    recommendations: [],
    risks: [],
    estimatedTimeRemaining: 0,
    confidenceScore: 0
  };

  return (
    <div className="space-y-6">
      {/* AI Analysis Overview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            Análisis IA de la Tarea
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Current State */}
            <div>
              <h4 className="font-medium mb-2">Estado Actual</h4>
              <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                {analysis.currentState}
              </p>
            </div>

            {/* Progress */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Progreso Estimado</h4>
                <span className="text-sm text-gray-500">
                  {analysis.completionPercentage}%
                </span>
              </div>
              <Progress value={analysis.completionPercentage} className="h-3" />
            </div>

            {/* Confidence Score */}
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-500" />
                <span className="font-medium">Confianza del Análisis</span>
              </div>
              <Badge variant="outline" className="bg-white">
                {analysis.confidenceScore}% de confianza
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            Próximos Pasos Sugeridos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analysis.nextSteps && analysis.nextSteps.length > 0 ? (
            <div className="space-y-3">
              {analysis.nextSteps.map((step, index) => (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-sm font-medium flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-700">{step}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p>No hay pasos específicos sugeridos</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            Recomendaciones IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analysis.recommendations && analysis.recommendations.length > 0 ? (
            <div className="space-y-3">
              {analysis.recommendations.map((recommendation, index) => (
                <div key={index} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700">{recommendation}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <Lightbulb className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p>No hay recomendaciones específicas</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Risks */}
      {analysis.risks && analysis.risks.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Riesgos Identificados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analysis.risks.map((risk, index) => (
                <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700">{risk}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Time Estimation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-bold text-blue-600">
              {analysis.estimatedTimeRemaining || 0}h
            </div>
            <p className="text-sm text-gray-500">Tiempo Estimado Restante</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold text-green-600">
              {analysis.completionPercentage}%
            </div>
            <p className="text-sm text-gray-500">Completado</p>
          </CardContent>
        </Card>
      </div>

      {/* Analysis Disclaimer */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-2">
            <Brain className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Análisis basado en IA</p>
              <p>
                Este análisis se basa en patrones de datos históricos y algoritmos de 
                aprendizaje automático. Los resultados son estimaciones y pueden variar.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskAISummary;
