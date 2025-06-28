
import { useEffect } from 'react';

interface UseContextualDataAutoCollectionProps {
  autoCollect: boolean;
  collectionInterval: number;
  collectData: () => Promise<void>;
  isCollecting: boolean;
  tasksLength: number;
  lastCollection: Date | null;
}

export const useContextualDataAutoCollection = ({
  autoCollect,
  collectionInterval,
  collectData,
  isCollecting,
  tasksLength,
  lastCollection,
}: UseContextualDataAutoCollectionProps) => {
  // Auto-recolección de datos
  useEffect(() => {
    if (!autoCollect) return;

    const interval = setInterval(() => {
      if (!isCollecting) {
        collectData();
      }
    }, collectionInterval);

    return () => clearInterval(interval);
  }, [autoCollect, collectionInterval, collectData, isCollecting]);

  // Recolección inicial
  useEffect(() => {
    if (autoCollect && tasksLength > 0 && !lastCollection) {
      collectData();
    }
  }, [autoCollect, tasksLength, lastCollection, collectData]);
};
