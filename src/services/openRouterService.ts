
export interface OpenRouterModel {
  id: string;
  name: string;
  description: string;
  pricing: {
    prompt: string;
    completion: string;
  };
  context_length: number;
  architecture: {
    modality: string;
    tokenizer: string;
    instruct_type?: string;
  };
  top_provider: {
    context_length: number;
    max_completion_tokens: number;
    is_moderated: boolean;
  };
  per_request_limits?: {
    prompt_tokens: string;
    completion_tokens: string;
  };
}

export interface GroupedModels {
  [provider: string]: OpenRouterModel[];
}

const CACHE_KEY = 'openrouter_models';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export const fetchOpenRouterModels = async (): Promise<OpenRouterModel[]> => {
  try {
    // Check cache first
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        return data;
      }
    }

    const response = await fetch('https://openrouter.ai/api/v1/models');
    if (!response.ok) {
      throw new Error('Failed to fetch models');
    }

    const result = await response.json();
    const models = result.data || [];

    // Cache the results
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      data: models,
      timestamp: Date.now()
    }));

    return models;
  } catch (error) {
    console.error('Error fetching OpenRouter models:', error);
    // Return fallback models if API fails
    return getFallbackModels();
  }
};

export const groupModelsByProvider = (models: OpenRouterModel[]): GroupedModels => {
  return models.reduce((acc, model) => {
    const provider = model.id.split('/')[0];
    if (!acc[provider]) {
      acc[provider] = [];
    }
    acc[provider].push(model);
    return acc;
  }, {} as GroupedModels);
};

export const getFallbackModels = (): OpenRouterModel[] => [
  {
    id: 'openai/gpt-4o',
    name: 'GPT-4o',
    description: 'Más potente y multimodal',
    pricing: { prompt: '0.000005', completion: '0.000015' },
    context_length: 128000,
    architecture: { modality: 'text+vision', tokenizer: 'tiktoken' },
    top_provider: { context_length: 128000, max_completion_tokens: 4096, is_moderated: true }
  },
  {
    id: 'openai/gpt-4o-mini',
    name: 'GPT-4o Mini',
    description: 'Rápido y económico',
    pricing: { prompt: '0.00000015', completion: '0.0000006' },
    context_length: 128000,
    architecture: { modality: 'text+vision', tokenizer: 'tiktoken' },
    top_provider: { context_length: 128000, max_completion_tokens: 16384, is_moderated: true }
  },
  {
    id: 'anthropic/claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    description: 'Excelente para razonamiento',
    pricing: { prompt: '0.000003', completion: '0.000015' },
    context_length: 200000,
    architecture: { modality: 'text+vision', tokenizer: 'claude' },
    top_provider: { context_length: 200000, max_completion_tokens: 8192, is_moderated: false }
  },
  {
    id: 'google/gemini-flash-1.5',
    name: 'Gemini 1.5 Flash',
    description: 'Rápido y eficiente de Google',
    pricing: { prompt: '0.00000075', completion: '0.000003' },
    context_length: 1000000,
    architecture: { modality: 'text+vision', tokenizer: 'gemini' },
    top_provider: { context_length: 1000000, max_completion_tokens: 8192, is_moderated: false }
  },
  {
    id: 'google/gemini-pro-1.5',
    name: 'Gemini 1.5 Pro',
    description: 'Modelo avanzado de Google',
    pricing: { prompt: '0.0000035', completion: '0.0000105' },
    context_length: 2000000,
    architecture: { modality: 'text+vision', tokenizer: 'gemini' },
    top_provider: { context_length: 2000000, max_completion_tokens: 8192, is_moderated: false }
  }
];

export const formatPricing = (prompt: string, completion: string): string => {
  const promptPrice = parseFloat(prompt) * 1000000;
  const completionPrice = parseFloat(completion) * 1000000;
  return `$${promptPrice.toFixed(2)}/$${completionPrice.toFixed(2)} por 1M tokens`;
};
