
import React, { memo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MoreHorizontal, 
  Calendar, 
  Timer, 
  Tag,
  Eye,
  EyeOff
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Task } from '@/hooks/useTasks';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface AnimatedKanbanTaskCardProps {
  task: Task;
  subtasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onDragStart: (e: React.DragEvent, task: Task) => void;
  getProjectName: (projectId?: string) => string | null;
  getProjectColor: (projectId?: string) => string | null;
  getPriorityColor: (priority: Task['priority']) => string;
}

const AnimatedKanbanTaskCard = memo(({ 
  task,
  subtasks,
  onEditTask,
  onDeleteTask,
  onDragStart,
  getProjectName,
  getProjectColor,
  getPriorityColor
}: AnimatedKanbanTaskCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const completedSubtasks = subtasks.filter(s => s.status === 'completed').length;
  const projectName = getProjectName(task.project_id);
  const projectColor = getProjectColor(task.project_id);

  const cardVariants = {
    idle: { 
      scale: 1, 
      rotateY: 0,
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    },
    hover: { 
      scale: 1.02, 
      rotateY: 2,
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      transition: { duration: 0.2 }
    },
    dragging: {
      scale: 1.05,
      rotateZ: 5,
      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.25)',
      zIndex: 50
    },
    tap: {
      scale: 0.98
    }
  };

  const contentVariants = {
    collapsed: { 
      height: 'auto',
      opacity: 1
    },
    expanded: { 
      height: 'auto',
      opacity: 1,
      transition: { duration: 0.3 }
    }
  };

  const handleDragStart = useCallback((e: React.DragEvent) => {
    setIsDragging(true);
    onDragStart(e, task);
  }, [onDragStart, task]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleEditTask = useCallback(() => {
    onEditTask(task);
  }, [onEditTask, task]);

  const handleDeleteTask = useCallback(() => {
    onDeleteTask(task.id);
  }, [onDeleteTask, task.id]);

  const toggleExpanded = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  return (
    <motion.div
      variants={cardVariants}
      initial="idle"
      animate={isDragging ? "dragging" : "idle"}
      whileHover="hover"
      whileTap="tap"
      layout
      transition={{ duration: 0.2 }}
    >
      <Card 
        className="mb-3 cursor-move bg-white overflow-hidden"
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <CardContent className="p-4">
          <motion.div 
            className="space-y-3"
            variants={contentVariants}
            animate={isExpanded ? "expanded" : "collapsed"}
          >
            {/* Header with title and actions */}
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
                  onClick={toggleExpanded}
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
                    <DropdownMenuItem onClick={handleEditTask}>
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={handleDeleteTask}
                      className="text-red-600"
                    >
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Description - only when expanded */}
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

            {/* Metadata section */}
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

              {/* Tags - only when expanded or if less than 3 */}
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
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
});

AnimatedKanbanTaskCard.displayName = 'AnimatedKanbanTaskCard';

export default AnimatedKanbanTaskCard;
