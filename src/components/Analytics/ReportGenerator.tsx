
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, BarChart3 } from 'lucide-react';
import { useGeneratedReports } from '@/hooks/useGeneratedReports';
import ReportTypeCard from './ReportGenerator/ReportTypeCard';
import ReportHistoryList from './ReportGenerator/ReportHistoryList';

const ReportGenerator = () => {
  const [generatingReport, setGeneratingReport] = useState<string | null>(null);
  const { 
    getReportHistory,
    generateReport,
    isGenerating,
    generatePDF,
    downloadPDF,
    isPDFGenerating
  } = useGeneratedReports();

  const { data: reportHistory, isLoading } = getReportHistory();

  const handleGenerateReport = async (type: 'weekly' | 'monthly') => {
    setGeneratingReport(type);
    try {
      generateReport(type);
    } finally {
      setGeneratingReport(null);
    }
  };

  const reportTypes = [
    {
      type: 'weekly' as const,
      title: 'Reporte Semanal',
      description: 'Análisis de los últimos 7 días',
      icon: Calendar,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-950'
    },
    {
      type: 'monthly' as const,
      title: 'Reporte Mensual',
      description: 'Análisis detallado del último mes',
      icon: BarChart3,
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-950'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Generadores de reportes */}
      <div className="grid gap-6 md:grid-cols-2">
        {reportTypes.map((reportType) => (
          <ReportTypeCard
            key={reportType.type}
            type={reportType.type}
            title={reportType.title}
            description={reportType.description}
            icon={reportType.icon}
            color={reportType.color}
            bgColor={reportType.bgColor}
            onGenerate={handleGenerateReport}
            isGenerating={isGenerating}
            generatingReport={generatingReport}
          />
        ))}
      </div>

      {/* Historial de reportes */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Reportes</CardTitle>
          <p className="text-sm text-muted-foreground">
            Tus reportes generados recientemente
          </p>
        </CardHeader>
        <CardContent>
          <ReportHistoryList 
            reportHistory={reportHistory}
            isLoading={isLoading}
            onGeneratePDF={generatePDF}
            onDownloadPDF={downloadPDF}
            isPDFGenerating={isPDFGenerating}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportGenerator;
