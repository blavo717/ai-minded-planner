
import { useTaskCRUD } from './useTaskCRUD';
import { useTaskActions } from './useTaskActions';
import { useTaskHierarchy } from './useTaskHierarchy';

export const useTaskMutations = () => {
  const crud = useTaskCRUD();
  const actions = useTaskActions();
  const hierarchy = useTaskHierarchy();

  return {
    ...crud,
    ...actions,
    ...hierarchy,
  };
};
