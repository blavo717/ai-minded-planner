-- Crear bucket para PDFs de reportes
INSERT INTO storage.buckets (id, name, public) 
VALUES ('reports-pdf', 'reports-pdf', false);

-- Política para que usuarios puedan subir sus propios PDFs
CREATE POLICY "Users can upload their own report PDFs" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'reports-pdf' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Política para que usuarios puedan leer sus propios PDFs
CREATE POLICY "Users can view their own report PDFs" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'reports-pdf' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Política para que usuarios puedan actualizar sus propios PDFs
CREATE POLICY "Users can update their own report PDFs" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'reports-pdf' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Política para que usuarios puedan eliminar sus propios PDFs
CREATE POLICY "Users can delete their own report PDFs" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'reports-pdf' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);