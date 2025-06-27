
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FolderOpen, Plus } from 'lucide-react';

interface EmptyProjectsStateProps {
  onCreateProject: () => void;
}

const EmptyProjectsState = ({ onCreateProject }: EmptyProjectsStateProps) => {
  return (
    <Card className="border-dashed border-2 border-border">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <FolderOpen className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold text-foreground mb-2">
          No tienes proyectos creados
        </h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          Crea tu primer proyecto para comenzar a organizar tus tareas de manera eficiente
        </p>
        <Button 
          onClick={onCreateProject}
          size="lg"
        >
          <Plus className="h-4 w-4 mr-2" />
          Crear primer proyecto
        </Button>
      </CardContent>
    </Card>
  );
};

export default EmptyProjectsState;
