
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Task } from '@/hooks/useTasks';
import MatrixTaskCard from './MatrixTaskCard';

interface MatrixQuadrantProps {
  title: string;
  description: string;
  tasks: Task[];
  color: string;
  onEditTask: (task: Task) => void;
  onCompleteTask: (task: Task) => void;
  onDrop: (task: Task) => void;
  onDragOver: (e: React.DragEvent) => void;
}

const MatrixQuadrant = ({ 
  title, 
  description, 
  tasks, 
  color, 
  onEditTask, 
  onCompleteTask,
  onDrop,
  onDragOver
}: MatrixQuadrantProps) => {
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const taskData = e.dataTransfer.getData('text/plain');
    if (taskData) {
      const task = JSON.parse(taskData);
      onDrop(task);
    }
  };

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    e.dataTransfer.setData('text/plain', JSON.stringify(task));
  };

  return (
    <Card 
      className={`h-full min-h-96 ${color}`}
      onDrop={handleDrop}
      onDragOver={onDragOver}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          <Badge variant="outline" className="text-xs">
            {tasks.length}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {tasks.map((task) => (
            <div
              key={task.id}
              draggable
              onDragStart={(e) => handleDragStart(e, task)}
            >
              <MatrixTaskCard
                task={task}
                onEditTask={onEditTask}
                onCompleteTask={onCompleteTask}
              />
            </div>
          ))}
          
          {tasks.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No hay tareas en este cuadrante</p>
              <p className="text-xs mt-1">Arrastra tareas aquí para clasificarlas</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MatrixQuadrant;
