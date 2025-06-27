
import React from 'react';
import TaskDataGenerator from '@/components/testing/TaskDataGenerator';

const TaskTesting = () => {
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Testing de Gestión de Tareas</h1>
        <p className="text-muted-foreground">
          Genera datos de prueba para validar la funcionalidad completa del sistema de tareas jerárquicas
        </p>
      </div>

      <TaskDataGenerator />
    </div>
  );
};

export default TaskTesting;
