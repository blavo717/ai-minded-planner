import { StyleSheet } from '@react-pdf/renderer';

// Paleta de colores profesional
export const pdfColors = {
  // Colores principales profesionales
  primary: '#1E40AF',
  primaryLight: '#3B82F6',
  primaryDark: '#1E3A8A',
  primaryGradient: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)',
  
  secondary: '#059669',
  secondaryLight: '#10B981',
  secondaryDark: '#047857',
  
  accent: '#7C3AED',
  accentLight: '#8B5CF6',
  
  warning: '#D97706',
  warningLight: '#F59E0B',
  danger: '#DC2626',
  dangerLight: '#EF4444',
  
  success: '#059669',
  successLight: '#10B981',
  
  // Grises profesionales con mejor contraste
  gray25: '#FCFCFD',
  gray50: '#F8FAFC',
  gray100: '#F1F5F9',
  gray200: '#E2E8F0',
  gray300: '#CBD5E1',
  gray400: '#94A3B8',
  gray500: '#64748B',
  gray600: '#475569',
  gray700: '#334155',
  gray800: '#1E293B',
  gray900: '#0F172A',
  
  // Fondos y superficies
  background: '#FFFFFF',
  backgroundSecondary: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceSecondary: '#F1F5F9',
  
  // Texto con mejor jerarquía
  text: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#64748B',
  textDisabled: '#94A3B8',
  
  // Bordes profesionales
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  borderStrong: '#CBD5E1',
  
  // Sombras y efectos
  shadow: 'rgba(15, 23, 42, 0.1)',
  shadowMedium: 'rgba(15, 23, 42, 0.15)',
  shadowStrong: 'rgba(15, 23, 42, 0.25)',
};

// Tipografías profesionales mejoradas
export const pdfFonts = {
  // Títulos principales
  display: { fontSize: 32, fontWeight: 'bold', letterSpacing: -0.5 },
  h1: { fontSize: 28, fontWeight: 'bold', letterSpacing: -0.25 },
  h2: { fontSize: 24, fontWeight: 'bold', letterSpacing: -0.1 },
  h3: { fontSize: 20, fontWeight: 'bold' },
  h4: { fontSize: 16, fontWeight: 'bold' },
  h5: { fontSize: 14, fontWeight: 'bold' },
  
  // Cuerpo de texto
  bodyLarge: { fontSize: 14, lineHeight: 1.6 },
  body: { fontSize: 12, lineHeight: 1.5 },
  bodySmall: { fontSize: 10, lineHeight: 1.4 },
  caption: { fontSize: 9, lineHeight: 1.3 },
  overline: { fontSize: 8, fontWeight: 'bold', letterSpacing: 1 },
  
  // Texto especializado
  metric: { fontSize: 24, fontWeight: 'bold' },
  metricLarge: { fontSize: 32, fontWeight: 'bold' },
  metricSmall: { fontSize: 18, fontWeight: 'bold' },
  label: { fontSize: 10, fontWeight: 'bold', letterSpacing: 0.5 },
};

// Sistema de espaciado profesional
export const pdfSpacing = {
  xxs: 2,
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
  xxxl: 24,
  xxxxl: 32,
  xxxxxl: 40,
  
  // Espaciados específicos
  sectionGap: 24,
  componentGap: 16,
  elementGap: 8,
  inlineGap: 4,
  
  // Padding específicos
  pagePadding: 40,
  cardPadding: 16,
  cellPadding: 8,
};

// Estilos base del tema
export const pdfTheme = StyleSheet.create({
  // Layout
  page: {
    flexDirection: 'column',
    backgroundColor: pdfColors.background,
    padding: 40,
    fontFamily: 'Helvetica',
  },
  
  // Headers
  h1: {
    ...pdfFonts.h1,
    color: pdfColors.text,
    marginBottom: pdfSpacing.lg,
  },
  h2: {
    ...pdfFonts.h2,
    color: pdfColors.text,
    marginBottom: pdfSpacing.md,
  },
  h3: {
    ...pdfFonts.h3,
    color: pdfColors.text,
    marginBottom: pdfSpacing.sm,
  },
  h4: {
    ...pdfFonts.h4,
    color: pdfColors.text,
    marginBottom: pdfSpacing.sm,
  },
  
  // Texto
  body: {
    ...pdfFonts.body,
    color: pdfColors.text,
    lineHeight: 1.4,
  },
  bodySecondary: {
    ...pdfFonts.body,
    color: pdfColors.textSecondary,
    lineHeight: 1.4,
  },
  caption: {
    ...pdfFonts.caption,
    color: pdfColors.textMuted,
  },
  
  // Cards y containers
  card: {
    backgroundColor: pdfColors.background,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: pdfColors.gray200,
    padding: pdfSpacing.md,
    marginBottom: pdfSpacing.md,
  },
  cardHeader: {
    borderBottomWidth: 1,
    borderBottomColor: pdfColors.gray200,
    paddingBottom: pdfSpacing.sm,
    marginBottom: pdfSpacing.sm,
  },
  
  // Status colors
  statusSuccess: {
    color: pdfColors.secondary,
    backgroundColor: '#ECFDF5',
    padding: pdfSpacing.xs,
    borderRadius: 4,
  },
  statusWarning: {
    color: pdfColors.warning,
    backgroundColor: '#FFFBEB',
    padding: pdfSpacing.xs,
    borderRadius: 4,
  },
  statusDanger: {
    color: pdfColors.danger,
    backgroundColor: '#FEF2F2',
    padding: pdfSpacing.xs,
    borderRadius: 4,
  },
  
  // Métricas
  metricContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: pdfSpacing.sm,
  },
  metricBox: {
    flex: 1,
    minWidth: 120,
    padding: pdfSpacing.md,
    backgroundColor: pdfColors.gray50,
    borderRadius: 6,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: pdfColors.primary,
  },
  metricLabel: {
    fontSize: 9,
    color: pdfColors.textSecondary,
    marginTop: pdfSpacing.xs,
  },
  
  // Tablas
  table: {
    borderWidth: 1,
    borderColor: pdfColors.gray200,
    borderRadius: 6,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: pdfColors.gray50,
    borderBottomWidth: 1,
    borderBottomColor: pdfColors.gray200,
  },
  tableHeaderCell: {
    flex: 1,
    padding: pdfSpacing.sm,
    fontSize: 10,
    fontWeight: 'bold',
    color: pdfColors.text,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: pdfColors.gray100,
  },
  tableCell: {
    flex: 1,
    padding: pdfSpacing.sm,
    fontSize: 9,
    color: pdfColors.text,
  },
  
  // Utilidades
  flexRow: { flexDirection: 'row' },
  flexColumn: { flexDirection: 'column' },
  justifyBetween: { justifyContent: 'space-between' },
  alignCenter: { alignItems: 'center' },
  textCenter: { textAlign: 'center' },
  textRight: { textAlign: 'right' },
  
  // Márgenes y padding
  mb4: { marginBottom: pdfSpacing.xs },
  mb8: { marginBottom: pdfSpacing.sm },
  mb12: { marginBottom: pdfSpacing.md },
  mb16: { marginBottom: pdfSpacing.lg },
  mt8: { marginTop: pdfSpacing.sm },
  mt12: { marginTop: pdfSpacing.md },
  p8: { padding: pdfSpacing.sm },
  p12: { padding: pdfSpacing.md },
  p16: { padding: pdfSpacing.lg },
});

// Configuración de marca personalizable
export interface BrandConfig {
  logo?: string;
  primaryColor?: string;
  companyName?: string;
  colors?: Partial<typeof pdfColors>;
}

export const createBrandedTheme = (brandConfig: BrandConfig = {}) => {
  const colors = { ...pdfColors, ...brandConfig.colors };
  
  return StyleSheet.create({
    ...pdfTheme,
    h1: {
      ...pdfTheme.h1,
      color: brandConfig.primaryColor || colors.primary,
    },
    metricValue: {
      ...pdfTheme.metricValue,
      color: brandConfig.primaryColor || colors.primary,
    },
  });
};