import { taskableTypes } from '../pages/Tasks/tasks.types';

export const getQueryParam = (param, defaultValue = null) => {
  const searchParams = new URLSearchParams(window.location.search);

  // Получаем значение параметра
  const value = searchParams.get(param);

  // Если параметр найден, возвращаем его. Если нет, возвращаем дефолтное значение.
  return value !== null ? value : defaultValue;
};

export const getTaskableTypeFromUrl = (url) => {
  if (!url) return null;

  const urlPatterns = {
    deals: taskableTypes.deal,
    stages: taskableTypes.stage,
  };

  // Extract the relevant part from URL
  const matches = url.match(/\/(deals|stages)/);
  if (!matches) return null;

  return urlPatterns[matches[1]] || null;
};

export const getPageTypeFromUrl = (url) => {
  if (!url) return null;

  const urlPatterns = {
    clients: 'companies',
    deals: 'deals',
    tasks: 'tasks',
  };

  // Извлекаем нужную часть из URL
  const matches = url.match(/\/(clients|deals|tasks)/);
  if (!matches) return null;

  return urlPatterns[matches[1]] || null;
};

export const removeLastPathSegment = (pathname) => {
  const segments = pathname.split('/').filter(Boolean);
  segments.pop();
  return segments.length ? `/${segments.join('/')}` : '/';
};
