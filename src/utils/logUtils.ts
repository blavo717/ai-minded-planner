
import { TaskLog } from '@/types/taskLogs';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export interface GroupedLogs {
  [date: string]: TaskLog[];
}

export const groupLogsByDate = (logs: TaskLog[]): GroupedLogs => {
  return logs.reduce((grouped: GroupedLogs, log) => {
    const date = format(new Date(log.created_at), 'yyyy-MM-dd');
    if (!grouped[date]) {
      grouped[date] = [];
    }
    grouped[date].push(log);
    return grouped;
  }, {});
};

export const formatLogDate = (dateString: string): string => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) {
    return 'Hoy';
  } else if (format(date, 'yyyy-MM-dd') === format(yesterday, 'yyyy-MM-dd')) {
    return 'Ayer';
  } else {
    return format(date, 'dd/MM/yyyy', { locale: es });
  }
};
