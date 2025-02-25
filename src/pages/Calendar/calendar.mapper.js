import {formatDateOnlyHours, formatDateToBackend} from '../../utils/formate.date';
import { mapChangedFieldsForBackend } from '../../utils/store.utils';
import {loadAvatar} from "../../utils/create.utils";
import {mapEmployeesFromApi} from "../Settings/settings.mapper";
import {mapCommentsFromApi} from "../Clients/clients.mapper";
import {format} from "date-fns";

export const mapBusinessFromApi = (apiBusiness,apiComments=[]) => {
  const startDate = new Date(apiBusiness?.start);
  const endDate = new Date(apiBusiness?.end);
  return {
    id: apiBusiness?.id,
    name: apiBusiness?.name,
    description: apiBusiness?.description,
    type: apiBusiness?.type,
    finished: apiBusiness?.finished,
    startDate: new Date(apiBusiness?.start),
    endDate: new Date(apiBusiness?.end),
    startTime: format(startDate, 'HH:mm'),
    endTime: format(endDate, 'HH:mm'),
    creator: mapEmployeesFromApi(apiBusiness.creator),
    performer: mapEmployeesFromApi(apiBusiness.performer),
    comments: mapCommentsFromApi(apiComments),
  };
};

export const mapBusinessToBackend = (drafts, changedFieldsSet) => {
  const castValue = (key, value,oldKey) => {
    debugger
    switch (key) {
      case 'date_from':
      case 'date_to':
        return formatDateToBackend(value).replace('T', ' ');
      case 'employee_id':
      case 'performer_id':
        debugger
        return Number(value[0]?.id);
      case 'start':
        if (oldKey === 'startTime') {
          // Если изменено startTime, нужно обновить часы в startDate
          const startDate = new Date(drafts.startDate);
          const [hours, minutes] = value.split(':').map(Number);
          startDate.setHours(hours, minutes, 0, 0);
          return formatDateToBackend(startDate).replace('T', ' ');
        }
        return formatDateToBackend(value).replace('T', ' ');
      case 'end':
        if (oldKey === 'endTime') {
          // Если изменено endTime, нужно обновить часы в endDate
          const endDate = new Date(drafts.endDate);
          const [hours, minutes] = value.split(':').map(Number);
          endDate.setHours(hours, minutes, 0, 0);
          return formatDateToBackend(endDate).replace('T', ' ');
        }
        return formatDateToBackend(value).replace('T', ' ');
      case 'finished':
          return value ? 1 : 0
      default:
        return value;
    }
  };

  const mapKeyToBackend = (key, draft) => {
    const keyMapping = {
      startDate: 'start',
      endDate: 'end',
      performer: 'performer_id',
      startDateMonth: 'start',
      endDateMonth: 'end',
      endTime:'end',
      startTime:'start',

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
