export const taskStatusTypes = {
  created: 'created',
  inProgress: 'inProgress',
  onReview: 'onReview',
  finished: 'finished',

  onHold: 'onHold',
};
export const taskStatusTypesRu = {
  inProgress: 'В работе',
  finished: 'Завершено',
  created: 'Создана',
  onReview: 'Ожидают проверку',
  onHold: 'Отложено',
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
  inProgress: { status: taskStatusTypesRu.inProgress, class: 'status-green' },
  finished: { status: taskStatusTypesRu.finished, class: 'status-red' },
  created: { status: taskStatusTypesRu.created, class: 'status-blue' },
  onReview: { status: taskStatusTypesRu.onReview, class: 'status-yellow' },
  onHold: { status: taskStatusTypesRu.onHold, class: 'status-disabled' },
};

export const colorStatusTaskTypesForTaskList = {
  inProgress: {
    status: taskStatusTypesRu.inProgress,
    class: 'status-task-green',
  },
  finished: { status: taskStatusTypesRu.finished, class: 'status-task-red' },
  created: { status: taskStatusTypesRu.created, class: 'status-task-blue' },
  onReview: { status: taskStatusTypesRu.onReview, class: 'status-task-yellow' },
  onHold: { status: taskStatusTypesRu.onHold, class: 'status-task-disabled' },
};
