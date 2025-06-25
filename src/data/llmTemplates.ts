
export interface LLMTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  configuration: {
    model_name: string;
    temperature: number;
    max_tokens: number;
    top_p: number;
    frequency_penalty: number;
    presence_penalty: number;
  };
}

// Plantillas actualizadas con modelos verificados de OpenRouter
export const LLM_TEMPLATES: LLMTemplate[] = [
  {
    id: 'productivity-analysis',
    name: 'Análisis de Productividad',
    description: 'Configuración optimizada para analizar patrones de trabajo y productividad',
    icon: '📊',
    configuration: {
      model_name: 'openai/gpt-4o-mini', // Rápido y económico para análisis
      temperature: 0.3,
      max_tokens: 1500,
      top_p: 0.9,
      frequency_penalty: 0.1,
      presence_penalty: 0.1,
    },
  },
  {
    id: 'insight-generation',
    name: 'Generación de Ideas',
    description: 'Para generar ideas y sugerencias creativas basadas en datos',
    icon: '💡',
    configuration: {
      model_name: 'anthropic/claude-3.5-sonnet', // Excelente para razonamiento
      temperature: 0.7,
      max_tokens: 2000,
      top_p: 0.95,
      frequency_penalty: 0.0,
      presence_penalty: 0.2,
    },
  },
  {
    id: 'chat-assistant',
    name: 'Asistente de Chat',
    description: 'Configuración balanceada para conversaciones interactivas',
    icon: '💬',
    configuration: {
      model_name: 'openai/gpt-4o', // Excelente para conversaciones
      temperature: 0.6,
      max_tokens: 1000,
      top_p: 1.0,
      frequency_penalty: 0.1,
      presence_penalty: 0.1,
    },
  },
  {
    id: 'pattern-analysis',
    name: 'Análisis de Patrones',
    description: 'Especializado en detectar patrones de comportamiento y tendencias',
    icon: '🔍',
    configuration: {
      model_name: 'anthropic/claude-3.5-sonnet', // Excelente para análisis
      temperature: 0.2,
      max_tokens: 1200,
      top_p: 0.8,
      frequency_penalty: 0.0,
      presence_penalty: 0.0,
    },
  },
  {
    id: 'fast-responses',
    name: 'Respuestas Rápidas',
    description: 'Configuración optimizada para respuestas rápidas y económicas',
    icon: '⚡',
    configuration: {
      model_name: 'google/gemini-flash-1.5', // Muy rápido y eficiente
      temperature: 0.5,
      max_tokens: 800,
      top_p: 0.9,
      frequency_penalty: 0.1,
      presence_penalty: 0.0,
    },
  },
  {
    id: 'detailed-analysis',
    name: 'Análisis Detallado',
    description: 'Para análisis profundos con respuestas extensas y detalladas',
    icon: '📝',
    configuration: {
      model_name: 'google/gemini-pro-1.5', // Gran contexto para análisis detallado
      temperature: 0.4,
      max_tokens: 3000,
      top_p: 0.9,
      frequency_penalty: 0.1,
      presence_penalty: 0.1,
    },
  },
];
