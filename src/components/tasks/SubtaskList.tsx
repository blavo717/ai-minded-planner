
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
  ChevronDown
} from 'lucide-react';
import { Task } from '@/hooks/useTasks';
import { useTaskMutations } from '@/hooks/useTaskMutations';

interface SubtaskListProps {
  parentTask: Task;
  subtasks: Task[];
  onCreateSubtask: (title: string) => void;
}

const SubtaskList = ({ parentTask, subtasks, onCreateSubtask }: SubtaskListProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const { updateTask, deleteTask } = useTaskMutations();

  const handleCreateSubtask = () => {
    if (newSubtaskTitle.trim()) {
      onCreateSubtask(newSubtaskTitle.trim());
      setNewSubtaskTitle('');
      setIsCreating(false);
    }
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
        <CardContent className="space-y-3">
          {subtasks.map((subtask) => (
            <div key={subtask.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3 flex-1">
                {getStatusIcon(subtask.status)}
                <div className="flex-1">
                  <h4 className="font-medium">{subtask.title}</h4>
                  {subtask.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {subtask.description}
                    </p>
                  )}
                </div>
                <Badge variant="outline" className="text-xs">
                  {getStatusText(subtask.status)}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2">
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
          ))}
          
          {/* Add new subtask */}
          <div className="border-t pt-3">
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

export default SubtaskList;
