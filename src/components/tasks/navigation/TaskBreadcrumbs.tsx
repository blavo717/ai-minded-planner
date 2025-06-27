
import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Home, FolderOpen, FileText } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Task } from '@/hooks/useTasks';
import { Project } from '@/hooks/useProjects';

interface TaskBreadcrumbsProps {
  task?: Task;
  parentTask?: Task;
  project?: Project;
  onNavigate?: (path: string) => void;
}

const TaskBreadcrumbs = ({ task, parentTask, project, onNavigate }: TaskBreadcrumbsProps) => {
  const breadcrumbVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={breadcrumbVariants}
      initial="hidden"
      animate="visible"
      className="mb-4"
    >
      <Breadcrumb>
        <BreadcrumbList>
          <motion.div variants={itemVariants}>
            <BreadcrumbItem>
              <BreadcrumbLink 
                onClick={() => onNavigate?.('/tasks')}
                className="flex items-center gap-1 hover:text-primary cursor-pointer transition-colors"
              >
                <Home className="h-3 w-3" />
                Tareas
              </BreadcrumbLink>
            </BreadcrumbItem>
          </motion.div>

          {project && (
            <>
              <BreadcrumbSeparator>
                <ChevronRight className="h-4 w-4" />
              </BreadcrumbSeparator>
              <motion.div variants={itemVariants}>
                <BreadcrumbItem>
                  <BreadcrumbLink 
                    onClick={() => onNavigate?.(`/projects/${project.id}`)}
                    className="flex items-center gap-1 hover:text-primary cursor-pointer transition-colors"
                  >
                    <FolderOpen className="h-3 w-3" />
                    {project.name}
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </motion.div>
            </>
          )}

          {parentTask && (
            <>
              <BreadcrumbSeparator>
                <ChevronRight className="h-4 w-4" />
              </BreadcrumbSeparator>
              <motion.div variants={itemVariants}>
                <BreadcrumbItem>
                  <BreadcrumbLink 
                    onClick={() => onNavigate?.(`/tasks/${parentTask.id}`)}
                    className="flex items-center gap-1 hover:text-primary cursor-pointer transition-colors"
                  >
                    <FileText className="h-3 w-3" />
                    {parentTask.title}
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </motion.div>
            </>
          )}

          {task && (
            <>
              <BreadcrumbSeparator>
                <ChevronRight className="h-4 w-4" />
              </BreadcrumbSeparator>
              <motion.div variants={itemVariants}>
                <BreadcrumbItem>
                  <BreadcrumbPage className="flex items-center gap-1 font-medium">
                    <FileText className="h-3 w-3" />
                    {task.title}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </motion.div>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>
    </motion.div>
  );
};

export default TaskBreadcrumbs;
