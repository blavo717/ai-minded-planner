import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { pdfColors, pdfFonts, pdfSpacing } from '@/utils/pdfTheme';

// Estilos profesionales mejorados
const professionalStyles = StyleSheet.create({
  // Layouts profesionales
  heroSection: {
    backgroundColor: pdfColors.primary,
    padding: pdfSpacing.xxxxxl,
    marginBottom: pdfSpacing.sectionGap,
    borderRadius: 8,
    color: '#FFFFFF',
  },
  
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: pdfSpacing.componentGap,
    marginBottom: pdfSpacing.sectionGap,
  },
  
  gridItem: {
    flex: 1,
    minWidth: '30%',
  },
  
  // Headers profesionales con separadores
  sectionHeader: {
    borderBottomWidth: 2,
    borderBottomColor: pdfColors.primary,
    paddingBottom: pdfSpacing.md,
    marginBottom: pdfSpacing.xl,
  },
  
  sectionTitle: {
    ...pdfFonts.h2,
    color: pdfColors.primary,
    marginBottom: pdfSpacing.xs,
  },
  
  sectionSubtitle: {
    ...pdfFonts.label,
    color: pdfColors.textMuted,
    textTransform: 'uppercase' as const,
  },
  
  // Cards elevados con sombras
  elevatedCard: {
    backgroundColor: pdfColors.surface,
    borderRadius: 12,
    padding: pdfSpacing.xl,
    marginBottom: pdfSpacing.componentGap,
    borderWidth: 1,
    borderColor: pdfColors.border,
    // Simulamos shadow con border sutil
    borderLeftWidth: 4,
    borderLeftColor: pdfColors.primary,
  },
  
  // Métricas destacadas
  metricDisplayCard: {
    backgroundColor: pdfColors.surfaceSecondary,
    borderRadius: 16,
    padding: pdfSpacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
    flex: 1,
  },
  
  metricValue: {
    ...pdfFonts.metricLarge,
    color: pdfColors.primary,
    marginBottom: pdfSpacing.xs,
  },
  
  metricLabel: {
    ...pdfFonts.label,
    color: pdfColors.textSecondary,
    textAlign: 'center',
    textTransform: 'uppercase' as const,
  },
  
  metricChange: {
    ...pdfFonts.caption,
    color: pdfColors.success,
    marginTop: pdfSpacing.xs,
  },
  
  // Tablas profesionales
  professionalTable: {
    backgroundColor: pdfColors.surface,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: pdfColors.border,
  },
  
  tableHeaderPro: {
    backgroundColor: pdfColors.primary,
    flexDirection: 'row',
    paddingVertical: pdfSpacing.lg,
    paddingHorizontal: pdfSpacing.xl,
  },
  
  tableHeaderCellPro: {
    flex: 1,
    ...pdfFonts.label,
    color: '#FFFFFF',
    textTransform: 'uppercase' as const,
  },
  
  tableRowPro: {
    flexDirection: 'row',
    paddingVertical: pdfSpacing.md,
    paddingHorizontal: pdfSpacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: pdfColors.borderLight,
  },
  
  tableRowAlt: {
    backgroundColor: pdfColors.backgroundSecondary,
  },
  
  tableCellPro: {
    flex: 1,
    ...pdfFonts.body,
    color: pdfColors.text,
  },
  
  // Indicadores de progreso
  progressContainer: {
    backgroundColor: pdfColors.gray200,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginVertical: pdfSpacing.xs,
  },
  
  progressBar: {
    backgroundColor: pdfColors.primary,
    height: '100%',
    borderRadius: 4,
  },
  
  // Badges y etiquetas
  badge: {
    paddingHorizontal: pdfSpacing.md,
    paddingVertical: pdfSpacing.xs,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  
  badgeSuccess: {
    backgroundColor: pdfColors.successLight,
    color: '#FFFFFF',
  },
  
  badgeWarning: {
    backgroundColor: pdfColors.warningLight,
    color: '#FFFFFF',
  },
  
  badgeDanger: {
    backgroundColor: pdfColors.dangerLight,
    color: '#FFFFFF',
  },
  
  badgeText: {
    ...pdfFonts.caption,
    fontWeight: 'bold',
  },
  
  // Separadores elegantes
  divider: {
    height: 1,
    backgroundColor: pdfColors.border,
    marginVertical: pdfSpacing.xl,
  },
  
  dividerWithText: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: pdfSpacing.xl,
  },
  
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: pdfColors.border,
  },
  
  dividerText: {
    ...pdfFonts.label,
    color: pdfColors.textMuted,
    backgroundColor: pdfColors.background,
    paddingHorizontal: pdfSpacing.lg,
    textTransform: 'uppercase' as const,
  },
  
  // Sidebar informativo
  infoSidebar: {
    backgroundColor: pdfColors.accent,
    borderRadius: 8,
    padding: pdfSpacing.xl,
    marginBottom: pdfSpacing.componentGap,
  },
  
  infoSidebarTitle: {
    ...pdfFonts.h5,
    color: '#FFFFFF',
    marginBottom: pdfSpacing.md,
  },
  
  infoSidebarText: {
    ...pdfFonts.bodySmall,
    color: '#FFFFFF',
    opacity: 0.9,
  },
});

// Interfaces para componentes
interface ProfessionalSectionProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

interface MetricDisplayProps {
  value: string | number;
  label: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
}

interface ProfessionalTableProps {
  headers: string[];
  rows: (string | number)[][];
  alternateRows?: boolean;
}

interface ProgressIndicatorProps {
  percentage: number;
  label?: string;
}

interface BadgeProps {
  text: string;
  variant: 'success' | 'warning' | 'danger';
}

// Componentes profesionales
export const ProfessionalSection: React.FC<ProfessionalSectionProps> = ({ 
  title, 
  subtitle, 
  children 
}) => (
  <View style={{ marginBottom: pdfSpacing.sectionGap }}>
    <View style={professionalStyles.sectionHeader}>
      <Text style={professionalStyles.sectionTitle}>{title}</Text>
      {subtitle && (
        <Text style={professionalStyles.sectionSubtitle}>{subtitle}</Text>
      )}
    </View>
    {children}
  </View>
);

export const MetricDisplay: React.FC<MetricDisplayProps> = ({ 
  value, 
  label, 
  change, 
  changeType = 'neutral' 
}) => (
  <View style={professionalStyles.metricDisplayCard}>
    <Text style={professionalStyles.metricValue}>{value}</Text>
    <Text style={professionalStyles.metricLabel}>{label}</Text>
    {change && (
      <Text style={[
        professionalStyles.metricChange,
        { color: changeType === 'positive' ? pdfColors.success : 
                changeType === 'negative' ? pdfColors.danger : 
                pdfColors.textMuted }
      ]}>
        {change}
      </Text>
    )}
  </View>
);

export const ProfessionalTable: React.FC<ProfessionalTableProps> = ({ 
  headers, 
  rows, 
  alternateRows = true 
}) => (
  <View style={professionalStyles.professionalTable}>
    <View style={professionalStyles.tableHeaderPro}>
      {headers.map((header, index) => (
        <Text key={index} style={professionalStyles.tableHeaderCellPro}>
          {header}
        </Text>
      ))}
    </View>
    
    {rows.map((row, rowIndex) => (
      <View 
        key={rowIndex} 
        style={[
          professionalStyles.tableRowPro,
          alternateRows && rowIndex % 2 === 1 && professionalStyles.tableRowAlt
        ]}
      >
        {row.map((cell, cellIndex) => (
          <Text key={cellIndex} style={professionalStyles.tableCellPro}>
            {cell}
          </Text>
        ))}
      </View>
    ))}
  </View>
);

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ 
  percentage, 
  label 
}) => (
  <View>
    {label && (
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: pdfSpacing.xs }}>
        <Text style={{ ...pdfFonts.caption, color: pdfColors.textSecondary }}>{label}</Text>
        <Text style={{ ...pdfFonts.caption, color: pdfColors.textSecondary, fontWeight: 'bold' }}>
          {percentage}%
        </Text>
      </View>
    )}
    <View style={professionalStyles.progressContainer}>
      <View style={[professionalStyles.progressBar, { width: `${percentage}%` }]} />
    </View>
  </View>
);

export const Badge: React.FC<BadgeProps> = ({ text, variant }) => (
  <View style={[
    professionalStyles.badge,
    professionalStyles[`badge${variant.charAt(0).toUpperCase() + variant.slice(1)}`]
  ]}>
    <Text style={professionalStyles.badgeText}>{text}</Text>
  </View>
);

export const Divider: React.FC<{ text?: string }> = ({ text }) => {
  if (text) {
    return (
      <View style={professionalStyles.dividerWithText}>
        <View style={professionalStyles.dividerLine} />
        <Text style={professionalStyles.dividerText}>{text}</Text>
        <View style={professionalStyles.dividerLine} />
      </View>
    );
  }
  
  return <View style={professionalStyles.divider} />;
};

export const ElevatedCard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <View style={professionalStyles.elevatedCard}>
    {children}
  </View>
);

export const GridContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <View style={professionalStyles.gridContainer}>
    {children}
  </View>
);

export const GridItem: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <View style={professionalStyles.gridItem}>
    {children}
  </View>
);

export const HeroSection: React.FC<{ title: string; subtitle?: string }> = ({ 
  title, 
  subtitle 
}) => (
  <View style={professionalStyles.heroSection}>
    <Text style={{ ...pdfFonts.display, color: '#FFFFFF', marginBottom: pdfSpacing.md }}>
      {title}
    </Text>
    {subtitle && (
      <Text style={{ ...pdfFonts.bodyLarge, color: '#FFFFFF', opacity: 0.9 }}>
        {subtitle}
      </Text>
    )}
  </View>
);

export const InfoSidebar: React.FC<{ title: string; children: React.ReactNode }> = ({ 
  title, 
  children 
}) => (
  <View style={professionalStyles.infoSidebar}>
    <Text style={professionalStyles.infoSidebarTitle}>{title}</Text>
    <View style={{ flex: 1 }}>
      {children}
    </View>
  </View>
);