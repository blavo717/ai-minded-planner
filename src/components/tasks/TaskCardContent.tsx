
import React, { useState } from 'react';
import { CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Task } from '@/hooks/useTasks';
import SubtaskList from './subtasks/SubtaskList';
import InlineTaskCreator from './subtasks/InlineTaskCreator';

interface TaskCardContentProps {
  task: Task;
  subtasks: Task[];
  totalSubtasks: number;
  isCompleted: boolean;
  onCreateSubtask: (title: string) => void;
}

const TaskCardContent = ({ 
  task, 
  subtasks, 
  totalSubtasks, 
  isCompleted, 
  onCreateSubtask 
}: TaskCardContentProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleCreateSubtaskClick = (title: string) => {
    onCreateSubtask(title);
  };

  return (
    <CardContent className="pt-0">
      {totalSubtasks > 0 ? (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full justify-between p-2 h-auto"
            >
              <span className="flex items-center gap-2">
                {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                Ver subtareas ({totalSubtasks})
              </span>
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="mt-2">
            <SubtaskList
              parentTask={task}
              subtasks={subtasks}
              onCreateSubtask={handleCreateSubtaskClick}
            />
          </CollapsibleContent>
        </Collapsible>
      ) : (
        !isCompleted && (
          <div className="border border-dashed border-gray-300 rounded-md">
            <InlineTaskCreator
              placeholder="Añadir primera subtarea..."
              onCreateTask={handleCreateSubtaskClick}
            />
          </div>
        )
      )}
    </CardContent>
  );
};

export default TaskCardContent;
