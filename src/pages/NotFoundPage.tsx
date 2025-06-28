
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-6 min-h-screen flex items-center justify-center">
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Página no encontrada</CardTitle>
          <CardDescription>Error 404 - La página que buscas no existe</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>Lo sentimos, no pudimos encontrar la página que estás buscando.</p>
          <Button onClick={() => navigate('/')} className="w-full">
            Volver al inicio
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFoundPage;
