
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Trash2,
  ChevronRight,
  ChevronDown,
  Flag
} from 'lucide-react';
import { Task } from '@/hooks/useTasks';
import { useTaskMutations } from '@/hooks/useTaskMutations';
import { useTasks } from '@/hooks/useTasks';
import ActivityTracker from './ActivityTracker';

interface SubtaskListProps {
  parentTask: Task;
  subtasks: Task[];
  onCreateSubtask: (title: string) => void;
}

const SubtaskList = ({ parentTask, subtasks, onCreateSubtask }: SubtaskListProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [expandedSubtasks, setExpandedSubtasks] = useState<Set<string>>(new Set());
  const { updateTask, deleteTask, createMicrotask } = useTaskMutations();
  const { getMicrotasksForSubtask } = useTasks();

  const handleCreateSubtask = () => {
    if (newSubtaskTitle.trim()) {
      onCreateSubtask(newSubtaskTitle.trim());
      setNewSubtaskTitle('');
      setIsCreating(false);
    }
  };

  const handleCreateMicrotask = (subtaskId: string, title: string) => {
    if (title.trim()) {
      createMicrotask(subtaskId, title.trim());
    }
  };

  const toggleSubtaskExpansion = (subtaskId: string) => {
    const newExpanded = new Set(expandedSubtasks);
    if (newExpanded.has(subtaskId)) {
      newExpanded.delete(subtaskId);
    } else {
      newExpanded.add(subtaskId);
    }
    setExpandedSubtasks(newExpanded);
  };

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'pending':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: Task['status']) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'in_progress': return 'En Progreso';
      case 'completed': return 'Completada';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  const completedCount = subtasks.filter(task => task.status === 'completed').length;
  const progressPercentage = subtasks.length > 0 ? Math.round((completedCount / subtasks.length) * 100) : 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
            Subtareas ({completedCount}/{subtasks.length})
          </CardTitle>
          
          {subtasks.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{progressPercentage}%</span>
              <div className="w-20 h-2 bg-gray-200 rounded-full">
                <div 
                  className="h-full bg-green-500 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-4">
          {subtasks.map((subtask) => {
            const microtasks = getMicrotasksForSubtask(subtask.id);
            const isSubtaskExpanded = expandedSubtasks.has(subtask.id);
            const completedMicrotasks = microtasks.filter(m => m.status === 'completed').length;
            
            return (
              <div key={subtask.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    {getStatusIcon(subtask.status)}
                    <div className="flex-1">
                      <h4 className="font-medium flex items-center gap-2">
                        {subtask.title}
                        {subtask.needs_followup && (
                          <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                            <Flag className="h-3 w-3 mr-1" />
                            Seguimiento
                          </Badge>
                        )}
                      </h4>
                      {subtask.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {subtask.description}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {getStatusText(subtask.status)}
                      </Badge>
                      
                      {microtasks.length > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {completedMicrotasks}/{microtasks.length} microtareas
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {microtasks.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleSubtaskExpansion(subtask.id)}
                      >
                        {isSubtaskExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                    
                    {subtask.status !== 'completed' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateTask({ 
                          id: subtask.id, 
                          status: 'completed',
                          completed_at: new Date().toISOString()
                        })}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteTask(subtask.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Activity Tracker for Subtask */}
                <ActivityTracker task={subtask} />

                {/* Microtasks */}
                {isSubtaskExpanded && microtasks.length > 0 && (
                  <div className="ml-6 pl-4 border-l-2 border-gray-200 space-y-2">
                    <h5 className="text-sm font-medium text-gray-700">Microtareas</h5>
                    {microtasks.map((microtask) => (
                      <MicrotaskItem
                        key={microtask.id}
                        microtask={microtask}
                        onUpdate={updateTask}
                        onDelete={deleteTask}
                      />
                    ))}
                  </div>
                )}

                {/* Add Microtask */}
                <div className="ml-6 pl-4 border-l-2 border-gray-200">
                  <MicrotaskCreator
                    onCreateMicrotask={(title) => handleCreateMicrotask(subtask.id, title)}
                  />
                </div>
              </div>
            );
          })}
          
          {/* Add new subtask */}
          <div className="border-t pt-4">
            {isCreating ? (
              <div className="flex gap-2">
                <Input
                  placeholder="Título de la subtarea..."
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleCreateSubtask();
                    }
                  }}
                  autoFocus
                />
                <Button onClick={handleCreateSubtask} size="sm">
                  Crear
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsCreating(false);
                    setNewSubtaskTitle('');
                  }}
                  size="sm"
                >
                  Cancelar
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={() => setIsCreating(true)}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Añadir Subtarea
              </Button>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

// Componente para items de microtarea
const MicrotaskItem = ({ 
  microtask, 
  onUpdate, 
  onDelete 
}: { 
  microtask: Task; 
  onUpdate: (data: any) => void; 
  onDelete: (id: string) => void; 
}) => {
  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-3 w-3 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-3 w-3 text-blue-500" />;
      case 'pending':
        return <AlertTriangle className="h-3 w-3 text-yellow-500" />;
      default:
        return <Clock className="h-3 w-3 text-gray-500" />;
    }
  };

  return (
    <div className="flex items-center justify-between p-2 bg-gray-50 rounded border">
      <div className="flex items-center gap-2 flex-1">
        {getStatusIcon(microtask.status)}
        <span className="text-sm">{microtask.title}</span>
        {microtask.needs_followup && (
          <Badge variant="secondary" className="bg-orange-100 text-orange-700 text-xs">
            <Flag className="h-2 w-2 mr-1" />
          </Badge>
        )}
      </div>
      
      <div className="flex items-center gap-1">
        {microtask.status !== 'completed' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onUpdate({ 
              id: microtask.id, 
              status: 'completed',
              completed_at: new Date().toISOString()
            })}
            className="h-6 w-6 p-0"
          >
            <CheckCircle className="h-3 w-3" />
          </Button>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(microtask.id)}
          className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};

// Componente para crear microtareas
const MicrotaskCreator = ({ 
  onCreateMicrotask 
}: { 
  onCreateMicrotask: (title: string) => void; 
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');

  const handleCreate = () => {
    if (title.trim()) {
      onCreateMicrotask(title.trim());
      setTitle('');
      setIsCreating(false);
    }
  };

  if (!isCreating) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsCreating(true)}
        className="text-xs text-gray-600 hover:text-gray-800"
      >
        <Plus className="h-3 w-3 mr-1" />
        Añadir Microtarea
      </Button>
    );
  }

  return (
    <div className="flex gap-2">
      <Input
        placeholder="Título de la microtarea..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            handleCreate();
          }
        }}
        className="text-xs"
        size="sm"
        autoFocus
      />
      <Button onClick={handleCreate} size="sm" className="text-xs">
        Crear
      </Button>
      <Button 
        variant="outline" 
        onClick={() => {
          setIsCreating(false);
          setTitle('');
        }}
        size="sm"
        className="text-xs"
      >
        Cancelar
      </Button>
    </div>
  );
};

export default SubtaskList;
