
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Brain, Settings } from 'lucide-react';

const ConfigurationAlert = () => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-500" />
          Asistente IA
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Alert>
          <Settings className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p>Para usar el asistente IA necesitas configurar tu API key.</p>
              <Button variant="outline" size="sm" asChild>
                <a href="/settings">
                  <Settings className="h-4 w-4 mr-2" />
                  Ir a Configuración
                </a>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default ConfigurationAlert;
