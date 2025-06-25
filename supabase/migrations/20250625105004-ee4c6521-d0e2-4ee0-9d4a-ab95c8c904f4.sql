
-- Expandir tabla de profiles con roles y información adicional para equipos de fábricas
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT CHECK (role IN ('project_manager', 'engineer', 'coordinator', 'specialist', 'admin'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS skills TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS department TEXT;

-- Sistema de asignaciones de tareas (multi-asignación)
CREATE TABLE IF NOT EXISTS task_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES profiles(id),
  assigned_by UUID REFERENCES profiles(id),
  role_in_task TEXT CHECK (role_in_task IN ('responsible', 'reviewer', 'contributor', 'observer')),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  due_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de contactos externos (contratistas, proveedores, autoridades)
CREATE TABLE IF NOT EXISTS external_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  company TEXT,
  role TEXT,
  email TEXT,
  phone TEXT,
  country TEXT,
  contact_type TEXT CHECK (contact_type IN ('contractor', 'supplier', 'authority', 'consultant', 'other')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS para task_assignments
ALTER TABLE task_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view task assignments they're involved in" 
  ON task_assignments 
  FOR SELECT 
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE id = assigned_to
      UNION
      SELECT id FROM profiles WHERE id = assigned_by
      UNION 
      SELECT user_id FROM tasks WHERE id = task_id
    )
  );

CREATE POLICY "Users can create task assignments for their tasks" 
  ON task_assignments 
  FOR INSERT 
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM tasks WHERE id = task_id
    )
  );

CREATE POLICY "Users can update task assignments they created" 
  ON task_assignments 
  FOR UPDATE 
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE id = assigned_by
    )
  );

CREATE POLICY "Users can delete task assignments they created" 
  ON task_assignments 
  FOR DELETE 
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE id = assigned_by
    )
  );

-- RLS para external_contacts
ALTER TABLE external_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own external contacts" 
  ON external_contacts 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own external contacts" 
  ON external_contacts 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own external contacts" 
  ON external_contacts 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own external contacts" 
  ON external_contacts 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Agregar índices para mejor performance
CREATE INDEX IF NOT EXISTS idx_task_assignments_task_id ON task_assignments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_assignments_assigned_to ON task_assignments(assigned_to);
CREATE INDEX IF NOT EXISTS idx_external_contacts_user_id ON external_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_external_contacts_contact_type ON external_contacts(contact_type);
