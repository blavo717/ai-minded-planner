
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Database, Play, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { checkAndGenerateTestData } from '@/utils/generateTestSessions';

const TestDataGenerator = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [dataGenerated, setDataGenerated] = useState<boolean | null>(null);

  const handleGenerateTestData = async () => {
    if (!user) return;

    setIsGenerating(true);
    try {
      const wasGenerated = await checkAndGenerateTestData(user.id);
      setDataGenerated(wasGenerated);
      
      if (wasGenerated) {
        toast({
          title: "Datos de prueba generados",
          description: "Se han creado sesiones de trabajo para tus tareas completadas. Actualiza la página para ver los nuevos análisis.",
        });
      } else {
        toast({
          title: "Datos ya existentes",
          description: "Ya tienes sesiones registradas o no hay tareas completadas para generar datos.",
          variant: "default",
        });
      }
    } catch (error) {
      console.error('Error generating test data:', error);
      toast({
        title: "Error",
        description: "No se pudieron generar los datos de prueba",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="border-dashed">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-lg">Generador de Datos de Prueba</CardTitle>
          <Badge variant="secondary">Desarrollo</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Genera sesiones de trabajo de ejemplo para ver análisis completos
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
          <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5" />
          <div className="text-sm">
            <p className="text-blue-700 dark:text-blue-300 mb-1">
              <strong>¿Por qué necesitas esto?</strong>
            </p>
            <p className="text-blue-600 dark:text-blue-400">
              Para ver métricas avanzadas como productividad, patrones de trabajo y análisis de tiempo, 
              necesitas datos de sesiones. Este generador crea sesiones realistas basadas en tus tareas completadas.
            </p>
          </div>
        </div>

        {dataGenerated === true && (
          <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm text-green-700 dark:text-green-300">
              ¡Datos generados exitosamente! Actualiza la página para ver los análisis.
            </span>
          </div>
        )}

        {dataGenerated === false && (
          <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950 rounded-lg">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <span className="text-sm text-amber-700 dark:text-amber-300">
              Ya tienes datos o no hay tareas completadas para generar sesiones.
            </span>
          </div>
        )}

        <Button 
          onClick={handleGenerateTestData}
          disabled={isGenerating || dataGenerated === true}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Generando datos...
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Generar Datos de Prueba
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default TestDataGenerator;
