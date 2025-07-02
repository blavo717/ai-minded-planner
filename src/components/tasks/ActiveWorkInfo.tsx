import React from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Task } from '@/hooks/useTasks';

interface ActiveWorkInfoProps {
  task: Task;
}

const ActiveWorkInfo: React.FC<ActiveWorkInfoProps> = ({ task }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-xl">{task.title}</CardTitle>
              <Badge variant="outline" className="text-xs">
                Nivel {task.task_level}
              </Badge>
            </div>
            {task.description && (
              <p className="text-muted-foreground">{task.description}</p>
            )}
          </div>
          <Badge variant={getPriorityColor(task.priority)}>
            {task.priority}
          </Badge>
        </div>
      </CardHeader>
    </Card>
  );
};

export default ActiveWorkInfo;