
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Flag } from 'lucide-react';
import { Task } from '@/hooks/useTasks';
import ActivitySummary from './activity/ActivitySummary';
import CommunicationTracker from './activity/CommunicationTracker';
import QuickActions from './activity/QuickActions';
import ActivityHistory from './activity/ActivityHistory';

interface ActivityTrackerProps {
  task: Task;
}

const ActivityTracker = ({ task }: ActivityTrackerProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Actividad
            {task.needs_followup && (
              <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                <Flag className="h-3 w-3 mr-1" />
                Seguimiento
              </Badge>
            )}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Contraer' : 'Expandir'}
          </Button>
        </div>
        
        <ActivitySummary task={task} />
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-4">
          <ActivityHistory task={task} />
          <QuickActions task={task} />
          <CommunicationTracker taskId={task.id} />
        </CardContent>
      )}
    </Card>
  );
};

export default ActivityTracker;
