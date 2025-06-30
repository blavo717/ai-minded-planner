
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';

interface TaskLogEntryFormProps {
  taskId: string;
  onSubmit: (data: { type: string; description: string }) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const TaskLogEntryForm: React.FC<TaskLogEntryFormProps> = ({ 
  taskId, 
  onSubmit, 
  onCancel, 
  isSubmitting = false 
}) => {
  const [type, setType] = useState('progreso');
  const [description, setDescription] = useState('');

  const logTypes = [
    { 
      value: 'progreso', 
      label: '📈 Progreso', 
      placeholder: 'Ej: Email enviado al cliente, esperando respuesta para continuar...',
      color: 'text-green-600'
    },
    { 
      value: 'bloqueo', 
      label: '🚫 Bloqueo', 
      placeholder: 'Ej: Esperando aprobación del presupuesto por parte del cliente...',
      color: 'text-red-600'
    },
    { 
      value: 'nota', 
      label: '📝 Nota', 
      placeholder: 'Ej: Recordar revisar el diseño antes de la siguiente reunión...',
      color: 'text-blue-600'
    },
    { 
      value: 'milestone', 
      label: '🎯 Milestone', 
      placeholder: 'Ej: Primera fase del proyecto completada exitosamente...',
      color: 'text-purple-600'
    }
  ];

  const currentType = logTypes.find(t => t.value === type);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (description.trim()) {
      onSubmit({ type, description: description.trim() });
      setDescription('');
    }
  };

  // Templates rápidos según el tipo
  const getQuickTemplates = () => {
    const templates: Record<string, string[]> = {
      progreso: [
        'Email enviado, esperando respuesta',
        'Reunión completada exitosamente',
        'Documento enviado para revisión',
        'Llamada realizada, próximos pasos definidos'
      ],
      bloqueo: [
        'Esperando aprobación del cliente',
        'Falta información necesaria',
        'Dependencia externa pendiente',
        'Recursos no disponibles'
      ],
      nota: [
        'Recordar seguimiento en 3 días',
        'Revisar antes de la próxima reunión',
        'Contactar proveedor la próxima semana',
        'Preparar documentación adicional'
      ],
      milestone: [
        'Fase completada exitosamente',
        'Objetivo del sprint alcanzado',
        'Entregable aprobado por el cliente',
        'Hito del proyecto cumplido'
      ]
    };
    return templates[type] || [];
  };

  return (
    <Card className="p-4 bg-gray-50 border-dashed">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block text-gray-700">
            Tipo de entrada
          </label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {logTypes.map(logType => (
                <SelectItem key={logType.value} value={logType.value}>
                  <span className={logType.color}>{logType.label}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="text-sm font-medium mb-2 block text-gray-700">
            Descripción
          </label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={currentType?.placeholder || 'Describe la actividad...'}
            rows={3}
            className="bg-white resize-none"
          />
        </div>

        {/* Templates rápidos */}
        {getQuickTemplates().length > 0 && (
          <div>
            <label className="text-xs font-medium mb-1 block text-gray-600">
              Templates rápidos:
            </label>
            <div className="flex flex-wrap gap-1">
              {getQuickTemplates().map((template, index) => (
                <Button
                  key={index}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs h-6 px-2"
                  onClick={() => setDescription(template)}
                >
                  {template}
                </Button>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex gap-2 justify-end pt-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isSubmitting}
            size="sm"
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={!description.trim() || isSubmitting}
            size="sm"
          >
            {isSubmitting ? 'Añadiendo...' : 'Añadir Entrada'}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default TaskLogEntryForm;
