
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Palette, Zap, AlertCircle } from 'lucide-react';
import { LLMConfiguration } from '@/hooks/useLLMConfigurations';
import { useOpenRouterModels } from '@/hooks/useOpenRouterModels';
import LLMTemplateSelector from './LLMTemplateSelector';
import { LLMTemplate } from '@/data/llmTemplates';

const formSchema = z.object({
  model_name: z.string().min(1, 'Selecciona un modelo'),
  temperature: z.number().min(0).max(2),
  max_tokens: z.number().min(1).max(4000),
  top_p: z.number().min(0).max(1),
  frequency_penalty: z.number().min(-2).max(2),
  presence_penalty: z.number().min(-2).max(2),
  is_active: z.boolean(),
});

type FormData = z.infer<typeof formSchema>;

interface LLMConfigurationFormProps {
  configuration?: LLMConfiguration;
  onSubmit: (data: Partial<LLMConfiguration>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const LLMConfigurationForm = ({ configuration, onSubmit, onCancel, isLoading }: LLMConfigurationFormProps) => {
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  const { groupedModels, isLoading: modelsLoading } = useOpenRouterModels();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
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

  const handleTemplateSelect = (template: LLMTemplate) => {
    form.setValue('model_name', template.configuration.model_name);
    form.setValue('temperature', template.configuration.temperature);
    form.setValue('max_tokens', template.configuration.max_tokens);
    form.setValue('top_p', template.configuration.top_p);
    form.setValue('frequency_penalty', template.configuration.frequency_penalty);
    form.setValue('presence_penalty', template.configuration.presence_penalty);
  };

  const testConnection = async (formData: FormData) => {
    setTestStatus('testing');
    setTestMessage('Probando conexión con el modelo...');

    try {
      // Crear configuración temporal para prueba
      const tempConfig = {
        id: configuration?.id || 'temp',
        user_id: 'temp',
        provider: 'openrouter',
        api_key_name: 'OPENROUTER_API_KEY',
        ...formData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const response = await fetch('/api/test-llm-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: tempConfig }),
      });

      const result = await response.json();

      if (result.success) {
        setTestStatus('success');
        setTestMessage(`Conexión exitosa con ${result.model}`);
        return true;
      } else {
        setTestStatus('error');
        setTestMessage(result.error || 'Error en la conexión');
        return false;
      }
    } catch (error) {
      setTestStatus('error');
      setTestMessage('Error al probar la conexión');
      return false;
    }
  };

  const handleSubmit = async (data: FormData) => {
    // Probar conexión antes de guardar
    const connectionSuccess = await testConnection(data);
    
    if (connectionSuccess) {
      onSubmit(data);
    }
  };

  if (showTemplates) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Plantillas de Configuración
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LLMTemplateSelector
            onSelectTemplate={handleTemplateSelect}
            isVisible={showTemplates}
            onClose={() => setShowTemplates(false)}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {configuration ? 'Editar Configuración' : 'Nueva Configuración LLM'}
        </CardTitle>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowTemplates(true)}
          >
            <Palette className="h-4 w-4 mr-2" />
            Usar Plantilla
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Selección de Modelo */}
            <FormField
              control={form.control}
              name="model_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Modelo</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={modelsLoading}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un modelo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(groupedModels).map(([provider, models]) => (
                        <div key={provider}>
                          <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase">
                            {provider}
                          </div>
                          {models.slice(0, 5).map((model) => (
                            <SelectItem key={model.id} value={model.id}>
                              <div className="flex flex-col">
                                <span>{model.name}</span>
                                {model.description && (
                                  <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                                    {model.description}
                                  </span>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </div>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            {/* Parámetros de Configuración */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Parámetros del Modelo</h3>
              
              {/* Temperature */}
              <FormField
                control={form.control}
                name="temperature"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Temperatura</FormLabel>
                      <span className="text-sm text-muted-foreground">{field.value}</span>
                    </div>
                    <FormControl>
                      <Slider
                        min={0}
                        max={2}
                        step={0.1}
                        value={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                      />
                    </FormControl>
                    <FormDescription>
                      Controla la creatividad de las respuestas (0 = conservador, 2 = muy creativo)
                    </FormDescription>
                  </FormItem>
                )}
              />

              {/* Max Tokens */}
              <FormField
                control={form.control}
                name="max_tokens"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Máximo de Tokens</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={4000}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      Longitud máxima de la respuesta
                    </FormDescription>
                  </FormItem>
                )}
              />

              {/* Top-p */}
              <FormField
                control={form.control}
                name="top_p"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Top-p</FormLabel>
                      <span className="text-sm text-muted-foreground">{field.value}</span>
                    </div>
                    <FormControl>
                      <Slider
                        min={0}
                        max={1}
                        step={0.05}
                        value={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                      />
                    </FormControl>
                    <FormDescription>
                      Controla la diversidad de las respuestas
                    </FormDescription>
                  </FormItem>
                )}
              />

              {/* Frequency Penalty */}
              <FormField
                control={form.control}
                name="frequency_penalty"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Penalización de Frecuencia</FormLabel>
                      <span className="text-sm text-muted-foreground">{field.value}</span>
                    </div>
                    <FormControl>
                      <Slider
                        min={-2}
                        max={2}
                        step={0.1}
                        value={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                      />
                    </FormControl>
                    <FormDescription>
                      Penaliza la repetición de palabras
                    </FormDescription>
                  </FormItem>
                )}
              />

              {/* Presence Penalty */}
              <FormField
                control={form.control}
                name="presence_penalty"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Penalización de Presencia</FormLabel>
                      <span className="text-sm text-muted-foreground">{field.value}</span>
                    </div>
                    <FormControl>
                      <Slider
                        min={-2}
                        max={2}
                        step={0.1}
                        value={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                      />
                    </FormControl>
                    <FormDescription>
                      Fomenta la introducción de nuevos topics
                    </FormDescription>
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Configuración Activa */}
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Configuración Activa</FormLabel>
                    <FormDescription>
                      Esta será la configuración predeterminada para las funciones de IA
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Estado del Test */}
            {testStatus !== 'idle' && (
              <Alert className={testStatus === 'success' ? 'border-green-200 bg-green-50' : testStatus === 'error' ? 'border-red-200 bg-red-50' : ''}>
                <div className="flex items-center gap-2">
                  {testStatus === 'testing' && <Zap className="h-4 w-4 animate-spin" />}
                  {testStatus === 'success' && <Zap className="h-4 w-4 text-green-600" />}
                  {testStatus === 'error' && <AlertCircle className="h-4 w-4 text-red-600" />}
                  <AlertDescription className={testStatus === 'success' ? 'text-green-800' : testStatus === 'error' ? 'text-red-800' : ''}>
                    {testMessage}
                  </AlertDescription>
                </div>
              </Alert>
            )}

            {/* Botones */}
            <div className="flex gap-3">
              <Button 
                type="submit" 
                disabled={isLoading || testStatus === 'testing'}
                className="flex-1"
              >
                {testStatus === 'testing' ? 'Probando conexión...' : 
                 isLoading ? 'Guardando...' : 
                 configuration ? 'Actualizar Configuración' : 'Crear Configuración'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                disabled={isLoading || testStatus === 'testing'}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default LLMConfigurationForm;
