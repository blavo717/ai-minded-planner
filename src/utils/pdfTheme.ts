import { StyleSheet } from '@react-pdf/renderer';

// Paleta de colores del sistema
export const pdfColors = {
  primary: '#3B82F6',
  primaryLight: '#60A5FA',
  primaryDark: '#1D4ED8',
  secondary: '#10B981',
  secondaryLight: '#34D399',
  warning: '#F59E0B',
  danger: '#EF4444',
  
  // Grises
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
  
  // Fondo y texto
  background: '#FFFFFF',
  text: '#1F2937',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
};

// Tipografías
export const pdfFonts = {
  h1: { fontSize: 24, fontWeight: 'bold' },
  h2: { fontSize: 20, fontWeight: 'bold' },
  h3: { fontSize: 16, fontWeight: 'bold' },
  h4: { fontSize: 14, fontWeight: 'bold' },
  body: { fontSize: 11 },
  bodySmall: { fontSize: 9 },
  caption: { fontSize: 8 },
};

// Espaciados
export const pdfSpacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
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