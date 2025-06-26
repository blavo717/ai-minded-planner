
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileCheck, Brain, Zap, Settings } from 'lucide-react';
import CompleteVerificationSuite from '@/components/testing/CompleteVerificationSuite';
import SimpleChatTest from '@/components/testing/SimpleChatTest';
import Phase3IntegralSuite from '@/components/tasks/testing/Phase3IntegralSuite';

const TestingHub = () => {
  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Centro de Testing</h1>
        <p className="text-muted-foreground">
          Hub completo para testing y verificación del sistema
        </p>
      </div>

      <Tabs defaultValue="complete" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="complete" className="flex items-center gap-2">
            <FileCheck className="h-4 w-4" />
            Verificación Completa
          </TabsTrigger>
          <TabsTrigger value="simple" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Tests Simples
          </TabsTrigger>
          <TabsTrigger value="integral" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Tests Integrales
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configuración
          </TabsTrigger>
        </TabsList>

        <TabsContent value="complete">
          <CompleteVerificationSuite />
        </TabsContent>

        <TabsContent value="simple">
          <Card>
            <CardHeader>
              <CardTitle>Tests Simples</CardTitle>
              <CardDescription>
                Tests básicos de funcionalidad individual
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SimpleChatTest />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integral">
          <Phase3IntegralSuite />
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Testing</CardTitle>
              <CardDescription>
                Configuración y ajustes del sistema de testing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Estado Actual: Opción B - Asistente Simplificado</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Chat manual básico funcionando</li>
                    <li>• Smart Messaging desactivado</li>
                    <li>• Sistema estable y confiable</li>
                    <li>• Ideal para testing y desarrollo</li>
                  </ul>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Componentes Verificados</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• ✅ Autenticación y perfiles</li>
                    <li>• ✅ Configuración LLM</li>
                    <li>• ✅ Jerarquía de tareas (main/sub/micro)</li>
                    <li>• ✅ Chat simple persistente</li>
                    <li>• ✅ Persistencia de datos</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TestingHub;
