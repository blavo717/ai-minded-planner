
export interface LLMTemplate {
  id: string;
  name: string;
  description: string;
  useCase: string;
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

export const LLM_TEMPLATES: LLMTemplate[] = [
  {
    id: 'productivity-analysis',
    name: 'Análisis de Productividad',
    description: 'Optimizado para analizar patrones de trabajo y generar insights de productividad',
    useCase: 'Análisis de datos de tareas y sesiones de trabajo',
    icon: '📊',
    configuration: {
      model_name: 'openai/gpt-4o-mini',
      temperature: 0.3,
      max_tokens: 1000,
      top_p: 0.8,
      frequency_penalty: 0.1,
      presence_penalty: 0.1,
    },
  },
  {
    id: 'insight-generation',
    name: 'Generación de Insights',
    description: 'Configurado para crear recomendaciones y sugerencias inteligentes',
    useCase: 'Generación de consejos y recomendaciones personalizadas',
    icon: '💡',
    configuration: {
      model_name: 'openai/gpt-4o-mini',
      temperature: 0.7,
      max_tokens: 800,
      top_p: 0.9,
      frequency_penalty: 0.2,
      presence_penalty: 0.3,
    },
  },
  {
    id: 'chat-assistant',
    name: 'Asistente de Chat',
    description: 'Equilibrado para conversaciones naturales y respuestas útiles',
    useCase: 'Interacciones conversacionales con el usuario',
    icon: '💬',
    configuration: {
      model_name: 'openai/gpt-4o-mini',
      temperature: 0.8,
      max_tokens: 1200,
      top_p: 0.95,
      frequency_penalty: 0.1,
      presence_penalty: 0.2,
    },
  },
  {
    id: 'task-optimization',
    name: 'Optimización de Tareas',
    description: 'Especializado en sugerir mejoras y optimizaciones para tareas',
    useCase: 'Análisis y optimización de flujos de trabajo',
    icon: '⚡',
    configuration: {
      model_name: 'openai/gpt-4o',
      temperature: 0.4,
      max_tokens: 1500,
      top_p: 0.85,
      frequency_penalty: 0.15,
      presence_penalty: 0.1,
    },
  },
  {
    id: 'creative-planning',
    name: 'Planificación Creativa',
    description: 'Configurado para generar ideas creativas y planificación innovadora',
    useCase: 'Brainstorming y planificación de proyectos creativos',
    icon: '🎨',
    configuration: {
      model_name: 'anthropic/claude-3.5-sonnet',
      temperature: 0.9,
      max_tokens: 1000,
      top_p: 0.95,
      frequency_penalty: 0.3,
      presence_penalty: 0.4,
    },
  },
];

export const getTemplateById = (id: string): LLMTemplate | undefined => {
  return LLM_TEMPLATES.find(template => template.id === id);
};

export const getTemplatesByUseCase = (useCase: string): LLMTemplate[] => {
  return LLM_TEMPLATES.filter(template => 
    template.useCase.toLowerCase().includes(useCase.toLowerCase())
  );
};
