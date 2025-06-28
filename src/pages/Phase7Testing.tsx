
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Phase7TestingPanel, AIValidationDashboard } from '@/components/ai';

const Phase7Testing = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <Tabs defaultValue="testing" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="testing">Suite de Pruebas</TabsTrigger>
          <TabsTrigger value="validation">Dashboard de Validación</TabsTrigger>
        </TabsList>

        <TabsContent value="testing">
          <Phase7TestingPanel />
        </TabsContent>

        <TabsContent value="validation">
          <AIValidationDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Phase7Testing;
