import { statusTypes } from './clients.types'; // Предположим, что у вас есть statusTypes
import { loadAvatar } from '../../utils/create.utils';
import {
  getValueByPath,
  mapChangedFieldsForBackend,
  mapFio,
  MapFio,
} from '../../utils/store.utils';
import { handleError } from '../../utils/snackbar';
import { mapDealFromApi } from '../Deals/deals.mapper'; // Если требуется для аватара

export const mapClientFromApi = (
  apiClient,
  apiPasswords = [],
  apiContactPersons = [],
  apiComments = [],
  apiServices = [],
  apiDeals = [],
) => {
  return {
    id: apiClient?.id,
    description: apiClient?.description ?? ' ',
    title: apiClient?.name,
    status: mapStatus(apiClient?.status),
    manager: {
      id: apiClient?.manager.id,
      name: apiClient?.manager.name,
      surname: apiClient?.manager.last_name,
      middleName: apiClient?.manager.middle_name,
      avatar: apiClient?.manager.avatar
        ? loadAvatar(apiClient?.manager.avatar)
        : null,
      position: apiClient?.manager.position.name,
      email: apiClient?.manager.email,
      phone: apiClient?.manager.phone,
    },
    services: mapServices(apiClient?.services, apiServices),
    deals: apiDeals.map((el) => mapDealFromApi(el)),
    comments: mapCommentsFromApi(apiComments),
    activities: [
      {
        date: new Date(2024, 1, 11),
        time: new Date(),
        description: 'Звонок',
        type: 'call',
        members: 2,
        assignee: {
          image: loadAvatar(),
          name: 'Александр',
          surname: 'Шилов',
          role: 'Директор',
        },
      },
      {
        date: new Date(2024, 1, 11),
        time: new Date(),
        description: 'Звонок',
        type: 'call',
        members: 2,
        assignee: {
          image: loadAvatar(),
          name: 'Александр',
          surname: 'Шилов',
          role: 'Директор',
        },
      },
    ],

    contactPersons: mapContactPersons(apiContactPersons),
    contactData: {
      address: {
        0: apiClient?.address,
      },
      tel: {
        0: apiClient?.phone,
      },
      email: {
        0: apiClient?.email,
      },
      site: {
        0: apiClient?.site,
      },
      requisites: { 0: mapLegals(apiClient?.legals) },
    },
    passwords: mapPasswords(apiPasswords),
    ymetricsToken: apiClient?.ymetrics_token,
    topvisorToken: apiClient?.topvisor_token,
  };
};

const mapPasswords = (apiPasswords) => {
  return apiPasswords?.reduce((acc, password, index) => {
    acc[password.id] = {
      id: password.id,
      name: password.service_name,
      values: {
        login: password.login,
        password: password.password,
      },
    };
    return acc;
  }, {});
};

const mapContactPersons = (apiContactPersons) => {
  return apiContactPersons?.reduce((acc, client) => {
    acc[client.id] = {
      id: client.id,
      role: client.role, // или другой подходящий роль, если есть
      fio: `${client?.last_name ?? ''} ${client?.name ?? ''} ${client?.middle_name ? client.middle_name : ''}`,
      tel: client.phone ? client.phone : null,
      email: client.email ? client.email : null,
      messengers: [
        client.telegram
          ? { telegram: `https://t.me/${client.telegram}` }
          : null,
        client.whatsapp && client.phone
          ? { whatsapp: `https://api.whatsapp.com/send?phone=${client.phone}` }
          : null,
      ].filter((messenger) => messenger !== null), // Убираем null значения
    };

    return acc;
  }, {});
};

const mapLegals = (legals) => {
  return {
    INN: legals.inn,
    KPP: legals.kpp,
    OGRN: legals.ogrn,
    RS: legals.checking_account,
    CORR_RS: legals.correspondent_account,

    BIK: legals.bank_bic,
    BankName: legals.bank_name,
  };
};

const mapServices = (backendServices, apiServices) => {
  if (apiServices === undefined) {
    const { last } = backendServices;
    return {
      total: backendServices.total,
      value: {
        id: last.id,
        description: last.name, // Используем поле name для description
        creator: {
          name: last.responsible.name, // Отсутствует creator в API, поэтому используем responsible
          surname: last.responsible.last_name,
          role: last.responsible.position.name,
          image: loadAvatar(last.responsible.avatar),
        },
        responsible: {
          name: last.responsible.name,
          surname: last.responsible.last_name,
          role: last.responsible.position.name,
          image: loadAvatar(last.responsible.avatar),
        },
        deadline: new Date(last.deadline), // Преобразуем строку в дату
      },
    };
  }
  if (!apiServices?.length) {
    return null;
  }
  return apiServices.map((service) => ({
    id: service.id,
    description: service.name, // Используем поле name для description
    creator: {
      name: service.responsible.name, // Отсутствует creator в API, поэтому используем responsible
      surname: service.responsible.last_name,
      role: service.responsible.position.name,
      image: loadAvatar(service.responsible.avatar),
    },
    responsible: {
      name: service.responsible.name,
      surname: service.responsible.last_name,
      role: service.responsible.position.name,
      image: loadAvatar(service.responsible.avatar),
    },
    deadline: new Date(service.deadline), // Преобразуем строку в дату
  }));
};

// Маппинг статуса компании из API
const mapStatus = (status) => {
  switch (status) {
    case 'not_working':
      return statusTypes.notInProgress;
    case 'working':
      return statusTypes.inProgress;
    case 'partner':
      return statusTypes.partner;
    case 'competitor':
      return statusTypes.competitor;
    default:
      return statusTypes.unknown;
  }
};
export const mapCommentsFromApi = (apiComments) => {
  return apiComments?.reduce((acc, comment) => {
    acc[comment.id] = {
      id: comment.id,
      date: new Date(comment.created_at),
      sender: {
        id: comment.commentator.id,
        image: comment.commentator.avatar
          ? loadAvatar(comment.commentator.avatar)
          : loadAvatar(),
        name: `${comment.commentator.name}`,
        lastName: `${comment.commentator?.last_name ?? ''}`,
      },
      value: {
        text: comment.text,
        files: comment.files.map((file) => ({
          id: file.id,
          name: file.original_name,
          extension: `.${file.original_name.split('.').pop()}`,
          url: file.url,
        })),
      },
    };
    return acc;
  }, {});
};

export const mapCommentDataToBackend = (drafts, changedFieldsSet) => {
  const formData = new FormData();

  const mapCommentKeyToBackend = (key) => {
    const commentKeyMapping = {
      text: 'text',
      files: 'files',
    };

    return commentKeyMapping[key] || key;
  };

  // Map changed fields for text
  const changedData = mapChangedFieldsForBackend(
    drafts,
    changedFieldsSet,
    mapCommentKeyToBackend,
    (key, value) => value, // No special casting needed for comments
  );

  // Add text to FormData
  if (changedData.text) {
    formData.append('text', changedData.text);
  }

  // Add files to FormData if present
  if (changedData.files) {
    changedData.files.forEach((file, index) => {
      formData.append(`files[${index}]`, file);
    });
  }

  return formData;
};

export const mapClientDataToBackend = (drafts, changedFieldsSet, propId) => {
  // Обработка ФИО
  const fioParams = mapFio(drafts, changedFieldsSet, propId);
  const getCorrectStatus = (status) => {
    const snakeStatuses = {
      working: 'inProgress',
      not_working: 'notInProgress',
      partner: 'partner',
      competitor: 'competitor',
    };
    if (Object.values(statusTypes).includes(status)) {
      return (
        Object.entries(snakeStatuses).find(
          ([snake, camel]) => camel === status,
        )?.[0] || 'unknown'
      );
    }

    return snakeStatuses[status] || statusTypes.unknown;
  };
  const castValue = (key, value) => {
    switch (key) {
      case 'manager_id':
        return Number(value.id);
      case 'status':
        return getCorrectStatus(value);
      default:
        return value; // По умолчанию оставить как есть
    }
  };

  const mapKeyToBackend = (key, draft) => {
    const keyMapping = {
      [`passwords.${propId}.name`]: 'service_name',
      [`passwords.${propId}.values.login`]: 'login',
      [`passwords.${propId}.values.password`]: 'password',
      [`contactPersons.${propId}.role`]: 'role',
      [`contactPersons.${propId}.tel`]: 'phone',
      [`contactPersons.${propId}.email`]: 'email',
      'contactData.requisites.0.BankName': 'bank_name',
      'contactData.requisites.0.INN': 'inn',
      'contactData.requisites.0.KPP': 'kpp',
      'contactData.requisites.0.OGRN': 'ogrn',
      'contactData.requisites.0.RS': 'checking_account',
      'contactData.requisites.0.CORR_RS': 'correspondent_account',
      'contactData.requisites.0.BIK': 'bank_bic',

      'contactData.tel.0': 'phone',
      'contactData.site.0': 'site',
      'contactData.email.0': 'email',
      manager: 'manager_id',
      title: 'name',
      inn: 'inn',
      kpp: 'kpp',
      ogrn: 'ogrn',
      ymetricsToken: 'ymetrics_token',
      topvisorToken: 'topvisor_token',
      // Добавляем другие ключи по мере необходимости
    };

    return keyMapping[key] || key;
  };

  return {
    ...mapChangedFieldsForBackend(
      drafts,
      changedFieldsSet,
      mapKeyToBackend,
      castValue,
    ),
    ...fioParams,
  };
};
