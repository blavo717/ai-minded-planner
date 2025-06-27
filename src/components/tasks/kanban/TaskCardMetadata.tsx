
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Calendar, Timer, Tag } from 'lucide-react';
import { Task } from '@/hooks/useTasks';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface TaskCardMetadataProps {
  task: Task;
  subtasks: Task[];
  projectName: string | null;
  projectColor: string | null;
  isExpanded: boolean;
}

const TaskCardMetadata = ({
  task,
  subtasks,
  projectName,
  projectColor,
  isExpanded
}: TaskCardMetadataProps) => {
  const completedSubtasks = subtasks.filter(s => s.status === 'completed').length;

  return (
    <motion.div 
      className="space-y-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      {/* Project badge */}
      {projectName && (
        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <Badge variant="outline" className="text-xs flex items-center gap-1 w-fit">
            <motion.div 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: projectColor || '#3B82F6' }}
              whileHover={{ scale: 1.2 }}
            />
            {projectName}
          </Badge>
        </motion.div>
      )}

      {/* Subtasks progress */}
      {subtasks.length > 0 && (
        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <Badge variant="outline" className="text-xs w-fit">
            {completedSubtasks}/{subtasks.length} subtareas
          </Badge>
        </motion.div>
      )}

      {/* Time and date info */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {task.due_date && (
          <motion.div 
            className="flex items-center gap-1"
            whileHover={{ scale: 1.05 }}
          >
            <Calendar className="h-3 w-3" />
            {format(new Date(task.due_date), 'dd MMM', { locale: es })}
          </motion.div>
        )}
        {task.estimated_duration && (
          <motion.div 
            className="flex items-center gap-1"
            whileHover={{ scale: 1.05 }}
          >
            <Timer className="h-3 w-3" />
            {task.estimated_duration}m
          </motion.div>
        )}
      </div>

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <AnimatePresence>
          <motion.div 
            className="flex flex-wrap gap-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {(isExpanded ? task.tags : task.tags.slice(0, 2)).map((tag, index) => (
              <motion.div
                key={tag}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.1 }}
              >
                <Badge variant="secondary" className="text-xs flex items-center gap-1">
                  <Tag className="h-2 w-2" />
                  {tag}
                </Badge>
              </motion.div>
            ))}
            {!isExpanded && task.tags.length > 2 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ scale: 1.1 }}
              >
                <Badge variant="secondary" className="text-xs">
                  +{task.tags.length - 2}
                </Badge>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </motion.div>
  );
};

export default TaskCardMetadata;
