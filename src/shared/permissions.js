export const Permissions = {
  // Администрирование
  SUPER_ADMIN: 'superAdmin',

  // Сделки
  ACCESS_DEALS: 'accessDeals',
  ACCESS_ALL_DEALS: 'accessAllDeals',
  CREATE_DEALS: 'createDeals',
  EDIT_DEALS: 'editDeals',
  DELETE_DEALS: 'deleteDeals',

  // Компании
  ACCESS_COMPANIES: 'accessCompanies',
  ACCESS_ALL_COMPANIES: 'accessAllCompanies',
  CREATE_COMPANIES: 'createCompanies',
  EDIT_COMPANIES: 'editCompanies',
  DELETE_COMPANIES: 'deleteCompanies',

  // Клиенты
  VIEW_CLIENTS: 'viewClients',
  CREATE_CLIENTS: 'createClients',
  EDIT_CLIENTS: 'editClients',
  DELETE_CLIENTS: 'deleteClients',

  // Услуги
  ACCESS_SERVICES: 'accessServices',
  ACCESS_ALL_SERVICES: 'accessAllServices',
  CREATE_SERVICES: 'createServices',
  EDIT_SERVICES: 'editServices',
  DELETE_SERVICES: 'deleteServices',

  // Задачи
  VIEW_ALL_TASKS: 'viewAllTasks',

  // Счета
  ACCESS_BILLS: 'accessBills',
  ACCESS_ALL_BILLS: 'accessAllBills',
  CREATE_BILLS: 'createBills',
  EDIT_BILLS: 'editBills',
  DELETE_BILLS: 'deleteBills',

  // Другое
  ACCESS_EMPLOYEES: 'accessEmployees',
  ACCESS_LEGAL_ENTITIES: 'accessLegalEntities',
};

export const PermissionGroups = {
  DEALS: [
    Permissions.ACCESS_DEALS,
    Permissions.ACCESS_ALL_DEALS,
    Permissions.CREATE_DEALS,
    Permissions.EDIT_DEALS,
    Permissions.DELETE_DEALS,
  ],

  COMPANIES: [
    Permissions.ACCESS_COMPANIES,
    Permissions.ACCESS_ALL_COMPANIES,
    Permissions.CREATE_COMPANIES,
    Permissions.EDIT_COMPANIES,
    Permissions.DELETE_COMPANIES,
  ],

  CLIENTS: [
    Permissions.VIEW_CLIENTS,
    Permissions.CREATE_CLIENTS,
    Permissions.EDIT_CLIENTS,
    Permissions.DELETE_CLIENTS,
  ],

  SERVICES: [
    Permissions.ACCESS_SERVICES,
    Permissions.ACCESS_ALL_SERVICES,
    Permissions.CREATE_SERVICES,
    Permissions.EDIT_SERVICES,
    Permissions.DELETE_SERVICES,
  ],

  BILLS: [
    Permissions.ACCESS_BILLS,
    Permissions.ACCESS_ALL_BILLS,
    Permissions.CREATE_BILLS,
    Permissions.EDIT_BILLS,
    Permissions.DELETE_BILLS,
  ],
};

export const isValidPermission = (permission) => {
  // Создаем список всех возможных разрешений
  const allPermissions = [
    ...Object.values(Permissions),
    ...Object.values(PermissionGroups).flat(),
  ];

  // Если передан массив - проверяем каждое разрешение
  if (Array.isArray(permission)) {
    return permission.every((p) => allPermissions.includes(p));
  }

  // Если передано одно разрешение - проверяем его наличие в списке
  return allPermissions.includes(permission);
};
