
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Target, Database, Activity, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { SystemHealthComponent } from '@/types/testing';

interface SystemHealthCardProps {
  healthKey: string;
  component: SystemHealthComponent;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'healthy':
      return 'text-green-600 bg-green-100';
    case 'warning':
      return 'text-yellow-600 bg-yellow-100';
    case 'error':
      return 'text-red-600 bg-red-100';
    case 'monitoring':
      return 'text-blue-600 bg-blue-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'healthy':
      return <CheckCircle className="h-4 w-4" />;
    case 'warning':
    case 'error':
      return <AlertTriangle className="h-4 w-4" />;
    case 'monitoring':
      return <Activity className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
};

const getKeyIcon = (key: string) => {
  switch (key) {
    case 'aiCore':
      return <Brain className="h-5 w-5 text-purple-500" />;
    case 'insights':
      return <Target className="h-5 w-5 text-blue-500" />;
    case 'dataCollection':
      return <Database className="h-5 w-5 text-green-500" />;
    case 'performance':
      return <Activity className="h-5 w-5 text-orange-500" />;
    default:
      return <Activity className="h-5 w-5 text-gray-500" />;
  }
};

const getKeyLabel = (key: string) => {
  switch (key) {
    case 'aiCore':
      return 'IA Core';
    case 'dataCollection':
      return 'Datos';
    default:
      return key;
  }
};

const SystemHealthCard = ({ healthKey, component }: SystemHealthCardProps) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {getKeyIcon(healthKey)}
            <span className="font-medium capitalize">
              {getKeyLabel(healthKey)}
            </span>
          </div>
          <Badge className={getStatusColor(component.status)}>
            {getStatusIcon(component.status)}
            <span className="ml-1 capitalize">{component.status}</span>
          </Badge>
        </div>
        
        <div className="space-y-1">
          {Object.entries(component.components || component.metrics || {}).map(([subKey, value]) => (
            <div key={subKey} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground capitalize">
                {subKey.replace(/([A-Z])/g, ' $1').toLowerCase()}
              </span>
              <span className={typeof value === 'boolean' 
                ? (value ? 'text-green-600' : 'text-red-600')
                : 'text-blue-600'
              }>
                {typeof value === 'boolean' 
                  ? (value ? '✓' : '✗')
                  : typeof value === 'number' 
                    ? value 
                    : value ? '✓' : '✗'
                }
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemHealthCard;
