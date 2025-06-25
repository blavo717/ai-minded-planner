
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, ExternalLink, Loader2, AlertCircle } from 'lucide-react';
import { LLMConfiguration } from '@/hooks/useLLMConfigurations';
import { useOpenRouterModels } from '@/hooks/useOpenRouterModels';
import { formatPricing } from '@/services/openRouterService';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const configSchema = z.object({
  model_name: z.string().min(1, 'Selecciona un modelo'),
  temperature: z.number().min(0).max(1),
  max_tokens: z.number().min(1).max(8000),
  top_p: z.number().min(0).max(1),
  frequency_penalty: z.number().min(-2).max(2),
  presence_penalty: z.number().min(-2).max(2),
  is_active: z.boolean(),
});

type ConfigFormData = z.infer<typeof configSchema>;

interface LLMConfigurationFormProps {
  configuration?: LLMConfiguration;
  onSubmit: (data: Partial<LLMConfiguration>) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

const LLMConfigurationForm = ({ 
  configuration, 
  onSubmit, 
  onCancel, 
  isLoading 
}: LLMConfigurationFormProps) => {
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [connectionError, setConnectionError] = useState<string>('');
  const [tempConfigId, setTempConfigId] = useState<string>('');
  const { models, groupedModels, isLoading: modelsLoading } = useOpenRouterModels();
  const { toast } = useToast();
  
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ConfigFormData>({
    resolver: zodResolver(configSchema),
    defaultValues: {
      model_name: configuration?.model_name || 'openai/gpt-4o-mini',
      temperature: configuration?.temperature || 0.7,
      max_tokens: configuration?.max_tokens || 1000,
      top_p: configuration?.top_p || 1.0,
      frequency_penalty: configuration?.frequency_penalty || 0.0,
      presence_penalty: configuration?.presence_penalty || 0.0,
      is_active: configuration?.is_active ?? true,
    },
  });

  const selectedModelId = watch('model_name');
  const selectedModel = models.find(model => model.id === selectedModelId);
  const temperature = watch('temperature');
  const maxTokens = watch('max_tokens');
  const topP = watch('top_p');
  const frequencyPenalty = watch('frequency_penalty');
  const presencePenalty = watch('presence_penalty');

  const testConnection = async (formData: ConfigFormData) => {
    setConnectionStatus('testing');
    setConnectionError('');

    try {
      // Crear configuración temporal para prueba
      const { data: tempConfig, error: createError } = await supabase
        .from('llm_configurations')
        .insert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          ...formData,
          provider: 'openrouter',
          api_key_name: 'OPENROUTER_API_KEY',
        })
        .select()
        .single();

      if (createError || !tempConfig) {
        throw new Error('Error creando configuración temporal');
      }

      setTempConfigId(tempConfig.id);

      // Probar la conexión
      const { data, error } = await supabase.functions.invoke('test-llm-connection', {
        body: { configId: tempConfig.id }
      });

      if (error || !data?.success) {
        throw new Error(data?.error || error?.message || 'Error en la prueba de conexión');
      }

      setConnectionStatus('success');
      toast({
        title: "Conexión exitosa",
        description: `El modelo ${formData.model_name} está funcionando correctamente.`,
      });

    } catch (error: any) {
      setConnectionStatus('error');
      setConnectionError(error.message);
      toast({
        title: "Error de conexión",
        description: error.message,
        variant: "destructive",
      });

      // Limpiar configuración temporal si falló
      if (tempConfigId) {
        await supabase
          .from('llm_configurations')
          .delete()
          .eq('id', tempConfigId);
      }
    }
  };

  const handleFormSubmit = async (data: ConfigFormData) => {
    // Si no hemos probado la conexión, probarla primero
    if (connectionStatus !== 'success') {
      await testConnection(data);
      return;
    }

    // Si la conexión fue exitosa, guardar la configuración
    if (tempConfigId && !configuration) {
      // Actualizar la configuración temporal para que sea permanente
      const { error } = await supabase
        .from('llm_configurations')
        .update({ is_active: data.is_active })
        .eq('id', tempConfigId);

      if (!error) {
        toast({
          title: "Configuración guardada",
          description: "La configuración del LLM ha sido guardada exitosamente.",
        });
        onSubmit({ ...data, id: tempConfigId });
      }
    } else {
      // Editar configuración existente
      onSubmit(data);
    }
  };

  const providerNames: { [key: string]: string } = {
    'openai': 'OpenAI',
    'anthropic': 'Anthropic',
    'meta-llama': 'Meta',
    'mistralai': 'Mistral',
    'google': 'Google',
    'cohere': 'Cohere',
    'huggingfaceh4': 'Hugging Face',
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {configuration ? 'Editar Configuración' : 'Nueva Configuración'} LLM
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Estado de la API Key */}
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              API Key de OpenRouter configurada correctamente en Supabase.
              <a 
                href="https://openrouter.ai/keys" 
                target="_blank" 
                rel="noopener noreferrer"
                className="ml-2 text-blue-600 hover:underline inline-flex items-center gap-1"
              >
                Gestionar API Keys <ExternalLink className="h-3 w-3" />
              </a>
            </AlertDescription>
          </Alert>

          {/* Estado de Conexión */}
          {connectionStatus !== 'idle' && (
            <Alert className={
              connectionStatus === 'success' ? 'border-green-200 bg-green-50' :
              connectionStatus === 'error' ? 'border-red-200 bg-red-50' :
              'border-blue-200 bg-blue-50'
            }>
              {connectionStatus === 'testing' && <Loader2 className="h-4 w-4 animate-spin" />}
              {connectionStatus === 'success' && <CheckCircle className="h-4 w-4 text-green-600" />}
              {connectionStatus === 'error' && <AlertCircle className="h-4 w-4 text-red-600" />}
              <AlertDescription>
                {connectionStatus === 'testing' && 'Probando conexión con el modelo...'}
                {connectionStatus === 'success' && 'Conexión exitosa. Ahora puedes guardar la configuración.'}
                {connectionStatus === 'error' && `Error: ${connectionError}`}
              </AlertDescription>
            </Alert>
          )}

          {/* Selección de Modelo */}
          <div className="space-y-2">
            <Label htmlFor="model_name">Modelo</Label>
            {modelsLoading ? (
              <div className="flex items-center gap-2 p-3 border rounded-md">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Cargando modelos...</span>
              </div>
            ) : (
              <Select
                value={selectedModelId}
                onValueChange={(value) => {
                  setValue('model_name', value);
                  setConnectionStatus('idle'); // Reset connection status when model changes
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un modelo" />
                </SelectTrigger>
                <SelectContent className="max-h-80">
                  {Object.entries(groupedModels).map(([provider, providerModels]) => (
                    <div key={provider}>
                      <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                        {providerNames[provider] || provider}
                      </div>
                      {providerModels.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          <div className="flex items-center justify-between w-full">
                            <div className="flex flex-col">
                              <span className="font-medium">{model.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {formatPricing(model.pricing.prompt, model.pricing.completion)}
                              </span>
                            </div>
                            <Badge variant="outline" className="ml-2 text-xs">
                              {model.context_length.toLocaleString()} ctx
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </div>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            {selectedModel && (
              <div className="p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-muted-foreground mb-2">
                  {selectedModel.description}
                </p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <Badge variant="secondary">
                    {selectedModel.context_length.toLocaleString()} tokens de contexto
                  </Badge>
                  <Badge variant="secondary">
                    {selectedModel.architecture.modality}
                  </Badge>
                  <Badge variant="outline">
                    {formatPricing(selectedModel.pricing.prompt, selectedModel.pricing.completion)}
                  </Badge>
                </div>
              </div>
            )}
            
            {errors.model_name && (
              <p className="text-sm text-destructive">{errors.model_name.message}</p>
            )}
          </div>

          {/* Parámetros del Modelo */}
          {/* Temperatura */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Temperatura</Label>
              <span className="text-sm font-mono">{temperature}</span>
            </div>
            <Slider
              value={[temperature]}
              onValueChange={(value) => {
                setValue('temperature', value[0]);
                setConnectionStatus('idle');
              }}
              max={1}
              min={0}
              step={0.1}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Controla la creatividad. 0 = más determinista, 1 = más creativo
            </p>
          </div>

          {/* Max Tokens */}
          <div className="space-y-2">
            <Label htmlFor="max_tokens">Máximo de Tokens</Label>
            <Input
              id="max_tokens"
              type="number"
              min={1}
              max={8000}
              {...register('max_tokens', { 
                valueAsNumber: true,
                onChange: () => setConnectionStatus('idle')
              })}
            />
            <p className="text-xs text-muted-foreground">
              Límite de tokens para la respuesta (1-8000)
            </p>
          </div>

          {/* Configuración Avanzada */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="font-medium">Configuración Avanzada</h4>
            
            {/* Top-p */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Top-p</Label>
                <span className="text-sm font-mono">{topP}</span>
              </div>
              <Slider
                value={[topP]}
                onValueChange={(value) => {
                  setValue('top_p', value[0]);
                  setConnectionStatus('idle');
                }}
                max={1}
                min={0}
                step={0.05}
                className="w-full"
              />
            </div>

            {/* Frequency Penalty */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Penalización de Frecuencia</Label>
                <span className="text-sm font-mono">{frequencyPenalty}</span>
              </div>
              <Slider
                value={[frequencyPenalty]}
                onValueChange={(value) => {
                  setValue('frequency_penalty', value[0]);
                  setConnectionStatus('idle');
                }}
                max={2}
                min={-2}
                step={0.1}
                className="w-full"
              />
            </div>

            {/* Presence Penalty */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Penalización de Presencia</Label>
                <span className="text-sm font-mono">{presencePenalty}</span>
              </div>
              <Slider
                value={[presencePenalty]}
                onValueChange={(value) => {
                  setValue('presence_penalty', value[0]);
                  setConnectionStatus('idle');
                }}
                max={2}
                min={-2}
                step={0.1}
                className="w-full"
              />
            </div>
          </div>

          {/* Configuración activa */}
          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={watch('is_active')}
              onCheckedChange={(checked) => setValue('is_active', checked)}
            />
            <Label htmlFor="is_active">Configuración activa</Label>
          </div>

          {/* Botones */}
          <div className="flex gap-2 pt-4">
            <Button 
              type="submit" 
              disabled={isLoading || connectionStatus === 'testing'}
              className={connectionStatus === 'success' ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              {connectionStatus === 'testing' ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Probando Conexión...
                </>
              ) : connectionStatus === 'success' ? (
                'Guardar Configuración'
              ) : (
                'Probar y Guardar'
              )}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default LLMConfigurationForm;
