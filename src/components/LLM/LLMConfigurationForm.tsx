
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Palette } from 'lucide-react';
import { useOpenRouterModels } from '@/hooks/useOpenRouterModels';
import LLMTemplateSelector from './LLMTemplateSelector';
import { LLMTemplate } from '@/data/llmTemplates';
import { getPopularModels } from '@/services/openRouterService';
import { llmFormSchema, LLMFormData, LLMConfigurationFormProps } from './types/llmFormTypes';
import { useConnectionTest } from './hooks/useConnectionTest';
import ModelSelector from './components/ModelSelector';
import ModelParametersSection from './components/ModelParametersSection';
import ConnectionTestAlert from './components/ConnectionTestAlert';
import ModelValidationAlert from './ModelValidationAlert';

const LLMConfigurationForm = ({ configuration, onSubmit, onCancel, isLoading }: LLMConfigurationFormProps) => {
  const [showTemplates, setShowTemplates] = useState(false);
  const { models, groupedModels, isLoading: modelsLoading } = useOpenRouterModels();
  const { testStatus, testMessage, testConnectionManually } = useConnectionTest(configuration);

  const form = useForm<LLMFormData>({
    resolver: zodResolver(llmFormSchema),
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

  const watchedModelName = form.watch('model_name');
  const popularModels = getPopularModels(models);

  const handleTemplateSelect = (template: LLMTemplate) => {
    form.setValue('model_name', template.configuration.model_name);
    form.setValue('temperature', template.configuration.temperature);
    form.setValue('max_tokens', template.configuration.max_tokens);
    form.setValue('top_p', template.configuration.top_p);
    form.setValue('frequency_penalty', template.configuration.frequency_penalty);
    form.setValue('presence_penalty', template.configuration.presence_penalty);
  };

  const handleSubmit = async (data: LLMFormData) => {
    console.log('Form submitted with data:', data);
    
    // Probar conexión antes de guardar
    const connectionSuccess = await testConnectionManually(data);
    
    if (connectionSuccess) {
      console.log('Connection successful, submitting form');
      onSubmit(data);
    } else {
      console.log('Connection failed, not submitting form');
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
            <ModelSelector
              control={form.control}
              models={models}
              groupedModels={groupedModels}
              popularModels={popularModels}
              isLoading={modelsLoading}
            />

            {/* Model Validation */}
            {watchedModelName && (
              <ModelValidationAlert modelId={watchedModelName} />
            )}

            <Separator />

            {/* Parámetros de Configuración */}
            <ModelParametersSection control={form.control} />

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
            <ConnectionTestAlert testStatus={testStatus} testMessage={testMessage} />

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
