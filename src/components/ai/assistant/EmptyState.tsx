
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Brain, Database, Zap } from 'lucide-react';

const EmptyState = () => {
  return (
    <div className="text-center text-muted-foreground py-8">
      <Brain className="h-12 w-12 mx-auto mb-4 text-purple-300" />
      <p className="text-lg font-medium mb-2">¡Hola! Soy tu asistente IA</p>
      <p className="text-sm mb-2">Tengo acceso completo a tus datos y contexto personal.</p>
      <div className="flex justify-center gap-2 mt-4">
        <Badge variant="outline">
          <Zap className="h-3 w-3 mr-1" />
          Memoria persistente
        </Badge>
        <Badge variant="outline">
          <Database className="h-3 w-3 mr-1" />
          Contexto inteligente
        </Badge>
      </div>
    </div>
  );
};

export default EmptyState;
