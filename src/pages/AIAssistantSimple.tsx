
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const AIAssistantSimple = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Asistente IA</h1>
      <Card>
        <CardHeader>
          <CardTitle>Asistente de Productividad</CardTitle>
          <CardDescription>Tu asistente IA para optimizar tareas y proyectos</CardDescription>
        </CardHeader>
        <CardContent>
          <p>El asistente IA te ayudará a organizar y priorizar tu trabajo.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIAssistantSimple;
