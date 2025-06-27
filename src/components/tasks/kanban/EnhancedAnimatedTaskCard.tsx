
import React, { memo, useState, useCallback } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Task } from '@/hooks/useTasks';
import TaskCardHeader from './TaskCardHeader';
import TaskCardExpandableContent from './TaskCardExpandableContent';
import TaskCardMetadata from './TaskCardMetadata';

interface EnhancedAnimatedTaskCardProps {
  task: Task;
  subtasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onDragStart: (e: React.DragEvent, task: Task) => void;
  getProjectName: (projectId?: string) => string | null;
  getProjectColor: (projectId?: string) => string | null;
  getPriorityColor: (priority: Task['priority']) => string;
}

const EnhancedAnimatedTaskCard = memo(({ 
  task,
  subtasks,
  onEditTask,
  onDeleteTask,
  onDragStart,
  getProjectName,
  getProjectColor,
  getPriorityColor
}: EnhancedAnimatedTaskCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  // Motion values for enhanced interactions
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [30, -30]);
  const rotateY = useTransform(x, [-100, 100], [-30, 30]);
  
  const projectName = getProjectName(task.project_id);
  const projectColor = getProjectColor(task.project_id);

  const cardVariants = {
    idle: { 
      scale: 1, 
      rotateY: 0,
      rotateX: 0,
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      borderColor: 'transparent'
    },
    hover: { 
      scale: 1.03, 
      rotateY: 2,
      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
      borderColor: task.priority === 'urgent' ? '#ef4444' : 
                   task.priority === 'high' ? '#f97316' :
                   task.priority === 'medium' ? '#eab308' : '#22c55e',
      transition: { 
        duration: 0.3,
        ease: "easeOut"
      }
    },
    dragging: {
      scale: 1.1,
      rotateZ: 5,
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
      zIndex: 50,
      transition: { duration: 0.2 }
    },
    tap: {
      scale: 0.97,
      transition: { duration: 0.1 }
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
      transition: { 
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };

  const priorityIndicatorVariants = {
    idle: { scale: 1, opacity: 0.7 },
    hover: { 
      scale: 1.3, 
      opacity: 1,
      boxShadow: '0 0 12px currentColor',
      transition: { duration: 0.3 }
    }
  };

  const handleDragStart = useCallback((e: React.DragEvent) => {
    setIsDragging(true);
    onDragStart(e, task);
    
    // Add drag ghost styling
    const dragImage = new Image();
    dragImage.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IGZpbGw9InRyYW5zcGFyZW50Ii8+PC9zdmc+';
    e.dataTransfer.setDragImage(dragImage, 0, 0);
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

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (!isHovered) return;
    
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = event.clientX - centerX;
    const deltaY = event.clientY - centerY;
    
    x.set(deltaX * 0.1);
    y.set(deltaY * 0.1);
  }, [isHovered, x, y]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  }, [x, y]);

  return (
    <motion.div
      variants={cardVariants}
      initial="idle"
      animate={isDragging ? "dragging" : isHovered ? "hover" : "idle"}
      whileTap="tap"
      layout
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: isHovered ? rotateX : 0,
        rotateY: isHovered ? rotateY : 0,
        transformStyle: "preserve-3d"
      }}
    >
      <Card 
        className={`mb-3 cursor-move bg-white overflow-hidden border-2 transition-colors duration-300 ${
          isDragging ? 'opacity-80' : ''
        }`}
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
            <div className="flex items-start justify-between">
              <TaskCardHeader
                task={task}
                isExpanded={isExpanded}
                getPriorityColor={getPriorityColor}
                onToggleExpanded={toggleExpanded}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTask}
              />
              
              {/* Enhanced priority indicator */}
              <motion.div
                className={`w-3 h-3 rounded-full ${getPriorityColor(task.priority)} ml-2`}
                variants={priorityIndicatorVariants}
                animate={isHovered ? "hover" : "idle"}
              />
            </div>

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

        {/* Hover overlay effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-blue-500/5 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />

        {/* Drag indicator */}
        <motion.div
          className="absolute top-2 right-2 opacity-0 pointer-events-none"
          animate={{ 
            opacity: isDragging ? 1 : 0,
            scale: isDragging ? 1 : 0.8
          }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex gap-1">
            {Array.from({ length: 6 }).map((_, i) => (
              <motion.div
                key={i}
                className="w-1 h-1 bg-blue-500 rounded-full"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.1
                }}
              />
            ))}
          </div>
        </motion.div>
      </Card>
    </motion.div>
  );
});

EnhancedAnimatedTaskCard.displayName = 'EnhancedAnimatedTaskCard';

export default EnhancedAnimatedTaskCard;
