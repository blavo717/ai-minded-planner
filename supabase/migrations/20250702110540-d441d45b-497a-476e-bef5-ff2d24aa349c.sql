-- Crear tablas para sistema de aprendizaje continuo

-- Tabla para feedback de recomendaciones
CREATE TABLE public.recommendation_feedback (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    task_id UUID NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('accepted', 'skipped', 'completed', 'feedback_positive', 'feedback_negative')),
    satisfaction INTEGER CHECK (satisfaction BETWEEN 1 AND 5),
    context_data JSONB DEFAULT '{}',
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla para reglas de aprendizaje
CREATE TABLE public.learning_rules (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    rule_type TEXT NOT NULL CHECK (rule_type IN ('preference', 'avoidance', 'timing', 'energy')),
    condition JSONB NOT NULL,
    action JSONB NOT NULL,
    confidence DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    usage_count INTEGER NOT NULL DEFAULT 0,
    success_rate DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla para pesos adaptativos
CREATE TABLE public.adaptive_weights (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    factor_name TEXT NOT NULL,
    weight DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    confidence DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    trend TEXT CHECK (trend IN ('increasing', 'decreasing', 'stable')),
    sample_size INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, factor_name)
);

-- Habilitar RLS
ALTER TABLE public.recommendation_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adaptive_weights ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para recommendation_feedback
CREATE POLICY "Users can manage their own feedback"
ON public.recommendation_feedback
FOR ALL
USING (auth.uid() = user_id);

-- Políticas RLS para learning_rules
CREATE POLICY "Users can manage their own learning rules"
ON public.learning_rules
FOR ALL
USING (auth.uid() = user_id);

-- Políticas RLS para adaptive_weights
CREATE POLICY "Users can manage their own adaptive weights"
ON public.adaptive_weights
FOR ALL
USING (auth.uid() = user_id);

-- Función para actualizar updated_at
CREATE TRIGGER update_learning_rules_updated_at
    BEFORE UPDATE ON public.learning_rules
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_adaptive_weights_updated_at
    BEFORE UPDATE ON public.adaptive_weights
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();