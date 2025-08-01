import React from 'react';
import { Document, Page, View, Text } from '@react-pdf/renderer';
import { BrandConfig } from '@/utils/pdfTheme';
import { MonthlyReportData } from '@/types/reportTypes';
import { 
  ProfessionalSection, 
  MetricDisplay, 
  ProfessionalTable, 
  ProgressIndicator,
  Badge,
  Divider,
  ElevatedCard,
  GridContainer,
  GridItem,
  HeroSection,
  InfoSidebar
} from './ProfessionalPDFComponents';
import { pdfColors, pdfFonts, pdfSpacing } from '@/utils/pdfTheme';
import { StyleSheet } from '@react-pdf/renderer';

interface EnhancedMonthlyReportTemplateProps {
  data: MonthlyReportData;
  brandConfig?: BrandConfig;
}

// Estilos específicos para el reporte mensual mejorado
const monthlyStyles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: pdfColors.background,
    padding: pdfSpacing.pagePadding,
    fontFamily: 'Helvetica',
  },
  
  coverPage: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    backgroundColor: pdfColors.primary,
    margin: -pdfSpacing.pagePadding,
    padding: pdfSpacing.xxxxxl,
  },
  
  coverTitle: {
    ...pdfFonts.display,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: pdfSpacing.xl,
  },
  
  coverSubtitle: {
    ...pdfFonts.h3,
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: pdfSpacing.xxxl,
  },
  
  coverDate: {
    ...pdfFonts.bodyLarge,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.8,
  },
  
  dashboardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: pdfSpacing.lg,
    marginBottom: pdfSpacing.sectionGap,
  },
  
  metricCard: {
    flex: 1,
    minWidth: '45%',
    maxWidth: '48%',
  },
  
  insightBox: {
    backgroundColor: pdfColors.accent,
    borderRadius: 12,
    padding: pdfSpacing.xl,
    marginBottom: pdfSpacing.componentGap,
  },
  
  insightTitle: {
    ...pdfFonts.h4,
    color: '#FFFFFF',
    marginBottom: pdfSpacing.md,
  },
  
  insightText: {
    ...pdfFonts.body,
    color: '#FFFFFF',
    opacity: 0.9,
    lineHeight: 1.5,
  },
  
  projectCard: {
    backgroundColor: pdfColors.surfaceSecondary,
    borderRadius: 8,
    padding: pdfSpacing.lg,
    marginBottom: pdfSpacing.md,
    borderLeftWidth: 4,
    borderLeftColor: pdfColors.primary,
  },
  
  projectName: {
    ...pdfFonts.h5,
    color: pdfColors.text,
    marginBottom: pdfSpacing.xs,
  },
  
  projectStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  projectStat: {
    ...pdfFonts.caption,
    color: pdfColors.textSecondary,
  },
  
  weeklyBreakdown: {
    flexDirection: 'row',
    gap: pdfSpacing.md,
    marginBottom: pdfSpacing.componentGap,
  },
  
  weekCard: {
    flex: 1,
    backgroundColor: pdfColors.surface,
    borderRadius: 8,
    padding: pdfSpacing.lg,
    borderWidth: 1,
    borderColor: pdfColors.border,
  },
  
  weekNumber: {
    ...pdfFonts.label,
    color: pdfColors.primary,
    marginBottom: pdfSpacing.xs,
    textTransform: 'uppercase' as const,
  },
  
  weekMetric: {
    ...pdfFonts.metricSmall,
    color: pdfColors.text,
    marginBottom: pdfSpacing.xs,
  },
  
  trendContainer: {
    backgroundColor: pdfColors.backgroundSecondary,
    borderRadius: 12,
    padding: pdfSpacing.xl,
    marginTop: pdfSpacing.componentGap,
  },
  
  trendTitle: {
    ...pdfFonts.h4,
    color: pdfColors.text,
    marginBottom: pdfSpacing.lg,
    textAlign: 'center',
  },
  
  trendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: pdfSpacing.lg,
  },
  
  trendItem: {
    flex: 1,
    minWidth: '30%',
    alignItems: 'center',
  },
  
  trendValue: {
    ...pdfFonts.metricSmall,
    color: pdfColors.primary,
    marginBottom: pdfSpacing.xs,
  },
  
  trendLabel: {
    ...pdfFonts.caption,
    color: pdfColors.textSecondary,
    textAlign: 'center',
  },
});

export const EnhancedMonthlyReportTemplate: React.FC<EnhancedMonthlyReportTemplateProps> = ({ 
  data, 
  brandConfig 
}) => {
  // Calcular métricas derivadas
  const hoursWorked = data.metrics?.timeWorked ? Math.round(data.metrics.timeWorked / 60) : 0;
  const avgTasksPerDay = data.metrics?.tasksCompleted ? Math.round(data.metrics.tasksCompleted / 30) : 0;
  const productivityScore = Math.round((data.metrics?.productivity || 0) * 100);
  
  // Preparar datos para la tabla de tareas
  const taskTableData = data.tasks?.slice(0, 15).map(task => [
    task.title || 'Sin título',
    task.priority || 'Media',
    task.status || 'Pendiente',
    task.completed_at ? new Date(task.completed_at).toLocaleDateString('es-ES') : 'Pendiente'
  ]) || [];

  // Preparar datos de proyectos
  const topProjects = data.projects?.slice(0, 6) || [];

  return (
    <Document>
      {/* Página de Portada */}
      <Page size="A4" style={monthlyStyles.page}>
        <View style={monthlyStyles.coverPage}>
          <Text style={monthlyStyles.coverTitle}>
            Reporte Mensual de Productividad
          </Text>
          <Text style={monthlyStyles.coverSubtitle}>
            Análisis Integral de Rendimiento
          </Text>
          <Text style={monthlyStyles.coverDate}>
            {new Date().toLocaleDateString('es-ES', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Text>
          
          <View style={{ marginTop: pdfSpacing.xxxl }}>
            <Text style={{ ...pdfFonts.body, color: '#FFFFFF', opacity: 0.8, textAlign: 'center' }}>
              Generado por {brandConfig?.companyName || 'Sistema de Productividad'}
            </Text>
          </View>
        </View>
      </Page>

      {/* Dashboard Ejecutivo */}
      <Page size="A4" style={monthlyStyles.page}>
        <HeroSection 
          title="Dashboard Ejecutivo" 
          subtitle="Métricas clave del período"
        />

        <GridContainer>
          <GridItem>
            <MetricDisplay
              value={data.metrics?.tasksCompleted || 0}
              label="Tareas Completadas"
              change={`+${Math.round(((data.metrics?.tasksCompleted || 0) / 30) * 100)}%`}
              changeType="positive"
            />
          </GridItem>
          
          <GridItem>
            <MetricDisplay
              value={`${hoursWorked}h`}
              label="Horas Trabajadas"
              change={`${Math.round(hoursWorked / 30 * 10) / 10}h/día`}
              changeType="neutral"
            />
          </GridItem>
          
          <GridItem>
            <MetricDisplay
              value={`${Math.round((data.metrics?.completionRate || 0) * 100)}%`}
              label="Tasa de Completación"
              change={productivityScore > 70 ? "Excelente" : "Mejorable"}
              changeType={productivityScore > 70 ? "positive" : "negative"}
            />
          </GridItem>
          
          <GridItem>
            <MetricDisplay
              value={avgTasksPerDay}
              label="Tareas por Día"
              change="Promedio"
              changeType="neutral"
            />
          </GridItem>
        </GridContainer>

        <Divider text="Análisis de Rendimiento" />

        {/* Insights Inteligentes */}
        <ElevatedCard>
          <Text style={{ ...pdfFonts.h4, color: pdfColors.primary, marginBottom: pdfSpacing.md }}>
            💡 Insights Inteligentes
          </Text>
          
          <View style={{ marginBottom: pdfSpacing.lg }}>
            <Text style={{ ...pdfFonts.body, color: pdfColors.text, marginBottom: pdfSpacing.md }}>
              🎯 <Text style={{ fontWeight: 'bold' }}>Tareas completadas:</Text> {data.metrics?.tasksCompleted || 0}
            </Text>
            
            <Text style={{ ...pdfFonts.body, color: pdfColors.text, marginBottom: pdfSpacing.md }}>
              ⚡ <Text style={{ fontWeight: 'bold' }}>Tiempo promedio:</Text> {Math.round((data.metrics?.averageTaskDuration || 0) / 60)} horas
            </Text>
            
            <Text style={{ ...pdfFonts.body, color: pdfColors.text }}>
              📈 <Text style={{ fontWeight: 'bold' }}>Tendencia:</Text> {
                productivityScore > 75 ? 'Productividad excelente' :
                productivityScore > 50 ? 'Productividad buena' : 'Oportunidad de mejora'
              }
            </Text>
          </View>
        </ElevatedCard>

        {/* Desglose Semanal */}
        <ProfessionalSection title="Desglose Semanal" subtitle="Análisis por semanas">
          <View style={monthlyStyles.weeklyBreakdown}>
            {data.weeklyBreakdown?.slice(0, 4).map((week, index) => (
              <View key={index} style={monthlyStyles.weekCard}>
                <Text style={monthlyStyles.weekNumber}>Semana {index + 1}</Text>
                <Text style={monthlyStyles.weekMetric}>{week.tasksCompleted || 0}</Text>
                <Text style={{ ...pdfFonts.caption, color: pdfColors.textSecondary }}>
                  tareas completadas
                </Text>
                
                <View style={{ marginTop: pdfSpacing.md }}>
                  <ProgressIndicator 
                    percentage={Math.min(100, ((week.tasksCompleted || 0) / 10) * 100)}
                    label="Progreso"
                  />
                </View>
              </View>
            )) || []}
          </View>
        </ProfessionalSection>
      </Page>

      {/* Análisis de Proyectos */}
      <Page size="A4" style={monthlyStyles.page}>
        <ProfessionalSection 
          title="Análisis de Proyectos" 
          subtitle="Estado y rendimiento por proyecto"
        >
          {topProjects.map((project, index) => (
            <View key={index} style={monthlyStyles.projectCard}>
              <View style={monthlyStyles.projectStats}>
                <View style={{ flex: 1 }}>
                  <Text style={monthlyStyles.projectName}>{project.name}</Text>
                  <Text style={monthlyStyles.projectStat}>
                    {project.tasksCompleted || 0} tareas • {Math.round(project.progress || 0)}% completado
                  </Text>
                </View>
                
                <View style={{ alignItems: 'flex-end' }}>
                  <Badge 
                    text={project.status || 'activo'} 
                    variant={
                      project.status === 'completado' ? 'success' : 
                      project.status === 'pausado' ? 'warning' : 'success'
                    } 
                  />
                </View>
              </View>
              
              <View style={{ marginTop: pdfSpacing.md }}>
                <ProgressIndicator 
                  percentage={Math.round(project.progress || 0)}
                  label="Progreso del proyecto"
                />
              </View>
            </View>
          ))}
        </ProfessionalSection>

        <Divider />

        {/* Tabla de Tareas Recientes */}
        <ProfessionalSection title="Tareas Recientes" subtitle="Últimas 15 tareas procesadas">
          <ProfessionalTable
            headers={['Tarea', 'Prioridad', 'Estado', 'Completada']}
            rows={taskTableData}
            alternateRows={true}
          />
        </ProfessionalSection>
      </Page>

      {/* Análisis de Tendencias */}
      <Page size="A4" style={monthlyStyles.page}>
        <ProfessionalSection 
          title="Análisis de Tendencias" 
          subtitle="Patrones y proyecciones"
        >
          <View style={monthlyStyles.trendContainer}>
            <Text style={monthlyStyles.trendTitle}>📊 Métricas de Tendencia</Text>
            
            <View style={monthlyStyles.trendGrid}>
              <View style={monthlyStyles.trendItem}>
                <Text style={monthlyStyles.trendValue}>
                  {Math.round((data.metrics?.completionRate || 0) * 100)}%
                </Text>
                <Text style={monthlyStyles.trendLabel}>Tasa de Éxito</Text>
              </View>
              
              <View style={monthlyStyles.trendItem}>
                <Text style={monthlyStyles.trendValue}>
                  {Math.round((data.metrics?.averageTaskDuration || 0) / 60)}h
                </Text>
                <Text style={monthlyStyles.trendLabel}>Duración Promedio</Text>
              </View>
              
              <View style={monthlyStyles.trendItem}>
                <Text style={monthlyStyles.trendValue}>
                  {data.projects?.length || 0}
                </Text>
                <Text style={monthlyStyles.trendLabel}>Proyectos Activos</Text>
              </View>
            </View>
          </View>

          {/* Recomendaciones */}
          <ElevatedCard>
            <Text style={{ ...pdfFonts.h4, color: pdfColors.primary, marginBottom: pdfSpacing.lg }}>
              🎯 Recomendaciones para el Próximo Mes
            </Text>
            
            <View style={{ gap: pdfSpacing.md }}>
              <Text style={{ ...pdfFonts.body, color: pdfColors.text }}>
                • <Text style={{ fontWeight: 'bold' }}>Optimizar tiempo:</Text> Enfócate en tareas de mayor impacto para mejorar la eficiencia
              </Text>
              
              <Text style={{ ...pdfFonts.body, color: pdfColors.text }}>
                • <Text style={{ fontWeight: 'bold' }}>Mantener momentum:</Text> {
                  productivityScore > 70 
                    ? 'Continúa con el excelente ritmo de trabajo actual'
                    : 'Establece metas más específicas para aumentar la productividad'
                }
              </Text>
              
              <Text style={{ ...pdfFonts.body, color: pdfColors.text }}>
                • <Text style={{ fontWeight: 'bold' }}>Gestión de proyectos:</Text> Considera priorizar proyectos con mayor ROI
              </Text>
            </View>
          </ElevatedCard>
        </ProfessionalSection>

        {/* Footer con información adicional */}
        <View style={{ 
          marginTop: pdfSpacing.xxxl,
          paddingTop: pdfSpacing.lg,
          borderTopWidth: 1,
          borderTopColor: pdfColors.border,
          alignItems: 'center'
        }}>
          <Text style={{ ...pdfFonts.caption, color: pdfColors.textMuted }}>
            Reporte generado automáticamente el {new Date().toLocaleDateString('es-ES')}
          </Text>
          <Text style={{ ...pdfFonts.caption, color: pdfColors.textMuted, marginTop: pdfSpacing.xs }}>
            {brandConfig?.companyName || 'Sistema de Productividad'} • Versión 2.0
          </Text>
        </View>
      </Page>
    </Document>
  );
};