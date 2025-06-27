
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Archive, 
  Users, 
  Edit, 
  Trash2,
  Clock,
  Flag,
  GitBranch
} from 'lucide-react';
import { Task } from '@/hooks/useTasks';

interface QuickActionsBarProps {
  selectedTasks: Task[];
  onCompleteTask: (taskId: string) => void;
  onArchiveTask: (taskId: string) => void;
  onAssignTask: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onManageDependencies: (task: Task) => void;
  onMarkAsWorked: (taskId: string) => void;
  onToggleFollowup: (taskId: string) => void;
}

const QuickActionsBar = ({
  selectedTasks,
  onCompleteTask,
  onArchiveTask,
  onAssignTask,
  onEditTask,
  onDeleteTask,
  onManageDependencies,
  onMarkAsWorked,
  onToggleFollowup
}: QuickActionsBarProps) => {
  const isVisible = selectedTasks.length > 0;
  const isSingleTask = selectedTasks.length === 1;
  const task = selectedTasks[0];

  const barVariants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut",
        staggerChildren: 0.05
      }
    },
    exit: {
      opacity: 0,
      y: 50,
      scale: 0.95,
      transition: { duration: 0.2 }
    }
  };

  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 }
  };

  if (!isVisible) return null;

  return (
    <motion.div
      className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50"
      variants={barVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {selectedTasks.length} seleccionada{selectedTasks.length > 1 ? 's' : ''}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Actions para tareas individuales */}
            {isSingleTask && (
              <>
                {task.status !== 'completed' && (
                  <motion.div variants={buttonVariants}>
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => onCompleteTask(task.id)}
                      className="flex items-center gap-1"
                    >
                      <CheckCircle className="h-3 w-3" />
                      Completar
                    </Button>
                  </motion.div>
                )}

                <motion.div variants={buttonVariants}>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onMarkAsWorked(task.id)}
                    className="flex items-center gap-1"
                  >
                    <Clock className="h-3 w-3" />
                    Trabajado
                  </Button>
                </motion.div>

                <motion.div variants={buttonVariants}>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onToggleFollowup(task.id)}
                    className="flex items-center gap-1"
                  >
                    <Flag className="h-3 w-3" />
                    Seguimiento
                  </Button>
                </motion.div>

                <motion.div variants={buttonVariants}>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onAssignTask(task.id)}
                    className="flex items-center gap-1"
                  >
                    <Users className="h-3 w-3" />
                    Asignar
                  </Button>
                </motion.div>

                <motion.div variants={buttonVariants}>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEditTask(task)}
                    className="flex items-center gap-1"
                  >
                    <Edit className="h-3 w-3" />
                    Editar
                  </Button>
                </motion.div>

                <motion.div variants={buttonVariants}>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onManageDependencies(task)}
                    className="flex items-center gap-1"
                  >
                    <GitBranch className="h-3 w-3" />
                    Dependencias
                  </Button>
                </motion.div>
              </>
            )}

            {/* Actions para múltiples tareas */}
            <motion.div variants={buttonVariants}>
              <Button
                size="sm"
                variant="outline"
                onClick={() => selectedTasks.forEach(t => onArchiveTask(t.id))}
                className="flex items-center gap-1"
              >
                <Archive className="h-3 w-3" />
                Archivar
              </Button>
            </motion.div>

            <motion.div variants={buttonVariants}>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => selectedTasks.forEach(t => onDeleteTask(t.id))}
                className="flex items-center gap-1"
              >
                <Trash2 className="h-3 w-3" />
                Eliminar
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default QuickActionsBar;
