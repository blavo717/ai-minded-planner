
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface DateRangeFilterProps {
  dueDateFrom?: Date;
  dueDateTo?: Date;
  onDateFromChange: (date?: Date) => void;
  onDateToChange: (date?: Date) => void;
}

const DateRangeFilter = ({ 
  dueDateFrom, 
  dueDateTo, 
  onDateFromChange, 
  onDateToChange 
}: DateRangeFilterProps) => {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">Fecha de Vencimiento</Label>
      <div className="grid grid-cols-2 gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dueDateFrom ? (
                format(dueDateFrom, 'PPP', { locale: es })
              ) : (
                <span>Desde...</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dueDateFrom}
              onSelect={onDateFromChange}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dueDateTo ? (
                format(dueDateTo, 'PPP', { locale: es })
              ) : (
                <span>Hasta...</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dueDateTo}
              onSelect={onDateToChange}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default DateRangeFilter;
