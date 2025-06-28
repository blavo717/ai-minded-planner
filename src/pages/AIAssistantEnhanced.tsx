
import React from 'react';
import { Badge } from "@/components/ui/badge";
import EnhancedAIAssistantPanel from '@/components/ai/EnhancedAIAssistantPanel';
import { Brain, Database, Zap, Shield, HardDrive, TrendingUp } from 'lucide-react';

const AIAssistantEnhanced = () => {
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Brain className="h-8 w-8 text-purple-600" />
          <h1 className="text-3xl font-bold">Asistente IA</h1>
        </div>
        
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Un asistente de inteligencia artificial avanzado con acceso completo a tu contexto personal, 
          memoria persistente y análisis inteligente de tus patrones de trabajo.
        </p>

        <div className="flex flex-wrap justify-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1 border-purple-300 text-purple-700">
            <Database className="h-3 w-3" />
            Contexto completo
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1 border-purple-300 text-purple-700">
            <HardDrive className="h-3 w-3" />
            Memoria persistente
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1 border-purple-300 text-purple-700">
            <TrendingUp className="h-3 w-3" />
            Análisis inteligente
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1 border-purple-300 text-purple-700">
            <Shield className="h-3 w-3" />
            Seguro y privado
          </Badge>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="max-w-4xl mx-auto">
        <EnhancedAIAssistantPanel />
      </div>

      {/* Features */}
      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-4">
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h3 className="font-medium text-purple-900 mb-2">🧠 Capacidades Avanzadas</h3>
          <ul className="text-sm text-purple-800 space-y-1">
            <li>• Acceso completo a tus tareas y proyectos</li>
            <li>• Análisis de patrones de productividad</li>
            <li>• Recomendaciones personalizadas</li>
            <li>• Memoria de conversaciones anteriores</li>
          </ul>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-medium text-green-900 mb-2">💡 Ejemplos de uso</h3>
          <ul className="text-sm text-green-800 space-y-1">
            <li>• "¿Cómo va mi progreso esta semana?"</li>
            <li>• "Sugiere cómo organizar mis tareas"</li>
            <li>• "Analiza mis patrones de trabajo"</li>
            <li>• "¿Qué proyectos requieren más atención?"</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AIAssistantEnhanced;
