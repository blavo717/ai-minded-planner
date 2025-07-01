
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface QuickFilterButtonProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  count: number;
  onClick: () => void;
}

const QuickFilterButton = ({ icon, label, active, count, onClick }: QuickFilterButtonProps) => {
  return (
    <Button
      variant={active ? "default" : "outline"}
      size="sm"
      onClick={onClick}
      className="gap-2 relative h-9"
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
      {count > 0 && (
        <Badge 
          variant={active ? "outline" : "secondary"} 
          className={`ml-1 h-5 px-1.5 text-xs ${active ? 'bg-white text-primary' : ''}`}
        >
          {count}
        </Badge>
      )}
    </Button>
  );
};

export default QuickFilterButton;
