
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Task } from '@/hooks/useTasks';
import { Project } from '@/hooks/useProjects';
import TaskBasicInfo from './TaskDetailSections/TaskBasicInfo';
import TaskHierarchy from './TaskDetailSections/TaskHierarchy';
import TaskActivity from './TaskDetailSections/TaskActivity';
import TaskAssignments from './TaskDetailSections/TaskAssignments';
import TaskAISummary from './TaskDetailSections/TaskAISummary';

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  allTasks: Task[];
  projects: Project[];
  onNavigateToPrevious?: () => void;
  onNavigateToNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

const TaskDetailModal = ({
  isOpen,
  onClose,
  task,
  allTasks,
  projects,
  onNavigateToPrevious,
  onNavigateToNext,
  hasPrevious = false,
  hasNext = false
}: TaskDetailModalProps) => {
  const [activeTab, setActiveTab] = useState('basic');

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowLeft' && hasPrevious) {
      onNavigateToPrevious?.();
    } else if (e.key === 'ArrowRight' && hasNext) {
      onNavigateToNext?.();
    }
  };

  const project = projects.find(p => p.id === task.project_id);
  const subtasks = allTasks.filter(t => t.parent_task_id === task.id);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
        onKeyDown={handleKeyDown}
      >
        <DialogHeader className="flex-shrink-0 border-b pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {hasPrevious && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onNavigateToPrevious}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              )}
              
              <div className="flex-1">
                <h2 className="text-xl font-semibold truncate max-w-96">
                  {task.title}
                </h2>
                {project && (
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: project.color || '#3B82F6' }}
                    />
                    {project.name}
                  </p>
                )}
              </div>

              {hasNext && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onNavigateToNext}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-5 flex-shrink-0">
              <TabsTrigger value="basic">Información</TabsTrigger>
              <TabsTrigger value="hierarchy">Subtareas</TabsTrigger>
              <TabsTrigger value="activity">Actividad</TabsTrigger>
              <TabsTrigger value="assignments">Asignaciones</TabsTrigger>
              <TabsTrigger value="ai">Análisis IA</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-hidden mt-4">
              <TabsContent 
                value="basic" 
                className="h-full overflow-y-auto data-[state=active]:flex data-[state=active]:flex-col"
              >
                <TaskBasicInfo task={task} project={project} />
              </TabsContent>

              <TabsContent 
                value="hierarchy" 
                className="h-full overflow-y-auto data-[state=active]:flex data-[state=active]:flex-col"
              >
                <TaskHierarchy task={task} subtasks={subtasks} allTasks={allTasks} />
              </TabsContent>

              <TabsContent 
                value="activity" 
                className="h-full overflow-y-auto data-[state=active]:flex data-[state=active]:flex-col"
              >
                <TaskActivity task={task} />
              </TabsContent>

              <TabsContent 
                value="assignments" 
                className="h-full overflow-y-auto data-[state=active]:flex data-[state=active]:flex-col"
              >
                <TaskAssignments task={task} />
              </TabsContent>

              <TabsContent 
                value="ai" 
                className="h-full overflow-y-auto data-[state=active]:flex data-[state=active]:flex-col"
              >
                <TaskAISummary task={task} />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetailModal;
