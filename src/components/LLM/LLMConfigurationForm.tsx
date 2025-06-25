
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
import { Eye, EyeOff, ExternalLink, Loader2 } from 'lucide-react';
import { LLMConfiguration } from '@/hooks/useLLMConfigurations';
import { useOpenRouterModels } from '@/hooks/useOpenRouterModels';
import { formatPricing } from '@/services/openRouterService';

const configSchema = z.object({
  model_name: z.string().min(1, 'Selecciona un modelo'),
  temperature: z.number().min(0).max(1),
  max_tokens: z.number().min(1).max(8000),
  top_p: z.number().min(0).max(1),
  frequency_penalty: z.number().min(-2).max(2),
  presence_penalty: z.number().min(-2).max(2),
  is_active: z.boolean(),
  openrouter_api_key: z.string().optional(),
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
  const [showApiKey, setShowApiKey] = useState(false);
  const { models, groupedModels, isLoading: modelsLoading } = useOpenRouterModels();
  
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
      openrouter_api_key: '',
    },
  });

  const selectedModelId = watch('model_name');
  const selectedModel = models.find(model => model.id === selectedModelId);
  const temperature = watch('temperature');
  const maxTokens = watch('max_tokens');
  const topP = watch('top_p');
  const frequencyPenalty = watch('frequency_penalty');
  const presencePenalty = watch('presence_penalty');

  const handleFormSubmit = (data: ConfigFormData) => {
    onSubmit(data);
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
          {/* API Key Section */}
          <div className="space-y-4 p-4 border rounded-lg bg-blue-50">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">API Key de OpenRouter</Label>
                <p className="text-xs text-muted-foreground">
                  Necesaria para usar los modelos de IA
                </p>
              </div>
              <a 
                href="https://openrouter.ai/keys" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm flex items-center gap-1"
              >
                Obtener API Key <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            
            <div className="relative">
              <Input
                type={showApiKey ? 'text' : 'password'}
                placeholder="sk-or-v1-..."
                {...register('openrouter_api_key')}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            
            <Alert>
              <AlertDescription className="text-xs">
                Tu API key se almacena de forma segura y nunca se comparte. 
                Solo se usa para hacer peticiones a OpenRouter en tu nombre.
              </AlertDescription>
            </Alert>
          </div>

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
                onValueChange={(value) => setValue('model_name', value)}
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

          {/* Temperatura */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Temperatura</Label>
              <span className="text-sm font-mono">{temperature}</span>
            </div>
            <Slider
              value={[temperature]}
              onValueChange={(value) => setValue('temperature', value[0])}
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
              {...register('max_tokens', { valueAsNumber: true })}
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
                onValueChange={(value) => setValue('top_p', value[0])}
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
                onValueChange={(value) => setValue('frequency_penalty', value[0])}
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
                onValueChange={(value) => setValue('presence_penalty', value[0])}
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
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Guardando...' : 'Guardar Configuración'}
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
