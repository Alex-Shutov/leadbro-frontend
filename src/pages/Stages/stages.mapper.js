import { loadAvatar } from '../../utils/create.utils';
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
    tasks: mapTasksFromApi(tasksData),
  };
};

const mapTasksFromApi = (tasksData) => {
  debugger
  return tasksData.reduce((acc, task) => {
      const mappedTask = mapTaskFromApi(task);
      acc[mappedTask.id] = mappedTask;
      return acc;
    }, {})

};

const mapTaskFromApi = (task) => {
  debugger;
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
    taskLinked: task?.linked_task,
    type: task?.type,
    auditors: task.auditors ? task.auditors.map(mapManager) : [],
    executors: task.performer ? [task.performer].map(mapManager) : [],
    responsibles: task.responsible ? mapManager(task.responsible) : [],
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
    image: participant.avatar ? loadAvatar(participant.avatar) : null,
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

const mapManager = (manager) => {
  if (!manager) return null;
  return {
    id: manager.id,
    name: manager.name,
    surname: manager.last_name,
    middleName: manager.middle_name,
    avatar: manager.avatar ? loadAvatar(manager.avatar) : null,
    role: manager.position?.name,
    email: manager.email,
    phone: manager.phone || null,
  };
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
  debugger
  const castValue = (key, value) => {
    debugger
    switch (key) {
      case 'active':
        return stageStatusTypes.inProgress === value;
      case 'start':
        return format(value, "yyyy-MM-dd'T'HH:mm:ss");
      case 'deadline':
        return format(value, "yyyy-MM-dd'T'HH:mm:ss");
      case 'actual_time':
      case 'planned_time':
        return parseFloat(value); // Если нужны бинарные числа, преобразуем в float
      case 'show_at_client_cabinet':
        debugger
        return Boolean(value); // Преобразуем в булевое значение
      case 'responsible_id':
        return value.id
      case 'performer_id':
        debugger
        return value.map(el=>el.id)[0]
      case 'auditors_ids':
        return value.map(el=>el.id); // Преобразуем идентификаторы в строки
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
      actualTime:'actual_time',
      type:'type',
      deadline:'deadline',
      responsibles:'responsible_id',
      auditors:'auditors',
      deadlineTime:'deadlineTime',
      executors:'performer_id',
      taskLinked:'linked_task',
      showInLK:'show_at_client_cabinet',
      description:'description',
      [`tasks.${propId}.actualTime`]: 'actual_time',
      [`tasks.${propId}.title`]: 'name',
      [`tasks.${propId}.type`]: 'type',
      [`tasks.${propId}.deadline`]: 'deadline',
      [`tasks.${propId}.responsibles`]: 'responsible_id',
      [`tasks.${propId}.auditors`]: 'auditors_ids',
      [`tasks.${propId}.deadlineTime`]: 'deadline', // Привязка времени к 'deadline'
      [`tasks.${propId}.executors`]: 'performer_id',
      [`tasks.${propId}.showInLK`]: 'show_at_client_cabinet',
      [`tasks.${propId}.description`]: 'description',
      [`tasks.${propId}.taskLinked`]: 'linked_task',
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
