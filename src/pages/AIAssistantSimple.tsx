
import React from 'react';
import { Badge } from "@/components/ui/badge";
import AIAssistantPanelSimple from '@/components/ai/AIAssistantPanelSimple';
import { Bot, Zap, Shield, Gauge } from 'lucide-react';

const AIAssistantSimple = () => {
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Bot className="h-8 w-8 text-blue-500" />
          <h1 className="text-3xl font-bold">Asistente IA Simple</h1>
        </div>
        
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Un asistente de inteligencia artificial simplificado, directo y eficiente. 
          Perfecto para consultas rápidas y conversaciones naturales.
        </p>

        <div className="flex flex-wrap justify-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Zap className="h-3 w-3" />
            Respuestas rápidas
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            Seguro y privado
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Gauge className="h-3 w-3" />
            Interfaz limpia
          </Badge>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="max-w-4xl mx-auto">
        <AIAssistantPanelSimple />
      </div>

      {/* Instructions */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">💡 Consejos de uso</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Haz preguntas claras y específicas</li>
            <li>• Puedes pedir ayuda con tareas, explicaciones o consejos</li>
            <li>• Usa el botón de limpiar para empezar una nueva conversación</li>
            <li>• Las respuestas se generan en tiempo real</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AIAssistantSimple;
