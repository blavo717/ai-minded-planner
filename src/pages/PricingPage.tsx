
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const PricingPage = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Precios</h1>
      <Card>
        <CardHeader>
          <CardTitle>Planes de Suscripción</CardTitle>
          <CardDescription>Elige el plan que mejor se adapte a ti</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Aquí se mostrarán los diferentes planes disponibles.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PricingPage;
