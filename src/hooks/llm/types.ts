
export interface LLMConfiguration {
  id: string;
  user_id: string;
  provider: string;
  api_key_name: string;
  model_name: string;
  temperature: number;
  max_tokens: number;
  top_p: number;
  frequency_penalty: number;
  presence_penalty: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
