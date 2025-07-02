import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Breadcrumb, 
  BreadcrumbList, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbSeparator, 
  BreadcrumbPage 
} from '@/components/ui/breadcrumb';
import { Badge } from '@/components/ui/badge';
import { Task } from '@/hooks/useTasks';
import { FolderOpen, ListTodo, Circle, Zap } from 'lucide-react';

interface WorkBreadcrumbProps {
  task: Task;
  hierarchyData: {
    parentTask?: Task;
    children: Task[];
    siblings: Task[];
    totalHierarchy: Task[];
  };
  projectName?: string;
}

const WorkBreadcrumb: React.FC<WorkBreadcrumbProps> = ({ 
  task, 
  hierarchyData, 
  projectName 
}) => {
  const navigate = useNavigate();
  const { parentTask } = hierarchyData;

  // Función para obtener el icono según el nivel
  const getLevelIcon = (level: number) => {
    switch (level) {
      case 1: return <ListTodo className="w-3 h-3" />;
      case 2: return <Circle className="w-3 h-3" />;
      case 3: return <Zap className="w-3 h-3" />;
      default: return null;
    }
  };

  // Función para obtener el label del nivel
  const getLevelLabel = (level: number) => {
    switch (level) {
      case 1: return 'Tarea';
      case 2: return 'Subtarea';
      case 3: return 'Microtarea';
      default: return 'Item';
    }
  };

  // Construir la jerarquía completa hacia arriba
  const buildHierarchy = () => {
    const hierarchy = [];
    
    // Si hay proyecto
    if (projectName) {
      hierarchy.push({
        type: 'project',
        name: projectName,
        icon: <FolderOpen className="w-3 h-3" />
      });
    }

    // Si es nivel 3 (microtarea), necesitamos mostrar tarea principal > subtarea > microtarea
    if (task.task_level === 3 && parentTask) {
      // Buscar la tarea principal (abuelo)
      const grandParentTask = hierarchyData.totalHierarchy.find(t => 
        t.id === parentTask.parent_task_id && t.task_level === 1
      );
      
      if (grandParentTask) {
        hierarchy.push({
          type: 'task',
          task: grandParentTask,
          level: 1,
          icon: getLevelIcon(1)
        });
      }
      
      // Subtarea (padre)
      hierarchy.push({
        type: 'task',
        task: parentTask,
        level: 2,
        icon: getLevelIcon(2)
      });
    }
    
    // Si es nivel 2 (subtarea), mostrar tarea principal > subtarea
    if (task.task_level === 2 && parentTask) {
      hierarchy.push({
        type: 'task',
        task: parentTask,
        level: 1,
        icon: getLevelIcon(1)
      });
    }

    return hierarchy;
  };

  const hierarchy = buildHierarchy();

  const handleNavigateToTask = (taskId: string) => {
    navigate(`/work/${taskId}`);
  };

  return (
    <div className="work-breadcrumb bg-muted/20 p-3 rounded-lg border">
      <Breadcrumb>
        <BreadcrumbList>
          {/* Elementos de la jerarquía */}
          {hierarchy.map((item, index) => (
            <React.Fragment key={index}>
              <BreadcrumbItem>
                {item.type === 'project' ? (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    {item.icon}
                    <span className="text-xs">{item.name}</span>
                  </div>
                ) : (
                  <BreadcrumbLink 
                    className="flex items-center gap-1 hover:text-primary cursor-pointer"
                    onClick={() => handleNavigateToTask(item.task.id)}
                  >
                    {item.icon}
                    <span className="text-xs font-medium">{item.task.title}</span>
                    <Badge variant="outline" className="text-xs ml-1">
                      {getLevelLabel(item.level)}
                    </Badge>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {index < hierarchy.length && <BreadcrumbSeparator />}
            </React.Fragment>
          ))}
          
          {/* Elemento actual */}
          <BreadcrumbItem>
            <BreadcrumbPage className="flex items-center gap-1">
              {getLevelIcon(task.task_level)}
              <span className="text-sm font-semibold">{task.title}</span>
              <Badge variant="default" className="text-xs ml-1">
                {getLevelLabel(task.task_level)}
              </Badge>
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      
      {/* Información contextual */}
      <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
        <span>Nivel actual: {task.task_level}/3</span>
        {hierarchyData.children.length > 0 && (
          <span>
            {hierarchyData.children.filter(c => c.task_level === task.task_level + 1).length} elementos hijo
          </span>
        )}
        {hierarchyData.siblings.length > 1 && (
          <span>
            {hierarchyData.siblings.length - 1} elementos relacionados
          </span>
        )}
      </div>
    </div>
  );
};

export default WorkBreadcrumb;