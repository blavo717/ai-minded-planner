
export const getRecentTasks = (mainTasks: any[], maxTasks: number) => {
  if (!mainTasks.length) return [];

  return mainTasks
    .slice(0, maxTasks)
    .map(task => ({
      id: task.id,
      title: task.title,
      status: task.status,
      priority: task.priority,
      updated_at: task.updated_at,
    }));
};

export const getRecentProjects = (projects: any[], maxProjects: number) => {
  if (!projects.length) return [];

  return projects
    .filter(p => p.status === 'active')
    .slice(0, maxProjects)
    .map(project => ({
      id: project.id,
      name: project.name,
      status: project.status || 'active',
      progress: project.progress || 0,
    }));
};
