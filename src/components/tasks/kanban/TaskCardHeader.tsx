
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Eye, EyeOff } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Task } from '@/hooks/useTasks';

interface TaskCardHeaderProps {
  task: Task;
  isExpanded: boolean;
  getPriorityColor: (priority: Task['priority']) => string;
  onToggleExpanded: () => void;
  onEditTask: () => void;
  onDeleteTask: () => void;
}

const TaskCardHeader = ({
  task,
  isExpanded,
  getPriorityColor,
  onToggleExpanded,
  onEditTask,
  onDeleteTask
}: TaskCardHeaderProps) => {
  return (
    <div className="flex items-start justify-between">
      <motion.h4 
        className="font-medium text-sm leading-tight flex-1 pr-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {task.title}
      </motion.h4>
      
      <div className="flex items-center gap-2">
        <motion.div
          className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`}
          whileHover={{ scale: 1.2 }}
          transition={{ duration: 0.2 }}
        />
        
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
          onClick={onToggleExpanded}
        >
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            {isExpanded ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
          </motion.div>
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-60 hover:opacity-100">
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEditTask}>
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={onDeleteTask}
              className="text-red-600"
            >
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default TaskCardHeader;
