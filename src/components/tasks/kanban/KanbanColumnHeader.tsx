
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, Loader2 } from 'lucide-react';

interface KanbanColumnHeaderProps {
  column: {
    id: string;
    title: string;
    color: string;
    icon: React.ReactNode;
  };
  taskCount: number;
  isExpanded: boolean;
  isUpdating: boolean;
  onToggleExpand: () => void;
}

const KanbanColumnHeader = ({
  column,
  taskCount,
  isExpanded,
  isUpdating,
  onToggleExpand
}: KanbanColumnHeaderProps) => {
  return (
    <Card className={`${column.color} border-2 transition-all duration-200 relative`}>
      {isUpdating && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
        </div>
      )}
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center justify-between">
          <motion.span 
            className="flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              {column.icon}
            </motion.div>
            {column.title}
          </motion.span>
          <div className="flex items-center gap-2">
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Badge variant="secondary" className="text-xs">
                {taskCount}
              </Badge>
            </motion.div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={onToggleExpand}
              disabled={isUpdating}
            >
              <motion.div
                animate={{ rotate: isExpanded ? 0 : -90 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="h-4 w-4" />
              </motion.div>
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
    </Card>
  );
};

export default KanbanColumnHeader;
