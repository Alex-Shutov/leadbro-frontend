import { taskableTypes } from '../pages/Tasks/tasks.types';
import {camelToSnakeCase} from "./mapper";

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

export const sanitizeUrlFilters = (filters) => {
  const sanitizedFilters = {};

  Object.entries(filters).forEach(([key, value]) => {
    // Проверяем на null, undefined, пустую строку и пустой массив
    if (
        value === null ||
        value === undefined ||
        value === '' ||
        (Array.isArray(value) && value.length === 0)
    ) {
      return;
    }

    const snakeKey = camelToSnakeCase(key);

    if (Array.isArray(value)) {
      if (value[0]?.hasOwnProperty('value')) {
        const arrayValue = value.map(item => item.value).join(',');
        // Добавляем только если есть значение после join
        if (arrayValue) {
          sanitizedFilters[snakeKey] = arrayValue;
        }
      } else {
        const arrayValue = value.join(',');
        if (arrayValue) {
          sanitizedFilters[snakeKey] = arrayValue;
        }
      }
    } else if (value?.hasOwnProperty('value')) {
      // Добавляем только если value не пустой
      if (value.value) {
        sanitizedFilters[snakeKey] = value.value;
      }
    } else {
      // Добавляем только непустые значения
      if (value) {
        sanitizedFilters[snakeKey] = value;
      }
    }
  });

  return sanitizedFilters;
};