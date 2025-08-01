import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { pdfColors, pdfFonts, pdfSpacing } from '@/utils/pdfTheme';

// Estilos para visualizaciones
const chartStyles = StyleSheet.create({
  chartContainer: {
    backgroundColor: pdfColors.surface,
    borderRadius: 12,
    padding: pdfSpacing.xl,
    marginBottom: pdfSpacing.componentGap,
    borderWidth: 1,
    borderColor: pdfColors.border,
  },
  
  chartTitle: {
    ...pdfFonts.h4,
    color: pdfColors.text,
    marginBottom: pdfSpacing.lg,
    textAlign: 'center',
  },
  
  chartSubtitle: {
    ...pdfFonts.caption,
    color: pdfColors.textSecondary,
    textAlign: 'center',
    marginBottom: pdfSpacing.xl,
  },
  
  // Gráfico de barras vertical
  barChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 120,
    marginBottom: pdfSpacing.lg,
    paddingHorizontal: pdfSpacing.md,
  },
  
  barColumn: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: pdfSpacing.xs,
  },
  
  bar: {
    backgroundColor: pdfColors.primary,
    borderRadius: 4,
    minHeight: 8,
    marginBottom: pdfSpacing.xs,
  },
  
  barValue: {
    ...pdfFonts.caption,
    color: pdfColors.text,
    fontWeight: 'bold',
    marginBottom: pdfSpacing.xs,
  },
  
  barLabel: {
    ...pdfFonts.caption,
    color: pdfColors.textSecondary,
    textAlign: 'center',
    transform: 'rotate(-45deg)',
  },
  
  // Gráfico circular (simulado con elementos)
  pieChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: pdfSpacing.lg,
  },
  
  pieVisual: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  
  pieLegend: {
    flex: 1,
    marginLeft: pdfSpacing.xl,
  },
  
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: pdfSpacing.md,
  },
  
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: pdfSpacing.md,
  },
  
  legendText: {
    ...pdfFonts.body,
    color: pdfColors.text,
    flex: 1,
  },
  
  legendValue: {
    ...pdfFonts.body,
    color: pdfColors.textSecondary,
    fontWeight: 'bold',
  },
  
  // Gráfico de líneas (simulado)
  lineChart: {
    height: 100,
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderColor: pdfColors.border,
    marginBottom: pdfSpacing.lg,
    padding: pdfSpacing.md,
    position: 'relative',
  },
  
  linePoint: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: pdfColors.primary,
  },
  
  lineLabel: {
    ...pdfFonts.caption,
    color: pdfColors.textSecondary,
    textAlign: 'center',
    marginTop: pdfSpacing.xs,
  },
  
  // Timeline visual
  timeline: {
    paddingLeft: pdfSpacing.lg,
  },
  
  timelineItem: {
    flexDirection: 'row',
    marginBottom: pdfSpacing.lg,
    position: 'relative',
  },
  
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: pdfColors.primary,
    marginRight: pdfSpacing.lg,
    marginLeft: -6,
  },
  
  timelineContent: {
    flex: 1,
  },
  
  timelineTitle: {
    ...pdfFonts.body,
    color: pdfColors.text,
    fontWeight: 'bold',
    marginBottom: pdfSpacing.xs,
  },
  
  timelineDate: {
    ...pdfFonts.caption,
    color: pdfColors.textSecondary,
    marginBottom: pdfSpacing.xs,
  },
  
  timelineDescription: {
    ...pdfFonts.bodySmall,
    color: pdfColors.textSecondary,
  },
  
  // Heatmap (grid de colores)
  heatmap: {
    flexDirection: 'column',
    gap: pdfSpacing.xs,
  },
  
  heatmapRow: {
    flexDirection: 'row',
    gap: pdfSpacing.xs,
  },
  
  heatmapCell: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  
  heatmapLegend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: pdfSpacing.md,
  },
  
  // Gauge/Medidor circular
  gauge: {
    alignItems: 'center',
    marginBottom: pdfSpacing.lg,
  },
  
  gaugeContainer: {
    width: 100,
    height: 50,
    marginBottom: pdfSpacing.md,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  
  gaugeArc: {
    width: 100,
    height: 50,
    borderRadius: 50,
    borderTopWidth: 8,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderColor: pdfColors.gray200,
  },
  
  gaugeValue: {
    ...pdfFonts.metricSmall,
    color: pdfColors.primary,
    textAlign: 'center',
  },
  
  gaugeLabel: {
    ...pdfFonts.caption,
    color: pdfColors.textSecondary,
    textAlign: 'center',
  },
});

// Interfaces para los componentes
interface BarChartData {
  label: string;
  value: number;
  color?: string;
}

interface PieChartData {
  label: string;
  value: number;
  percentage: number;
  color: string;
}

interface TimelineEvent {
  title: string;
  date: string;
  description?: string;
  status?: 'completed' | 'pending' | 'in_progress';
}

interface HeatmapData {
  value: number;
  label?: string;
}

// Componentes de Visualización

export const PDFBarChart: React.FC<{
  title: string;
  subtitle?: string;
  data: BarChartData[];
  maxValue?: number;
}> = ({ title, subtitle, data, maxValue }) => {
  const max = maxValue || Math.max(...data.map(d => d.value));
  
  return (
    <View style={chartStyles.chartContainer}>
      <Text style={chartStyles.chartTitle}>{title}</Text>
      {subtitle && <Text style={chartStyles.chartSubtitle}>{subtitle}</Text>}
      
      <View style={chartStyles.barChart}>
        {data.map((item, index) => {
          const height = Math.max(8, (item.value / max) * 100);
          return (
            <View key={index} style={chartStyles.barColumn}>
              <Text style={chartStyles.barValue}>{item.value}</Text>
              <View 
                style={[
                  chartStyles.bar, 
                  { 
                    height, 
                    backgroundColor: item.color || pdfColors.primary 
                  }
                ]} 
              />
              <Text style={chartStyles.barLabel}>{item.label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export const PDFPieChart: React.FC<{
  title: string;
  subtitle?: string;
  data: PieChartData[];
}> = ({ title, subtitle, data }) => {
  return (
    <View style={chartStyles.chartContainer}>
      <Text style={chartStyles.chartTitle}>{title}</Text>
      {subtitle && <Text style={chartStyles.chartSubtitle}>{subtitle}</Text>}
      
      <View style={chartStyles.pieChart}>
        {/* Representación visual simplificada del pie */}
        <View style={[chartStyles.pieVisual, { backgroundColor: pdfColors.primary }]}>
          <Text style={{ ...pdfFonts.metricSmall, color: '#FFFFFF' }}>
            {data.length}
          </Text>
          <Text style={{ ...pdfFonts.caption, color: '#FFFFFF' }}>
            categorías
          </Text>
        </View>
        
        {/* Leyenda */}
        <View style={chartStyles.pieLegend}>
          {data.map((item, index) => (
            <View key={index} style={chartStyles.legendItem}>
              <View style={[chartStyles.legendColor, { backgroundColor: item.color }]} />
              <Text style={chartStyles.legendText}>{item.label}</Text>
              <Text style={chartStyles.legendValue}>{item.percentage}%</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

export const PDFTimeline: React.FC<{
  title: string;
  events: TimelineEvent[];
}> = ({ title, events }) => {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'completed': return pdfColors.success;
      case 'in_progress': return pdfColors.warning;
      case 'pending': return pdfColors.gray400;
      default: return pdfColors.primary;
    }
  };

  return (
    <View style={chartStyles.chartContainer}>
      <Text style={chartStyles.chartTitle}>{title}</Text>
      
      <View style={chartStyles.timeline}>
        {events.map((event, index) => (
          <View key={index} style={chartStyles.timelineItem}>
            <View style={[
              chartStyles.timelineDot, 
              { backgroundColor: getStatusColor(event.status) }
            ]} />
            <View style={chartStyles.timelineContent}>
              <Text style={chartStyles.timelineTitle}>{event.title}</Text>
              <Text style={chartStyles.timelineDate}>{event.date}</Text>
              {event.description && (
                <Text style={chartStyles.timelineDescription}>{event.description}</Text>
              )}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

export const PDFProductivityHeatmap: React.FC<{
  title: string;
  weekData: number[][]; // 7 días x 4 semanas
}> = ({ title, weekData }) => {
  const getHeatmapColor = (value: number) => {
    if (value === 0) return pdfColors.gray100;
    if (value <= 2) return pdfColors.primaryLight + '40'; // 25% opacity
    if (value <= 4) return pdfColors.primaryLight + '80'; // 50% opacity
    if (value <= 6) return pdfColors.primary + 'B0'; // 75% opacity
    return pdfColors.primary;
  };

  return (
    <View style={chartStyles.chartContainer}>
      <Text style={chartStyles.chartTitle}>{title}</Text>
      
      <View style={chartStyles.heatmap}>
        {weekData.map((week, weekIndex) => (
          <View key={weekIndex} style={chartStyles.heatmapRow}>
            {week.map((day, dayIndex) => (
              <View 
                key={dayIndex}
                style={[
                  chartStyles.heatmapCell,
                  { backgroundColor: getHeatmapColor(day) }
                ]} 
              />
            ))}
          </View>
        ))}
      </View>
      
      <View style={chartStyles.heatmapLegend}>
        <Text style={{ ...pdfFonts.caption, color: pdfColors.textSecondary }}>
          Menos
        </Text>
        <View style={chartStyles.heatmapRow}>
          {[0, 2, 4, 6, 8].map((value, index) => (
            <View 
              key={index}
              style={[
                chartStyles.heatmapCell,
                { backgroundColor: getHeatmapColor(value) }
              ]} 
            />
          ))}
        </View>
        <Text style={{ ...pdfFonts.caption, color: pdfColors.textSecondary }}>
          Más
        </Text>
      </View>
    </View>
  );
};

export const PDFGauge: React.FC<{
  title: string;
  value: number;
  maxValue: number;
  unit?: string;
  label?: string;
}> = ({ title, value, maxValue, unit, label }) => {
  const percentage = Math.min(100, (value / maxValue) * 100);
  
  return (
    <View style={chartStyles.chartContainer}>
      <Text style={chartStyles.chartTitle}>{title}</Text>
      
      <View style={chartStyles.gauge}>
        <View style={chartStyles.gaugeContainer}>
          <View style={[
            chartStyles.gaugeArc,
            percentage > 75 ? { borderColor: pdfColors.success } :
            percentage > 50 ? { borderColor: pdfColors.warning } :
            { borderColor: pdfColors.danger }
          ]} />
        </View>
        
        <Text style={chartStyles.gaugeValue}>
          {value}{unit || ''}
        </Text>
        
        {label && (
          <Text style={chartStyles.gaugeLabel}>{label}</Text>
        )}
        
        <Text style={{ ...pdfFonts.caption, color: pdfColors.textSecondary, marginTop: pdfSpacing.xs }}>
          {percentage.toFixed(1)}% del objetivo
        </Text>
      </View>
    </View>
  );
};

export const PDFTrendLine: React.FC<{
  title: string;
  data: { label: string; value: number }[];
  trend: 'up' | 'down' | 'stable';
}> = ({ title, data, trend }) => {
  const trendColor = trend === 'up' ? pdfColors.success : 
                    trend === 'down' ? pdfColors.danger : 
                    pdfColors.textSecondary;
  
  const trendIcon = trend === 'up' ? '↗️' : 
                   trend === 'down' ? '↘️' : '➡️';

  return (
    <View style={chartStyles.chartContainer}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: pdfSpacing.lg }}>
        <Text style={chartStyles.chartTitle}>{title}</Text>
        <Text style={{ ...pdfFonts.h4, color: trendColor, marginLeft: pdfSpacing.md }}>
          {trendIcon}
        </Text>
      </View>
      
      <View style={chartStyles.lineChart}>
        {/* Líneas de grid */}
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
          {[25, 50, 75].map((percent, index) => (
            <View 
              key={index}
              style={{
                position: 'absolute',
                top: `${percent}%`,
                left: 0,
                right: 0,
                height: 1,
                backgroundColor: pdfColors.borderLight,
              }} 
            />
          ))}
        </View>
        
        {/* Puntos de datos */}
        {data.map((point, index) => {
          const x = (index / (data.length - 1)) * 80 + 10; // 10% margin
          const y = 80 - (point.value / Math.max(...data.map(d => d.value))) * 60 + 10; // 10% margin
          
          return (
            <View 
              key={index}
              style={[
                chartStyles.linePoint,
                { 
                  left: `${x}%`, 
                  top: `${y}%`,
                  backgroundColor: trendColor
                }
              ]} 
            />
          );
        })}
      </View>
      
      {/* Etiquetas del eje X */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: pdfSpacing.md }}>
        {data.map((point, index) => (
          <Text key={index} style={chartStyles.lineLabel}>
            {point.label}
          </Text>
        ))}
      </View>
    </View>
  );
};