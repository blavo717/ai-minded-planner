
import React, { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { TestResult } from '@/hooks/useFilterTesting';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface TestingAlertsProps {
  testResults: TestResult[];
  isRunning: boolean;
}

const TestingAlerts = ({ testResults, isRunning }: TestingAlertsProps) => {
  const { toast } = useToast();

  useEffect(() => {
    if (!isRunning && testResults.length > 0) {
      const failed = testResults.filter(t => t.status === 'failed');
      const warnings = testResults.filter(t => t.status === 'warning');
      const passed = testResults.filter(t => t.status === 'passed');

      // Alert for failed tests
      if (failed.length > 0) {
        toast({
          title: "Tests Fallidos Detectados",
          description: `${failed.length} test(s) han fallado. Revisa los filtros que no funcionan correctamente.`,
          variant: "destructive",
        });
      }

      // Alert for warnings
      if (warnings.length > 0) {
        toast({
          title: "Advertencias en Tests",
          description: `${warnings.length} test(s) tienen advertencias. Algunos filtros podrían necesitar revisión.`,
          variant: "default",
        });
      }

      // Success alert if all passed
      if (failed.length === 0 && warnings.length === 0 && passed.length > 0) {
        toast({
          title: "Todos los Tests Pasaron",
          description: `✅ ${passed.length} tests ejecutados exitosamente. Los filtros funcionan correctamente.`,
          variant: "default",
        });
      }
    }
  }, [testResults, isRunning, toast]);

  return null; // This component only handles alerts
};

export default TestingAlerts;
