
import { useState } from 'react';
import { useLLMConfigurations } from '@/hooks/useLLMConfigurations';
import { supabase } from '@/integrations/supabase/client';

interface LLMRequestParams {
  systemPrompt: string;
  userPrompt: string;
  functionName: string;
}

interface LLMResponse {
  content: string;
  model_used?: string;
}

export const useLLMService = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { activeConfiguration } = useLLMConfigurations();

  const makeLLMRequest = async (params: LLMRequestParams): Promise<LLMResponse> => {
    if (!activeConfiguration) {
      throw new Error('No hay configuración LLM activa. Ve a Configuración > LLM para configurar tu API key.');
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('openrouter-chat', {
        body: {
          messages: [
            { role: 'system', content: params.systemPrompt },
            { role: 'user', content: params.userPrompt }
          ],
          configId: activeConfiguration.id,
          functionName: params.functionName
        }
      });

      if (error) throw error;

      if (!data?.success) {
        throw new Error(data?.error || 'Error en la llamada al LLM');
      }

      return {
        content: data.response,
        model_used: data.model_used || activeConfiguration.model_name
      };
    } catch (error) {
      console.error('Error in LLM request:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    makeLLMRequest,
    isLoading,
    hasActiveConfiguration: !!activeConfiguration
  };
};
