
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const CalendarPage = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Calendario</h1>
      <Card>
        <CardHeader>
          <CardTitle>Vista de Calendario</CardTitle>
          <CardDescription>Gestión de eventos y tareas por fecha</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Aquí se mostrará tu calendario de tareas y eventos.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarPage;
