import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Target,
  Calendar,
  Users,
  Zap,
  Activity,
  RefreshCw
} from 'lucide-react';
import { useProjectAnalytics } from '@/hooks/useProjectAnalytics';
import { useProjects } from '@/hooks/useProjects';

interface ProjectAnalyticsDashboardProps {
  onClose?: () => void;
}

const ProjectAnalyticsDashboard: React.FC<ProjectAnalyticsDashboardProps> = ({ onClose }) => {
  const { projects } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  
  const {
    projectAnalytics,
    isLoadingAnalytics,
    generateForecast,
    forecastData,
    isGeneratingForecast,
    getProjectById,
    getCriticalProjects,
    getHighRiskProjects
  } = useProjectAnalytics(selectedProjectId !== 'all' ? selectedProjectId : undefined);

  const selectedProject = selectedProjectId && selectedProjectId !== 'all' ? getProjectById(selectedProjectId) : null;
  const criticalProjects = getCriticalProjects();
  const highRiskProjects = getHighRiskProjects();

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-orange-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getRiskBadge = (riskLevel: string) => {
    const colors = {
      low: 'bg-green-100 text-green-700',
      medium: 'bg-yellow-100 text-yellow-700',
      high: 'bg-orange-100 text-orange-700',
      critical: 'bg-red-100 text-red-700'
    };
    return <Badge className={colors[riskLevel as keyof typeof colors] || 'bg-gray-100 text-gray-700'}>
      {riskLevel.toUpperCase()}
    </Badge>;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No establecida';
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const handleGenerateForecast = () => {
    if (selectedProjectId && selectedProjectId !== 'all') {
      generateForecast(selectedProjectId);
    }
  };

  if (isLoadingAnalytics) {
    return (
      <div className="w-full max-w-6xl mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-gray-400" />
            <p className="text-gray-600">Analizando proyectos...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            Análisis de Proyectos
          </h2>
          <p className="text-gray-600">
            Métricas en tiempo real, predicciones y gestión de riesgos
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Seleccionar proyecto específico" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los proyectos</SelectItem>
              {projects?.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {onClose && (
            <Button variant="outline" onClick={onClose} size="sm">
              Cerrar
            </Button>
          )}
        </div>
      </div>

      {/* Alertas de riesgo */}
      {criticalProjects.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Alerta crítica:</strong> {criticalProjects.length} proyecto(s) en estado crítico requieren atención inmediata.
          </AlertDescription>
        </Alert>
      )}

      {/* Métricas generales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{projectAnalytics.length}</div>
                <div className="text-sm text-gray-600">Proyectos activos</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{criticalProjects.length}</div>
                <div className="text-sm text-gray-600">Proyectos críticos</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Activity className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">{highRiskProjects.length}</div>
                <div className="text-sm text-gray-600">Alto riesgo</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(projectAnalytics.reduce((sum, p) => sum + p.completion_percentage, 0) / Math.max(projectAnalytics.length, 1))}%
                </div>
                <div className="text-sm text-gray-600">Progreso promedio</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Vista General</TabsTrigger>
          <TabsTrigger value="detailed">Análisis Detallado</TabsTrigger>
          <TabsTrigger value="forecast">Pronósticos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4">
            {projectAnalytics.map((project) => (
              <Card key={project.project_id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-lg">{project.project_name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        {getRiskBadge(project.risk_level)}
                        <Badge variant="outline">{project.status}</Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{project.health_score}</div>
                      <div className="text-sm text-gray-600">Health Score</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-xl font-semibold">{project.completion_percentage}%</div>
                      <div className="text-sm text-gray-600">Completado</div>
                      <Progress value={project.completion_percentage} className="h-2 mt-1" />
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-semibold">{project.total_tasks}</div>
                      <div className="text-sm text-gray-600">Total tareas</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-semibold text-red-600">{project.overdue_tasks}</div>
                      <div className="text-sm text-gray-600">Vencidas</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-semibold">{project.team_velocity}</div>
                      <div className="text-sm text-gray-600">Velocidad/semana</div>
                    </div>
                  </div>

                  {project.days_behind_schedule > 0 && (
                    <Alert className="mb-4">
                      <Clock className="h-4 w-4" />
                      <AlertDescription>
                        Proyecto con retraso de {project.days_behind_schedule} días. 
                        Fecha estimada: {formatDate(project.predicted_completion_date)}
                      </AlertDescription>
                    </Alert>
                  )}

                  {project.identified_risks.length > 0 && (
                    <div className="border-t pt-4">
                      <h5 className="font-medium mb-2 text-red-600">Riesgos Identificados:</h5>
                      <div className="space-y-2">
                        {project.identified_risks.slice(0, 2).map((risk) => (
                          <div key={risk.id} className="flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5" />
                            <div className="flex-1">
                              <div className="font-medium text-sm">{risk.title}</div>
                              <div className="text-xs text-gray-600">{risk.description}</div>
                            </div>
                            {getRiskBadge(risk.severity)}
                          </div>
                        ))}
                        {project.identified_risks.length > 2 && (
                          <div className="text-sm text-gray-500">
                            +{project.identified_risks.length - 2} riesgos más
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="detailed" className="space-y-4">
          {selectedProject ? (
            <Card>
              <CardHeader>
                <CardTitle>{selectedProject.project_name} - Análisis Detallado</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h5 className="font-medium mb-3">Progreso del Proyecto</h5>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Completadas</span>
                        <span className="font-medium text-green-600">{selectedProject.completed_tasks}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Pendientes</span>
                        <span className="font-medium">{selectedProject.pending_tasks}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Vencidas</span>
                        <span className="font-medium text-red-600">{selectedProject.overdue_tasks}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium mb-3">Tiempo y Recursos</h5>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Horas estimadas</span>
                        <span className="font-medium">{selectedProject.estimated_total_hours}h</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Horas trabajadas</span>
                        <span className="font-medium">{selectedProject.actual_hours_spent}h</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Horas restantes</span>
                        <span className="font-medium">{selectedProject.remaining_hours}h</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium mb-3">Fechas Clave</h5>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Inicio</span>
                        <span className="font-medium">{formatDate(selectedProject.start_date)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Fecha límite</span>
                        <span className="font-medium">{formatDate(selectedProject.original_deadline)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Estimación actual</span>
                        <span className="font-medium">{formatDate(selectedProject.predicted_completion_date)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedProject.identified_risks.length > 0 && (
                  <div>
                    <h5 className="font-medium mb-3">Todos los Riesgos</h5>
                    <div className="space-y-3">
                      {selectedProject.identified_risks.map((risk) => (
                        <div key={risk.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h6 className="font-medium">{risk.title}</h6>
                            {getRiskBadge(risk.severity)}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{risk.description}</p>
                          <div className="text-sm">
                            <strong>Impacto:</strong> {risk.impact}
                          </div>
                          <div className="text-sm">
                            <strong>Probabilidad:</strong> {risk.likelihood}%
                          </div>
                          <div className="text-sm mt-2 p-2 bg-blue-50 rounded">
                            <strong>Mitigación:</strong> {risk.mitigation_suggestion}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Target className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-semibold mb-2">Selecciona un proyecto</h3>
                <p className="text-gray-600">
                  Elige un proyecto específico para ver su análisis detallado
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="forecast" className="space-y-4">
          {selectedProject ? (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Pronóstico - {selectedProject.project_name}</CardTitle>
                    <Button 
                      onClick={handleGenerateForecast}
                      disabled={isGeneratingForecast}
                    >
                      <TrendingUp className={`w-4 h-4 mr-2 ${isGeneratingForecast ? 'animate-spin' : ''}`} />
                      {isGeneratingForecast ? 'Generando...' : 'Generar Pronóstico'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {forecastData ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                          <CardContent className="p-4 text-center">
                            <div className="text-3xl font-bold text-blue-600">{forecastData.completion_probability}%</div>
                            <div className="text-sm text-gray-600">Probabilidad de completación a tiempo</div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4 text-center">
                            <div className="text-lg font-semibold">{formatDate(forecastData.estimated_completion_date)}</div>
                            <div className="text-sm text-gray-600">Fecha estimada de completación</div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4 text-center">
                            <div className="text-lg font-semibold">{forecastData.recommendations.length}</div>
                            <div className="text-sm text-gray-600">Recomendaciones generadas</div>
                          </CardContent>
                        </Card>
                      </div>

                      <div>
                        <h5 className="font-medium mb-3">Intervalos de Confianza</h5>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="text-center p-3 bg-green-50 rounded-lg">
                            <div className="font-medium text-green-700">Optimista</div>
                            <div className="text-sm">{formatDate(forecastData.confidence_interval.optimistic)}</div>
                          </div>
                          <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <div className="font-medium text-blue-700">Realista</div>
                            <div className="text-sm">{formatDate(forecastData.confidence_interval.realistic)}</div>
                          </div>
                          <div className="text-center p-3 bg-red-50 rounded-lg">
                            <div className="font-medium text-red-700">Pesimista</div>
                            <div className="text-sm">{formatDate(forecastData.confidence_interval.pessimistic)}</div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h5 className="font-medium mb-3">Factores que Afectan el Timeline</h5>
                        <div className="space-y-2">
                          {forecastData.factors_affecting_timeline.map((factor, index) => (
                            <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                              <div className={`w-3 h-3 rounded-full ${
                                factor.impact === 'positive' ? 'bg-green-500' :
                                factor.impact === 'negative' ? 'bg-red-500' : 'bg-gray-500'
                              }`}></div>
                              <div className="flex-1">
                                <div className="font-medium">{factor.factor}</div>
                                <div className="text-sm text-gray-600">{factor.description}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h5 className="font-medium mb-3">Recomendaciones</h5>
                        <div className="space-y-2">
                          {forecastData.recommendations.map((recommendation, index) => (
                            <div key={index} className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                              <Zap className="w-4 h-4 text-blue-600 mt-0.5" />
                              <div className="text-sm">{recommendation}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-xl font-semibold mb-2">Generar Pronóstico</h3>
                      <p className="text-gray-600 mb-4">
                        Analiza las tendencias actuales y genera predicciones inteligentes sobre el proyecto
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-semibold mb-2">Selecciona un proyecto</h3>
                <p className="text-gray-600">
                  Elige un proyecto específico para generar pronósticos detallados
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectAnalyticsDashboard;