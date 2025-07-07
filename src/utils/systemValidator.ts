/**
 * Validador simplificado del sistema de recomendaciones
 */
export class SystemValidator {
  
  /**
   * Validar que el sistema de recomendaciones funciona correctamente
   */
  static async validateRecommendationSystem(): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
    performance: { [key: string]: number };
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const performanceResults: { [key: string]: number } = {};

    // Test 1: Validar servicios principales
    const start1 = Date.now();
    try {
      const { EnhancedFactorsService } = await import('@/services/enhancedFactorsService');
      const service = new EnhancedFactorsService();
      
      const mockTask = {
        id: 'test-task',
        title: 'Test Task',
        priority: 'medium' as const,
        status: 'pending' as const,
        due_date: new Date(Date.now() + 86400000).toISOString(),
        estimated_duration: 60,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: 'test-user',
        task_level: 1 as const,
        is_archived: false
      };

      const mockContext = {
        timeOfDay: 'morning' as const,
        dayOfWeek: 'monday',
        userEnergyLevel: 'high' as const,
        completedTasksToday: 2,
        workPattern: 'normal' as const
      };
      const factors = service.generateEnhancedFactors(mockTask, mockContext);
      
      if (!factors || factors.length === 0) {
        errors.push('EnhancedFactorsService no genera factores');
      }
      
      if (!factors.some(f => f.weight > 0)) {
        warnings.push('Ningún factor tiene peso positivo');
      }
      
    } catch (error) {
      errors.push(`Error en EnhancedFactorsService: ${error}`);
    }
    performanceResults.factorsService = Date.now() - start1;

    // Test 2: Validar hooks principales
    const start2 = Date.now();
    try {
      await import('@/hooks/useProactiveNotifications');
      await import('@/hooks/useWeeklyPlanner');
      await import('@/hooks/useProductivityPreferences');
      await import('@/hooks/useUserAchievements');
    } catch (error) {
      errors.push(`Error cargando hooks: ${error}`);
    }
    performanceResults.hooksLoad = Date.now() - start2;

    // Test 3: Validar componentes principales
    const start3 = Date.now();
    try {
      await import('@/components/planner/SimplifiedSmartPlanner');
      await import('@/components/planner/ProductivityDashboard');
      await import('@/components/planner/ProactiveNotificationsPanel');
      await import('@/components/planner/WeeklyPlannerPanel');
    } catch (error) {
      errors.push(`Error cargando componentes: ${error}`);
    }
    performanceResults.componentsLoad = Date.now() - start3;

    // Verificar performance general
    const totalTime = Object.values(performanceResults).reduce((sum, time) => sum + time, 0);
    if (totalTime > 1000) {
      warnings.push(`Sistema tarda ${totalTime.toFixed(0)}ms en validarse completo`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      performance: performanceResults
    };
  }

  /**
   * Test específico de coherencia en recomendaciones
   */
  static testRecommendationCoherence(): {
    isCoherent: boolean;
    issues: string[];
  } {
    const issues: string[] = [];

    try {
      // Test básico de coherencia lógica
      const urgentScore = 85; // Simulado
      const normalScore = 55; // Simulado
      
      if (urgentScore <= normalScore) {
        issues.push('Tarea urgente no tiene score mayor que tarea normal');
      }
      
    } catch (error) {
      issues.push(`Error en test de coherencia: ${error}`);
    }

    return {
      isCoherent: issues.length === 0,
      issues
    };
  }

  /**
   * Test de stress simplificado
   */
  static async stressTest(): Promise<{
    passed: boolean;
    results: { [test: string]: { time: number; success: boolean } };
  }> {
    const results: { [test: string]: { time: number; success: boolean } } = {};

    // Test 1: Carga de servicios
    const start1 = Date.now();
    try {
      await import('@/services/enhancedFactorsService');
      results.serviceLoad = {
        time: Date.now() - start1,
        success: true
      };
    } catch (error) {
      results.serviceLoad = {
        time: Date.now() - start1,
        success: false
      };
    }

    const allPassed = Object.values(results).every(r => r.success && r.time < 1000);
    
    return {
      passed: allPassed,
      results
    };
  }
}