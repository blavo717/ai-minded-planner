
import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AIInsight, InsightGenerationConfig, UserContext, InsightGenerationResult } from '@/types/ai-insights';
import { PatternAnalysisResult } from '@/types/ai-patterns';
import { InsightGenerator } from '@/utils/ai/InsightGenerator';
import { defaultPatternAnalyzer } from '@/utils/ai/PatternAnalyzer';
import { useTasks } from '@/hooks/useTasks';
import { useTaskSessions } from '@/hooks/useTaskSessions';
import { useToast } from '@/hooks/use-toast';

interface UseInsightGenerationOptions {
  config?: Partial<InsightGenerationConfig>;
  autoGenerate?: boolean;
  refreshIntervalMs?: number;
}

export const useInsightGeneration = (options: UseInsightGenerationOptions = {}) => {
  const {
    config = {},
    autoGenerate = true,
    refreshIntervalMs = 30 * 60 * 1000, // 30 minutos por defecto
  } = options;

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { tasks } = useTasks();
  const { sessions } = useTaskSessions();

  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [lastGeneration, setLastGeneration] = useState<Date | null>(null);

  // Configuración del generador
  const [generatorConfig] = useState(() => 
    new InsightGenerator(config)
  );

  // Query para obtener análisis de patrones
  const {
    data: patternAnalysis,
    isLoading: isAnalyzing,
    error: analysisError,
  } = useQuery({
    queryKey: ['pattern-analysis', tasks.length, sessions.length],
    queryFn: async (): Promise<PatternAnalysisResult> => {
      console.log('Generating pattern analysis for insights...');
      return await defaultPatternAnalyzer.analyzePatterns(tasks, sessions);
    },
    enabled: tasks.length > 0,
    staleTime: 15 * 60 * 1000, // 15 minutos
    refetchInterval: autoGenerate ? refreshIntervalMs : false,
  });

  // Mutation para generar insights
  const generateInsightsMutation = useMutation({
    mutationFn: async ({
      analysis,
      context,
      existingInsights = [],
    }: {
      analysis: PatternAnalysisResult;
      context: UserContext;
      existingInsights?: AIInsight[];
    }): Promise<InsightGenerationResult> => {
      console.log('Generating insights...');
      return await generatorConfig.generateInsights(analysis, context, existingInsights);
    },
    onSuccess: (result) => {
      setInsights(prev => {
        // Combinar insights existentes válidos con nuevos
        const validExisting = prev.filter(insight => {
          const now = new Date();
          return (!insight.expiresAt || insight.expiresAt > now) && !insight.dismissedAt;
        });
        
        // Evitar duplicados por ID
        const newInsights = result.insights.filter(
          newInsight => !validExisting.some(existing => existing.id === newInsight.id)
        );
        
        return [...validExisting, ...newInsights];
      });
      
      setLastGeneration(new Date());
      
      if (result.insights.length > 0) {
        console.log(`Generated ${result.insights.length} new insights`);
      }
    },
    onError: (error) => {
      console.error('Error generating insights:', error);
      toast({
        title: 'Error generando insights',
        description: 'No se pudieron generar insights en este momento.',
        variant: 'destructive',
      });
    },
  });

  // Generar contexto de usuario
  const createUserContext = useCallback((): UserContext => {
    return {
      currentTime: new Date(),
      currentTasks: tasks.filter(task => 
        task.status === 'in_progress' || task.status === 'pending'
      ),
      recentActivity: sessions.slice(-10), // Últimas 10 sesiones
      workingHours: [9, 18], // Default 9 AM - 6 PM
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
  }, [tasks, sessions]);

  // Función principal para generar insights
  const generateInsights = useCallback(async (forceRefresh = false) => {
    if (!patternAnalysis) {
      console.log('No pattern analysis available for insights generation');
      return;
    }

    if (!forceRefresh && lastGeneration) {
      const timeSinceLastGeneration = Date.now() - lastGeneration.getTime();
      if (timeSinceLastGeneration < 10 * 60 * 1000) { // 10 minutos
        console.log('Skipping insights generation - too recent');
        return;
      }
    }

    const context = createUserContext();
    await generateInsightsMutation.mutateAsync({
      analysis: patternAnalysis,
      context,
      existingInsights: insights,
    });
  }, [patternAnalysis, insights, lastGeneration, createUserContext, generateInsightsMutation]);

  // Auto-generar insights cuando cambian los patrones
  useEffect(() => {
    if (autoGenerate && patternAnalysis && !generateInsightsMutation.isPending) {
      generateInsights();
    }
  }, [patternAnalysis, autoGenerate, generateInsights, generateInsightsMutation.isPending]);

  // Funciones para manejar insights
  const markAsRead = useCallback((insightId: string) => {
    setInsights(prev =>
      prev.map(insight =>
        insight.id === insightId
          ? { ...insight, readAt: new Date() }
          : insight
      )
    );
  }, []);

  const dismissInsight = useCallback((insightId: string) => {
    setInsights(prev =>
      prev.map(insight =>
        insight.id === insightId
          ? { ...insight, dismissedAt: new Date() }
          : insight
      )
    );
  }, []);

  const clearExpiredInsights = useCallback(() => {
    const now = new Date();
    setInsights(prev =>
      prev.filter(insight => !insight.expiresAt || insight.expiresAt > now)
    );
  }, []);

  // Limpiar insights expirados periódicamente
  useEffect(() => {
    const interval = setInterval(clearExpiredInsights, 5 * 60 * 1000); // Cada 5 minutos
    return () => clearInterval(interval);
  }, [clearExpiredInsights]);

  // Insights filtrados
  const unreadInsights = insights.filter(insight => !insight.readAt && !insight.dismissedAt);
  const activeInsights = insights.filter(insight => !insight.dismissedAt);
  const criticalInsights = activeInsights.filter(insight => insight.category === 'critical');
  const suggestionInsights = activeInsights.filter(insight => insight.category === 'suggestion');

  return {
    // Datos
    insights: activeInsights,
    unreadInsights,
    criticalInsights,
    suggestionInsights,
    patternAnalysis,
    
    // Estados
    isGenerating: generateInsightsMutation.isPending,
    isAnalyzing,
    lastGeneration,
    
    // Acciones
    generateInsights,
    markAsRead,
    dismissInsight,
    clearExpiredInsights,
    
    // Errores
    error: analysisError || generateInsightsMutation.error,
  };
};
