import React from 'react';
import { Document, Page, View, Text } from '@react-pdf/renderer';
import { BrandConfig } from '@/utils/pdfTheme';
import { MonthlyReportData } from '@/types/reportTypes';
import { 
  ProfessionalSection, 
  MetricDisplay, 
  ProfessionalTable, 
  ElevatedCard,
  GridContainer,
  GridItem,
  HeroSection,
  Badge
} from './ProfessionalPDFComponents';
import {
  PDFBarChart,
  PDFPieChart,
  PDFTimeline,
  PDFProductivityHeatmap,
  PDFGauge,
  PDFTrendLine
} from './PDFVisualizationComponents';
import { IntelligentAnalyticsService } from '@/services/intelligentAnalyticsService';
import { pdfColors, pdfFonts, pdfSpacing } from '@/utils/pdfTheme';
import { StyleSheet } from '@react-pdf/renderer';

interface UltimateMonthlyReportTemplateProps {
  data: MonthlyReportData;
  brandConfig?: BrandConfig;
}

// Estilos para el reporte definitivo
const ultimateStyles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: pdfColors.background,
    padding: pdfSpacing.pagePadding,
    fontFamily: 'Helvetica',
  },
  
  executiveSummary: {
    backgroundColor: pdfColors.primaryGradient,
    borderRadius: 16,
    padding: pdfSpacing.xxxl,
    marginBottom: pdfSpacing.sectionGap,
    color: '#FFFFFF',
  },
  
  summaryTitle: {
    ...pdfFonts.display,
    color: '#FFFFFF',
    marginBottom: pdfSpacing.lg,
    textAlign: 'center',
  },
  
  summaryGrid: {
    flexDirection: 'row',
    gap: pdfSpacing.xl,
    marginTop: pdfSpacing.xl,
  },
  
  summaryCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: pdfSpacing.lg,
    alignItems: 'center',
  },
  
  summaryValue: {
    ...pdfFonts.metricLarge,
    color: '#FFFFFF',
    marginBottom: pdfSpacing.xs,
  },
  
  summaryLabel: {
    ...pdfFonts.caption,
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center',
    textTransform: 'uppercase' as const,
  },
  
  alertBox: {
    borderRadius: 8,
    padding: pdfSpacing.lg,
    marginBottom: pdfSpacing.md,
    borderLeftWidth: 4,
  },
  
  alertTitle: {
    ...pdfFonts.h5,
    marginBottom: pdfSpacing.xs,
  },
  
  alertMessage: {
    ...pdfFonts.body,
  },
  
  insightCard: {
    backgroundColor: pdfColors.backgroundSecondary,
    borderRadius: 12,
    padding: pdfSpacing.xl,
    marginBottom: pdfSpacing.lg,
    borderWidth: 1,
    borderColor: pdfColors.border,
  },
  
  insightIcon: {
    ...pdfFonts.h3,
    marginRight: pdfSpacing.md,
  },
  
  insightText: {
    ...pdfFonts.body,
    color: pdfColors.text,
    flex: 1,
  },
  
  predictionBox: {
    backgroundColor: pdfColors.accent,
    borderRadius: 12,
    padding: pdfSpacing.xl,
    marginTop: pdfSpacing.lg,
  },
  
  predictionTitle: {
    ...pdfFonts.h4,
    color: '#FFFFFF',
    marginBottom: pdfSpacing.md,
  },
  
  predictionText: {
    ...pdfFonts.body,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: pdfSpacing.md,
  },
  
  confidenceBar: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  
  confidenceFill: {
    backgroundColor: '#FFFFFF',
    height: '100%',
    borderRadius: 4,
  },
});

export const UltimateMonthlyReportTemplate: React.FC<UltimateMonthlyReportTemplateProps> = ({ 
  data, 
  brandConfig 
}) => {
  // Generar análisis inteligente
  const insights = IntelligentAnalyticsService.generateIntelligentInsights(data);
  const recommendations = IntelligentAnalyticsService.generateSmartRecommendations(data);
  const alerts = IntelligentAnalyticsService.generateIntelligentAlerts(data);
  const predictiveAnalysis = IntelligentAnalyticsService.generatePredictiveAnalysis(data);
  const workPatterns = IntelligentAnalyticsService.analyzeWorkPatterns(data);
  
  // Calcular métricas derivadas
  const hoursWorked = data.metrics?.timeWorked ? Math.round(data.metrics.timeWorked / 60) : 0;
  const avgTasksPerDay = data.metrics?.tasksCompleted ? Math.round(data.metrics.tasksCompleted / 30) : 0;
  const productivityScore = Math.round((data.metrics?.productivity || 0) * 100);
  
  // Preparar datos para visualizaciones
  const weeklyChartData = data.weeklyBreakdown?.map((week, index) => ({
    label: `S${index + 1}`,
    value: week.tasksCompleted || 0,
    color: index % 2 === 0 ? pdfColors.primary : pdfColors.primaryLight
  })) || [];
  
  const projectPieData = data.projects?.slice(0, 5).map((project, index) => ({
    label: project.name,
    value: project.tasksCompleted || 0,
    percentage: Math.round(((project.tasksCompleted || 0) / (data.metrics?.tasksCompleted || 1)) * 100),
    color: [pdfColors.primary, pdfColors.secondary, pdfColors.accent, pdfColors.warning, pdfColors.danger][index] || pdfColors.primary
  })) || [];
  
  // Datos para heatmap (simulado)
  const heatmapData = Array(4).fill(null).map(() => 
    Array(7).fill(null).map(() => Math.floor(Math.random() * 8))
  );
  
  // Timeline de eventos importantes
  const timelineEvents = [
    { title: 'Inicio del período', date: data.period_start, description: 'Comienzo del análisis mensual' },
    { title: 'Pico de productividad', date: 'Semana 2', description: workPatterns.peakPerformancePattern, status: 'completed' as const },
    { title: 'Fin del período', date: data.period_end, description: 'Finalización del análisis', status: 'completed' as const }
  ];
  
  // Datos de tendencia
  const trendData = data.weeklyBreakdown?.map((week, index) => ({
    label: `S${index + 1}`,
    value: week.tasksCompleted || 0
  })) || [];
  
  const trendDirection = predictiveAnalysis.trend === 'ascending' ? 'up' : 
                        predictiveAnalysis.trend === 'descending' ? 'down' : 'stable';

  return (
    <Document>
      {/* Página 1: Resumen Ejecutivo */}
      <Page size="A4" style={ultimateStyles.page}>
        <View style={ultimateStyles.executiveSummary}>
          <Text style={ultimateStyles.summaryTitle}>
            Resumen Ejecutivo - {new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
          </Text>
          
          <View style={ultimateStyles.summaryGrid}>
            <View style={ultimateStyles.summaryCard}>
              <Text style={ultimateStyles.summaryValue}>{data.metrics?.tasksCompleted || 0}</Text>
              <Text style={ultimateStyles.summaryLabel}>Tareas Completadas</Text>
            </View>
            
            <View style={ultimateStyles.summaryCard}>
              <Text style={ultimateStyles.summaryValue}>{productivityScore}%</Text>
              <Text style={ultimateStyles.summaryLabel}>Score Productividad</Text>
            </View>
            
            <View style={ultimateStyles.summaryCard}>
              <Text style={ultimateStyles.summaryValue}>{hoursWorked}h</Text>
              <Text style={ultimateStyles.summaryLabel}>Tiempo Invertido</Text>
            </View>
            
            <View style={ultimateStyles.summaryCard}>
              <Text style={ultimateStyles.summaryValue}>{workPatterns.efficiencyScore}</Text>
              <Text style={ultimateStyles.summaryLabel}>Índice Eficiencia</Text>
            </View>
          </View>
        </View>
        
        {/* Alertas Inteligentes */}
        <ProfessionalSection title="🚨 Alertas Inteligentes" subtitle="Notificaciones automáticas del sistema">
          {alerts.map((alert, index) => {
            const alertColors = {
              success: { bg: pdfColors.successLight + '20', border: pdfColors.success, text: pdfColors.success },
              warning: { bg: pdfColors.warningLight + '20', border: pdfColors.warning, text: pdfColors.warning },
              danger: { bg: pdfColors.dangerLight + '20', border: pdfColors.danger, text: pdfColors.danger },
              info: { bg: pdfColors.primaryLight + '20', border: pdfColors.primary, text: pdfColors.primary }
            };
            
            const colors = alertColors[alert.type];
            
            return (
              <View key={index} style={[
                ultimateStyles.alertBox,
                { backgroundColor: colors.bg, borderLeftColor: colors.border }
              ]}>
                <Text style={[ultimateStyles.alertTitle, { color: colors.text }]}>
                  {alert.title}
                </Text>
                <Text style={[ultimateStyles.alertMessage, { color: colors.text }]}>
                  {alert.message}
                </Text>
              </View>
            );
          })}
        </ProfessionalSection>
        
        {/* Insights Inteligentes */}
        <ProfessionalSection title="💡 Insights Inteligentes" subtitle="Análisis automático de patrones">
          {insights.map((insight, index) => (
            <View key={index} style={ultimateStyles.insightCard}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <Text style={ultimateStyles.insightIcon}>
                  {insight.includes('🎯') ? '🎯' : 
                   insight.includes('🚀') ? '🚀' : 
                   insight.includes('⚡') ? '⚡' : 
                   insight.includes('🎪') ? '🎪' : '📊'}
                </Text>
                <Text style={ultimateStyles.insightText}>{insight}</Text>
              </View>
            </View>
          ))}
        </ProfessionalSection>
        
        {/* Análisis Predictivo */}
        <View style={ultimateStyles.predictionBox}>
          <Text style={ultimateStyles.predictionTitle}>🔮 Análisis Predictivo</Text>
          <Text style={ultimateStyles.predictionText}>{predictiveAnalysis.prediction}</Text>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ ...pdfFonts.caption, color: '#FFFFFF' }}>
              Confianza: {predictiveAnalysis.confidence.toFixed(1)}%
            </Text>
            <View style={ultimateStyles.confidenceBar}>
              <View style={[
                ultimateStyles.confidenceFill,
                { width: `${predictiveAnalysis.confidence}%` }
              ]} />
            </View>
          </View>
        </View>
      </Page>

      {/* Página 2: Análisis Visual */}
      <Page size="A4" style={ultimateStyles.page}>
        <HeroSection title="📊 Análisis Visual de Datos" subtitle="Visualizaciones inteligentes del rendimiento" />
        
        <GridContainer>
          <GridItem>
            <PDFBarChart
              title="Rendimiento Semanal"
              subtitle="Tareas completadas por semana"
              data={weeklyChartData}
            />
          </GridItem>
          
          <GridItem>
            <PDFGauge
              title="Medidor de Productividad"
              value={productivityScore}
              maxValue={100}
              unit="%"
              label="Score General"
            />
          </GridItem>
        </GridContainer>
        
        <GridContainer>
          <GridItem>
            <PDFPieChart
              title="Distribución por Proyectos"
              subtitle="Top 5 proyectos más activos"
              data={projectPieData}
            />
          </GridItem>
          
          <GridItem>
            <PDFTrendLine
              title="Tendencia de Productividad"
              data={trendData}
              trend={trendDirection}
            />
          </GridItem>
        </GridContainer>
        
        <PDFProductivityHeatmap
          title="🔥 Mapa de Calor de Productividad"
          weekData={heatmapData}
        />
      </Page>

      {/* Página 3: Timeline y Recomendaciones */}
      <Page size="A4" style={ultimateStyles.page}>
        <PDFTimeline
          title="📅 Timeline del Período"
          events={timelineEvents}
        />
        
        <ProfessionalSection 
          title="🎯 Recomendaciones Inteligentes" 
          subtitle="Estrategias personalizadas para optimización"
        >
          {recommendations.map((rec, index) => (
            <ElevatedCard key={index}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <Text style={{ ...pdfFonts.h4, marginRight: pdfSpacing.md }}>
                  {index + 1}.
                </Text>
                <Text style={{ ...pdfFonts.body, color: pdfColors.text, flex: 1 }}>
                  {rec}
                </Text>
              </View>
            </ElevatedCard>
          ))}
        </ProfessionalSection>
        
        {/* Análisis de Patrones de Trabajo */}
        <ElevatedCard>
          <Text style={{ ...pdfFonts.h4, color: pdfColors.primary, marginBottom: pdfSpacing.lg }}>
            🧠 Análisis de Patrones de Trabajo
          </Text>
          
          <View style={{ gap: pdfSpacing.md }}>
            <Text style={{ ...pdfFonts.body, color: pdfColors.text }}>
              <Text style={{ fontWeight: 'bold' }}>Patrón de Rendimiento:</Text> {workPatterns.peakPerformancePattern}
            </Text>
            
            <Text style={{ ...pdfFonts.body, color: pdfColors.text }}>
              <Text style={{ fontWeight: 'bold' }}>Distribución de Carga:</Text> {workPatterns.workloadDistribution}
            </Text>
            
            <Text style={{ ...pdfFonts.body, color: pdfColors.text }}>
              <Text style={{ fontWeight: 'bold' }}>Score de Eficiencia:</Text> {workPatterns.efficiencyScore}/100
            </Text>
          </View>
          
          {workPatterns.recommendations.length > 0 && (
            <View style={{ marginTop: pdfSpacing.lg }}>
              <Text style={{ ...pdfFonts.h5, color: pdfColors.textSecondary, marginBottom: pdfSpacing.md }}>
                Recomendaciones Específicas:
              </Text>
              {workPatterns.recommendations.map((rec, index) => (
                <Text key={index} style={{ ...pdfFonts.bodySmall, color: pdfColors.textSecondary, marginBottom: pdfSpacing.xs }}>
                  • {rec}
                </Text>
              ))}
            </View>
          )}
        </ElevatedCard>
        
        {/* Footer */}
        <View style={{ 
          marginTop: pdfSpacing.xxxl,
          paddingTop: pdfSpacing.lg,
          borderTopWidth: 2,
          borderTopColor: pdfColors.primary,
          alignItems: 'center'
        }}>
          <Text style={{ ...pdfFonts.body, color: pdfColors.primary, fontWeight: 'bold' }}>
            {brandConfig?.companyName || 'Sistema de Productividad'} • Reporte IA v3.0
          </Text>
          <Text style={{ ...pdfFonts.caption, color: pdfColors.textMuted, marginTop: pdfSpacing.xs }}>
            Generado con Inteligencia Artificial el {new Date().toLocaleDateString('es-ES')}
          </Text>
        </View>
      </Page>
    </Document>
  );
};