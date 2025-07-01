
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Copy, Mail } from 'lucide-react';
import { IntelligentAction } from '@/types/intelligent-actions';
import { Task } from '@/hooks/useTasks';
import { useIntelligentActions } from '@/hooks/ai/useIntelligentActions';
import { useToast } from '@/hooks/use-toast';

interface DraftEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  action: IntelligentAction;
  onEmailGenerated?: () => void;
}

export function DraftEmailModal({ 
  isOpen, 
  onClose, 
  task, 
  action, 
  onEmailGenerated 
}: DraftEmailModalProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<'es' | 'en'>('es');
  const [emailContent, setEmailContent] = useState<{
    subject: string;
    body: string;
  } | null>(null);
  
  const { generateDraftEmail, isGeneratingEmail, actionContext } = useIntelligentActions(
    task, 
    action.suggestedData.content || '', 
    `Generar email para: ${task.title}`
  );
  const { toast } = useToast();

  const handleGenerateEmail = async (language: 'es' | 'en') => {
    setSelectedLanguage(language);
    
    try {
      const draft = await generateDraftEmail(actionContext, language);
      setEmailContent({
        subject: draft.subject,
        body: draft.body
      });
    } catch (error) {
      console.error('Error generating email:', error);
      toast({
        title: 'Error al generar email',
        description: 'No se pudo generar el draft del email',
        variant: 'destructive',
      });
    }
  };

  const handleCopyToClipboard = async () => {
    if (!emailContent) return;

    const fullEmail = `Asunto: ${emailContent.subject}\n\n${emailContent.body}`;
    
    try {
      await navigator.clipboard.writeText(fullEmail);
      toast({
        title: 'Email copiado',
        description: 'El draft del email se copió al portapapeles',
      });
      onEmailGenerated?.();
    } catch (error) {
      toast({
        title: 'Error al copiar',
        description: 'No se pudo copiar el email al portapapeles',
        variant: 'destructive',
      });
    }
  };

  const handleClose = () => {
    setEmailContent(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Draft Email - {task.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Botones de idioma */}
          <div className="flex gap-3">
            <Button
              onClick={() => handleGenerateEmail('es')}
              disabled={isGeneratingEmail}
              className="flex-1"
              variant={selectedLanguage === 'es' ? 'default' : 'outline'}
            >
              {isGeneratingEmail && selectedLanguage === 'es' && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Draft Email Español
            </Button>
            <Button
              onClick={() => handleGenerateEmail('en')}
              disabled={isGeneratingEmail}
              className="flex-1"
              variant={selectedLanguage === 'en' ? 'default' : 'outline'}
            >
              {isGeneratingEmail && selectedLanguage === 'en' && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Draft Email English
            </Button>
          </div>

          {/* Contenido del email generado */}
          {emailContent && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="subject">Asunto</Label>
                <Input
                  id="subject"
                  value={emailContent.subject}
                  onChange={(e) => setEmailContent({
                    ...emailContent,
                    subject: e.target.value
                  })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="body">Cuerpo del email</Label>
                <Textarea
                  id="body"
                  value={emailContent.body}
                  onChange={(e) => setEmailContent({
                    ...emailContent,
                    body: e.target.value
                  })}
                  rows={12}
                  className="mt-1 font-mono text-sm"
                  placeholder="El contenido del email aparecerá aquí..."
                />
              </div>

              <div className="flex justify-between">
                <div className="text-sm text-muted-foreground">
                  Email generado en {selectedLanguage === 'es' ? 'Español' : 'English'}
                </div>
                <Button
                  onClick={handleCopyToClipboard}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Copiar al portapapeles
                </Button>
              </div>
            </div>
          )}

          {/* Estado de carga */}
          {isGeneratingEmail && (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Generando draft de email...</span>
              </div>
            </div>
          )}

          {/* Información del contexto */}
          <div className="text-xs text-muted-foreground bg-muted p-3 rounded">
            <strong>Contexto:</strong> {action.suggestedData.content || task.description || 'Basado en el análisis de la tarea'}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
