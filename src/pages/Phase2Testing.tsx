
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Zap, TestTube, Activity } from 'lucide-react';
import { Phase2ContextEngineTesting } from '@/components/testing/Phase2ContextEngineTesting';
import { Phase2PerformanceTesting } from '@/components/testing/Phase2PerformanceTesting';

const Phase2Testing = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Testing Completo - Fase 2</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Sistema completo de testing y validación del Context Engine Avanzado. 
          Incluye tests funcionales, de integración, rendimiento y estrés.
        </p>
        <div className="flex justify-center space-x-4">
          <Badge variant="outline" className="text-lg px-4 py-2">
            <Brain className="h-4 w-4 mr-2" />
            Context Engine
          </Badge>
          <Badge variant="outline" className="text-lg px-4 py-2">
            <TestTube className="h-4 w-4 mr-2" />
            Testing Robusto
          </Badge>
          <Badge variant="outline" className="text-lg px-4 py-2">
            <Activity className="h-4 w-4 mr-2" />
            Performance
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="functional" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="functional" className="flex items-center space-x-2">
            <TestTube className="h-4 w-4" />
            <span>Tests Funcionales</span>
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center space-x-2">
            <Zap className="h-4 w-4" />
            <span>Tests de Rendimiento</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="functional" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TestTube className="h-5 w-5" />
                <span>Testing Funcional del Context Engine</span>
              </CardTitle>
              <CardDescription>
                Tests completos de funcionalidad, integración y validación de todos los componentes del Context Engine.
                Incluye validación de ContextAnalyzer, ContextCache, ContextPrioritizer y hooks de integración.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Phase2ContextEngineTesting />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5" />
                <span>Testing de Rendimiento y Estrés</span>
              </CardTitle>
              <CardDescription>
                Tests de rendimiento, uso de memoria y pruebas de estrés para validar que el Context Engine 
                funciona eficientemente bajo carga y en condiciones extremas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Phase2PerformanceTesting />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Información del Sistema */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center space-x-2">
              <Brain className="h-5 w-5 text-blue-500" />
              <span>ContextAnalyzer</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Análisis inteligente de situación, carga de trabajo, urgencia y recomendaciones contextuales.
            </p>
            <div className="mt-2 space-y-1">
              <Badge variant="outline" className="text-xs">
                Análisis de Situación
              </Badge>
              <Badge variant="outline" className="text-xs">
                Métricas de Carga
              </Badge>
              <Badge variant="outline" className="text-xs">
                Recomendaciones
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center space-x-2">
              <Zap className="h-5 w-5 text-green-500" />
              <span>ContextCache</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Sistema de cache inteligente con TTL, LRU, estadísticas y limpieza automática.
            </p>
            <div className="mt-2 space-y-1">
              <Badge variant="outline" className="text-xs">
                Cache LRU
              </Badge>
              <Badge variant="outline" className="text-xs">
                TTL Automático
              </Badge>
              <Badge variant="outline" className="text-xs">
                Estadísticas
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center space-x-2">
              <Activity className="h-5 w-5 text-purple-500" />
              <span>ContextPrioritizer</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Algoritmo de priorización inteligente para tareas y proyectos con scores configurables.
            </p>
            <div className="mt-2 space-y-1">
              <Badge variant="outline" className="text-xs">
                Priorización IA
              </Badge>
              <Badge variant="outline" className="text-xs">
                Scores Dinámicos
              </Badge>
              <Badge variant="outline" className="text-xs">
                Recomendaciones
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Phase2Testing;
