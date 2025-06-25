
import React, { useState } from 'react';
import { Plus, Brain, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import LLMConfigurationForm from '@/components/LLM/LLMConfigurationForm';
import LLMConfigurationList from '@/components/LLM/LLMConfigurationList';
import { useLLMConfigurations, LLMConfiguration } from '@/hooks/useLLMConfigurations';

const LLMSettings = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingConfig, setEditingConfig] = useState<LLMConfiguration | undefined>();
  const [showApiKeyAlert, setShowApiKeyAlert] = useState(true);
  
  const {
    configurations,
    activeConfiguration,
    isLoading,
    createConfiguration,
    updateConfiguration,
    deleteConfiguration,
    testConnection,
    isCreating,
    isUpdating,
    isDeleting,
    isTesting,
  } = useLLMConfigurations();

  const handleSubmit = (data: Partial<LLMConfiguration>) => {
    if (editingConfig) {
      updateConfiguration({ id: editingConfig.id, ...data });
    } else {
      createConfiguration(data);
    }
    setShowForm(false);
    setEditingConfig(undefined);
  };

  const handleEdit = (config: LLMConfiguration) => {
    setEditingConfig(config);
    setShowForm(true);
  };

  const handleToggleActive = (configId: string, isActive: boolean) => {
    updateConfiguration({ id: configId, is_active: isActive });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingConfig(undefined);
  };

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto p-6">
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Brain className="h-8 w-8 text-blue-600" />
              Configuración de LLM
            </h1>
            <p className="text-muted-foreground mt-1">
              Configura y gestiona tus modelos de lenguaje para las funciones de IA
            </p>
          </div>
          
          {!showForm && (
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Configuración
            </Button>
          )}
        </div>

        {/* API Key Alert */}
        {showApiKeyAlert && (
          <Alert>
            <Key className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>
                Para usar las funciones de IA, necesitas configurar tu API Key de OpenRouter.
                <a 
                  href="https://openrouter.ai/keys" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="ml-2 text-blue-600 hover:underline"
                >
                  Obtener API Key →
                </a>
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowApiKeyAlert(false)}
              >
                ×
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Current Active Configuration */}
        {activeConfiguration && !showForm && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-green-800 flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Configuración Activa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{activeConfiguration.model_name}</p>
                  <p className="text-sm text-green-600">
                    Temperatura: {activeConfiguration.temperature} | 
                    Max Tokens: {activeConfiguration.max_tokens}
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleEdit(activeConfiguration)}
                >
                  Editar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Form or List */}
        {showForm ? (
          <LLMConfigurationForm
            configuration={editingConfig}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isCreating || isUpdating}
          />
        ) : (
          <LLMConfigurationList
            configurations={configurations}
            onEdit={handleEdit}
            onDelete={deleteConfiguration}
            onTestConnection={testConnection}
            onToggleActive={handleToggleActive}
            isDeleting={isDeleting}
            isTesting={isTesting}
          />
        )}
      </div>
    </div>
  );
};

export default LLMSettings;
