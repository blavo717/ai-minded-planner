
import React from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import { Control } from 'react-hook-form';
import { LLMFormData } from '../types/llmFormTypes';

interface ModelSelectorProps {
  control: Control<LLMFormData>;
  models: any[];
  groupedModels: any;
  popularModels: any[];
  isLoading: boolean;
}

const ModelSelector = ({ control, models, groupedModels, popularModels, isLoading }: ModelSelectorProps) => {
  return (
    <FormField
      control={control}
      name="model_name"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Modelo</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un modelo" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {/* Popular Models Section */}
              {popularModels.length > 0 && (
                <>
                  <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    Populares
                  </div>
                  {popularModels.map((model) => (
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
                  <div className="mx-2 my-1 h-px bg-border" />
                </>
              )}
              
              {/* All Models by Provider */}
              {Object.entries(groupedModels).map(([provider, providerModels]: [string, any]) => (
                <div key={provider}>
                  <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase">
                    {provider}
                  </div>
                  {providerModels.slice(0, 8).map((model: any) => (
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
                  {providerModels.length > 8 && (
                    <div className="px-2 py-1 text-xs text-muted-foreground">
                      y {providerModels.length - 8} más...
                    </div>
                  )}
                </div>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default ModelSelector;
