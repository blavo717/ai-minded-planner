import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { format, startOfWeek, endOfWeek, eachWeekOfInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import { PDFHeader, PDFSection, PDFMetricCard, PDFTable, PDFChart, PDFFooter } from './PDFComponents';
import { pdfTheme, pdfColors } from '@/utils/pdfTheme';
import { MonthlyReportData, BrandConfig, TaskData, ProjectData, DataValidationResult } from '@/types/reportTypes';

// Función de validación de datos
const validateReportData = (data: MonthlyReportData): DataValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validaciones críticas
  if (!data) {
    errors.push('Datos del reporte no proporcionados');
    return { isValid: false, errors, warnings };
  }

  if (!data.period_start || !data.period_end) {
    errors.push('Período del reporte no definido');
  }

  if (!data.metrics) {
    errors.push('Métricas del reporte no disponibles');
  }

  // Validaciones de advertencia
  if (!data.tasks || !Array.isArray(data.tasks) || data.tasks.length === 0) {
    warnings.push('No hay tareas disponibles para mostrar');
  }

  if (!data.projects || !Array.isArray(data.projects) || data.projects.length === 0) {
    warnings.push('No hay proyectos disponibles para mostrar');
  }

  console.log('🔍 Validación de datos del reporte:', {
    errores: errors.length,
    advertencias: warnings.length,
    tareas: data.tasks?.length || 0,
    proyectos: data.projects?.length || 0,
    métricas: !!data.metrics
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

interface MonthlyReportTemplateProps {
  data: MonthlyReportData;
  brandConfig?: BrandConfig;
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
  noDataText: {
    fontSize: 12,
    color: pdfColors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    padding: '20px 0',
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
  // FASE 5: Logging y validación robusto
  const validation = validateReportData(data);
  
  console.log('📊 MonthlyReportTemplate - Iniciando generación:', {
    datosRecibidos: !!data,
    validación: validation,
    período: data ? `${data.period_start} - ${data.period_end}` : 'No definido',
    timestamp: new Date().toISOString()
  });

  // Si hay errores críticos, no podemos generar el PDF
  if (!validation.isValid) {
    console.error('❌ Errores críticos en datos del reporte:', validation.errors);
    throw new Error(`No se puede generar el PDF: ${validation.errors.join(', ')}`);
  }

  // Log de advertencias pero continuar
  if (validation.warnings.length > 0) {
    console.warn('⚠️ Advertencias en datos del reporte:', validation.warnings);
  }

  const periodStart = new Date(data.period_start);
  const periodEnd = new Date(data.period_end);
  const generatedDate = format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es });
  
  // Calcular datos derivados
  const hoursWorked = Math.round(data.metrics.timeWorked / 60 * 10) / 10;
  const daysInPeriod = Math.ceil((periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24));
  const avgTasksPerDay = (data.metrics.tasksCompleted / daysInPeriod).toFixed(1);
  
  // Generar semanas del período
  const weeks = eachWeekOfInterval({ start: periodStart, end: periodEnd });
  
  // Logging para debugging
  console.log('📊 MonthlyReportTemplate - Datos recibidos:', {
    hasProjects: !!data.projects,
    projectsLength: data.projects?.length || 0,
    hasTasks: !!data.tasks,
    tasksLength: data.tasks?.length || 0,
    hasWeeklyBreakdown: !!data.weeklyBreakdown,
    weeklyBreakdownLength: data.weeklyBreakdown?.length || 0,
    hasTrends: !!data.trends,
    hasComparison: !!data.comparison
  });

  // Preparar datos para tabla de proyectos con validación robusta
  const safeProjects = Array.isArray(data.projects) ? data.projects : [];
  const projectTableData = safeProjects.slice(0, 8).map(project => [
    project?.name ? (project.name.length > 25 ? project.name.substring(0, 25) + '...' : project.name) : 'Sin nombre',
    project?.status === 'completed' ? 'Completado' : project?.status === 'in_progress' ? 'En Progreso' : 'Pendiente',
    `${project?.progress || 0}%`,
    `${project?.tasksCompleted || 0}/${project?.tasksTotal || 0}`,
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
        {Array.isArray(data.weeklyBreakdown) && data.weeklyBreakdown.length > 0 && (
          <PDFSection title="Rendimiento por Semana">
            <PDFTable
              headers={['Semana', 'Tareas', 'Horas', 'Productividad']}
              rows={data.weeklyBreakdown.map((week, index) => [
                `Semana ${week?.week || index + 1}`,
                (week?.tasksCompleted || 0).toString(),
                `${Math.round((week?.timeWorked || 0) / 60)}h`,
                `${(week?.productivity || 0).toFixed(1)}/5`
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

        {/* Tareas del período */}
        <PDFSection title="Tareas del Período">
          {(!data.tasks || !Array.isArray(data.tasks) || data.tasks.length === 0) ? (
            <Text style={monthlyStyles.noDataText}>
              No hay tareas disponibles para mostrar en este período
            </Text>
          ) : (
            <PDFTable 
              headers={['Tarea', 'Estado', 'Prioridad', 'Proyecto']}
              rows={data.tasks.slice(0, 20).map(task => [
                task.title || 'Sin título',
                task.status || 'Sin estado',
                task.priority || 'Sin prioridad',
                task.project_name || 'Sin proyecto'
              ])}
            />
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
        {Array.isArray(data.trends?.improvements) && data.trends.improvements.length > 0 && (
          <PDFSection title="Áreas de Mejora Identificadas">
            {data.trends.improvements.map((improvement, index) => (
              <View key={index} style={monthlyStyles.improvementItem}>
                <View style={monthlyStyles.checkmark} />
                <Text style={pdfTheme.body}>{improvement || 'Sin descripción'}</Text>
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