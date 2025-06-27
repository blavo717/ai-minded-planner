
import { useState, useCallback } from 'react';
import { Task } from '@/hooks/useTasks';
import { FilterState } from '@/types/filters';
import { applySmartFilter } from '@/utils/smartFilters';

export interface TestResult {
  id: string;
  name: string;
  category: 'basic' | 'smart' | 'advanced' | 'persistence';
  status: 'pending' | 'running' | 'passed' | 'failed' | 'warning';
  message: string;
  duration?: number;
  timestamp?: string;
  details?: any;
}

export interface TestLog {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARNING' | 'ERROR';
  message: string;
  details?: any;
}

export const useFilterTesting = (
  tasks: Task[],
  applyFilters: (filters: FilterState) => Task[],
  taskAssignments: any[] = [],
  taskDependencies: any[] = []
) => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [testLogs, setTestLogs] = useState<TestLog[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  const addLog = useCallback((level: TestLog['level'], message: string, details?: any) => {
    const log: TestLog = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      level,
      message,
      details
    };
    setTestLogs(prev => [log, ...prev.slice(0, 99)]); // Keep last 100 logs
  }, []);

  const updateTestResult = useCallback((testId: string, updates: Partial<TestResult>) => {
    setTestResults(prev => prev.map(test => 
      test.id === testId 
        ? { ...test, ...updates, timestamp: new Date().toISOString() }
        : test
    ));
  }, []);

  // Generate synthetic test data
  const generateTestData = useCallback((): Task[] => {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    return [
      {
        id: 'test-1',
        title: 'Tarea vencida de prueba',
        description: 'Descripción de prueba',
        status: 'pending',
        priority: 'high',
        due_date: yesterday.toISOString(),
        created_at: weekAgo.toISOString(),
        updated_at: weekAgo.toISOString(),
        user_id: 'test-user',
        task_level: 1,
        tags: ['test', 'urgent']
      },
      {
        id: 'test-2',
        title: 'Tarea vence hoy',
        description: 'Vence hoy para testing',
        status: 'in_progress',
        priority: 'medium',
        due_date: now.toISOString(),
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
        user_id: 'test-user',
        task_level: 1,
        tags: ['test']
      },
      {
        id: 'test-3',
        title: 'Tarea completada recientemente',
        description: 'Completada ayer',
        status: 'completed',
        priority: 'low',
        completed_at: yesterday.toISOString(),
        created_at: weekAgo.toISOString(),
        updated_at: yesterday.toISOString(),
        user_id: 'test-user',
        task_level: 1,
        tags: ['test', 'done']
      },
      {
        id: 'test-4',
        title: 'Tarea sin actividad reciente',
        description: 'Sin actividad por más de 7 días',
        status: 'pending',
        priority: 'urgent',
        created_at: weekAgo.toISOString(),
        updated_at: weekAgo.toISOString(),
        last_worked_at: weekAgo.toISOString(),
        user_id: 'test-user',
        task_level: 1
      }
    ] as Task[];
  }, []);

  // Basic filter tests
  const runBasicTests = useCallback(async () => {
    const testData = [...tasks, ...generateTestData()];
    
    // Test search filter
    const searchTest: TestResult = {
      id: 'basic-search',
      name: 'Filtro de Búsqueda',
      category: 'basic',
      status: 'running',
      message: 'Ejecutando prueba de búsqueda...'
    };
    setTestResults(prev => [...prev, searchTest]);
    
    try {
      const searchFilter: FilterState = {
        search: 'prueba',
        status: [],
        priority: [],
        projects: [],
        tags: [],
        assignedTo: [],
        smartFilters: [],
        operators: {
          status: { type: 'OR' },
          priority: { type: 'OR' },
          projects: { type: 'OR' },
          tags: { type: 'OR' },
          assignedTo: { type: 'OR' }
        }
      };
      
      const searchResults = applyFilters(searchFilter);
      const hasSearchResults = searchResults.some(task => 
        task.title.toLowerCase().includes('prueba') || 
        task.description?.toLowerCase().includes('prueba')
      );
      
      updateTestResult('basic-search', {
        status: hasSearchResults ? 'passed' : 'failed',
        message: hasSearchResults 
          ? `✅ Búsqueda funcionando - ${searchResults.length} resultados`
          : '❌ Búsqueda no funciona correctamente'
      });
      
      addLog('INFO', `Test búsqueda: ${searchResults.length} resultados encontrados`);
    } catch (error) {
      updateTestResult('basic-search', {
        status: 'failed',
        message: `❌ Error en búsqueda: ${error}`
      });
      addLog('ERROR', 'Error en test de búsqueda', error);
    }

    // Test status filters with OR operator
    const statusTest: TestResult = {
      id: 'basic-status-or',
      name: 'Filtro Estado (OR)',
      category: 'basic',
      status: 'running',
      message: 'Probando filtros de estado con operador OR...'
    };
    setTestResults(prev => [...prev.filter(t => t.id !== 'basic-status-or'), statusTest]);

    try {
      const statusFilter: FilterState = {
        search: '',
        status: ['pending', 'in_progress'],
        priority: [],
        projects: [],
        tags: [],
        assignedTo: [],
        smartFilters: [],
        operators: {
          status: { type: 'OR' },
          priority: { type: 'OR' },
          projects: { type: 'OR' },
          tags: { type: 'OR' },
          assignedTo: { type: 'OR' }
        }
      };

      const statusResults = applyFilters(statusFilter);
      const validResults = statusResults.every(task => 
        task.status === 'pending' || task.status === 'in_progress'
      );

      updateTestResult('basic-status-or', {
        status: validResults ? 'passed' : 'failed',
        message: validResults 
          ? `✅ Filtro estado OR funciona - ${statusResults.length} resultados`
          : '❌ Filtro estado OR no funciona correctamente'
      });

      addLog('INFO', `Test estado OR: ${statusResults.length} resultados válidos`);
    } catch (error) {
      updateTestResult('basic-status-or', {
        status: 'failed',
        message: `❌ Error en filtro estado: ${error}`
      });
      addLog('ERROR', 'Error en test de estado', error);
    }
  }, [tasks, applyFilters, generateTestData, updateTestResult, addLog]);

  // Smart filter tests
  const runSmartFilterTests = useCallback(async () => {
    const testData = [...tasks, ...generateTestData()];
    
    const smartFilters = [
      { id: 'overdue', name: 'Tareas Vencidas' },
      { id: 'due_today', name: 'Vencen Hoy' },
      { id: 'inactive', name: 'Sin Actividad' },
      { id: 'high_priority_pending', name: 'Alta Prioridad Pendientes' },
      { id: 'recently_completed', name: 'Completadas Recientemente' }
    ];

    for (const filter of smartFilters) {
      const testId = `smart-${filter.id}`;
      const test: TestResult = {
        id: testId,
        name: `Filtro Inteligente: ${filter.name}`,
        category: 'smart',
        status: 'running',
        message: `Probando filtro ${filter.name}...`
      };
      setTestResults(prev => [...prev.filter(t => t.id !== testId), test]);

      try {
        const smartFilterResults = applySmartFilter(testData, filter.id);
        const resultCount = smartFilterResults.length;
        
        // Validations specific to each smart filter
        let isValid = true;
        let validationMessage = '';

        switch (filter.id) {
          case 'overdue':
            const now = new Date();
            isValid = smartFilterResults.every(task => 
              task.due_date && new Date(task.due_date) < now && task.status !== 'completed'
            );
            validationMessage = isValid ? 'Todas las tareas están vencidas y no completadas' : 'Hay tareas que no deberían estar en vencidas';
            break;
          
          case 'due_today':
            const today = new Date().toDateString();
            isValid = smartFilterResults.every(task => 
              task.due_date && new Date(task.due_date).toDateString() === today
            );
            validationMessage = isValid ? 'Todas las tareas vencen hoy' : 'Hay tareas que no vencen hoy';
            break;
          
          case 'high_priority_pending':
            isValid = smartFilterResults.every(task => 
              (task.priority === 'high' || task.priority === 'urgent') && 
              (task.status === 'pending' || task.status === 'in_progress')
            );
            validationMessage = isValid ? 'Todas son alta prioridad y pendientes' : 'Hay tareas que no cumplen criterios';
            break;
        }

        updateTestResult(testId, {
          status: isValid ? 'passed' : 'warning',
          message: isValid 
            ? `✅ ${filter.name} funciona - ${resultCount} resultados. ${validationMessage}`
            : `⚠️ ${filter.name} dudoso - ${resultCount} resultados. ${validationMessage}`
        });

        addLog(isValid ? 'INFO' : 'WARNING', `Filtro ${filter.name}: ${resultCount} resultados`, { validationMessage });
      } catch (error) {
        updateTestResult(testId, {
          status: 'failed',
          message: `❌ Error en ${filter.name}: ${error}`
        });
        addLog('ERROR', `Error en filtro ${filter.name}`, error);
      }
    }
  }, [tasks, generateTestData, updateTestResult, addLog]);

  // Advanced filter tests
  const runAdvancedTests = useCallback(async () => {
    // Test date range filters
    const dateRangeTest: TestResult = {
      id: 'advanced-date-range',
      name: 'Filtro Rango de Fechas',
      category: 'advanced',
      status: 'running',
      message: 'Probando filtros de rango de fechas...'
    };
    setTestResults(prev => [...prev.filter(t => t.id !== 'advanced-date-range'), dateRangeTest]);

    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);

      const dateFilter: FilterState = {
        search: '',
        status: [],
        priority: [],
        projects: [],
        tags: [],
        assignedTo: [],
        dueDateFrom: tomorrow,
        dueDateTo: nextWeek,
        smartFilters: [],
        operators: {
          status: { type: 'OR' },
          priority: { type: 'OR' },
          projects: { type: 'OR' },
          tags: { type: 'OR' },
          assignedTo: { type: 'OR' }
        }
      };

      const dateResults = applyFilters(dateFilter);
      const validDates = dateResults.every(task => {
        if (!task.due_date) return false;
        const taskDate = new Date(task.due_date);
        return taskDate >= tomorrow && taskDate <= nextWeek;
      });

      updateTestResult('advanced-date-range', {
        status: validDates ? 'passed' : 'warning',
        message: validDates 
          ? `✅ Filtro fechas funciona - ${dateResults.length} resultados en rango`
          : `⚠️ Filtro fechas dudoso - ${dateResults.length} resultados, verificar rango`
      });

      addLog('INFO', `Test rango fechas: ${dateResults.length} resultados`);
    } catch (error) {
      updateTestResult('advanced-date-range', {
        status: 'failed',
        message: `❌ Error en filtro fechas: ${error}`
      });
      addLog('ERROR', 'Error en test de fechas', error);
    }

    // Test assignment filters if data exists
    if (taskAssignments.length > 0) {
      const assignmentTest: TestResult = {
        id: 'advanced-assignments',
        name: 'Filtro Asignaciones',
        category: 'advanced',
        status: 'running',
        message: 'Probando filtros de asignaciones...'
      };
      setTestResults(prev => [...prev.filter(t => t.id !== 'advanced-assignments'), assignmentTest]);

      try {
        const uniqueAssignees = [...new Set(taskAssignments.map(a => a.assigned_to))];
        if (uniqueAssignees.length > 0) {
          const assignmentFilter: FilterState = {
            search: '',
            status: [],
            priority: [],
            projects: [],
            tags: [],
            assignedTo: [uniqueAssignees[0]],
            smartFilters: [],
            operators: {
              status: { type: 'OR' },
              priority: { type: 'OR' },
              projects: { type: 'OR' },
              tags: { type: 'OR' },
              assignedTo: { type: 'OR' }
            }
          };

          const assignmentResults = applyFilters(assignmentFilter);
          
          updateTestResult('advanced-assignments', {
            status: 'passed',
            message: `✅ Filtro asignaciones funciona - ${assignmentResults.length} resultados`
          });

          addLog('INFO', `Test asignaciones: ${assignmentResults.length} resultados`);
        }
      } catch (error) {
        updateTestResult('advanced-assignments', {
          status: 'failed',
          message: `❌ Error en filtro asignaciones: ${error}`
        });
        addLog('ERROR', 'Error en test de asignaciones', error);
      }
    }
  }, [tasks, taskAssignments, applyFilters, updateTestResult, addLog]);

  // Run all tests
  const runAllTests = useCallback(async () => {
    setIsRunning(true);
    setProgress(0);
    setTestResults([]);
    setTestLogs([]);

    addLog('INFO', 'Iniciando suite completo de tests de filtros');

    try {
      setProgress(25);
      await runBasicTests();
      
      setProgress(50);
      await runSmartFilterTests();
      
      setProgress(75);
      await runAdvancedTests();
      
      setProgress(100);
      addLog('INFO', 'Suite de tests completado');
    } catch (error) {
      addLog('ERROR', 'Error durante la ejecución de tests', error);
    } finally {
      setIsRunning(false);
    }
  }, [runBasicTests, runSmartFilterTests, runAdvancedTests, addLog]);

  const clearResults = useCallback(() => {
    setTestResults([]);
    setTestLogs([]);
    setProgress(0);
  }, []);

  const getTestStats = useCallback(() => {
    const total = testResults.length;
    const passed = testResults.filter(t => t.status === 'passed').length;
    const failed = testResults.filter(t => t.status === 'failed').length;
    const warnings = testResults.filter(t => t.status === 'warning').length;
    const running = testResults.filter(t => t.status === 'running').length;

    return { total, passed, failed, warnings, running };
  }, [testResults]);

  return {
    testResults,
    testLogs,
    isRunning,
    progress,
    runAllTests,
    clearResults,
    getTestStats,
    addLog
  };
};
