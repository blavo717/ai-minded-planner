
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LLMTemplate, LLM_TEMPLATES } from '@/data/llmTemplates';

interface LLMTemplateSelectorProps {
  onSelectTemplate: (template: LLMTemplate) => void;
  isVisible: boolean;
  onClose: () => void;
}

const LLMTemplateSelector = ({ onSelectTemplate, isVisible, onClose }: LLMTemplateSelectorProps) => {
  if (!isVisible) return null;

  const handleSelectTemplate = (template: LLMTemplate) => {
    onSelectTemplate(template);
    onClose();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Plantillas de Configuración</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          Cancelar
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {LLM_TEMPLATES.map((template) => (
          <Card key={template.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="text-xl">{template.icon}</span>
                {template.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                {template.description}
              </p>
              
              <div className="space-y-2 mb-4">
                <Badge variant="outline" className="text-xs">
                  {template.configuration.model_name}
                </Badge>
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <span>Temp: {template.configuration.temperature}</span>
                  <span>Tokens: {template.configuration.max_tokens}</span>
                </div>
              </div>
              
              <Button 
                size="sm" 
                className="w-full"
                onClick={() => handleSelectTemplate(template)}
              >
                Usar Plantilla
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default LLMTemplateSelector;
