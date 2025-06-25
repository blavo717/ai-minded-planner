
import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Task } from '@/hooks/useTasks';
import KanbanTaskCard from './KanbanTaskCard';

interface KanbanColumnProps {
  column: {
    id: string;
    title: string;
    status: Task['status'];
    color: string;
    icon: React.ReactNode;
  };
  tasks: Task[];
  getSubtasksForTask: (taskId: string) => Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onDragStart: (e: React.DragEvent, task: Task) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, targetStatus: Task['status']) => void;
  getProjectName: (projectId?: string) => string | null;
  getProjectColor: (projectId?: string) => string | null;
  getPriorityColor: (priority: Task['priority']) => string;
}

const KanbanColumn = memo(({
  column,
  tasks,
  getSubtasksForTask,
  onEditTask,
  onDeleteTask,
  onDragStart,
  onDragOver,
  onDrop,
  getProjectName,
  getProjectColor,
  getPriorityColor
}: KanbanColumnProps) => {
  const columnTasks = tasks.filter(task => task.status === column.status);

  return (
    <div className="space-y-4">
      <Card className={`${column.color} border-2`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center justify-between">
            <span className="flex items-center gap-2">
              {column.icon}
              {column.title}
            </span>
            <Badge variant="secondary" className="text-xs">
              {columnTasks.length}
            </Badge>
          </CardTitle>
        </CardHeader>
      </Card>

      <div 
        className="min-h-[400px] space-y-3"
        onDragOver={onDragOver}
        onDrop={(e) => onDrop(e, column.status)}
      >
        {columnTasks.map((task) => (
          <KanbanTaskCard
            key={task.id}
            task={task}
            subtasks={getSubtasksForTask(task.id)}
            onEditTask={onEditTask}
            onDeleteTask={onDeleteTask}
            onDragStart={onDragStart}
            getProjectName={getProjectName}
            getProjectColor={getProjectColor}
            getPriorityColor={getPriorityColor}
          />
        ))}
        
        {columnTasks.length === 0 && (
          <div className="text-center text-muted-foreground text-sm py-8">
            Sin tareas
          </div>
        )}
      </div>
    </div>
  );
});

KanbanColumn.displayName = 'KanbanColumn';

export default KanbanColumn;
