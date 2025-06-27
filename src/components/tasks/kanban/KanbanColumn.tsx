
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
  onDragEnd: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragEnter: () => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent, targetStatus: Task['status']) => void;
  getProjectName: (projectId?: string) => string | null;
  getProjectColor: (projectId?: string) => string | null;
  getPriorityColor: (priority: Task['priority']) => string;
  isDragOver: boolean;
}

const KanbanColumn = memo(({
  column,
  tasks,
  getSubtasksForTask,
  onEditTask,
  onDeleteTask,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragEnter,
  onDragLeave,
  onDrop,
  getProjectName,
  getProjectColor,
  getPriorityColor,
  isDragOver
}: KanbanColumnProps) => {
  const columnTasks = tasks.filter(task => task.status === column.status);

  return (
    <div className="space-y-4 animate-fade-in">
      <Card className={`${column.color} border-2 transition-all duration-200 ${
        isDragOver ? 'border-blue-400 bg-blue-50' : ''
      }`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center justify-between">
            <span className="flex items-center gap-2">
              {column.icon}
              {column.title}
            </span>
            <Badge variant="secondary" className="text-xs transition-all duration-200">
              {columnTasks.length}
            </Badge>
          </CardTitle>
        </CardHeader>
      </Card>

      <div 
        className={`min-h-[400px] space-y-3 p-2 rounded-lg transition-all duration-200 ${
          isDragOver ? 'bg-blue-50/50 border-2 border-dashed border-blue-300' : ''
        }`}
        onDragOver={onDragOver}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDrop={(e) => onDrop(e, column.status)}
      >
        {columnTasks.map((task, index) => (
          <div
            key={task.id}
            className="animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <KanbanTaskCard
              task={task}
              subtasks={getSubtasksForTask(task.id)}
              onEditTask={onEditTask}
              onDeleteTask={onDeleteTask}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              getProjectName={getProjectName}
              getProjectColor={getProjectColor}
              getPriorityColor={getPriorityColor}
            />
          </div>
        ))}
        
        {columnTasks.length === 0 && (
          <div className="text-center text-muted-foreground text-sm py-8 transition-all duration-200">
            <div className={`${isDragOver ? 'text-blue-600' : ''}`}>
              {isDragOver ? 'Suelta aquí la tarea' : 'Sin tareas'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

KanbanColumn.displayName = 'KanbanColumn';

export default KanbanColumn;
