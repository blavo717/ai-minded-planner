import React from 'react';
import { Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// Estilos base para componentes PDF
const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#3B82F6',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  section: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 10,
  },
  sectionContent: {
    fontSize: 11,
    lineHeight: 1.4,
    color: '#374151',
  },
  metricCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: 'bold',
  },
  metricValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: 'bold',
  },
  table: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 6,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tableHeaderCell: {
    flex: 1,
    padding: 8,
    fontSize: 10,
    fontWeight: 'bold',
    color: '#374151',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  tableCell: {
    flex: 1,
    padding: 8,
    fontSize: 9,
    color: '#374151',
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  chartPlaceholder: {
    width: 200,
    height: 120,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 50,
    right: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 10,
  },
  footerText: {
    fontSize: 9,
    color: '#6B7280',
  },
  pageNumber: {
    fontSize: 9,
    color: '#6B7280',
  },
});

// Componente Header
interface PDFHeaderProps {
  title: string;
  subtitle?: string;
  logo?: string;
}

export const PDFHeader: React.FC<PDFHeaderProps> = ({ title, subtitle, logo }) => (
  <View style={styles.header}>
    <View>
      <Text style={styles.headerTitle}>{title}</Text>
      {subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}
    </View>
    {logo && <Image src={logo} style={{ width: 60, height: 60 }} />}
  </View>
);

// Componente Section
interface PDFSectionProps {
  title: string;
  children: React.ReactNode;
}

export const PDFSection: React.FC<PDFSectionProps> = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.sectionContent}>
      {children}
    </View>
  </View>
);

// Componente Metric Card
interface PDFMetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
}

export const PDFMetricCard: React.FC<PDFMetricCardProps> = ({ label, value, unit }) => (
  <View style={styles.metricCard}>
    <Text style={styles.metricLabel}>{label}</Text>
    <Text style={styles.metricValue}>
      {value}{unit && ` ${unit}`}
    </Text>
  </View>
);

// Componente Chart (placeholder)
interface PDFChartProps {
  title: string;
  description?: string;
  chartImage?: string;
}

export const PDFChart: React.FC<PDFChartProps> = ({ title, description, chartImage }) => (
  <View style={styles.chartContainer}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {description && <Text style={styles.sectionContent}>{description}</Text>}
    {chartImage ? (
      <Image src={chartImage} style={{ width: 300, height: 180, marginTop: 10 }} />
    ) : (
      <View style={styles.chartPlaceholder}>
        <Text style={{ fontSize: 10, color: '#9CA3AF' }}>Gráfico en desarrollo</Text>
      </View>
    )}
  </View>
);

// Componente Table
interface PDFTableProps {
  headers: string[];
  rows: (string | number)[][];
}

export const PDFTable: React.FC<PDFTableProps> = ({ headers, rows }) => (
  <View style={styles.table}>
    <View style={styles.tableHeader}>
      {headers.map((header, index) => (
        <Text key={index} style={styles.tableHeaderCell}>
          {header}
        </Text>
      ))}
    </View>
    {rows.map((row, rowIndex) => (
      <View key={rowIndex} style={styles.tableRow}>
        {row.map((cell, cellIndex) => (
          <Text key={cellIndex} style={styles.tableCell}>
            {cell}
          </Text>
        ))}
      </View>
    ))}
  </View>
);

// Componente Footer
interface PDFFooterProps {
  generatedDate: string;
  pageNumber: number;
  totalPages?: number;
}

export const PDFFooter: React.FC<PDFFooterProps> = ({ generatedDate, pageNumber, totalPages }) => (
  <View style={styles.footer}>
    <Text style={styles.footerText}>Generado el {generatedDate}</Text>
    <Text style={styles.pageNumber}>
      Página {pageNumber}{totalPages && ` de ${totalPages}`}
    </Text>
  </View>
);