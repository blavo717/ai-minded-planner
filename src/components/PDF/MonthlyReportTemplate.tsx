import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { format, startOfWeek, endOfWeek, eachWeekOfInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import { PDFHeader, PDFSection, PDFMetricCard, PDFTable, PDFChart, PDFFooter } from './PDFComponents';
import { pdfTheme, pdfColors } from '@/utils/pdfTheme';

// Interfaces
interface MonthlyReportData {
  period_start: string;
  period_end: string;
  metrics: {
    tasksCompleted: number;
    tasksCreated: number;
    timeWorked: number; // en minutos
    productivity: number; // 1-5
    completionRate: number; // 0-100
    averageTaskDuration: number; // en minutos
    projectsActive: number;
    projectsCompleted: number;
  };
  weeklyBreakdown?: Array<{
    week: number;
    tasksCompleted: number;
    timeWorked: number;
    productivity: number;
  }>;
  projects?: Array<{
    id: string;
    name: string;
    status: string;
    progress: number;
    tasksTotal: number;
    tasksCompleted: number;
  }>;
  trends?: {
    productivityTrend: 'up' | 'down' | 'stable';
    timeEfficiency: number;
    bestWeek: number;
    improvements: string[];
  };
  comparison?: {
    previousMonth: {
      tasksCompleted: number;
      timeWorked: number;
      productivity: number;
    };
    changePercentage: {
      tasks: number;
      time: number;
      productivity: number;
    };
  };
}

interface MonthlyReportTemplateProps {
  data: MonthlyReportData;
  brandConfig?: {
    companyName?: string;
    logo?: string;
  };
}

// Estilos específicos del template mensual
const monthlyStyles = StyleSheet.create({
  page: {
    ...pdfTheme.page,
    fontSize: 10,
  },
  coverPage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: pdfColors.primary,
  },
  coverTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  coverSubtitle: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 40,
    opacity: 0.9,
  },
  dashboardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  bigMetric: {
    flex: 1,
    minWidth: 140,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: pdfColors.gray200,
    alignItems: 'center',
    shadowColor: pdfColors.gray300,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bigMetricValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: pdfColors.primary,
    marginBottom: 5,
  },
  bigMetricLabel: {
    fontSize: 10,
    color: pdfColors.textSecondary,
    textAlign: 'center',
  },
  weeklyChart: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: pdfColors.gray200,
    padding: 15,
    marginBottom: 20,
  },
  trendIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  trendUp: {
    color: pdfColors.secondary,
  },
  trendDown: {
    color: pdfColors.danger,
  },
  trendStable: {
    color: pdfColors.textSecondary,
  },
  comparisonBox: {
    backgroundColor: pdfColors.gray50,
    borderRadius: 6,
    padding: 12,
    marginBottom: 10,
  },
  comparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  improvementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    backgroundColor: pdfColors.secondary + '10',
    padding: 10,
    borderRadius: 4,
  },
  checkmark: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: pdfColors.secondary,
    marginTop: 2,
    marginRight: 8,
  },
});

export const MonthlyReportTemplate: React.FC<MonthlyReportTemplateProps> = ({ 
  data, 
  brandConfig = {} 
}) => {
  const periodStart = new Date(data.period_start);
  const periodEnd = new Date(data.period_end);
  const generatedDate = format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es });
  
  // Calcular datos derivados
  const hoursWorked = Math.round(data.metrics.timeWorked / 60 * 10) / 10;
  const daysInPeriod = Math.ceil((periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24));
  const avgTasksPerDay = (data.metrics.tasksCompleted / daysInPeriod).toFixed(1);
  
  // Generar semanas del período
  const weeks = eachWeekOfInterval({ start: periodStart, end: periodEnd });
  
  // Preparar datos para tabla de proyectos
  const projectTableData = (data.projects || []).slice(0, 8).map(project => [
    project.name.length > 25 ? project.name.substring(0, 25) + '...' : project.name,
    project.status === 'completed' ? 'Completado' : project.status === 'in_progress' ? 'En Progreso' : 'Pendiente',
    `${project.progress}%`,
    `${project.tasksCompleted}/${project.tasksTotal}`,
  ]);

  return (
    <Document>
      {/* Página 1: Portada Ejecutiva */}
      <Page size="A4" style={monthlyStyles.page}>
        <View style={monthlyStyles.coverPage}>
          <Text style={monthlyStyles.coverTitle}>Reporte Mensual</Text>
          <Text style={monthlyStyles.coverSubtitle}>
            {format(periodStart, 'MMMM yyyy', { locale: es })}
          </Text>
          {brandConfig.companyName && (
            <Text style={[pdfTheme.body, { color: '#FFFFFF', textAlign: 'center', marginTop: 30 }]}>
              {brandConfig.companyName}
            </Text>
          )}
          <Text style={[pdfTheme.caption, { color: '#FFFFFF', textAlign: 'center', marginTop: 20, opacity: 0.8 }]}>
            Reporte generado el {generatedDate}
          </Text>
        </View>
      </Page>

      {/* Página 2: Dashboard de Métricas */}
      <Page size="A4" style={monthlyStyles.page}>
        <PDFHeader 
          title="Dashboard Ejecutivo" 
          subtitle={`${format(periodStart, 'dd MMM', { locale: es })} - ${format(periodEnd, 'dd MMM yyyy', { locale: es })}`}
          logo={brandConfig.logo}
        />

        {/* Métricas principales */}
        <View style={monthlyStyles.dashboardGrid}>
          <View style={monthlyStyles.bigMetric}>
            <Text style={monthlyStyles.bigMetricValue}>{data.metrics.tasksCompleted}</Text>
            <Text style={monthlyStyles.bigMetricLabel}>Tareas Completadas</Text>
          </View>
          <View style={monthlyStyles.bigMetric}>
            <Text style={monthlyStyles.bigMetricValue}>{hoursWorked}</Text>
            <Text style={monthlyStyles.bigMetricLabel}>Horas Trabajadas</Text>
          </View>
          <View style={monthlyStyles.bigMetric}>
            <Text style={monthlyStyles.bigMetricValue}>{data.metrics.productivity.toFixed(1)}</Text>
            <Text style={monthlyStyles.bigMetricLabel}>Productividad (/5)</Text>
          </View>
          <View style={monthlyStyles.bigMetric}>
            <Text style={monthlyStyles.bigMetricValue}>{data.metrics.completionRate.toFixed(1)}%</Text>
            <Text style={monthlyStyles.bigMetricLabel}>Tasa Completación</Text>
          </View>
          <View style={monthlyStyles.bigMetric}>
            <Text style={monthlyStyles.bigMetricValue}>{data.metrics.projectsCompleted}</Text>
            <Text style={monthlyStyles.bigMetricLabel}>Proyectos Completados</Text>
          </View>
          <View style={monthlyStyles.bigMetric}>
            <Text style={monthlyStyles.bigMetricValue}>{avgTasksPerDay}</Text>
            <Text style={monthlyStyles.bigMetricLabel}>Tareas/Día Promedio</Text>
          </View>
        </View>

        {/* Comparación con mes anterior */}
        {data.comparison && (
          <PDFSection title="Comparación con Mes Anterior">
            <View style={monthlyStyles.comparisonBox}>
              <View style={monthlyStyles.comparisonRow}>
                <Text style={pdfTheme.body}>Tareas Completadas:</Text>
                <Text style={[pdfTheme.body, data.comparison.changePercentage.tasks >= 0 ? monthlyStyles.trendUp : monthlyStyles.trendDown]}>
                  {data.comparison.changePercentage.tasks >= 0 ? '+' : ''}{data.comparison.changePercentage.tasks.toFixed(1)}%
                </Text>
              </View>
              <View style={monthlyStyles.comparisonRow}>
                <Text style={pdfTheme.body}>Tiempo Trabajado:</Text>
                <Text style={[pdfTheme.body, data.comparison.changePercentage.time >= 0 ? monthlyStyles.trendUp : monthlyStyles.trendDown]}>
                  {data.comparison.changePercentage.time >= 0 ? '+' : ''}{data.comparison.changePercentage.time.toFixed(1)}%
                </Text>
              </View>
              <View style={monthlyStyles.comparisonRow}>
                <Text style={pdfTheme.body}>Productividad:</Text>
                <Text style={[pdfTheme.body, data.comparison.changePercentage.productivity >= 0 ? monthlyStyles.trendUp : monthlyStyles.trendDown]}>
                  {data.comparison.changePercentage.productivity >= 0 ? '+' : ''}{data.comparison.changePercentage.productivity.toFixed(1)}%
                </Text>
              </View>
            </View>
          </PDFSection>
        )}

        <PDFFooter generatedDate={generatedDate} pageNumber={2} />
      </Page>

      {/* Página 3: Análisis por Semanas */}
      <Page size="A4" style={monthlyStyles.page}>
        <PDFHeader title="Análisis Semanal" />

        {/* Desglose semanal */}
        {data.weeklyBreakdown && data.weeklyBreakdown.length > 0 && (
          <PDFSection title="Rendimiento por Semana">
            <PDFTable
              headers={['Semana', 'Tareas', 'Horas', 'Productividad']}
              rows={data.weeklyBreakdown.map((week, index) => [
                `Semana ${week.week}`,
                week.tasksCompleted.toString(),
                `${Math.round(week.timeWorked / 60)}h`,
                `${week.productivity.toFixed(1)}/5`
              ])}
            />
          </PDFSection>
        )}

        {/* Tendencias */}
        {data.trends && (
          <PDFSection title="Tendencias y Patrones">
            <View style={monthlyStyles.trendIndicator}>
              <Text style={pdfTheme.body}>Tendencia de Productividad: </Text>
              <Text style={[
                pdfTheme.body,
                data.trends.productivityTrend === 'up' ? monthlyStyles.trendUp :
                data.trends.productivityTrend === 'down' ? monthlyStyles.trendDown :
                monthlyStyles.trendStable
              ]}>
                {data.trends.productivityTrend === 'up' ? '↗ Mejorando' :
                 data.trends.productivityTrend === 'down' ? '↘ Decreciendo' :
                 '→ Estable'}
              </Text>
            </View>
            
            {data.trends.bestWeek && (
              <Text style={[pdfTheme.body, { marginTop: 10 }]}>
                Mejor semana: Semana {data.trends.bestWeek}
              </Text>
            )}
            
            {data.trends.timeEfficiency && (
              <Text style={[pdfTheme.body, { marginTop: 5 }]}>
                Eficiencia temporal: {(data.trends.timeEfficiency * 100).toFixed(1)}%
              </Text>
            )}
          </PDFSection>
        )}

        <PDFFooter generatedDate={generatedDate} pageNumber={3} />
      </Page>

      {/* Página 4: Proyectos y Progreso */}
      <Page size="A4" style={monthlyStyles.page}>
        <PDFHeader title="Proyectos y Progreso" />

        {/* Estado de proyectos */}
        <PDFSection title="Estado de Proyectos">
          {projectTableData.length > 0 ? (
            <PDFTable
              headers={['Proyecto', 'Estado', 'Progreso', 'Tareas']}
              rows={projectTableData}
            />
          ) : (
            <Text style={pdfTheme.bodySecondary}>No hay proyectos registrados en este período.</Text>
          )}
        </PDFSection>

        {/* Métricas de proyectos */}
        <View style={[monthlyStyles.dashboardGrid, { marginTop: 20 }]}>
          <PDFMetricCard 
            label="Proyectos Activos" 
            value={data.metrics.projectsActive} 
          />
          <PDFMetricCard 
            label="Proyectos Completados" 
            value={data.metrics.projectsCompleted} 
          />
        </View>

        <PDFFooter generatedDate={generatedDate} pageNumber={4} />
      </Page>

      {/* Página 5: Plan de Mejora */}
      <Page size="A4" style={monthlyStyles.page}>
        <PDFHeader title="Plan de Mejora" />

        {/* Mejoras identificadas */}
        {data.trends?.improvements && data.trends.improvements.length > 0 && (
          <PDFSection title="Áreas de Mejora Identificadas">
            {data.trends.improvements.map((improvement, index) => (
              <View key={index} style={monthlyStyles.improvementItem}>
                <View style={monthlyStyles.checkmark} />
                <Text style={pdfTheme.body}>{improvement}</Text>
              </View>
            ))}
          </PDFSection>
        )}

        {/* Recomendaciones estratégicas */}
        <PDFSection title="Recomendaciones para el Próximo Mes">
          <Text style={pdfTheme.body}>
            Basado en el análisis de este mes, se sugiere enfocarse en:
          </Text>
          <Text style={[pdfTheme.body, { marginTop: 10, marginLeft: 15 }]}>
            • Mantener la consistencia en las tareas diarias
          </Text>
          <Text style={[pdfTheme.body, { marginLeft: 15 }]}>
            • Optimizar los horarios más productivos identificados
          </Text>
          <Text style={[pdfTheme.body, { marginLeft: 15 }]}>
            • Revisar proyectos con menor progreso
          </Text>
          {data.metrics.completionRate < 80 && (
            <Text style={[pdfTheme.body, { marginLeft: 15 }]}>
              • Mejorar la tasa de completación de tareas
            </Text>
          )}
        </PDFSection>

        <PDFFooter generatedDate={generatedDate} pageNumber={5} />
      </Page>
    </Document>
  );
};