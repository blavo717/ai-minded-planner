
import React from 'react';
import { FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Control } from 'react-hook-form';
import { LLMFormData } from '../types/llmFormTypes';

interface ModelParametersSectionProps {
  control: Control<LLMFormData>;
}

const ModelParametersSection = ({ control }: ModelParametersSectionProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Parámetros del Modelo</h3>
      
      {/* Temperature */}
      <FormField
        control={control}
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
        control={control}
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
        control={control}
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
        control={control}
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
        control={control}
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
  );
};

export default ModelParametersSection;
