import { createBlob } from '../../utils/create.utils';
import { mapChangedFieldsForBackend } from '../../utils/store.utils';
import { serviceTypeEnum, statusActTypes, statusTypes } from './services.types';
import { serviceStatuses } from './components/ServicePage/components/Statuses';

// Маппинг данных сервиса с бэкенда
export const mapServiceFromApi = (apiService, stagesData) => {
  return {
    id: apiService.id,
    title: apiService.name, // Название услуги
    deadline: apiService.deadline,
    contractNumber: apiService.contract_number || '4444', // Номер договора
    client: apiService.company
      ? {
          id: apiService.company.id,
          title: apiService.company.name,
        }
      : null,
    type: apiService.type,
    manager: mapManager(apiService.responsible),
    command: mapParticipants(apiService.participants),
    status: mapServiceStatus(apiService.active), // Статус (активна ли услуга)
    stages: mapStages(stagesData || apiService.stages), // Этапы
    tasks: mapTasks(stagesData.tasks), // Задачи
  };
};

// Маппинг менеджера (ответственного)
const mapManager = (manager) => {
  if (!manager) return null;
  return {
    id: manager.id,
    name: manager.name,
    surname: manager.last_name,
    middleName: manager.middle_name,
    avatar: manager.avatar ? createBlob(manager.avatar) : null,
    role: manager.position?.name,
    email: manager.email,
    phone: manager.phone || null,
  };
};

// Маппинг команды участников
const mapParticipants = (participants) => {
  return participants.map((participant) => ({
    id: participant.id,
    name: participant.name,
    surname: participant.last_name,
    middleName: participant.middle_name,
    avatar: participant.avatar ? createBlob(participant.avatar) : null,
    role: participant.position?.name,
    email: participant.email,
    phone: participant.phone || null,
  }));
};

// Маппинг этапов
// Маппинг этапов
const mapStages = (stages) => {
  // Если это массив этапов (пришел из /api/services/{service_id}/stages)
  if (Array.isArray(stages)) {
    return stages.map((stage) => ({
      id: stage.id,
      title: stage.name,
      number: '1234',
      time: {
        planned: {
          planned: 5,
          actual: 8,
          type: 'часов',
        },
        extra: {
          planned: 5,
          actual: 8,
          type: 'часов',
          cost: 7500,
        },
      },
      act: {
        scanStatus: statusActTypes.notAssignedScan,
        originalStatus: statusActTypes.notAssignedOriginal,
        withSign: {
          id: 0,
          file: 'Act with sign',
          extension: '.pdf',
        },
        withoutSign: {
          id: 1,
          file: 'Act without sign',
          extension: '.pdf',
        },
      },
      payedDate: new Date(2024, 12, 12),
      startDate: new Date(stage.start),
      endDate: stage.deadline ? new Date(stage.deadline) : null,
      description: stage.technical_specification,
      cost: stage.actSum, // Стоимость этапа
      active: stage.active === 1 ? serviceStatuses.tasks.inProgress : '',
    }));
  }

  // Если это объект этапов (пришел из getServices)
  if (!stages || !stages.last) return null;

  return {
    total: stages.total,
    last: {
      id: stages.last.id,
      title: stages.last.name,
      startDate: new Date(stages.last.start),
      endDate: new Date(stages.last.deadline),
      description: stages.last.technical_specification,
      cost: stages.last.actSum, // Стоимость услуги на данном этапе
      active: stages.last.active === 1, // Признак активности
    },
  };
};

// Маппинг задач
const mapTasks = (tasks) => {
  debugger;
  if (!tasks || !tasks.last) return null;

  return {
    total: tasks.total,
    last: {
      id: tasks.last.id,
      name: tasks.last.name,
      description: tasks.last.description,
      type: tasks.last.type,
      status: tasks.last.status,
      startDate: new Date(tasks.last.startDate || tasks.last.deadline),
      endDate: new Date(tasks.last.deadline),
      plannedTime: tasks.last.planned_time || null,
      actualTime: tasks.last.actual_time || null,
      responsible: mapManager(tasks.last.responsible),
      performer: mapManager(tasks.last.performer),
      auditors: mapParticipants(tasks.last.auditors),
      showAtClientCabinet: tasks.last.show_at_client_cabinet === 1,
    },
  };
};

// Маппинг статуса услуги
const mapServiceStatus = (active) => {
  return active ? statusTypes.inProgress : statusTypes.finished;
};

// Маппинг типа услуги
const mapServiceType = (type) => {
  const types = {
    seo: 'SEO продвижение',
    development: 'Разработка',
    consulting: 'Консалтинг',
  };
  return types[type] || 'Неизвестный тип';
};

// Маппинг данных для отправки на бэкенд
export const mapServiceDataToBackend = (drafts, changedFieldsSet, propId) => {
  const castValue = (key, value) => {
    switch (key) {
      case 'responsible_id':
        return Number(value.id);
      case 'participants_ids':
        return value.map((el) => el.id);
      case 'active':
        return statusTypes.inProgress === value;
      case 'deadline':
        return value.toISOString().slice(0, -5);
      case 'client':
        return value.id;
      default:
        return value; // По умолчанию оставить как есть
    }
  };

  const mapKeyToBackend = (key, draft) => {
    const keyMapping = {
      manager: 'responsible_id',
      client: 'client',
      // 'client': 'company_id',
      deadline: 'deadline',
      status: 'active',
      command: 'participants_ids',
      title: 'name',
      contractNumber: 'contract_number',
      'type.title': 'type',
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
