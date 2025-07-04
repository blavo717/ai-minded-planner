
import React, { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import IntelligentAIAssistantPanel from '@/components/ai/IntelligentAIAssistantPanel';
import { Brain, Database, Zap, Shield, ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const AIAssistantEnhanced = () => {
  const [showFeatures, setShowFeatures] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header compacto */}
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-2">
          <Brain className="h-8 w-8 text-purple-600" />
          <h1 className="text-3xl font-bold">Asistente IA</h1>
        </div>
        
        <p className="text-muted-foreground max-w-2xl mx-auto text-sm">
          Un asistente de inteligencia artificial avanzado con acceso completo a tu contexto personal, 
          memoria persistente y análisis inteligente de tus patrones de trabajo.
        </p>

        <div className="flex flex-wrap justify-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1 border-purple-300 text-purple-700">
            <Database className="h-3 w-3" />
            Contexto completo
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1 border-purple-300 text-purple-700">
            <Zap className="h-3 w-3" />
            Memoria persistente
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1 border-purple-300 text-purple-700">
            <Shield className="h-3 w-3" />
            Seguro y privado
          </Badge>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="max-w-4xl mx-auto">
        <IntelligentAIAssistantPanel />
      </div>

      {/* Features Info - Colapsable */}
      <div className="max-w-4xl mx-auto">
        <Collapsible open={showFeatures} onOpenChange={setShowFeatures}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <span>Ver capacidades y ejemplos</span>
              {showFeatures ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="font-medium text-purple-900 mb-2 flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  Capacidades Avanzadas
                </h3>
                <ul className="text-sm text-purple-800 space-y-1">
                  <li>• Acceso completo a tus tareas y proyectos</li>
                  <li>• Análisis de patrones de productividad</li>
                  <li>• Recomendaciones personalizadas</li>
                  <li>• Memoria de conversaciones anteriores</li>
                </ul>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-medium text-green-900 mb-2 flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Ejemplos de uso
                </h3>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• "¿Cómo va mi progreso esta semana?"</li>
                  <li>• "Sugiere cómo organizar mis tareas"</li>
                  <li>• "Analiza mis patrones de trabajo"</li>
                  <li>• "¿Qué proyectos requieren más atención?"</li>
                </ul>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
};

export default AIAssistantEnhanced;
