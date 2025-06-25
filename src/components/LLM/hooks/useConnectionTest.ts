
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { LLMFormData } from '../types/llmFormTypes';

export const useConnectionTest = (configuration?: any) => {
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');
  const { user } = useAuth();

  const testConnectionManually = async (formData: LLMFormData) => {
    if (!user) {
      setTestStatus('error');
      setTestMessage('Usuario no autenticado');
      return false;
    }

    setTestStatus('testing');
    setTestMessage('Probando conexión con el modelo...');

    try {
      console.log('Testing connection with form data:', formData);
      
      // Crear una configuración temporal para la prueba
      let tempConfigId = configuration?.id;
      
      if (!tempConfigId) {
        // Si no hay configuración existente, crear temporalmente una nueva
        const { data: tempConfig, error: createError } = await supabase
          .from('llm_configurations')
          .insert({
            user_id: user.id,
            model_name: formData.model_name,
            temperature: formData.temperature,
            max_tokens: formData.max_tokens,
            top_p: formData.top_p,
            frequency_penalty: formData.frequency_penalty,
            presence_penalty: formData.presence_penalty,
            provider: 'openrouter',
            api_key_name: 'OPENROUTER_API_KEY',
            is_active: false, // Temporal, no activar
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating temp config:', createError);
          throw new Error('Error al crear configuración temporal: ' + createError.message);
        }

        tempConfigId = tempConfig.id;
        console.log('Created temporary config with ID:', tempConfigId);
      } else {
        // Actualizar la configuración existente con los nuevos valores
        const { error: updateError } = await supabase
          .from('llm_configurations')
          .update({
            model_name: formData.model_name,
            temperature: formData.temperature,
            max_tokens: formData.max_tokens,
            top_p: formData.top_p,
            frequency_penalty: formData.frequency_penalty,
            presence_penalty: formData.presence_penalty,
          })
          .eq('id', tempConfigId);

        if (updateError) {
          console.error('Error updating config:', updateError);
          throw new Error('Error al actualizar configuración: ' + updateError.message);
        }
      }

      // Probar la conexión usando la función de edge
      console.log('Calling test-llm-connection with config ID:', tempConfigId);
      
      const { data, error } = await supabase.functions.invoke('test-llm-connection', {
        body: { configId: tempConfigId }
      });

      console.log('Edge function response:', { data, error });

      if (error || !data?.success) {
        const errorMessage = error?.message || data?.error || 'Error desconocido en la conexión';
        console.error('Connection test failed:', errorMessage);
        setTestStatus('error');
        setTestMessage(errorMessage);
        return false;
      }

      console.log('Connection test successful:', data);
      setTestStatus('success');
      setTestMessage(`Conexión exitosa con ${data.model || formData.model_name}`);
      return true;

    } catch (error: any) {
      console.error('Test connection error:', error);
      setTestStatus('error');
      setTestMessage(error.message || 'Error al probar la conexión');
      return false;
    }
  };

  return {
    testStatus,
    testMessage,
    testConnectionManually,
  };
};
