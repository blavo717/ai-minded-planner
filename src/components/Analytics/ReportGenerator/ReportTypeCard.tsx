
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Target, LucideIcon } from 'lucide-react';

interface ReportTypeCardProps {
  type: 'weekly' | 'monthly';
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  onGenerate: (type: 'weekly' | 'monthly') => void;
  isGenerating: boolean;
  generatingReport: string | null;
}

const ReportTypeCard = ({
  type,
  title,
  description,
  icon: Icon,
  color,
  bgColor,
  onGenerate,
  isGenerating,
  generatingReport
}: ReportTypeCardProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${bgColor}`}>
            <Icon className={`h-5 w-5 ${color}`} />
          </div>
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {description}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4" />
              <span>Incluye:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 ml-6">
              <li>Métricas de productividad</li>
              <li>Análisis de tiempo trabajado</li>
              <li>Tareas completadas</li>
              <li>Eficiencia promedio</li>
              <li>Insights personalizados</li>
            </ul>
          </div>
          
          <Button 
            onClick={() => {
              console.log(`🎯 Click en botón ${type}, isGenerating: ${isGenerating}`);
              onGenerate(type);
            }}
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Generando...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Generar Reporte
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportTypeCard;
