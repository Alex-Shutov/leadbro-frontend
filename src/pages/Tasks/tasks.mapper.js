import { taskStatusTypes } from '../Stages/stages.types';
import { loadAvatar } from '../../utils/create.utils';

export const mapTaskFromApi = (task) => {
  return {
    id: task.id,
    title: task.name,
    status: mapTaskStatus(task.status),
    stage: {
      id: task.stage?.id || null,
      title: task.stage?.name || 'Этап не задан',
    },
    type: task.type,
    taskLinked:task?.linked_task,
    description: task.description,
    deadline: new Date(task.deadline),
    deadlineTime: formatDuration(task.planned_time), // Например, '5 ч'
    actualTime: formatDuration(task.actual_time), // Например, '2 дн'
    isNewForUser: task.show_at_client_cabinet === 1,
    responsibles:mapAssigned([task.responsible]),
    executors:mapAssigned([task.performer]),
    auditors:mapAssigned(task.auditors),
    assigned: mapAssigned([task.responsible, task.performer]), // Ответственные и исполнители
    comments: mapComments(task.comments || []), // Комментарии к задаче
  };
};

// Маппинг статуса задачи
const mapTaskStatus = (status) => {
  switch (status) {
    case 'created':
      return taskStatusTypes.created;
    case 'in_progress':
      return taskStatusTypes.inProgress;
    case 'finished':
      return taskStatusTypes.finished;
    default:
      return taskStatusTypes.unknown;
  }
};

// Маппинг ответственных и исполнителей
const mapAssigned = (assigned) => {
  return assigned
    .filter(Boolean) // Исключаем null/undefined значения
    .map((person) => ({
      id: person.id,
      image: person.avatar ? loadAvatar(person.avatar) : null,
      name: person.name,
      surname: person.last_name,
      role: person.position?.name,
    }));
};

// Маппинг комментариев
const mapComments = (comments) => {
  return comments.map((comment) => ({
    id: comment.id,
    date: new Date(comment.date || new Date()), // Преобразуем дату
    sender: {
      id: comment.sender?.id || null,
      image: comment.sender?.avatar ? loadAvatar(comment.sender.avatar) : null,
      name: `${comment.sender?.name || ''} ${comment.sender?.last_name || ''}`.trim(),
    },
    value: {
      text: comment.text || 'Комментарий отсутствует',
    },
  }));
};

// Функция для форматирования времени
const formatDuration = (time) => {
  if (!time) return 'Не указано';
  const days = Math.floor(time / 24);
  const hours = Math.floor(time % 24);
  return days > 0 ? `${days} дн` : `${hours} ч`;
};
