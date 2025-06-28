
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const GanttPage = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Diagrama de Gantt</h1>
      <Card>
        <CardHeader>
          <CardTitle>Vista de Gantt</CardTitle>
          <CardDescription>Visualización temporal de proyectos</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Aquí se mostrará el diagrama de Gantt de tus proyectos.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default GanttPage;
