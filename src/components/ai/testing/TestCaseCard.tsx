
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Target, Zap, Activity, Settings, Brain, TestTube, CheckCircle, AlertTriangle, RefreshCw, Clock } from 'lucide-react';
import { TestCase } from '@/utils/ai/testing/testCases';
import { TestResult } from '@/types/testing';

interface TestCaseCardProps {
  test: TestCase;
  result?: TestResult;
  isCurrentlyRunning: boolean;
  onRunTest: (testId: string) => void;
  isRunning: boolean;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'integration':
      return <Target className="h-4 w-4" />;
    case 'performance':
      return <Zap className="h-4 w-4" />;
    case 'data':
      return <Activity className="h-4 w-4" />;
    case 'ui':
      return <Settings className="h-4 w-4" />;
    case 'ai':
      return <Brain className="h-4 w-4" />;
    default:
      return <TestTube className="h-4 w-4" />;
  }
};

const getStatusIcon = (status: TestResult['success']) => {
  if (status === true) return <CheckCircle className="h-4 w-4 text-green-500" />;
  if (status === false) return <AlertTriangle className="h-4 w-4 text-red-500" />;
  return <Clock className="h-4 w-4 text-gray-500" />;
};

const TestCaseCard = ({ test, result, isCurrentlyRunning, onRunTest, isRunning }: TestCaseCardProps) => {
  return (
    <Card className={`transition-colors ${isCurrentlyRunning ? 'bg-blue-50 border-blue-200' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-full">
              {getCategoryIcon(test.category)}
            </div>
            
            <div className="flex-1">
              <h4 className="font-medium">{test.name}</h4>
              <p className="text-sm text-muted-foreground capitalize">
                Categoría: {test.category}
              </p>
              {result?.error && (
                <p className="text-xs text-red-600 mt-1">
                  {result.error}
                </p>
              )}
              {result?.duration && (
                <p className="text-xs text-gray-500">
                  Duración: {result.duration.toFixed(2)}ms
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {result && (
              <Badge variant={
                result.success ? 'default' :
                !result.success ? 'destructive' : 'outline'
              }>
                {getStatusIcon(result.success)}
                <span className="ml-1">{result.success ? 'Éxito' : 'Error'}</span>
              </Badge>
            )}
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onRunTest(test.id)}
              disabled={isRunning}
            >
              {isCurrentlyRunning ? 'Ejecutando...' : 'Probar'}
            </Button>
          </div>
        </div>
        
        {result?.result && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
            <h5 className="font-medium text-sm mb-2">Detalles del Test:</h5>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(result.result, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TestCaseCard;
