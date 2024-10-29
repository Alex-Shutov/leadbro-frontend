// billsMapper.js

import { formatDateToBackend } from '../../utils/formate.date';
import { mapChangedFieldsForBackend } from '../../utils/store.utils';

export const mapBillFromApi = (apiBill) => {
  return {
    id: apiBill.id,
    number: apiBill.number,
    creationDate: new Date(apiBill.creation_date),
    paymentDate: new Date(apiBill.payment_date),
    paymentReason:'',
    company: apiBill.company
      ? {
          id: apiBill.company.id,
          name: apiBill.company.name,
        }
      : null,
    legalEntity: apiBill.legal_entity
      ? {
          id: apiBill.legal_entity.id,
          name: apiBill.legal_entity.name,
        }
      : null,
    items: apiBill.items.map((item) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      measurementUnit: item.measurement_unit,
    })),
    sum: apiBill.sum,
    status: apiBill.status,
    stampedBill: apiBill.stamped_bill,
    unstampedBill: apiBill.unstamped_bill,
    stampedAct: apiBill.stamped_act,
    unstampedAct: apiBill.unstamped_act,
  };
};

export const mapBillDataToBackend = (drafts, changedFieldsSet) => {
  const castValue = (key, value) => {
    switch (key) {
      case 'legalEntityId':
        return Number(value.id);
      case 'companyId':
        return Number(value.id);
      case 'creationDate':
      case 'paymentDate':
        return formatDateToBackend(value);
      default:
        return value;
    }
  };

  const mapKeyToBackend = (key, draft) => {
    const keyMapping = {
      legalEntity: 'legal_entity_id',
      company: 'company_id',
      creationDate: 'creation_date',
      paymentDate: 'payment_date',
      // Добавьте дополнительные ключи по мере необходимости
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
