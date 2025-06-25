
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTaskDependencies } from '@/hooks/useTaskDependencies';
import { useTasks } from '@/hooks/useTasks';
import { Link2, AlertTriangle, Settings } from 'lucide-react';

interface TaskDependenciesProps {
  taskId: string;
  onManageDependencies: () => void;
}

const TaskDependencies = ({ taskId, onManageDependencies }: TaskDependenciesProps) => {
  const { dependencies, isLoading } = useTaskDependencies(taskId);
  const { tasks } = useTasks();

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
      </div>
    );
  }

  if (!dependencies || dependencies.length === 0) {
    return null;
  }

  const getDependencyTypeIcon = (type: string) => {
    switch (type) {
      case 'blocks':
        return <AlertTriangle className="h-3 w-3 text-red-500" />;
      case 'requires':
        return <Link2 className="h-3 w-3 text-blue-500" />;
      case 'follows':
        return <Link2 className="h-3 w-3 text-green-500" />;
      default:
        return <Link2 className="h-3 w-3 text-gray-500" />;
    }
  };

  const getDependencyTypeText = (type: string) => {
    switch (type) {
      case 'blocks':
        return 'Bloquea';
      case 'requires':
        return 'Requiere';
      case 'follows':
        return 'Sigue a';
      default:
        return type;
    }
  };

  const getTaskTitle = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    return task?.title || 'Tarea no encontrada';
  };

  const getTaskStatus = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    return task?.status || 'unknown';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="mt-3">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Link2 className="h-4 w-4" />
            Dependencias
          </span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onManageDependencies}
            className="h-6 w-6 p-0"
          >
            <Settings className="h-3 w-3" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {dependencies.map((dependency) => (
            <div key={dependency.id} className="flex items-center gap-2 text-sm">
              {getDependencyTypeIcon(dependency.dependency_type)}
              <span className="text-muted-foreground">
                {getDependencyTypeText(dependency.dependency_type)}:
              </span>
              <span className="font-medium flex-1">
                {getTaskTitle(dependency.depends_on_task_id)}
              </span>
              <Badge 
                variant="secondary" 
                className={`text-xs ${getStatusColor(getTaskStatus(dependency.depends_on_task_id))}`}
              >
                {getTaskStatus(dependency.depends_on_task_id)}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskDependencies;
