
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Download, FileText, BarChart3, Clock, File, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { GeneratedReport } from '@/hooks/useGeneratedReports';
interface ReportHistoryListProps {
  reportHistory: GeneratedReport[] | undefined;
  isLoading: boolean;
  onGeneratePDF: (reportId: string) => Promise<string | null>;
  onDownloadPDF: (reportId: string) => void;
  isPDFGenerating: boolean;
}

const ReportHistoryList = ({ reportHistory, isLoading, onGeneratePDF, onDownloadPDF, isPDFGenerating }: ReportHistoryListProps) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-muted rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (!reportHistory || reportHistory.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">
          No hay reportes generados aún
        </p>
        <p className="text-sm text-muted-foreground">
          Genera tu primer reporte usando los botones de arriba
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reportHistory.map((report) => (
        <div
          key={report.id}
          className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              {report.report_type === 'weekly' ? (
                <Calendar className="h-4 w-4 text-primary" />
              ) : (
                <BarChart3 className="h-4 w-4 text-primary" />
              )}
            </div>
            <div>
              <h4 className="font-medium">
                Reporte {report.report_type === 'weekly' ? 'Semanal' : 'Mensual'}
              </h4>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>
                  {format(new Date(report.period_start), 'dd MMM', { locale: es })} - {' '}
                  {format(new Date(report.period_end), 'dd MMM yyyy', { locale: es })}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {report.metrics.tasksCompleted} tareas
                </Badge>
                <Badge variant="outline">
                  {report.metrics.productivity.toFixed(1)}/5
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {Math.round(report.metrics.timeWorked / 60)}h trabajadas
              </p>
            </div>
            
            <div className="flex gap-2">
              {report.file_url ? (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onDownloadPDF(report.id)}
                  disabled={isPDFGenerating}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Descargar PDF
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onGeneratePDF(report.id)}
                  disabled={isPDFGenerating}
                >
                  {isPDFGenerating ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <File className="h-4 w-4 mr-2" />
                  )}
                  {isPDFGenerating ? 'Generando...' : 'Generar PDF'}
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReportHistoryList;
