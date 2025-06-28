
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

const MAX_RETRIES = 2;
const RETRY_DELAY = 1000; // 1 segundo

export const useLLMService = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { activeConfiguration, hasActiveConfiguration } = useLLMConfigurations();

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const makeLLMRequest = async (params: LLMRequestParams): Promise<LLMResponse> => {
    if (!hasActiveConfiguration || !activeConfiguration) {
      throw new Error('No hay configuración LLM activa. Ve a Configuración > LLM para configurar tu API key.');
    }

    setIsLoading(true);
    const startTime = Date.now();
    let lastError: Error | null = null;

    // Intentar hasta MAX_RETRIES veces
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`🚀 Intento ${attempt}/${MAX_RETRIES} - Iniciando solicitud LLM:`, {
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
          console.error(`❌ Error en edge function (intento ${attempt}):`, error);
          lastError = new Error(error.message || 'Error en la conexión con el servicio LLM');
          
          // Si no es el último intento, esperar antes de reintentar
          if (attempt < MAX_RETRIES) {
            console.log(`⏳ Esperando ${RETRY_DELAY}ms antes del siguiente intento...`);
            await delay(RETRY_DELAY);
            continue;
          }
          throw lastError;
        }

        // CORREGIDO: Verificar estructura de respuesta mejorada
        if (!data || !data.success) {
          console.error(`❌ Respuesta sin éxito (intento ${attempt}):`, data);
          lastError = new Error(data?.error || 'Error en la llamada al LLM');
          
          if (attempt < MAX_RETRIES) {
            console.log(`⏳ Esperando ${RETRY_DELAY}ms antes del siguiente intento...`);
            await delay(RETRY_DELAY);
            continue;
          }
          throw lastError;
        }

        // CORREGIDO: Validar que tenemos el contenido de respuesta
        if (!data.response) {
          console.error(`❌ Respuesta vacía (intento ${attempt}):`, data);
          lastError = new Error('Respuesta vacía del servicio LLM');
          
          if (attempt < MAX_RETRIES) {
            console.log(`⏳ Esperando ${RETRY_DELAY}ms antes del siguiente intento...`);
            await delay(RETRY_DELAY);
            continue;
          }
          throw lastError;
        }

        // CORREGIDO: Procesamiento mejorado de metadata
        const responseTime = Date.now() - startTime;
        
        console.log('✅ Respuesta LLM exitosa:', {
          attempt: attempt,
          responseTime: `${responseTime}ms`,
          model: data.model_used || activeConfiguration.model_name,
          contentLength: data.response?.length || 0,
          tokensUsed: data.tokens_used || 0,
          promptTokens: data.prompt_tokens || 0,
          completionTokens: data.completion_tokens || 0,
          serverResponseTime: data.response_time || 0,
        });

        // CORREGIDO: Retornar respuesta con metadata completa
        return {
          content: data.response,
          model_used: data.model_used || activeConfiguration.model_name,
          tokens_used: data.tokens_used || 0,
          prompt_tokens: data.prompt_tokens || 0,
          completion_tokens: data.completion_tokens || 0,
          response_time: data.response_time || responseTime,
        };

      } catch (error: any) {
        console.error(`❌ Error en solicitud LLM (intento ${attempt}):`, {
          error: error.message,
          functionName: params.functionName,
          attempt: attempt,
        });
        
        lastError = error;
        
        // Si no es el último intento, esperar antes de reintentar
        if (attempt < MAX_RETRIES) {
          console.log(`⏳ Reintentando en ${RETRY_DELAY}ms...`);
          await delay(RETRY_DELAY);
          continue;
        }
        
        throw error;
      }
    }

    // Si llegamos aquí, todos los intentos fallaron
    throw lastError || new Error('Todos los intentos de solicitud LLM fallaron');
  };

  return {
    makeLLMRequest,
    isLoading,
    hasActiveConfiguration,
    activeModel: activeConfiguration?.model_name,
    activeConfiguration,
  };
};
