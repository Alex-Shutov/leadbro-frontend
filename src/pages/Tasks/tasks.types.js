export const tasksTypes = {
  frontend: 'frontend',
  backend: 'backend',
  seo: 'seo',
  design: 'design',
  internal: 'internal',
  analytics: 'analytics',
  brief: 'brief',
  calculation: 'calculation',
};

export const tasksTypesRu = {
  frontend: 'Фронтенд',
  backend: 'Бэкенд',
  seo: 'SEO',
  design: 'Дизайн',
  internal: 'Внутренний',
  analytics: 'Аналитика',
  brief: 'Бриф',
  calculation: 'Расчет',
};

export const taskableTypes = {
  deal: 'App\\Models\\Deal',
  stage: 'App\\Models\\Stage',
};

export const colorTasksTypes = {
  design: { status: tasksTypesRu.design, class: 'status-green' },
  seo: { status: tasksTypesRu.seo, class: 'status-red' },
  frontend: { status: tasksTypesRu.frontend, class: 'status-purple' },
  backend: { status: tasksTypesRu.backend, class: 'status-blue' },
  internal: { status: tasksTypesRu.internal, class: 'status-yellow' },
  analytics: { status: tasksTypesRu.analytics, class: 'status-grey' },
  brief: { status: tasksTypesRu.brief, class: 'status-brown' },
  calculation: { status: tasksTypesRu.calculation, class: 'status-pink' },
};
