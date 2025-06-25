
import { useState } from 'react';

export const useSubtaskExpansion = () => {
  const [expandedSubtasks, setExpandedSubtasks] = useState<Set<string>>(new Set());

  const toggleSubtaskExpansion = (subtaskId: string) => {
    const newExpanded = new Set(expandedSubtasks);
    if (newExpanded.has(subtaskId)) {
      newExpanded.delete(subtaskId);
    } else {
      newExpanded.add(subtaskId);
    }
    setExpandedSubtasks(newExpanded);
  };

  const isSubtaskExpanded = (subtaskId: string) => {
    return expandedSubtasks.has(subtaskId);
  };

  return {
    toggleSubtaskExpansion,
    isSubtaskExpanded,
  };
};
