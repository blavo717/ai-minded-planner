
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  TestTube,
  Play,
  RefreshCw
} from 'lucide-react';
import { useAITesting } from '@/hooks/ai/useAITesting';
import { useToast } from '@/hooks/use-toast';
import TestResultsCard from './testing/TestResultsCard';
import TestCaseCard from './testing/TestCaseCard';

const Phase7TestingPanel = () => {
  const { toast } = useToast();
  const [currentTest, setCurrentTest] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const {
    isRunning: isRunningTests,
    testResults,
    availableTestCases,
    runSingleTest,
    runTestSuite
  } = useAITesting();

  const runAllTests = useCallback(async () => {
    await runTestSuite();
  }, [runTestSuite]);

  const runCategoryTests = useCallback(async (category: string) => {
    const categoryTests = availableTestCases.filter(t => t.category === category);
    let successCount = 0;
    
    for (const test of categoryTests) {
      setCurrentTest(test.id);
      const result = await runSingleTest(test);
      if (result.success) successCount++;
      
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    setCurrentTest('');
    
    toast({
      title: `Pruebas de ${category} Completadas`,
      description: `${successCount}/${categoryTests.length} pruebas exitosas`
    });
  }, [availableTestCases, runSingleTest, toast]);

  const handleRunSingleTest = useCallback(async (testId: string) => {
    setCurrentTest(testId);
    await runSingleTest(availableTestCases.find(t => t.id === testId)!);
    setCurrentTest('');
  }, [runSingleTest, availableTestCases]);

  const filteredTests = selectedCategory === 'all' 
    ? availableTestCases 
    : availableTestCases.filter(t => t.category === selectedCategory);

  const filteredResults = selectedCategory === 'all'
    ? testResults
    : testResults.filter(r => {
        const test = availableTestCases.find(t => t.id === r.testId);
        return test?.category === selectedCategory;
      });

  const successCount = testResults.filter(r => r.success).length;
  const errorCount = testResults.filter(r => !r.success).length;
  const totalTests = testResults.length;
  const completionPercentage = totalTests > 0 ? (successCount / totalTests) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <TestTube className="h-6 w-6 text-blue-500" />
            Fase 7: Testing y Validación
          </h1>
          <p className="text-muted-foreground">
            Validación completa del sistema de IA y todas sus funcionalidades
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={runAllTests} 
            disabled={isRunningTests}
            className="flex items-center gap-2"
          >
            {isRunningTests ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Ejecutando...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Ejecutar Todas
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Resumen de resultados */}
      {testResults.length > 0 && (
        <TestResultsCard 
          successCount={successCount}
          errorCount={errorCount}
          completionPercentage={completionPercentage}
          totalTests={totalTests}
        />
      )}

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="integration">Integración</TabsTrigger>
          <TabsTrigger value="functionality">Funcionalidad</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="data">Datos</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedCategory} className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              {selectedCategory === 'all' ? 'Todas las Pruebas' : `Pruebas de ${selectedCategory}`}
            </h3>
            {selectedCategory !== 'all' && (
              <Button 
                onClick={() => runCategoryTests(selectedCategory)} 
                disabled={isRunningTests}
                size="sm"
                variant="outline"
              >
                <Play className="h-4 w-4 mr-2" />
                Ejecutar Categoría
              </Button>
            )}
          </div>

          <div className="space-y-3">
            {filteredTests.map((test) => {
              const result = filteredResults.find(r => r.testId === test.id);
              const isCurrentlyRunning = currentTest === test.id;
              
              return (
                <TestCaseCard
                  key={test.id}
                  test={test}
                  result={result}
                  isCurrentlyRunning={isCurrentlyRunning}
                  onRunTest={handleRunSingleTest}
                  isRunning={isRunningTests}
                />
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {isRunningTests && (
        <Alert>
          <RefreshCw className="h-4 w-4 animate-spin" />
          <AlertDescription>
            Ejecutando suite de pruebas... Test actual: {
              availableTestCases.find(t => t.id === currentTest)?.name || 'Inicializando'
            }
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default Phase7TestingPanel;
