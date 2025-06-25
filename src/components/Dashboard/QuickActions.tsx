
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, FolderPlus, BarChart3 } from 'lucide-react';

const QuickActions = () => {
  const actions = [
    {
      label: 'Nueva Tarea',
      icon: Plus,
      onClick: () => console.log('Nueva tarea'),
      className: 'bg-blue-500 hover:bg-blue-600 text-white',
    },
    {
      label: 'Nuevo Proyecto',
      icon: FolderPlus,
      onClick: () => console.log('Nuevo proyecto'),
      className: 'bg-green-500 hover:bg-green-600 text-white',
    },
    {
      label: 'Ver Calendario',
      icon: Calendar,
      onClick: () => console.log('Ver calendario'),
      className: 'bg-purple-500 hover:bg-purple-600 text-white',
    },
    {
      label: 'Reportes',
      icon: BarChart3,
      onClick: () => console.log('Ver reportes'),
      className: 'bg-orange-500 hover:bg-orange-600 text-white',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action) => (
            <Button
              key={action.label}
              onClick={action.onClick}
              className={`h-auto py-3 px-4 flex flex-col items-center gap-2 ${action.className}`}
            >
              <action.icon className="h-5 w-5" />
              <span className="text-xs font-medium">{action.label}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
