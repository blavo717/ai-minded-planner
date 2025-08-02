/**
 * SUBTAREA 4: Interface de Usuario para Generación de Reportes IA
 * Componente React para generar y previsualizar reportes HTML con IA
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Download, Eye, Share2, Sparkles, Settings2, Calendar, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAIReportGeneration } from '@/hooks/useAIReportGeneration';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AIReportConfiguration } from '@/services/aiHTMLReportService';

interface AIReportGeneratorProps {
  className?: string;
}

const AIReportGenerator: React.FC<AIReportGeneratorProps> = ({ className }) => {
  const { toast } = useToast();
  const {
    generateAIReport,
    isGenerating,
    hasActiveConfiguration,
    lastGeneratedReport,
    saveReportToHistory
  } = useAIReportGeneration();

  // Estados del componente
  const [selectedType, setSelectedType] = useState<'weekly' | 'monthly'>('monthly');
  const [showPreview, setShowPreview] = useState(false);
  const [configuration, setConfiguration] = useState<AIReportConfiguration>({
    type: 'monthly',
    includeCharts: true,
    includeInsights: true,
    colorScheme: 'blue',
    detailLevel: 'detailed'
  });

  const handleGenerateReport = async () => {
    if (!hasActiveConfiguration) {
      toast({
        title: "Configuración requerida",
        description: "Configure su API key de IA en Configuración > LLM antes de generar reportes.",
        variant: "destructive",
      });
      return;
    }

    try {
      const config = { ...configuration, type: selectedType };
      console.log('🚀 Iniciando generación de reporte IA:', config);

      const result = await generateAIReport(config);

      if (result.success) {
        toast({
          title: "Reporte generado exitosamente",
          description: `Reporte ${selectedType} generado con IA en ${Math.round(result.metadata?.generationTime || 0)}ms`,
        });
        setShowPreview(true);
      } else {
        throw new Error(result.error || 'Error desconocido');
      }

    } catch (error: any) {
      console.error('❌ Error generando reporte:', error);
      toast({
        title: "Error al generar reporte",
        description: error.message || "No se pudo generar el reporte con IA.",
        variant: "destructive",
      });
    }
  };

  const handleSaveToHistory = async () => {
    if (lastGeneratedReport?.htmlContent) {
      try {
        await saveReportToHistory(lastGeneratedReport, selectedType);
        toast({
          title: "Reporte guardado",
          description: "El reporte ha sido guardado en su historial.",
        });
      } catch (error) {
        toast({
          title: "Error al guardar",
          description: "No se pudo guardar el reporte en el historial.",
          variant: "destructive",
        });
      }
    }
  };

  const handleDownloadHTML = () => {
    if (lastGeneratedReport?.htmlContent) {
      const blob = new Blob([lastGeneratedReport.htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte-${selectedType}-${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleShareReport = async () => {
    if (lastGeneratedReport?.htmlContent && navigator.share) {
      try {
        await navigator.share({
          title: `Reporte ${selectedType === 'weekly' ? 'Semanal' : 'Mensual'}`,
          text: 'Reporte de productividad generado con IA',
          url: window.location.href
        });
      } catch (error) {
        // Fallback: copiar al clipboard
        navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Enlace copiado",
          description: "El enlace del reporte ha sido copiado al portapapeles.",
        });
      }
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10">
          <Sparkles className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Reportes IA</h2>
          <p className="text-muted-foreground">
            Genera reportes HTML profesionales con inteligencia artificial
          </p>
        </div>
      </div>

      {/* Configuración */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Configuración del Reporte
          </CardTitle>
          <CardDescription>
            Personaliza tu reporte antes de generar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Tipo de reporte */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Reporte</Label>
              <Select value={selectedType} onValueChange={(value: 'weekly' | 'monthly') => {
                setSelectedType(value);
                setConfiguration(prev => ({ ...prev, type: value }));
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Reporte Semanal</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="monthly">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      <span>Reporte Mensual</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Esquema de Colores</Label>
              <Select 
                value={configuration.colorScheme} 
                onValueChange={(value: 'blue' | 'green' | 'purple' | 'corporate') => 
                  setConfiguration(prev => ({ ...prev, colorScheme: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blue">Azul Profesional</SelectItem>
                  <SelectItem value="green">Verde Productividad</SelectItem>
                  <SelectItem value="purple">Púrpura Moderno</SelectItem>
                  <SelectItem value="corporate">Corporativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Nivel de detalle */}
          <div className="space-y-2">
            <Label>Nivel de Detalle</Label>
            <Select 
              value={configuration.detailLevel} 
              onValueChange={(value: 'summary' | 'detailed' | 'comprehensive') => 
                setConfiguration(prev => ({ ...prev, detailLevel: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="summary">Resumen</SelectItem>
                <SelectItem value="detailed">Detallado</SelectItem>
                <SelectItem value="comprehensive">Comprehensivo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Opciones adicionales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="charts"
                checked={configuration.includeCharts}
                onCheckedChange={(checked) => 
                  setConfiguration(prev => ({ ...prev, includeCharts: checked }))
                }
              />
              <Label htmlFor="charts">Incluir Gráficos</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="insights"
                checked={configuration.includeInsights}
                onCheckedChange={(checked) => 
                  setConfiguration(prev => ({ ...prev, includeInsights: checked }))
                }
              />
              <Label htmlFor="insights">Incluir Insights IA</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estado de configuración LLM */}
      {!hasActiveConfiguration && (
        <Alert>
          <Sparkles className="h-4 w-4" />
          <AlertDescription>
            Configure su API key de IA en <strong>Configuración → LLM</strong> para generar reportes inteligentes.
          </AlertDescription>
        </Alert>
      )}

      {/* Botón de generación */}
      <div className="flex gap-3">
        <Button
          onClick={handleGenerateReport}
          disabled={isGenerating || !hasActiveConfiguration}
          size="lg"
          className="flex-1"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generando con IA...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generar Reporte {selectedType === 'weekly' ? 'Semanal' : 'Mensual'}
            </>
          )}
        </Button>
      </div>

      {/* Metadata del último reporte */}
      {lastGeneratedReport && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Último Reporte Generado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">
                Modelo: {lastGeneratedReport.metadata?.modelUsed || 'unknown'}
              </Badge>
              <Badge variant="secondary">
                Tokens: {lastGeneratedReport.metadata?.tokensUsed || 0}
              </Badge>
              <Badge variant="secondary">
                Tiempo: {lastGeneratedReport.metadata?.generationTime || 0}ms
              </Badge>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowPreview(!showPreview)}
                className="flex-1"
              >
                <Eye className="mr-2 h-4 w-4" />
                {showPreview ? 'Ocultar' : 'Ver'} Preview
              </Button>
              
              <Button
                variant="outline"
                onClick={handleDownloadHTML}
              >
                <Download className="mr-2 h-4 w-4" />
                Descargar HTML
              </Button>

              <Button
                variant="outline"
                onClick={handleSaveToHistory}
              >
                Guardar en Historial
              </Button>

              <Button
                variant="outline"
                onClick={handleShareReport}
              >
                <Share2 className="mr-2 h-4 w-4" />
                Compartir
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview del reporte */}
      {showPreview && lastGeneratedReport && (
        <Card>
          <CardHeader>
            <CardTitle>Preview del Reporte</CardTitle>
            <CardDescription>
              Vista previa del reporte HTML generado con IA
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <iframe
                srcDoc={lastGeneratedReport.htmlContent}
                style={{ width: '100%', height: '600px', border: 'none' }}
                title="Preview del Reporte"
                sandbox="allow-scripts"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AIReportGenerator;