
import React from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { OPENROUTER_MODELS, LLMConfiguration } from '@/hooks/useLLMConfigurations';

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

  const selectedModel = OPENROUTER_MODELS.find(model => model.id === watch('model_name'));
  const temperature = watch('temperature');
  const maxTokens = watch('max_tokens');
  const topP = watch('top_p');
  const frequencyPenalty = watch('frequency_penalty');
  const presencePenalty = watch('presence_penalty');

  const handleFormSubmit = (data: ConfigFormData) => {
    onSubmit(data);
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
          {/* Selección de Modelo */}
          <div className="space-y-2">
            <Label htmlFor="model_name">Modelo</Label>
            <Select
              value={watch('model_name')}
              onValueChange={(value) => setValue('model_name', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un modelo" />
              </SelectTrigger>
              <SelectContent>
                {OPENROUTER_MODELS.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    <div className="flex items-center justify-between w-full">
                      <div>
                        <span className="font-medium">{model.name}</span>
                        <Badge variant="outline" className="ml-2 text-xs">
                          {model.provider}
                        </Badge>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedModel && (
              <p className="text-sm text-muted-foreground">
                {selectedModel.description}
              </p>
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
