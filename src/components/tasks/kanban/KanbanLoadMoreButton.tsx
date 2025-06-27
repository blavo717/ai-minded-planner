
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface KanbanLoadMoreButtonProps {
  hasMoreTasks: boolean;
  isUpdating: boolean;
  remainingTasksCount: number;
  loadMoreCount: number;
  onLoadMore: () => void;
}

const KanbanLoadMoreButton = ({
  hasMoreTasks,
  isUpdating,
  remainingTasksCount,
  loadMoreCount,
  onLoadMore
}: KanbanLoadMoreButtonProps) => {
  if (!hasMoreTasks || isUpdating) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex justify-center pt-2"
    >
      <Button
        variant="outline"
        size="sm"
        onClick={onLoadMore}
        className="text-xs"
      >
        <Plus className="h-3 w-3 mr-1" />
        Cargar {Math.min(loadMoreCount, remainingTasksCount)} más
      </Button>
    </motion.div>
  );
};

export default KanbanLoadMoreButton;
