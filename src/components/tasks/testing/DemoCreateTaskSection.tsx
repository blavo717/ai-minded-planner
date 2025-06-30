
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface DemoCreateTaskSectionProps {
  onCreateTask: () => void;
}

const DemoCreateTaskSection: React.FC<DemoCreateTaskSectionProps> = ({ onCreateTask }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Crear Tarea Principal
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Prueba crear una nueva tarea con todas las opciones disponibles
        </p>
        
        <Button 
          onClick={onCreateTask}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Abrir Modal de Crear Tarea
        </Button>
        
        <div className="bg-gray-50 p-3 rounded">
          <h4 className="font-medium mb-2">Qué probar:</h4>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• Título y descripción</li>
            <li>• Selección de prioridad</li>
            <li>• Asignación de persona (nuevo!)</li>
            <li>• Selección de rol en la tarea</li>
            <li>• Fecha límite y duración</li>
            <li>• Etiquetas</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default DemoCreateTaskSection;
