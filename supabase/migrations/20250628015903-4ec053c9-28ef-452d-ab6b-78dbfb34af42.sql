
-- Crear tabla de roles si no existe
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Insertar role de owner para tu usuario
INSERT INTO public.user_roles (user_id, role)
SELECT auth.users.id, 'owner'
FROM auth.users 
WHERE auth.users.email = 'jlblavo36@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Función para verificar si un usuario es owner
CREATE OR REPLACE FUNCTION public.is_owner(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = $1 AND role = 'owner'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener el email del usuario actual
CREATE OR REPLACE FUNCTION public.get_current_user_email()
RETURNS TEXT AS $$
BEGIN
  RETURN (SELECT email FROM auth.users WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Habilitar RLS en todas las tablas principales
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Políticas para tasks
DROP POLICY IF EXISTS "Users can manage their own tasks" ON public.tasks;
CREATE POLICY "Users can manage their own tasks" ON public.tasks
FOR ALL USING (
  user_id = auth.uid() OR 
  public.is_owner(auth.uid()) OR 
  public.get_current_user_email() = 'jlblavo36@gmail.com'
);

-- Políticas para projects
DROP POLICY IF EXISTS "Users can manage their own projects" ON public.projects;
CREATE POLICY "Users can manage their own projects" ON public.projects
FOR ALL USING (
  user_id = auth.uid() OR 
  public.is_owner(auth.uid()) OR 
  public.get_current_user_email() = 'jlblavo36@gmail.com'
);

-- Políticas para task_sessions
DROP POLICY IF EXISTS "Users can manage their own sessions" ON public.task_sessions;
CREATE POLICY "Users can manage their own sessions" ON public.task_sessions
FOR ALL USING (
  user_id = auth.uid() OR 
  public.is_owner(auth.uid()) OR 
  public.get_current_user_email() = 'jlblavo36@gmail.com'
);

-- Políticas para profiles
DROP POLICY IF EXISTS "Users can manage profiles" ON public.profiles;
CREATE POLICY "Users can manage profiles" ON public.profiles
FOR ALL USING (
  id = auth.uid() OR 
  public.is_owner(auth.uid()) OR 
  public.get_current_user_email() = 'jlblavo36@gmail.com'
);

-- Políticas para user_roles
DROP POLICY IF EXISTS "Owners can manage roles" ON public.user_roles;
CREATE POLICY "Owners can manage roles" ON public.user_roles
FOR ALL USING (
  public.is_owner(auth.uid()) OR 
  public.get_current_user_email() = 'jlblavo36@gmail.com'
);
