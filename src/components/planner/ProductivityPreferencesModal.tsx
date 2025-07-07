import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  Calendar, 
  Zap, 
  Target, 
  Bell,
  Timer,
  Coffee,
  Settings,
  Save
} from 'lucide-react';
import { useProductivityPreferences } from '@/hooks/useProductivityPreferences';

interface ProductivityPreferencesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProductivityPreferencesModal: React.FC<ProductivityPreferencesModalProps> = ({
  open,
  onOpenChange
}) => {
  const { preferences, updatePreferences, isUpdating } = useProductivityPreferences();
  
  const [localPrefs, setLocalPrefs] = useState(preferences);

  React.useEffect(() => {
    setLocalPrefs(preferences);
  }, [preferences]);

  const handleSave = () => {
    if (localPrefs) {
      updatePreferences({
        work_hours_start: localPrefs.work_hours_start,
        work_hours_end: localPrefs.work_hours_end,
        preferred_work_days: localPrefs.preferred_work_days,
        energy_schedule: localPrefs.energy_schedule,
        notification_frequency: localPrefs.notification_frequency,
        focus_session_duration: localPrefs.focus_session_duration,
        break_duration: localPrefs.break_duration,
        productivity_goals: localPrefs.productivity_goals
      });
      onOpenChange(false);
    }
  };

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const toggleWorkDay = (dayIndex: number) => {
    if (!localPrefs) return;
    
    const currentDays = localPrefs.preferred_work_days;
    const newDays = currentDays.includes(dayIndex)
      ? currentDays.filter(d => d !== dayIndex)
      : [...currentDays, dayIndex].sort();
    
    setLocalPrefs({
      ...localPrefs,
      preferred_work_days: newDays
    });
  };

  const updateEnergySchedule = (level: 'high' | 'medium' | 'low', hours: number[]) => {
    if (!localPrefs) return;
    
    setLocalPrefs({
      ...localPrefs,
      energy_schedule: {
        ...localPrefs.energy_schedule,
        [level]: hours
      }
    });
  };

  if (!localPrefs) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configuración de Productividad
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="schedule" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="schedule" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Horarios
            </TabsTrigger>
            <TabsTrigger value="energy" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Energía
            </TabsTrigger>
            <TabsTrigger value="focus" className="flex items-center gap-2">
              <Timer className="w-4 h-4" />
              Enfoque
            </TabsTrigger>
            <TabsTrigger value="goals" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Objetivos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="schedule" className="space-y-6">
            {/* Horarios de trabajo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Horarios de Trabajo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Hora de inicio</label>
                    <Slider
                      value={[localPrefs.work_hours_start]}
                      onValueChange={([value]) => setLocalPrefs({...localPrefs, work_hours_start: value})}
                      max={23}
                      min={0}
                      step={1}
                      className="w-full"
                    />
                    <div className="text-center mt-2 font-mono">
                      {localPrefs.work_hours_start.toString().padStart(2, '0')}:00
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Hora de fin</label>
                    <Slider
                      value={[localPrefs.work_hours_end]}
                      onValueChange={([value]) => setLocalPrefs({...localPrefs, work_hours_end: value})}
                      max={23}
                      min={0}
                      step={1}
                      className="w-full"
                    />
                    <div className="text-center mt-2 font-mono">
                      {localPrefs.work_hours_end.toString().padStart(2, '0')}:00
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Días de trabajo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Días de Trabajo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2">
                  {dayNames.map((day, index) => (
                    <Button
                      key={index}
                      variant={localPrefs.preferred_work_days.includes(index) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleWorkDay(index)}
                      className="h-12"
                    >
                      {day}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="energy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Horario de Energía
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block text-green-600">
                      🔋 Alta energía ({localPrefs.energy_schedule.high.length} horas)
                    </label>
                    <div className="grid grid-cols-12 gap-1">
                      {Array.from({ length: 24 }, (_, i) => (
                        <Button
                          key={i}
                          variant={localPrefs.energy_schedule.high.includes(i) ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            const current = localPrefs.energy_schedule.high;
                            const newHours = current.includes(i)
                              ? current.filter(h => h !== i)
                              : [...current, i].sort((a, b) => a - b);
                            updateEnergySchedule('high', newHours);
                          }}
                          className="h-8 text-xs p-0"
                        >
                          {i}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block text-blue-600">
                      ⚡ Energía media ({localPrefs.energy_schedule.medium.length} horas)
                    </label>
                    <div className="grid grid-cols-12 gap-1">
                      {Array.from({ length: 24 }, (_, i) => (
                        <Button
                          key={i}
                          variant={localPrefs.energy_schedule.medium.includes(i) ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            const current = localPrefs.energy_schedule.medium;
                            const newHours = current.includes(i)
                              ? current.filter(h => h !== i)
                              : [...current, i].sort((a, b) => a - b);
                            updateEnergySchedule('medium', newHours);
                          }}
                          className="h-8 text-xs p-0"
                        >
                          {i}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block text-gray-600">
                      🪫 Baja energía ({localPrefs.energy_schedule.low.length} horas)
                    </label>
                    <div className="grid grid-cols-12 gap-1">
                      {Array.from({ length: 24 }, (_, i) => (
                        <Button
                          key={i}
                          variant={localPrefs.energy_schedule.low.includes(i) ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            const current = localPrefs.energy_schedule.low;
                            const newHours = current.includes(i)
                              ? current.filter(h => h !== i)
                              : [...current, i].sort((a, b) => a - b);
                            updateEnergySchedule('low', newHours);
                          }}
                          className="h-8 text-xs p-0"
                        >
                          {i}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="focus" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Timer className="w-5 h-5" />
                  Sesiones de Enfoque
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Duración de sesión de enfoque: {localPrefs.focus_session_duration} minutos
                  </label>
                  <Slider
                    value={[localPrefs.focus_session_duration]}
                    onValueChange={([value]) => setLocalPrefs({...localPrefs, focus_session_duration: value})}
                    max={90}
                    min={15}
                    step={5}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Duración de descanso: {localPrefs.break_duration} minutos
                  </label>
                  <Slider
                    value={[localPrefs.break_duration]}
                    onValueChange={([value]) => setLocalPrefs({...localPrefs, break_duration: value})}
                    max={30}
                    min={5}
                    step={5}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Frecuencia de notificaciones: {localPrefs.notification_frequency} minutos
                  </label>
                  <Slider
                    value={[localPrefs.notification_frequency]}
                    onValueChange={([value]) => setLocalPrefs({...localPrefs, notification_frequency: value})}
                    max={120}
                    min={15}
                    step={15}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="goals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Objetivos de Productividad
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Tareas diarias objetivo: {localPrefs.productivity_goals.daily_tasks}
                  </label>
                  <Slider
                    value={[localPrefs.productivity_goals.daily_tasks]}
                    onValueChange={([value]) => setLocalPrefs({
                      ...localPrefs, 
                      productivity_goals: {...localPrefs.productivity_goals, daily_tasks: value}
                    })}
                    max={20}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Tareas semanales objetivo: {localPrefs.productivity_goals.weekly_tasks}
                  </label>
                  <Slider
                    value={[localPrefs.productivity_goals.weekly_tasks]}
                    onValueChange={([value]) => setLocalPrefs({
                      ...localPrefs, 
                      productivity_goals: {...localPrefs.productivity_goals, weekly_tasks: value}
                    })}
                    max={100}
                    min={5}
                    step={5}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer con botones */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isUpdating}>
            <Save className="w-4 h-4 mr-2" />
            {isUpdating ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductivityPreferencesModal;