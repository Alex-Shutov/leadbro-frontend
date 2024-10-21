export const taskStatusTypes = {
  created: 'created',
  in_work: 'in_work',
  waiting_for_approval: 'waiting_for_approval',
  finished: 'finished',
  paused: 'paused',
};
export const taskStatusTypesRu = {
  in_work: 'В работе',
  finished: 'Завершено',
  created: 'Создана',
  waiting_for_approval: 'Ожидает проверку',
  paused: 'Отложено',
};

export const stageStatusTypes = {
  inProgress: 'inProgress',
  finished: 'finished',
};
export const stageStatusTypesRu = {
  inProgress: 'В работе',
  finished: 'Завершен',
};

export const colorStatusTaskTypes = {
  in_work: { status: taskStatusTypesRu.in_work, class: 'status-green' },
  finished: { status: taskStatusTypesRu.finished, class: 'status-red' },
  created: { status: taskStatusTypesRu.created, class: 'status-blue' },
  waiting_for_approval: { status: taskStatusTypesRu.waiting_for_approval, class: 'status-yellow' },
  paused: { status: taskStatusTypesRu.paused, class: 'status-disabled' },
};

export const colorStatusTaskTypesForTaskList = {
  in_work: {
    status: taskStatusTypesRu.in_work,
    class: 'status-task-green',
  },
  finished: { status: taskStatusTypesRu.finished, class: 'status-task-red' },
  created: { status: taskStatusTypesRu.created, class: 'status-task-blue' },
  waiting_for_approval: { status: taskStatusTypesRu.waiting_for_approval, class: 'status-task-yellow' },
  paused: { status: taskStatusTypesRu.paused, class: 'status-task-disabled' },
};
