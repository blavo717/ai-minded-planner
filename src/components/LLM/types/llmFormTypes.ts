
import { z } from 'zod';

export const llmFormSchema = z.object({
  model_name: z.string().min(1, 'Selecciona un modelo'),
  temperature: z.number().min(0).max(2),
  max_tokens: z.number().min(1).max(4000),
  top_p: z.number().min(0).max(1),
  frequency_penalty: z.number().min(-2).max(2),
  presence_penalty: z.number().min(-2).max(2),
  is_active: z.boolean(),
});

export type LLMFormData = z.infer<typeof llmFormSchema>;

export interface LLMConfigurationFormProps {
  configuration?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
}
