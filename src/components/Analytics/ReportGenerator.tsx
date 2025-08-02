
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, BarChart3, Sparkles, Zap } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useGeneratedReports } from '@/hooks/useGeneratedReports';
import { useLLMService } from '@/hooks/useLLMService';
import ReportTypeCard from './ReportGenerator/ReportTypeCard';
import ReportHistoryList from './ReportGenerator/ReportHistoryList';
import AIReportGenerator from '@/components/Reports/AIReportGenerator';

const ReportGenerator = () => {
  const { 
    getReportHistory,
    generateReport,
    isGenerating,
    generatePDF,
    downloadPDF,
    isPDFGenerating
  } = useGeneratedReports();
  
  const { hasActiveConfiguration } = useLLMService();

  const { data: reportHistory, isLoading } = getReportHistory();

  const handleGenerateReport = (type: 'weekly' | 'monthly') => {
    console.log(`🚀 Iniciando generación de reporte ${type}`);
    generateReport(type);
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
      {/* Header con descripción de opciones */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Generador de Reportes</h2>
          <p className="text-muted-foreground">
            Genera reportes PDF tradicionales o reportes HTML inteligentes con IA
          </p>
        </div>
        {hasActiveConfiguration && (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            IA Disponible
          </Badge>
        )}
      </div>

      <Tabs defaultValue="traditional" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="traditional" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Reportes PDF
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Reportes IA
            {!hasActiveConfiguration && (
              <Badge variant="outline" className="ml-1 text-xs">
                Config requerida
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Tab de Reportes PDF Tradicionales */}
        <TabsContent value="traditional" className="space-y-6 mt-6">
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
                generatingReport={null}
              />
            ))}
          </div>

          {/* Historial de reportes */}
          <Card>
            <CardHeader>
              <CardTitle>Historial de Reportes PDF</CardTitle>
              <p className="text-sm text-muted-foreground">
                Tus reportes PDF generados recientemente
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
        </TabsContent>

        {/* Tab de Reportes IA */}
        <TabsContent value="ai" className="mt-6">
          <AIReportGenerator />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportGenerator;
