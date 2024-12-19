import { mapChangedFieldsForBackend } from '../../utils/store.utils';
import { loadAvatar } from '../../utils/create.utils';
import { mapTaskFromApi } from '../Tasks/tasks.mapper';
import { createMockTasks } from './deals.mock';
import { mapCommentsFromApi } from '../Clients/clients.mapper';

export const mapDealFromApi = (apiDeal, tasksDeal, comments = []) => {
  return {
    id: apiDeal?.id,
    createdAt: new Date(apiDeal?.created_at),
    name: apiDeal?.name,
    description: Boolean(apiDeal?.description) ? apiDeal?.description : ' ',
    note: apiDeal?.note ?? '',
    source: apiDeal?.source,
    serviceType: apiDeal?.service_type,
    price: apiDeal?.price,
    status: apiDeal?.status,
    creator: apiDeal?.creator
      ? {
          id: apiDeal?.creator.id,
          name: apiDeal?.creator.name,
          middleName: apiDeal?.creator.middle_name,
          lastName: apiDeal?.creator.last_name,
          image: loadAvatar(apiDeal?.creator.avatar),
          role: apiDeal?.creator.position.name,
        }
      : null,
    responsible: apiDeal?.responsible
      ? {
          id: apiDeal?.responsible.id,
          name: apiDeal?.responsible.name,
          middleName: apiDeal?.responsible.middle_name,
          lastName: apiDeal?.responsible.last_name,
          image: loadAvatar(apiDeal?.responsible.avatar),
          role: apiDeal?.responsible.position.name,
        }
      : null,
    auditor: apiDeal?.auditor
      ? {
          id: apiDeal?.auditor.id,
          name: apiDeal?.auditor.name,
          middleName: apiDeal?.auditor.middle_name,
          lastName: apiDeal?.auditor.last_name,
          image: loadAvatar(apiDeal?.auditor.avatar),
          role: apiDeal?.auditor.position.name,
        }
      : null,
    manager: apiDeal?.manager
      ? {
          id: apiDeal?.manager.id,
          name: apiDeal?.manager.name,
          middleName: apiDeal?.manager.middle_name,
          lastName: apiDeal?.manager.last_name,
          image: loadAvatar(apiDeal?.manager.avatar),
          role: apiDeal?.manager.position.name,
        }
      : null,
    company: apiDeal?.company
      ? {
          image: loadAvatar(),
          id: apiDeal?.company.id,
          name: apiDeal?.company.name,
        }
      : null,
    tasks: tasksDeal ? mapTasksFromApi(tasksDeal) : [],
    comments: mapCommentsFromApi(comments),
  };
};

const mapTasksFromApi = (tasksData) => {
  return tasksData?.reduce((acc, task,index) => {
    const mappedTask = mapTaskFromApi(task);
      acc[mappedTask.id] = {
          ...mappedTask,
          order: index
      };
    return acc;
  }, {});
};

export const mapDealDataToBackend = (drafts, changedFieldsSet) => {
  const castValue = (key, value) => {
    switch (key) {
      case 'responsible_id':
      case 'auditor_id':
      case 'manager_id':
      case 'company_id':
        return value ? Number(value.id) : null;
      case 'price':
        return Number(value);
      default:
        return value;
    }
  };

  const mapKeyToBackend = (key) => {
    const keyMapping = {
      responsible: 'responsible_id',
      auditor: 'auditor_id',
      manager: 'manager_id',
      company: 'company_id',
      serviceType: 'service_type',
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
