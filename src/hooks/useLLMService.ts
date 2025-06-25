
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useLLMConfigurations } from '@/hooks/useLLMConfigurations';

interface LLMRequest {
  systemPrompt: string;
  userPrompt: string;
  functionName: string;
  maxTokensOverride?: number;
}

interface LLMResponse {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model_used: string;
}

export const useLLMService = () => {
  const { user } = useAuth();
  const { activeConfiguration } = useLLMConfigurations();

  const makeLLMRequestMutation = useMutation({
    mutationFn: async (request: LLMRequest): Promise<LLMResponse> => {
      if (!user) throw new Error('Usuario no autenticado');
      if (!activeConfiguration) throw new Error('No hay configuración LLM activa');

      const { data, error } = await supabase.functions.invoke('openrouter-chat', {
        body: {
          messages: [
            { role: 'system', content: request.systemPrompt },
            { role: 'user', content: request.userPrompt }
          ],
          model: activeConfiguration.model_name,
          temperature: activeConfiguration.temperature,
          max_tokens: request.maxTokensOverride || activeConfiguration.max_tokens,
          top_p: activeConfiguration.top_p,
          frequency_penalty: activeConfiguration.frequency_penalty,
          presence_penalty: activeConfiguration.presence_penalty,
          function_name: request.functionName
        }
      });

      if (error) throw error;
      
      return {
        content: data.content,
        usage: data.usage,
        model_used: activeConfiguration.model_name
      };
    },
    onError: (error) => {
      console.error('Error en llamada LLM:', error);
    }
  });

  const generateAnalysisInsights = async (analysisData: any) => {
    return makeLLMRequestMutation.mutateAsync({
      systemPrompt: `Eres un asistente de productividad experto. Analiza los datos del usuario y genera insights útiles y accionables sobre su productividad y patrones de trabajo. 

Enfócate en:
1. Patrones de productividad y áreas de mejora
2. Sugerencias específicas y accionables
3. Identificación de tendencias en el trabajo
4. Recomendaciones personalizadas

Responde en formato JSON con un array de insights, cada uno con:
- insight_type: tipo de insight
- title: título conciso
- description: descripción detallada
- insight_data: datos específicos del insight
- priority: prioridad del 1 al 3`,
      userPrompt: `Analiza estos datos de productividad del usuario: ${JSON.stringify(analysisData, null, 2)}`,
      functionName: 'analysis-insights'
    });
  };

  const generatePatternInsights = async (patternType: string, patternData: any, historicalData: any[]) => {
    return makeLLMRequestMutation.mutateAsync({
      systemPrompt: `Eres un experto en análisis de productividad. Analiza el nuevo patrón de comportamiento del usuario junto con su historial para generar insights útiles y específicos.

Enfócate en:
1. Detectar tendencias y cambios en el comportamiento
2. Identificar oportunidades de mejora específicas
3. Generar recomendaciones accionables
4. Mantener un tono positivo y motivador

Responde en formato JSON con un array de insights (máximo 2), cada uno con:
- insight_type: tipo de insight
- title: título motivador y específico
- description: descripción detallada con números específicos
- insight_data: datos relevantes del análisis
- priority: prioridad del 1 al 3`,
      userPrompt: `Analiza este nuevo patrón:
Tipo: ${patternType}
Datos actuales: ${JSON.stringify(patternData)}
Contexto histórico: ${JSON.stringify(historicalData)}`,
      functionName: 'pattern-insights',
      maxTokensOverride: 800
    });
  };

  return {
    makeLLMRequest: makeLLMRequestMutation.mutateAsync,
    generateAnalysisInsights,
    generatePatternInsights,
    isLoading: makeLLMRequestMutation.isPending,
    error: makeLLMRequestMutation.error,
  };
};
