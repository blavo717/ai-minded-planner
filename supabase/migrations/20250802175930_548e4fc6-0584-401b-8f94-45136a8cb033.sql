-- Agregar campo generation_type a la tabla generated_reports
ALTER TABLE public.generated_reports 
ADD COLUMN generation_type TEXT DEFAULT 'pdf' CHECK (generation_type IN ('pdf', 'ai', 'hybrid'));

-- Crear índice para mejorar performance en consultas por tipo
CREATE INDEX idx_generated_reports_generation_type ON public.generated_reports(generation_type);

-- Agregar comentario para documentar el campo
COMMENT ON COLUMN public.generated_reports.generation_type IS 'Tipo de generación: pdf (tradicional), ai (generado con IA), hybrid (combinado)';