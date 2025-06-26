
import React, { useState } from 'react';
import { CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { Task } from '@/hooks/useTasks';
import SubtaskList from './SubtaskList';

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
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleCreateSubtaskClick('Nueva subtarea')}
            className="w-full flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Añadir subtarea
          </Button>
        )
      )}
    </CardContent>
  );
};

export default TaskCardContent;
