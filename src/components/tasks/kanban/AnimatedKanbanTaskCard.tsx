
import React, { memo, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Task } from '@/hooks/useTasks';
import TaskCardHeader from './TaskCardHeader';
import TaskCardExpandableContent from './TaskCardExpandableContent';
import TaskCardMetadata from './TaskCardMetadata';

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
            <TaskCardHeader
              task={task}
              isExpanded={isExpanded}
              getPriorityColor={getPriorityColor}
              onToggleExpanded={toggleExpanded}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
            />

            <TaskCardExpandableContent
              task={task}
              isExpanded={isExpanded}
            />

            <TaskCardMetadata
              task={task}
              subtasks={subtasks}
              projectName={projectName}
              projectColor={projectColor}
              isExpanded={isExpanded}
            />
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
});

AnimatedKanbanTaskCard.displayName = 'AnimatedKanbanTaskCard';

export default AnimatedKanbanTaskCard;
