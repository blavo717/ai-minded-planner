
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Team = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Equipo</h1>
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Equipo</CardTitle>
          <CardDescription>Colaboración y gestión de miembros del equipo</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Aquí podrás gestionar tu equipo, asignar tareas y colaborar en proyectos.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Team;
