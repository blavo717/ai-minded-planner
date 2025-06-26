
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Database, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { generateTestData, cleanTestData } from '@/utils/generateTestData';

const TestDataGenerator = () => {
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleGenerateData = async () => {
    if (!user) return;

    setIsGenerating(true);
    setMessage(null);

    try {
      const result = await generateTestData(user.id);
      setMessage({
        type: 'success',
        text: `Datos generados exitosamente: ${result.sessions} sesiones de trabajo`
      });
      
      // Recargar la página después de 2 segundos para mostrar los nuevos datos
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Error generando datos de prueba. Revisa la consola para más detalles.'
      });
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCleanData = async () => {
    if (!user) return;

    setIsCleaning(true);
    setMessage(null);

    try {
      await cleanTestData(user.id);
      setMessage({
        type: 'success',
        text: 'Datos de prueba eliminados exitosamente'
      });
      
      // Recargar la página después de 2 segundos
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Error eliminando datos de prueba. Revisa la consola para más detalles.'
      });
      console.error(error);
    } finally {
      setIsCleaning(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Generador de Datos de Prueba
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Genera datos de ejemplo para probar las funcionalidades de Analytics
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {message && (
          <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
            {message.type === 'success' ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          <div className="p-4 border border-border rounded-lg">
            <h4 className="font-medium mb-2">Generar Datos de Prueba</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Creará 30 días de sesiones de trabajo ficticias para poblar los gráficos y métricas.
            </p>
            <Button 
              onClick={handleGenerateData}
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Generando...
                </>
              ) : (
                <>
                  <Database className="h-4 w-4 mr-2" />
                  Generar Datos
                </>
              )}
            </Button>
          </div>

          <div className="p-4 border border-border rounded-lg">
            <h4 className="font-medium mb-2">Limpiar Datos de Prueba</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Eliminará todas las sesiones de trabajo generadas para pruebas.
            </p>
            <Button 
              onClick={handleCleanData}
              disabled={isCleaning}
              variant="destructive"
              className="w-full"
            >
              {isCleaning ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Limpiando...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Limpiar Datos
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          <strong>Nota:</strong> Los datos generados son solo para propósitos de prueba y demostración. 
          Puedes eliminarlos en cualquier momento.
        </div>
      </CardContent>
    </Card>
  );
};

export default TestDataGenerator;
