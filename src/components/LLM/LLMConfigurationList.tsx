
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Settings, Trash2, Zap, CheckCircle } from 'lucide-react';
import { LLMConfiguration } from '@/hooks/useLLMConfigurations';
import { useOpenRouterModels } from '@/hooks/useOpenRouterModels';

interface LLMConfigurationListProps {
  configurations: LLMConfiguration[];
  onEdit: (config: LLMConfiguration) => void;
  onDelete: (configId: string) => void;
  onTestConnection: (configId: string) => void;
  onToggleActive: (configId: string, isActive: boolean) => void;
  isDeleting?: boolean;
  isTesting?: boolean;
}

const LLMConfigurationList = ({
  configurations,
  onEdit,
  onDelete,
  onTestConnection,
  onToggleActive,
  isDeleting,
  isTesting
}: LLMConfigurationListProps) => {
  const { models } = useOpenRouterModels();

  const getModelInfo = (modelName: string) => {
    return models.find(model => model.id === modelName);
  };

  if (configurations.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <Settings className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-muted-foreground">
              No hay configuraciones de LLM guardadas
            </p>
            <p className="text-muted-foreground text-sm mt-1">
              Crea tu primera configuración para empezar a usar IA
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {configurations.map((config) => {
        const modelInfo = getModelInfo(config.model_name);
        const provider = modelInfo?.id?.split('/')[0] || 'OpenRouter';
        
        return (
          <Card key={config.id} className={config.is_active ? 'ring-2 ring-blue-500' : ''}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-lg">
                    {modelInfo?.name || config.model_name}
                  </CardTitle>
                  {config.is_active && (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Activa
                    </Badge>
                  )}
                  <Badge variant="outline">
                    {provider}
                  </Badge>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(config)}>
                      <Settings className="h-4 w-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onTestConnection(config.id)}
                      disabled={isTesting}
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Probar conexión
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onDelete(config.id)}
                      disabled={isDeleting}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Temperatura:</span>
                  <div className="font-mono">{config.temperature}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Max Tokens:</span>
                  <div className="font-mono">{config.max_tokens}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Top-p:</span>
                  <div className="font-mono">{config.top_p}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Configurada:</span>
                  <div className="text-xs">
                    {new Date(config.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              {modelInfo?.description && (
                <p className="text-sm text-muted-foreground mt-3">
                  {modelInfo.description}
                </p>
              )}
              
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.is_active}
                    onCheckedChange={(checked) => onToggleActive(config.id, checked)}
                  />
                  <span className="text-sm">
                    {config.is_active ? 'Activa' : 'Inactiva'}
                  </span>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onTestConnection(config.id)}
                  disabled={isTesting}
                >
                  <Zap className="h-4 w-4 mr-1" />
                  {isTesting ? 'Probando...' : 'Probar'}
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default LLMConfigurationList;
