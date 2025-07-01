
import React, { memo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { Task } from '@/hooks/useTasks';
import { Project } from '@/hooks/useProjects';
import CompactSubtaskList from './CompactSubtaskList';
import TaskActivityLogModal from './TaskActivityLogModal';
import { useTaskMutations } from '@/hooks/useTaskMutations';
import CompactTaskCardHeader from './compact/CompactTaskCardHeader';
import CompactTaskCardMetadata from './compact/CompactTaskCardMetadata';
import CompactTaskCardActions from './compact/CompactTaskCardActions';

interface CompactTaskCardProps {
  task: Task;
  subtasks: Task[];
  project?: Project;
  onEditTask: (task: Task) => void;
  onManageDependencies: (task: Task) => void;
  onAssignTask: (task: Task) => void;
  onCompleteTask: (task: Task) => void;
  onArchiveTask: (taskId: string) => void;
  onCreateSubtask: (parentTaskId: string, title: string) => void;
  getSubtasksForTask: (taskId: string) => Task[];
}

const CompactTaskCard = memo(({ 
  task, 
  subtasks, 
  project,
  onEditTask, 
  onManageDependencies,
  onAssignTask,
  onCompleteTask,
  onArchiveTask,
  onCreateSubtask,
  getSubtasksForTask
}: CompactTaskCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedLogTask, setSelectedLogTask] = useState<Task | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { updateTask } = useTaskMutations();

  const completedSubtasks = subtasks.filter(st => st.status === 'completed').length;
  const totalSubtasks = subtasks.length;
  const isCompleted = task.status === 'completed';
  const hasSubtasks = totalSubtasks > 0;
  const showProgress = totalSubtasks > 0;

  const getPriorityColor = () => {
    switch (task.priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-300';
    }
  };

  const handleToggleComplete = (checked: boolean) => {
    if (checked) {
      onCompleteTask(task);
    }
  };

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleDoubleClickTitle = () => {
    setIsEditingTitle(true);
    setEditTitle(task.title);
  };

  const handleSaveTitle = () => {
    if (editTitle.trim() && editTitle.trim() !== task.title) {
      updateTask({
        id: task.id,
        title: editTitle.trim()
      });
    }
    setIsEditingTitle(false);
  };

  const handleCancelEdit = () => {
    setEditTitle(task.title);
    setIsEditingTitle(false);
  };

  const handleCreateSubtaskAndKeepOpen = () => {
    onCreateSubtask(task.id, 'Nueva subtarea');
    // No cerramos el dropdown aquí
  };

  return (
    <>
      <div className="space-y-0">
        <Card 
          className={`border-l-4 transition-all duration-200 group hover:shadow-md ${
            isCompleted ? 'bg-gray-50 opacity-75' : 'bg-white hover:bg-gray-50'
          }`}
          style={{ borderLeftColor: project?.color || getPriorityColor().replace('bg-', '#') }}
        >
          <div className="py-4 px-6">
            <CompactTaskCardHeader
              task={task}
              isCompleted={isCompleted}
              isExpanded={isExpanded}
              isEditingTitle={isEditingTitle}
              editTitle={editTitle}
              onToggleComplete={handleToggleComplete}
              onToggleExpand={handleToggleExpand}
              onDoubleClickTitle={handleDoubleClickTitle}
              onEditTitleChange={setEditTitle}
              onSaveTitle={handleSaveTitle}
              onCancelEdit={handleCancelEdit}
            />

            {/* Contenido principal - APROVECHA EL ANCHO COMPLETO */}
            <div className="flex-1 min-w-0 flex items-center justify-between gap-6 mt-2">
              {/* Metadata horizontal - APROVECHA EL ESPACIO EXTRA */}
              <CompactTaskCardMetadata task={task} project={project} />

              {/* Indicadores de estado y acciones */}
              <CompactTaskCardActions
                task={task}
                completedSubtasks={completedSubtasks}
                totalSubtasks={totalSubtasks}
                showProgress={showProgress}
                dropdownOpen={dropdownOpen}
                onDropdownOpenChange={setDropdownOpen}
                onLogClick={setSelectedLogTask}
                onEditTask={() => onEditTask(task)}
                onCreateSubtask={handleCreateSubtaskAndKeepOpen}
                onManageDependencies={() => onManageDependencies(task)}
                onAssignTask={() => onAssignTask(task)}
                onArchiveTask={() => onArchiveTask(task.id)}
              />
            </div>
          </div>
        </Card>

        {/* Lista expandible de subtareas */}
        {isExpanded && (
          hasSubtasks ? (
            <CompactSubtaskList
              parentTask={task}
              subtasks={subtasks}
              onCreateSubtask={onCreateSubtask}
              onEditTask={onEditTask}
              getSubtasksForTask={getSubtasksForTask}
            />
          ) : (
            <div className="ml-12 border-l-2 border-gray-200 pl-6 py-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onCreateSubtask(task.id, 'Nueva subtarea')}
                className="h-7 text-xs text-gray-500 hover:text-gray-700 justify-start w-full"
              >
                <ChevronRight className="h-3 w-3 mr-1" />
                Añadir subtarea
              </Button>
            </div>
          )
        )}
      </div>

      {/* Modal de Log de Actividad */}
      {selectedLogTask && (
        <TaskActivityLogModal
          taskId={selectedLogTask.id}
          taskTitle={selectedLogTask.title}
          isOpen={true}
          onClose={() => setSelectedLogTask(null)}
        />
      )}
    </>
  );
});

CompactTaskCard.displayName = 'CompactTaskCard';

export default CompactTaskCard;
