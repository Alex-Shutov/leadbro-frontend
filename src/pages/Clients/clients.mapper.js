import { statusTypes } from './clients.types'; // Предположим, что у вас есть statusTypes
import { createBlob } from '../../utils/create.utils';
import {
  getValueByPath,
  mapChangedFieldsForBackend, mapFio, MapFio,
} from '../../utils/store.utils';
import {handleError} from "../../utils/snackbar"; // Если требуется для аватара

export const mapClientFromApi = (
  apiClient,
  apiPasswords = [],
  apiContactPersons = [],
) => {
  return {
    id: apiClient.id,
    description: apiClient.description,
    title: apiClient.name,
    status: mapStatus(apiClient.status),
    manager: {
      id: apiClient.manager.id,
      name: apiClient.manager.name,
      surname: apiClient.manager.last_name,
      middleName: apiClient.manager.middle_name,
      avatar: apiClient.manager.avatar
        ? createBlob(apiClient.manager.avatar)
        : null,
      position: apiClient.manager.position.name,
      email: apiClient.manager.email,
      phone: apiClient.manager.phone,
    },
    services: mapServices(apiClient),
    deals: [
      {
        status: 'Догоовр подписан',
        sum: '39000',
        description: 'Связаться с клиентом',
        deadline: new Date(),
        responsible: {
          image: createBlob(),
          name: 'Александр',
          surname: 'Шилов',
          role: 'Директор',
          deadline: new Date(),
        },
      },
    ],
    activities: [
      {
        date: new Date(2024, 1, 11),
        time: new Date(),
        description: 'Звонок',
        type: 'call',
        members: 2,
        assignee: {
          image: createBlob(),
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
          image: createBlob(),
          name: 'Александр',
          surname: 'Шилов',
          role: 'Директор',
        },
      },
    ],
    contactPersons: mapContactPersons(apiContactPersons),
    contactData: {
      address: {
        0: apiClient.address,
      },
      tel: {
        0: apiClient.phone,
      },
      email: {
        0: apiClient.email,
      },
      site: {
        0: apiClient.site,
      },
      requisites: { 0: mapLegals(apiClient.legals) },
    },
    passwords: mapPasswords(apiPasswords),
    ymetricsToken: apiClient.ymetrics_token,
    topvisorToken: apiClient.topvisor_token,
  };
};

const mapPasswords = (apiPasswords) => {
  return apiPasswords.reduce((acc, password, index) => {
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
  return apiContactPersons.reduce((acc,client) => {
    acc[client.id] ={
      id: client.id,
      role: client.role, // или другой подходящий роль, если есть
      fio: `${client.last_name} ${client.name} ${client.middle_name ? client.middle_name  : ''}`,
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
  },{});
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

const mapServices = (backendServices) => {
  const { last } = backendServices.services;
  if (!last) {
    return null;
  }
  return {
    total: backendServices.services.total,
    value: {
      description: last.name, // Используем поле name для description
      creator: {
        name: last.responsible.name, // Отсутствует creator в API, поэтому используем responsible
        surname: last.responsible.last_name,
        role: last.responsible.position.name,
        image: null, // API не возвращает image
      },
      responsible: {
        name: last.responsible.name,
        surname: last.responsible.last_name,
        role: last.responsible.position.name,
        image: null, // API не возвращает image
      },
      deadline: new Date(last.deadline), // Преобразуем строку в дату
    },
  };
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

export const mapClientDataToBackend = (drafts, changedFieldsSet, propId) => {

  // Обработка ФИО
  const fioParams = mapFio(drafts,changedFieldsSet,propId)
  const castValue = (key, value) => {
    switch (key) {
      case 'manager_id':
        return Number(value.id);
      default:
        return value; // По умолчанию оставить как есть
    }
  };

  const mapKeyToBackend = (key,draft) => {

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

  return {...mapChangedFieldsForBackend(
    drafts,
    changedFieldsSet,
    mapKeyToBackend,
    castValue,
  ),...fioParams};
};
