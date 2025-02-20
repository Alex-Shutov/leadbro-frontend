import { formatDateToBackend } from '../../utils/formate.date';
import { mapChangedFieldsForBackend } from '../../utils/store.utils';

export const mapBusinessFromApi = (apiBusiness) => {
  return {
    id: apiBusiness?.id,
    name: apiBusiness?.name,
    description: apiBusiness?.description,
    type: apiBusiness?.type,
    finished: apiBusiness?.finished,
    startDate: new Date(apiBusiness?.start),
    endDate: new Date(apiBusiness?.end),
    creator: apiBusiness?.creator
      ? {
          id: apiBusiness.creator.id,
          name: apiBusiness.creator.name,
          middleName: apiBusiness.creator.middle_name,
          lastName: apiBusiness.creator.last_name,
          avatar: apiBusiness.creator.avatar,
          position: apiBusiness.creator.position,
        }
      : null,
    performer: apiBusiness?.performer
      ? {
          id: apiBusiness.performer.id,
          name: apiBusiness.performer.name,
          middleName: apiBusiness.performer.middle_name,
          lastName: apiBusiness.performer.last_name,
          avatar: apiBusiness.performer.avatar,
          position: apiBusiness.performer.position,
        }
      : null,
  };
};

export const mapBusinessToBackend = (drafts, changedFieldsSet) => {
  const castValue = (key, value) => {
    switch (key) {
      case 'date_from':
      case 'date_to':
        return formatDateToBackend(value);
      case 'employee_id':
        return Number(value?.id);
      case 'start':

      default:
        return value;
    }
  };

  const mapKeyToBackend = (key, draft) => {
    const keyMapping = {
      startDate: 'date_from',
      endDate: 'date_to',
      performer: 'employee_id',
      startDateMonth: 'start',
      endDateMonth: 'end',
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
