
import { useState } from 'react';
import { useLLMConfigurations } from '@/hooks/useLLMConfigurations';
import { supabase } from '@/integrations/supabase/client';

interface LLMRequestParams {
  systemPrompt: string;
  userPrompt: string;
  functionName: string;
  temperature?: number;
  maxTokens?: number;
}

interface LLMResponse {
  content: string;
  model_used?: string;
  tokens_used?: number;
  prompt_tokens?: number;
  completion_tokens?: number;
  response_time?: number;
}

export const useLLMService = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { activeConfiguration, hasActiveConfiguration } = useLLMConfigurations();

  const makeLLMRequest = async (params: LLMRequestParams): Promise<LLMResponse> => {
    if (!hasActiveConfiguration || !activeConfiguration) {
      throw new Error('No hay configuración LLM activa. Ve a Configuración > LLM para configurar tu API key.');
    }

    setIsLoading(true);
    const startTime = Date.now();

    try {
      console.log('🚀 Iniciando solicitud LLM:', {
        functionName: params.functionName,
        systemPromptLength: params.systemPrompt.length,
        userPromptLength: params.userPrompt.length,
        temperature: params.temperature ?? activeConfiguration.temperature,
        maxTokens: params.maxTokens ?? activeConfiguration.max_tokens,
        model: activeConfiguration.model_name,
      });

      const { data, error } = await supabase.functions.invoke('openrouter-chat', {
        body: {
          messages: [
            { role: 'system', content: params.systemPrompt },
            { role: 'user', content: params.userPrompt }
          ],
          function_name: params.functionName,
          temperature: params.temperature ?? activeConfiguration.temperature,
          max_tokens: params.maxTokens ?? activeConfiguration.max_tokens,
        }
      });

      if (error) {
        console.error('❌ Error en edge function:', error);
        throw new Error(error.message || 'Error en la conexión con el servicio LLM');
      }

      if (!data?.success) {
        console.error('❌ Respuesta sin éxito:', data);
        throw new Error(data?.error || 'Error en la llamada al LLM');
      }

      const responseTime = Date.now() - startTime;
      
      console.log('✅ Respuesta LLM exitosa:', {
        responseTime: `${responseTime}ms`,
        model: data.model_used || activeConfiguration.model_name,
        contentLength: data.response?.length || 0,
        tokensUsed: data.tokens_used,
        promptTokens: data.prompt_tokens,
        completionTokens: data.completion_tokens,
      });

      return {
        content: data.response,
        model_used: data.model_used || activeConfiguration.model_name,
        tokens_used: data.tokens_used || 0,
        prompt_tokens: data.prompt_tokens || 0,
        completion_tokens: data.completion_tokens || 0,
        response_time: data.response_time || responseTime,
      };
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      console.error('❌ Error en solicitud LLM:', {
        error: error.message,
        responseTime: `${responseTime}ms`,
        functionName: params.functionName,
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    makeLLMRequest,
    isLoading,
    hasActiveConfiguration,
    activeModel: activeConfiguration?.model_name,
    activeConfiguration,
  };
};
