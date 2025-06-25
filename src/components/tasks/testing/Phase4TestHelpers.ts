
// Helpers para mejorar los tests de Phase 4
export const TestHelpers = {
  
  // Esperar con timeout y validación
  waitForCondition: async (
    condition: () => boolean | Promise<boolean>,
    timeout: number = 10000,
    interval: number = 500,
    description: string = 'condition'
  ): Promise<boolean> => {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      try {
        const result = await condition();
        if (result) return true;
      } catch (error) {
        console.warn(`Error checking ${description}:`, error);
      }
      
      await new Promise(resolve => setTimeout(resolve, interval));
    }
    
    throw new Error(`Timeout waiting for ${description} after ${timeout}ms`);
  },

  // Validar respuesta HTTP
  validateHttpResponse: (response: any, testName: string) => {
    if (!response) {
      throw new Error(`${testName}: No response received`);
    }
    
    if (response.error) {
      throw new Error(`${testName}: API Error - ${response.error}`);
    }
    
    return true;
  },

  // Validar estructura de plan
  validatePlanStructure: (plan: any, testName: string) => {
    if (!plan) {
      throw new Error(`${testName}: No plan received`);
    }
    
    if (!plan.id) {
      throw new Error(`${testName}: Plan missing ID`);
    }
    
    if (!plan.planned_tasks || !Array.isArray(plan.planned_tasks)) {
      throw new Error(`${testName}: Plan missing or invalid planned_tasks array`);
    }
    
    // Validar estructura de cada tarea
    plan.planned_tasks.forEach((task: any, index: number) => {
      if (!task.taskId || !task.title || !task.startTime || !task.endTime) {
        throw new Error(`${testName}: Task ${index} missing required fields`);
      }
      
      if (!['task', 'break', 'buffer'].includes(task.type)) {
        throw new Error(`${testName}: Task ${index} has invalid type: ${task.type}`);
      }
    });
    
    return true;
  },

  // Limpiar datos de test
  cleanupTestData: async (supabase: any, userId?: string) => {
    try {
      if (userId && userId !== 'test-user-id') {
        // Limpiar planes del día actual para el usuario real
        const today = new Date().toISOString().split('T')[0];
        await supabase
          .from('ai_daily_plans')
          .delete()
          .eq('user_id', userId)
          .eq('plan_date', today);
      }
      
      // Limpiar datos de test temporales
      await supabase
        .from('ai_daily_plans')
        .delete()
        .like('id', 'test-%');
        
      await supabase
        .from('ai_daily_plans')
        .delete()
        .like('id', 'temp-%');
        
    } catch (error) {
      console.warn('Error during cleanup:', error);
    }
  },

  // Generar ID único de test
  generateTestId: (prefix: string = 'test') => {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  },

  // Formatear duración para logging
  formatDuration: (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  },

  // Validar UUID
  isValidUUID: (uuid: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  },

  // Mock de plan para testing
  createMockPlan: (planDate: string, options: any = {}) => {
    return {
      id: TestHelpers.generateTestId('mock-plan'),
      user_id: options.userId || 'test-user-id',
      plan_date: planDate,
      planned_tasks: [
        {
          taskId: 'mock-task-1',
          title: 'Tarea Mock 1',
          startTime: '09:00',
          endTime: '10:30',
          duration: 90,
          priority: 'high',
          type: 'task'
        },
        {
          taskId: 'mock-break-1',
          title: 'Descanso Mock',
          startTime: '10:30',
          endTime: '10:45',
          duration: 15,
          priority: 'low',
          type: 'break'
        }
      ],
      optimization_strategy: 'testing-mock',
      estimated_duration: 105,
      ai_confidence: 0.95,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }
};

export default TestHelpers;
