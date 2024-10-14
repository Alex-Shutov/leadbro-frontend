import { createBlob } from '../../utils/create.utils';
import { stageStatusTypes, taskStatusTypes } from './stages.types';
import { statusTypes } from '../Services/services.types';
import { mapChangedFieldsForBackend } from '../../utils/store.utils';
import { format } from 'date-fns';

export const mapStageFromApi = (stageData, tasksData) => {
  return {
    id: stageData.id,
    number: stageData.number || '1234', // Номер этапа
    title: stageData.name,
    startTime: stageData.start ? new Date(stageData.start) : new Date(),
    deadline: stageData.deadline ? new Date(stageData.deadline) : new Date(),
    deadlineTime: `${parseFloat(stageData.planned_time.toFixed(1))} ч`, // Время дедлайна по умолчанию
    actualTime: `${parseFloat(stageData.actual_time.toFixed(1))} ч`, // Время дедлайна по умолчанию
    contactPerson: stageData.contactPerson || 'Александр Шилов',
    extraCosts: stageData.extraCosts || '7500',
    actSum: stageData?.actSum || stageData?.act_sum,
    budgetTimeValue: stageData.budgetTimeValue || 20,
    budgetTimeType: stageData.budgetTimeType || 'minutes',
    status:
      stageData.active === 1
        ? stageStatusTypes.inProgress
        : stageStatusTypes.finished,
    taskDescription: stageData.technical_specification || 'Нарисовать СРМ',
    sumByHand: true,
    service: {
      id: stageData.service?.id,
      title: stageData.service?.name,
    },
    client: {
      id: stageData.company?.id,
      title: stageData.company?.name,
    },
    tasks: tasksData.map(mapTaskFromApi),
  };
};

const mapTaskFromApi = (task) => {
  return {
    id: task.id,
    title: task.name,
    status: mapTaskStatus(task.status),
    service: {
      id: task.service?.id || 0,
      title: task.service?.title || 'Название услуги 1',
    },
    template: {
      id: task.template?.id || 0,
      title: task.template?.title || 'Название шаблона 1',
    },
    description: task.description || 'Описание отсутствует',
    showInLK: task.show_at_client_cabinet === 1,
    comments: task.comments ? mapComments(task.comments) : {},
    taskLinked: {
      id: task.taskLinked?.id || 0,
      title: task.taskLinked?.title || 'Задача № 3 - разработать сайт',
    },
    type: {
      id: task.type?.id || 0,
      title: task.type?.title || 'Тип задачи 1',
    },
    auditors: task.auditors ? task.auditors.map(mapParticipant) : [],
    executors: task.executors ? task.executors.map(mapParticipant) : [],
    responsibles: task.responsible ? task.responsible : [],
    deadline: task.deadline ? new Date(task.deadline) : new Date(),
    deadlineTime: task.deadlineTime || '5 ч',
    actualTime: task.actual_time ? `${task.actual_time} ч` : 'Не задано',
    isNewForUser: task.isNewForUser || false,
  };
};

const mapParticipant = (participant) => {
  return {
    id: participant.id,
    fio: participant.fio || 'Неизвестный',
    role: participant.role || 'Неизвестная роль',
    image: participant.avatar ? createBlob(participant.avatar) : null,
  };
};

const mapComments = (comments) => {
  return Object.keys(comments).reduce((acc, key) => {
    const comment = comments[key];
    acc[key] = {
      id: comment.id,
      date: comment.date ? new Date(comment.date) : new Date(),
      sender: mapParticipant(comment.sender),
      value: comment.value || { text: 'Текст комментария отсутствует' },
    };
    return acc;
  }, {});
};

const mapTaskStatus = (status) => {
  switch (status) {
    case 'created':
      return taskStatusTypes.created;
    case 'finished':
      return taskStatusTypes.finished;
    default:
      return taskStatusTypes.inProgress;
  }
};

export const mapStageDataToBackend = (drafts, changedFieldsSet, propId) => {
  const castValue = (key, value) => {
    switch (key) {
      case 'active':
        return stageStatusTypes.inProgress === value;
      case 'start':
        return format(value, "yyyy-MM-dd'T'HH:mm:ss");
      case 'deadline':
        return format(value, "yyyy-MM-dd'T'HH:mm:ss");
      default:
        return value; // По умолчанию оставить как есть
    }
  };

  const mapKeyToBackend = (key, draft) => {
    const keyMapping = {
      status: 'active',
      title: 'name',
      startTime: 'start',
      actSum: 'act_sum',
      taskDescription: 'technical_specification',
      // Добавляем дополнительные ключи по мере необходимости
    };

    return keyMapping[key] || key;
  };

  return mapChangedFieldsForBackend(
    drafts,
    changedFieldsSet,
    mapKeyToBackend,
    castValue,
  );
};
