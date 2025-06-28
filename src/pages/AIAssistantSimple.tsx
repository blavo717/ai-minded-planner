
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import AIAssistantPanelSimple from '@/components/ai/AIAssistantPanelSimple';
import { Bot, Zap, Shield, Gauge, Brain, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AIAssistantSimple = () => {
  const navigate = useNavigate();

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

        {/* Upgrade Notice */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <Brain className="h-6 w-6 text-purple-600" />
            <div className="flex-1 text-left">
              <h3 className="font-medium text-purple-900">¿Necesitas más poder?</h3>
              <p className="text-sm text-purple-700">
                Prueba el Asistente IA Enriquecido con memoria persistente y contexto completo
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/ai-assistant-enhanced')}
              className="border-purple-300 text-purple-700 hover:bg-purple-100"
            >
              Probar
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
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
