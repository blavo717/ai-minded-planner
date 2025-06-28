
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AlertTriangle, TrendingUp, Shield } from 'lucide-react';

interface TestResultsCardProps {
  successCount: number;
  errorCount: number;
  completionPercentage: number;
  totalTests: number;
}

const TestResultsCard = ({ successCount, errorCount, completionPercentage, totalTests }: TestResultsCardProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-2xl font-bold text-green-600">{successCount}</p>
              <p className="text-sm text-muted-foreground">Exitosas</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <div>
              <p className="text-2xl font-bold text-red-600">{errorCount}</p>
              <p className="text-sm text-muted-foreground">Fallidas</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-2xl font-bold text-blue-600">{completionPercentage.toFixed(0)}%</p>
              <p className="text-sm text-muted-foreground">Completado</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-purple-500" />
            <div>
              <p className="text-2xl font-bold text-purple-600">{totalTests}</p>
              <p className="text-sm text-muted-foreground">Total Tests</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestResultsCard;
