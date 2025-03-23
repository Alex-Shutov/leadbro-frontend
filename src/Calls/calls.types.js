export const callStatusTypes = {
  COMPLETED: 'completed',
  MISSED: 'missed',
  IN_PROGRESS: 'in_progress',
};

export const callDirectionTypes = {
  INCOMING: 'incoming',
  OUTGOING: 'outgoing',
  MISSED: 'missed',
};

export const colorStatusTypes = {
  [callStatusTypes.COMPLETED]: {
    class: 'status-green',
    status: 'Завершен',
  },
  [callStatusTypes.MISSED]: {
    class: 'status-red',
    status: 'Пропущен',
  },
  [callStatusTypes.IN_PROGRESS]: {
    class: 'status-yellow',
    status: 'В процессе',
  },
};
