
import React, { useState } from 'react';
import { Task } from '@/hooks/useTasks';
import { useAIAssistantSimple } from '@/hooks/useAIAssistantSimple';
import MicrotaskItem from './MicrotaskItem';
import InlineTaskCreator from './InlineTaskCreator';
import TaskCreatorModal from './TaskCreatorModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Sparkles
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
  const { sendMessage } = useAIAssistantSimple();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'priority' | 'created' | 'duration'>('priority');
  const [showCompleted, setShowCompleted] = useState(true);

  // Debug: Log microtasks data
  console.log('🔍 MicrotaskList Debug:', {
    isExpanded,
    microtasksCount: microtasks.length,
    parentTaskId: parentTask?.id,
    parentTaskTitle: parentTask?.title,
    microtasks: microtasks.map(m => ({
      id: m.id,
      title: m.title,
      task_level: m.task_level,
      parent_task_id: m.parent_task_id,
      status: m.status
    }))
  });

  const handleCreateMicrotask = (data: { title?: string; description?: string; priority?: 'low' | 'medium' | 'high' | 'urgent'; estimated_duration?: number }) => {
    console.log('🔧 MicrotaskList handleCreateMicrotask:', data);
    onCreateMicrotask(data);
    setIsCreateModalOpen(false);
  };

  const handleCreateMicrotaskSimple = (title: string) => {
    console.log('🔧 MicrotaskList handleCreateMicrotaskSimple:', title);
    onCreateMicrotask({ title });
  };

  const handleDeleteMicrotask = async (taskId: string) => {
    console.log('🗑️ MicrotaskList handleDeleteMicrotask:', taskId);
    await onDeleteTask(taskId);
  };

  const handleAISuggestions = () => {
    if (parentTask) {
      sendMessage(
        `💡 ¿Puedes ayudarme a dividir la tarea "${parentTask.title}" en microtareas más específicas? Actualmente tiene ${microtasks.length} microtareas. La descripción de la tarea principal es: "${parentTask.description || 'Sin descripción'}"`
      );
    }
  };

  if (!isExpanded) {
    console.log('🔍 MicrotaskList not expanded, returning null');
    return null;
  }

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

  console.log('🔍 MicrotaskList rendering:', { 
    totalCount, 
    filteredCount: filteredMicrotasks.length,
    isExpanded 
  });

  return (
    <div className="mt-1 ml-3 pl-2 border-l border-purple-200 space-y-1">
      {/* Header ultra-compacto de Microtareas - Siempre visible cuando expandido */}
      <div className="bg-purple-50 rounded-sm px-2 py-1 border border-purple-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
            <h6 className="text-xs font-medium text-purple-800">
              Microtareas
            </h6>
            <Badge variant="outline" className="text-xs h-3 px-1">
              {completedCount}/{totalCount}
            </Badge>
            {/* Debug info en desarrollo */}
            {process.env.NODE_ENV === 'development' && (
              <span className="text-xs text-purple-600">
                🔍 {microtasks.length} encontradas
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            {totalCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleAISuggestions}
                className="h-4 px-1 text-xs text-purple-700 hover:bg-purple-100"
              >
                <Sparkles className="h-2 w-2 mr-1" />
                IA
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Controles compactos (solo si hay microtareas) */}
      {totalCount > 0 && (
        <div className="bg-white rounded-sm p-1 border border-gray-200 space-y-1">
          <div className="flex items-center gap-1">
            <div className="flex-1 relative">
              <Search className="absolute left-1 top-1/2 transform -translate-y-1/2 h-2 w-2 text-gray-400" />
              <Input
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-4 h-5 text-xs"
              />
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortBy(sortBy === 'priority' ? 'created' : sortBy === 'created' ? 'duration' : 'priority')}
              className="h-5 px-1 text-xs"
            >
              <ArrowUpDown className="h-2 w-2 mr-1" />
              {sortBy === 'priority' ? 'P' : sortBy === 'created' ? 'F' : 'D'}
            </Button>
            
            <Button
              variant={showCompleted ? "default" : "outline"}
              size="sm"
              onClick={() => setShowCompleted(!showCompleted)}
              className="h-5 px-1 text-xs"
            >
              <Filter className="h-2 w-2 mr-1" />
              {showCompleted ? 'Todas' : 'Activas'}
            </Button>
          </div>
        </div>
      )}

      {/* Lista de microtareas */}
      {filteredMicrotasks.length > 0 && (
        <div className="space-y-1">
          {filteredMicrotasks.map((microtask) => (
            <MicrotaskItem
              key={microtask.id}
              microtask={microtask}
              onUpdate={onUpdateTask}
              onDelete={handleDeleteMicrotask}
            />
          ))}
        </div>
      )}

      {/* Mensaje cuando no hay resultados de búsqueda */}
      {totalCount > 0 && filteredMicrotasks.length === 0 && (
        <div className="bg-gray-50 rounded-sm p-1 text-center">
          <p className="text-xs text-gray-500">
            No se encontraron microtareas
          </p>
        </div>
      )}

      {/* Mensaje cuando no hay microtareas */}
      {totalCount === 0 && (
        <div className="bg-purple-50 rounded-sm p-2 text-center border border-dashed border-purple-300">
          <p className="text-xs text-purple-600 mb-1">
            No hay microtareas aún
          </p>
          <p className="text-xs text-purple-500">
            Las microtareas te ayudan a dividir las subtareas en pasos más pequeños
          </p>
        </div>
      )}

      {/* Creador inline ultra-compacto - Siempre visible */}
      <div className="bg-gray-50 rounded-sm border border-dashed border-gray-300">
        <InlineTaskCreator
          placeholder="Añadir microtarea..."
          onCreateTask={handleCreateMicrotaskSimple}
          onOpenAdvanced={() => setIsCreateModalOpen(true)}
          size="sm"
        />
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
