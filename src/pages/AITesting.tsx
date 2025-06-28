
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AIContextTester } from '@/components/AI/AIContextTester';
import { AISystemMonitor } from '@/components/AI/AISystemMonitor';
import { TestTube, Activity, Brain } from 'lucide-react';

const AITesting: React.FC = () => {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Testing del Sistema de IA</h1>
        <p className="text-muted-foreground">
          Validación y monitoreo completo del sistema de asistente inteligente
        </p>
      </div>

      <Tabs defaultValue="testing" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="testing" className="flex items-center gap-2">
            <TestTube className="h-4 w-4" />
            Testing y Validación
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Monitoreo del Sistema
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="testing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Suite de Testing Completa
              </CardTitle>
              <CardDescription>
                Ejecuta pruebas completas del sistema de contexto IA, generación de prompts y integración con LLM
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AIContextTester />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="monitoring" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Monitor del Sistema en Tiempo Real
              </CardTitle>
              <CardDescription>
                Supervisión continua del estado y rendimiento del sistema de IA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AISystemMonitor />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AITesting;
