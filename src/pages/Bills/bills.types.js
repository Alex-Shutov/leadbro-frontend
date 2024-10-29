export const billStatusTypes = {
  created: 'created',
  paid: 'paid',
  expired: 'expired',
};

export const billStatusTypesRu = {
  created: 'Выставлен',
  paid: 'Оплачен',
  expired: 'Просрочен',
};

export const colorBillStatusTypes = {
  created: { status: billStatusTypesRu.created, class: 'status-blue' },
  paid: { status: billStatusTypesRu.paid, class: 'status-green' },
  expired: { status: billStatusTypesRu.expired, class: 'status-red' },
};


export const measurementUnitTypes = {
  pcs: 'pcs',
  hours: 'hours'
};

export const measurementUnitTypesRu = {
  pcs: 'шт',
  hours: 'часы'
};