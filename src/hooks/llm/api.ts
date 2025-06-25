
import { supabase } from '@/integrations/supabase/client';
import { LLMConfiguration } from './types';

export const llmConfigApi = {
  async getConfigurations(userId: string): Promise<LLMConfiguration[]> {
    const { data, error } = await supabase
      .from('llm_configurations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as LLMConfiguration[];
  },

  async createConfiguration(userId: string, config: Partial<LLMConfiguration>): Promise<void> {
    const { error } = await supabase
      .from('llm_configurations')
      .insert({
        user_id: userId,
        provider: 'openrouter',
        api_key_name: 'OPENROUTER_API_KEY',
        ...config,
      });

    if (error) throw error;
  },

  async updateConfiguration(id: string, config: Partial<LLMConfiguration>): Promise<void> {
    const { error } = await supabase
      .from('llm_configurations')
      .update(config)
      .eq('id', id);

    if (error) throw error;
  },

  async deleteConfiguration(configId: string): Promise<void> {
    const { error } = await supabase
      .from('llm_configurations')
      .delete()
      .eq('id', configId);

    if (error) throw error;
  },

  async testConnection(configId: string): Promise<any> {
    const { data, error } = await supabase.functions.invoke('test-llm-connection', {
      body: { configId }
    });

    if (error) throw error;
    
    if (!data?.success) {
      throw new Error(data?.error || 'Connection test failed');
    }
    
    return data;
  }
};
