import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { PDFHeader, PDFSection, PDFMetricCard, PDFTable, PDFChart, PDFFooter } from './PDFComponents';
import { pdfTheme, pdfColors } from '@/utils/pdfTheme';

// Interfaces
interface WeeklyReportData {
  period_start: string;
  period_end: string;
  metrics: {
    tasksCompleted: number;
    tasksCreated: number;
    timeWorked: number; // en minutos
    productivity: number; // 1-5
    completionRate: number; // 0-100
    averageTaskDuration: number; // en minutos
  };
  tasks?: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
    completed_at?: string;
    actual_duration?: number;
  }>;
  insights?: {
    mostProductiveDay?: string;
    mostProductiveHour?: string;
    commonTags?: string[];
    recommendations?: string[];
  };
}

interface WeeklyReportTemplateProps {
  data: WeeklyReportData;
  brandConfig?: {
    companyName?: string;
    logo?: string;
  };
}

// Estilos específicos del template semanal
const weeklyStyles = StyleSheet.create({
  page: {
    ...pdfTheme.page,
    fontSize: 11,
  },
  coverPage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: pdfColors.gray50,
  },
  coverTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: pdfColors.primary,
    marginBottom: 20,
    textAlign: 'center',
  },
  coverSubtitle: {
    fontSize: 16,
    color: pdfColors.textSecondary,
    textAlign: 'center',
    marginBottom: 40,
  },
  executiveSummary: {
    backgroundColor: pdfColors.primary,
    color: '#FFFFFF',
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#FFFFFF',
  },
  summaryText: {
    fontSize: 11,
    lineHeight: 1.5,
    color: '#FFFFFF',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  metricBox: {
    flex: 1,
    minWidth: 120,
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: pdfColors.gray200,
    alignItems: 'center',
  },
  insightBox: {
    backgroundColor: pdfColors.gray50,
    padding: 15,
    borderRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: pdfColors.secondary,
    marginBottom: 10,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: pdfColors.primary,
    marginTop: 6,
    marginRight: 8,
  },
});

export const WeeklyReportTemplate: React.FC<WeeklyReportTemplateProps> = ({ 
  data, 
  brandConfig = {} 
}) => {
  const periodStart = new Date(data.period_start);
  const periodEnd = new Date(data.period_end);
  const generatedDate = format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es });
  
  // Calcular datos derivados
  const hoursWorked = Math.round(data.metrics.timeWorked / 60 * 10) / 10;
  const avgTaskDurationHours = Math.round(data.metrics.averageTaskDuration / 60 * 10) / 10;
  
  // Preparar datos para tabla de tareas
  const taskTableData = (data.tasks || []).slice(0, 10).map(task => [
    task.title.length > 30 ? task.title.substring(0, 30) + '...' : task.title,
    task.status === 'completed' ? 'Completada' : task.status,
    task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Media' : 'Baja',
    task.completed_at ? format(new Date(task.completed_at), 'dd/MM', { locale: es }) : '-',
    task.actual_duration ? `${Math.round(task.actual_duration / 60)}h` : '-'
  ]);

  return (
    <Document>
      {/* Página 1: Portada */}
      <Page size="A4" style={weeklyStyles.page}>
        <View style={weeklyStyles.coverPage}>
          <Text style={weeklyStyles.coverTitle}>Reporte Semanal</Text>
          <Text style={weeklyStyles.coverSubtitle}>
            {format(periodStart, 'dd MMM', { locale: es })} - {format(periodEnd, 'dd MMM yyyy', { locale: es })}
          </Text>
          {brandConfig.companyName && (
            <Text style={[pdfTheme.body, { textAlign: 'center', marginTop: 20 }]}>
              {brandConfig.companyName}
            </Text>
          )}
        </View>
        <PDFFooter generatedDate={generatedDate} pageNumber={1} />
      </Page>

      {/* Página 2: Resumen Ejecutivo */}
      <Page size="A4" style={weeklyStyles.page}>
        <PDFHeader 
          title="Resumen Ejecutivo" 
          subtitle={`Semana del ${format(periodStart, 'dd MMM', { locale: es })} al ${format(periodEnd, 'dd MMM yyyy', { locale: es })}`}
          logo={brandConfig.logo}
        />

        {/* Resumen destacado */}
        <View style={weeklyStyles.executiveSummary}>
          <Text style={weeklyStyles.summaryTitle}>Resumen de la Semana</Text>
          <Text style={weeklyStyles.summaryText}>
            Durante esta semana se completaron {data.metrics.tasksCompleted} tareas de un total de {data.metrics.tasksCreated} creadas, 
            alcanzando una tasa de completación del {data.metrics.completionRate.toFixed(1)}%. 
            Se trabajaron un total de {hoursWorked} horas con una productividad promedio de {data.metrics.productivity}/5.
          </Text>
        </View>

        {/* Métricas principales */}
        <View style={weeklyStyles.metricsGrid}>
          <View style={weeklyStyles.metricBox}>
            <Text style={[pdfTheme.metricValue, { fontSize: 24 }]}>{data.metrics.tasksCompleted}</Text>
            <Text style={pdfTheme.metricLabel}>Tareas Completadas</Text>
          </View>
          <View style={weeklyStyles.metricBox}>
            <Text style={[pdfTheme.metricValue, { fontSize: 24 }]}>{hoursWorked}h</Text>
            <Text style={pdfTheme.metricLabel}>Tiempo Trabajado</Text>
          </View>
          <View style={weeklyStyles.metricBox}>
            <Text style={[pdfTheme.metricValue, { fontSize: 24 }]}>{data.metrics.productivity}/5</Text>
            <Text style={pdfTheme.metricLabel}>Productividad</Text>
          </View>
          <View style={weeklyStyles.metricBox}>
            <Text style={[pdfTheme.metricValue, { fontSize: 24 }]}>{data.metrics.completionRate.toFixed(1)}%</Text>
            <Text style={pdfTheme.metricLabel}>Tasa Completación</Text>
          </View>
        </View>

        {/* Insights */}
        {data.insights && (
          <PDFSection title="Insights de la Semana">
            {data.insights.mostProductiveDay && (
              <View style={weeklyStyles.insightBox}>
                <Text style={[pdfTheme.h4, { marginBottom: 5 }]}>Día Más Productivo</Text>
                <Text style={pdfTheme.body}>{data.insights.mostProductiveDay}</Text>
              </View>
            )}
            {data.insights.mostProductiveHour && (
              <View style={weeklyStyles.insightBox}>
                <Text style={[pdfTheme.h4, { marginBottom: 5 }]}>Hora Más Productiva</Text>
                <Text style={pdfTheme.body}>{data.insights.mostProductiveHour}</Text>
              </View>
            )}
            {data.insights.commonTags && data.insights.commonTags.length > 0 && (
              <View style={weeklyStyles.insightBox}>
                <Text style={[pdfTheme.h4, { marginBottom: 5 }]}>Categorías Más Trabajadas</Text>
                <Text style={pdfTheme.body}>{data.insights.commonTags.join(', ')}</Text>
              </View>
            )}
          </PDFSection>
        )}

        <PDFFooter generatedDate={generatedDate} pageNumber={2} />
      </Page>

      {/* Página 3: Detalles de Tareas */}
      <Page size="A4" style={weeklyStyles.page}>
        <PDFHeader title="Detalle de Tareas" />

        <PDFSection title="Tareas Completadas">
          {taskTableData.length > 0 ? (
            <PDFTable
              headers={['Tarea', 'Estado', 'Prioridad', 'Completada', 'Duración']}
              rows={taskTableData}
            />
          ) : (
            <Text style={pdfTheme.bodySecondary}>No se completaron tareas en este período.</Text>
          )}
        </PDFSection>

        {/* Métricas de tiempo */}
        <PDFSection title="Análisis de Tiempo">
          <View style={weeklyStyles.metricsGrid}>
            <PDFMetricCard 
              label="Duración Promedio por Tarea" 
              value={avgTaskDurationHours} 
              unit="horas" 
            />
            <PDFMetricCard 
              label="Tareas por Día" 
              value={(data.metrics.tasksCompleted / 7).toFixed(1)} 
              unit="tareas/día" 
            />
          </View>
        </PDFSection>

        {/* Recomendaciones */}
        {data.insights?.recommendations && data.insights.recommendations.length > 0 && (
          <PDFSection title="Recomendaciones para la Próxima Semana">
            {data.insights.recommendations.map((rec, index) => (
              <View key={index} style={weeklyStyles.recommendationItem}>
                <View style={weeklyStyles.bullet} />
                <Text style={pdfTheme.body}>{rec}</Text>
              </View>
            ))}
          </PDFSection>
        )}

        <PDFFooter generatedDate={generatedDate} pageNumber={3} />
      </Page>
    </Document>
  );
};