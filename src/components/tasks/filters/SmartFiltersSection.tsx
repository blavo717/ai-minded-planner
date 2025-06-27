
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { getSmartFilters } from '@/utils/smartFilters';
import { 
  AlertTriangle, 
  Calendar as CalendarIcon, 
  Clock, 
  Zap, 
  Users, 
  Archive, 
  Bookmark 
} from 'lucide-react';

interface SmartFiltersSectionProps {
  selectedFilters: string[];
  onFilterChange: (filterId: string, checked: boolean) => void;
}

const getIconForSmartFilter = (filterId: string) => {
  const icons: Record<string, React.ComponentType<any>> = {
    overdue: AlertTriangle,
    due_today: CalendarIcon,
    inactive: Clock,
    high_priority_pending: Zap,
    unassigned: Users,
    recently_completed: Archive,
  };
  return icons[filterId] || Bookmark;
};

const SmartFiltersSection = ({ selectedFilters, onFilterChange }: SmartFiltersSectionProps) => {
  const smartFilters = getSmartFilters();

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">Filtros Inteligentes</Label>
      <div className="flex flex-wrap gap-2">
        {smartFilters.map((filter) => {
          const Icon = getIconForSmartFilter(filter.id);
          const isActive = selectedFilters.includes(filter.id);
          
          return (
            <Button
              key={filter.id}
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => onFilterChange(filter.id, !isActive)}
              className="text-xs"
              title={filter.description}
            >
              <Icon className="h-3 w-3 mr-1" />
              {filter.name}
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default SmartFiltersSection;
