
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task } from '@/hooks/useTasks';

interface TaskCardExpandableContentProps {
  task: Task;
  isExpanded: boolean;
}

const TaskCardExpandableContent = ({
  task,
  isExpanded
}: TaskCardExpandableContentProps) => {
  return (
    <AnimatePresence>
      {isExpanded && task.description && (
        <motion.p 
          className="text-xs text-muted-foreground"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
        >
          {task.description}
        </motion.p>
      )}
    </AnimatePresence>
  );
};

export default TaskCardExpandableContent;
