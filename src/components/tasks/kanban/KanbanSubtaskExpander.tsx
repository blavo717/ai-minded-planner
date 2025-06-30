
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Circle, 
  Edit, 
  Trash2, 
  Plus,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { Task } from '@/hooks/useTasks';
import { useTaskMutations } from '@/hooks/useTaskMutations';
import { toast } from '@/hooks/use-toast';
import KanbanMicrotaskViewer from './KanbanMicrotaskViewer';

interface KanbanSubtaskExpanderProps {
  parentTask: Task;
  subtasks: Task[];
  isExpanded: boolean;
  showCreateForm: boolean;
  onCloseCreateForm: () => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

const KanbanSubtaskExpander = ({ 
  parentTask,
  subtasks,
  isExpanded,
  showCreateForm,
  onCloseCreateForm,
  onEditTask,
  onDeleteTask
}: KanbanSubtaskExpanderProps) => {
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [expandedMicrotasks, setExpandedMicrotasks] = useState<Set<string>>(new Set());
  const { createTask, updateTask } = useTaskMutations();

  const handleCreateSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;

    try {
      await createTask({
        title: newSubtaskTitle,
        parent_task_id: parentTask.id,
        project_id: parentTask.project_id,
        status: 'pending',
        priority: 'medium',
        task_level: (parentTask.task_level || 1) + 1
      });
      
      setNewSubtaskTitle('');
      onCloseCreateForm();
      
      toast({
        title: "Subtarea creada",
        description: "La subtarea se ha creado exitosamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear la subtarea",
        variant: "destructive"
      });
    }
  };

  const handleToggleSubtaskStatus = async (subtask: Task) => {
    const newStatus = subtask.status === 'completed' ? 'pending' : 'completed';
    
    try {
      await updateTask({
        id: subtask.id,
        status: newStatus,
        completed_at: newStatus === 'completed' ? new Date().toISOString() : undefined
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar la subtarea",
        variant: "destructive"
      });
    }
  };

  const toggleMicrotaskExpansion = (subtaskId: string) => {
    const newExpanded = new Set(expandedMicrotasks);
    if (newExpanded.has(subtaskId)) {
      newExpanded.delete(subtaskId);
    } else {
      newExpanded.add(subtaskId);
    }
    setExpandedMicrotasks(newExpanded);
  };

  // Get microtasks for each subtask (task_level 3)
  const getMicrotasksForSubtask = (subtaskId: string) => {
    return subtasks.filter(task => 
      task.parent_task_id === subtaskId && task.task_level === 3
    );
  };

  const subtasksLevel2 = subtasks.filter(task => task.task_level === 2);

  return (
    <AnimatePresence>
      {(isExpanded || showCreateForm) && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <div className="border-t pt-3 mt-3">
            {/* Create subtask form */}
            {showCreateForm && (
              <form onSubmit={handleCreateSubtask} className="mb-3">
                <div className="flex gap-2">
                  <Input
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    placeholder="Título de la subtarea..."
                    className="flex-1 h-8 text-xs"
                    autoFocus
                  />
                  <Button type="submit" size="sm" className="h-8 text-xs">
                    Crear
                  </Button>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 text-xs"
                    onClick={onCloseCreateForm}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            )}

            {/* Subtasks list */}
            {isExpanded && (
              <div className="space-y-2">
                {subtasksLevel2.map((subtask) => {
                  const microtasks = getMicrotasksForSubtask(subtask.id);
                  const isExpandedMicrotasks = expandedMicrotasks.has(subtask.id);
                  
                  return (
                    <div key={subtask.id} className="bg-gray-50 rounded p-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0"
                            onClick={() => handleToggleSubtaskStatus(subtask)}
                          >
                            {subtask.status === 'completed' ? 
                              <CheckCircle className="h-3 w-3 text-green-600" /> : 
                              <Circle className="h-3 w-3 text-gray-400" />
                            }
                          </Button>
                          
                          <span className={`text-xs flex-1 ${
                            subtask.status === 'completed' ? 'line-through text-gray-500' : ''
                          }`}>
                            {subtask.title}
                          </span>
                          
                          {microtasks.length > 0 && (
                            <Badge variant="outline" className="text-xs h-4">
                              {microtasks.filter(m => m.status === 'completed').length}/{microtasks.length}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1">
                          {microtasks.length > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0"
                              onClick={() => toggleMicrotaskExpansion(subtask.id)}
                            >
                              {isExpandedMicrotasks ? 
                                <ChevronDown className="h-2 w-2" /> : 
                                <ChevronRight className="h-2 w-2" />
                              }
                            </Button>
                          )}
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0"
                            onClick={() => onEditTask(subtask)}
                          >
                            <Edit className="h-2 w-2" />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0 text-red-600"
                            onClick={() => onDeleteTask(subtask.id)}
                          >
                            <Trash2 className="h-2 w-2" />
                          </Button>
                        </div>
                      </div>

                      {/* Microtasks section */}
                      <AnimatePresence>
                        {isExpandedMicrotasks && microtasks.length > 0 && (
                          <KanbanMicrotaskViewer
                            parentSubtask={subtask}
                            microtasks={microtasks}
                            onEditTask={onEditTask}
                            onDeleteTask={onDeleteTask}
                          />
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
                
                {subtasksLevel2.length === 0 && !showCreateForm && (
                  <p className="text-xs text-gray-500 text-center py-2">
                    No hay subtareas aún
                  </p>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default KanbanSubtaskExpander;
