
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  CheckCircle, 
  Circle, 
  Edit, 
  Trash2, 
  Plus
} from 'lucide-react';
import { Task } from '@/hooks/useTasks';
import { useTaskMutations } from '@/hooks/useTaskMutations';
import { toast } from '@/hooks/use-toast';

interface KanbanMicrotaskViewerProps {
  parentSubtask: Task;
  microtasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

const KanbanMicrotaskViewer = ({ 
  parentSubtask,
  microtasks,
  onEditTask,
  onDeleteTask
}: KanbanMicrotaskViewerProps) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newMicrotaskTitle, setNewMicrotaskTitle] = useState('');
  const { createTask, updateTask } = useTaskMutations();

  const handleCreateMicrotask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMicrotaskTitle.trim()) return;

    try {
      await createTask({
        title: newMicrotaskTitle,
        parent_task_id: parentSubtask.id,
        project_id: parentSubtask.project_id,
        status: 'pending',
        priority: 'low',
        task_level: 3
      });
      
      setNewMicrotaskTitle('');
      setShowCreateForm(false);
      
      toast({
        title: "Microtarea creada",
        description: "La microtarea se ha creado exitosamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear la microtarea",
        variant: "destructive"
      });
    }
  };

  const handleToggleMicrotaskStatus = async (microtask: Task) => {
    const newStatus = microtask.status === 'completed' ? 'pending' : 'completed';
    
    try {
      await updateTask({
        id: microtask.id,
        status: newStatus,
        completed_at: newStatus === 'completed' ? new Date().toISOString() : undefined
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar la microtarea",
        variant: "destructive"
      });
    }
  };

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="ml-4 mt-2"
    >
      <div className="border-l-2 border-gray-200 pl-3">
        {/* Create microtask form */}
        {showCreateForm && (
          <form onSubmit={handleCreateMicrotask} className="mb-2">
            <div className="flex gap-1">
              <Input
                value={newMicrotaskTitle}
                onChange={(e) => setNewMicrotaskTitle(e.target.value)}
                placeholder="Microtarea..."
                className="flex-1 h-6 text-xs"
                autoFocus
              />
              <Button type="submit" size="sm" className="h-6 text-xs px-2">
                +
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                className="h-6 text-xs px-2"
                onClick={() => setShowCreateForm(false)}
              >
                ×
              </Button>
            </div>
          </form>
        )}

        {/* Microtasks list */}
        <div className="space-y-1">
          {microtasks.map((microtask) => (
            <div key={microtask.id} className="flex items-center justify-between bg-white rounded px-2 py-1 border">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-3 w-3 p-0 flex-shrink-0"
                  onClick={() => handleToggleMicrotaskStatus(microtask)}
                >
                  {microtask.status === 'completed' ? 
                    <CheckCircle className="h-2 w-2 text-green-600" /> : 
                    <Circle className="h-2 w-2 text-gray-400" />
                  }
                </Button>
                
                <span className={`text-xs truncate ${
                  microtask.status === 'completed' ? 'line-through text-gray-500' : ''
                }`}>
                  {microtask.title}
                </span>
              </div>
              
              <div className="flex items-center gap-1 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-3 w-3 p-0"
                  onClick={() => onEditTask(microtask)}
                >
                  <Edit className="h-2 w-2" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-3 w-3 p-0 text-red-600"
                  onClick={() => onDeleteTask(microtask.id)}
                >
                  <Trash2 className="h-2 w-2" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Add microtask button */}
        {!showCreateForm && (
          <Button
            variant="ghost"
            size="sm"
            className="h-5 w-full text-xs text-gray-500 mt-1"
            onClick={() => setShowCreateForm(true)}
          >
            <Plus className="h-2 w-2 mr-1" />
            Agregar microtarea
          </Button>
        )}
      </div>
    </motion.div>
  );
};

export default KanbanMicrotaskViewer;
