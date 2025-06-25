
import React, { useState } from 'react';
import { Task } from '@/hooks/useTasks';
import { useAIAssistant } from '@/hooks/useAIAssistant';
import MicrotaskItem from './MicrotaskItem';
import TaskCreator from './TaskCreator';
import TaskCreatorModal from './TaskCreatorModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Sparkles,
  Plus
} from 'lucide-react';

interface MicrotaskListProps {
  microtasks: Task[];
  isExpanded: boolean;
  onUpdateTask: (data: any) => void;
  onDeleteTask: (id: string) => void;
  onCreateMicrotask: (data: { title?: string; description?: string; priority?: 'low' | 'medium' | 'high' | 'urgent'; estimated_duration?: number }) => void;
  parentTask?: Task;
}

const MicrotaskList = ({ 
  microtasks, 
  isExpanded, 
  onUpdateTask, 
  onDeleteTask, 
  onCreateMicrotask,
  parentTask 
}: MicrotaskListProps) => {
  const { addSuggestion } = useAIAssistant();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'priority' | 'created' | 'duration'>('priority');
  const [showCompleted, setShowCompleted] = useState(true);

  const handleCreateMicrotask = (data: { title?: string; description?: string; priority?: 'low' | 'medium' | 'high' | 'urgent'; estimated_duration?: number }) => {
    onCreateMicrotask(data);
    setIsCreateModalOpen(false);
  };

  const handleAISuggestions = () => {
    if (parentTask) {
      addSuggestion(
        `💡 ¿Necesitas ayuda para dividir "${parentTask.title}" en microtareas más específicas? Puedo sugerir una estructura detallada basada en la descripción de la tarea.`,
        'medium',
        { 
          type: 'microtask_suggestions', 
          parentTask: parentTask,
          currentMicrotasks: microtasks 
        }
      );
    }
  };

  // Si la subtarea no está expandida, no mostrar nada
  if (!isExpanded) return null;

  // Filtrar y ordenar microtareas
  const filteredMicrotasks = microtasks
    .filter(task => {
      if (!showCompleted && task.status === 'completed') return false;
      if (!searchTerm) return true;
      return task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
             task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          const priorities = { urgent: 4, high: 3, medium: 2, low: 1 };
          return priorities[b.priority] - priorities[a.priority];
        case 'created':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'duration':
          return (b.estimated_duration || 0) - (a.estimated_duration || 0);
        default:
          return 0;
      }
    });

  const completedCount = microtasks.filter(t => t.status === 'completed').length;
  const totalCount = microtasks.length;

  return (
    <div className="space-y-3">
      {/* Sección de microtareas con fondo blanco profesional */}
      <div className="ml-6 pl-4 border-l-2 border-gray-200 space-y-3">
        {/* Header de Microtareas mejorado */}
        <div className="bg-purple-100 rounded-lg px-3 py-2 border border-purple-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <h5 className="text-sm font-semibold text-purple-800">
                Microtareas
              </h5>
              {totalCount > 0 && (
                <Badge variant="outline" className="text-xs">
                  {completedCount}/{totalCount}
                </Badge>
              )}
            </div>
            
            {totalCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleAISuggestions}
                className="h-6 px-2 text-xs text-purple-700 hover:bg-purple-200"
              >
                <Sparkles className="h-3 w-3 mr-1" />
                Sugerencias IA
              </Button>
            )}
          </div>
        </div>

        {/* Controles de filtro y búsqueda (solo si hay microtareas) */}
        {totalCount > 0 && (
          <div className="bg-white rounded-lg p-3 border border-gray-200 space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                <Input
                  placeholder="Buscar microtareas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-7 h-7 text-xs"
                />
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortBy(sortBy === 'priority' ? 'created' : sortBy === 'created' ? 'duration' : 'priority')}
                className="h-7 px-2 text-xs"
              >
                <ArrowUpDown className="h-3 w-3 mr-1" />
                {sortBy === 'priority' ? 'Prioridad' : sortBy === 'created' ? 'Fecha' : 'Duración'}
              </Button>
              
              <Button
                variant={showCompleted ? "default" : "outline"}
                size="sm"
                onClick={() => setShowCompleted(!showCompleted)}
                className="h-7 px-2 text-xs"
              >
                <Filter className="h-3 w-3 mr-1" />
                {showCompleted ? 'Todas' : 'Activas'}
              </Button>
            </div>
          </div>
        )}

        {/* Lista de microtareas existentes con fondo blanco */}
        {filteredMicrotasks.length > 0 && (
          <div className="space-y-2">
            {filteredMicrotasks.map((microtask) => (
              <MicrotaskItem
                key={microtask.id}
                microtask={microtask}
                onUpdate={onUpdateTask}
                onDelete={onDeleteTask}
              />
            ))}
          </div>
        )}

        {/* Mensaje cuando no hay resultados de búsqueda */}
        {totalCount > 0 && filteredMicrotasks.length === 0 && (
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-500">
              No se encontraron microtareas que coincidan con "{searchTerm}"
            </p>
          </div>
        )}

        {/* Botón para añadir microtarea con fondo blanco */}
        <div className="bg-gray-50 rounded-lg p-2 border border-dashed border-gray-300">
          <TaskCreator
            placeholder="Añadir microtarea..."
            buttonText="+ Añadir Microtarea"
            onCreateTask={() => setIsCreateModalOpen(true)}
            size="sm"
          />
        </div>
      </div>

      {/* Modal para crear microtarea */}
      <TaskCreatorModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateTask={handleCreateMicrotask}
        isCreating={false}
        taskLevel="microtarea"
      />
    </div>
  );
};

export default MicrotaskList;
