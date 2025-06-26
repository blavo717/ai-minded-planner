
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Download, FileText, BarChart3, Clock, Target } from 'lucide-react';
import { useReports } from '@/hooks/useReports';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const ReportGenerator = () => {
  const [generatingReport, setGeneratingReport] = useState<string | null>(null);
  const { 
    generateWeeklyReport, 
    generateMonthlyReport, 
    getReportHistory,
    isGenerating 
  } = useReports();

  const { data: reportHistory, isLoading } = getReportHistory();

  const handleGenerateReport = async (type: 'weekly' | 'monthly') => {
    setGeneratingReport(type);
    try {
      if (type === 'weekly') {
        await generateWeeklyReport();
      } else {
        await generateMonthlyReport();
      }
    } finally {
      setGeneratingReport(null);
    }
  };

  const reportTypes = [
    {
      type: 'weekly' as const,
      title: 'Reporte Semanal',
      description: 'Análisis de los últimos 7 días',
      icon: Calendar,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-950'
    },
    {
      type: 'monthly' as const,
      title: 'Reporte Mensual',
      description: 'Análisis detallado del último mes',
      icon: BarChart3,
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-950'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Generadores de reportes */}
      <div className="grid gap-6 md:grid-cols-2">
        {reportTypes.map((reportType) => (
          <Card key={reportType.type}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${reportType.bgColor}`}>
                  <reportType.icon className={`h-5 w-5 ${reportType.color}`} />
                </div>
                <div>
                  <CardTitle className="text-lg">{reportType.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {reportType.description}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4" />
                    <span>Incluye:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 ml-6">
                    <li>Métricas de productividad</li>
                    <li>Análisis de tiempo</li>
                    <li>Rendimiento por proyecto</li>
                    <li>Patrones de trabajo</li>
                    <li>Recomendaciones personalizadas</li>
                  </ul>
                </div>
                
                <Button 
                  onClick={() => handleGenerateReport(reportType.type)}
                  disabled={isGenerating || generatingReport === reportType.type}
                  className="w-full"
                >
                  {generatingReport === reportType.type ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Generando...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Generar Reporte
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Historial de reportes */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Reportes</CardTitle>
          <p className="text-sm text-muted-foreground">
            Tus reportes generados recientemente
          </p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : !reportHistory || reportHistory.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No hay reportes generados aún
              </p>
              <p className="text-sm text-muted-foreground">
                Genera tu primer reporte usando los botones de arriba
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {reportHistory.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      {report.type === 'weekly' ? (
                        <Calendar className="h-4 w-4 text-primary" />
                      ) : (
                        <BarChart3 className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium">
                        Reporte {report.type === 'weekly' ? 'Semanal' : 'Mensual'}
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>
                          {format(new Date(report.period.start), 'dd MMM', { locale: es })} - {' '}
                          {format(new Date(report.period.end), 'dd MMM yyyy', { locale: es })}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {report.metrics.completedTasks} tareas
                        </Badge>
                        <Badge variant="outline">
                          {report.metrics.productivity.toFixed(1)}/5
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {Math.round(report.metrics.timeWorked / 60)}h trabajadas
                      </p>
                    </div>
                    
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Descargar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Configuración de reportes automáticos */}
      <Card>
        <CardHeader>
          <CardTitle>Reportes Automáticos</CardTitle>
          <p className="text-sm text-muted-foreground">
            Configura la generación automática de reportes
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border border-border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Reporte Semanal Automático</h4>
                <Badge variant="secondary">Próximamente</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Recibe un reporte semanal cada lunes por email con tu resumen de productividad
              </p>
            </div>
            
            <div className="p-4 border border-border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Reporte Mensual Automático</h4>
                <Badge variant="secondary">Próximamente</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Recibe un análisis mensual detallado el primer día de cada mes
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportGenerator;
