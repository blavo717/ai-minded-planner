
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const KanbanPage = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Tablero Kanban</h1>
      <Card>
        <CardHeader>
          <CardTitle>Vista Kanban</CardTitle>
          <CardDescription>Gestión visual de tareas por estados</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Aquí se mostrará tu tablero Kanban.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default KanbanPage;
