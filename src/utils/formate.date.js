import { format, parse } from 'date-fns';
import { ru } from 'date-fns/locale/ru';

export const formatDate = (date) => {
  console.log(date, 'date');
  if (!date) return '';
  let formatDate = format(date, 'cccccc, dd LLL, HH:mm', { locale: ru });
  formatDate = formatDate.charAt(0).toUpperCase() + formatDate.slice(1);
  return formatDate;
};

export const formatDateWithoutHours = (date) => {
  if (!date) return '';
  const stringDate = date instanceof Date ? date.toISOString() : date;
  let formatDate = format(stringDate, 'cccccc, dd LLL', { locale: ru });
  formatDate = formatDate.charAt(0).toUpperCase() + formatDate.slice(1);
  return formatDate;
};

export const formatDateWithDateAndYear = (date) => {
  if (!date) return 'Не указано';

  let formatDate = format(date, 'dd MMMM, yyyy', { locale: ru });
  formatDate = formatDate.charAt(0).toUpperCase() + formatDate.slice(1);
  return formatDate;
};

export const formatDateOnlyHours = (date) => {
  if (!date) return;
  const stringDate = date instanceof Date ? date.toISOString() : date;
  const time = stringDate.split('T')[1].slice(0, -1);
  return format(
    parse(time.split(':', 2).join(':'), 'HH:mm', new Date()),
    'HH:mm ',
  );
};

export const formatDateWithOnlyDigits = (date) => {
  if (!date) return;

  let formatDate = format(date, 'dd.MM.yyyy', { locale: ru });
  formatDate = formatDate.charAt(0).toUpperCase() + formatDate.slice(1);
  return formatDate;
};

export const formatHours = (date) => {
  if (!date) return;

  return format(date, 'HH:mm');
};

export const formatDateToBackend = (value) => {
  if (!value) return;

  return format(value, "yyyy-MM-dd'T'HH:mm:ss");
};

export const formatDateToQuery = (value) => {
  if (!value) return;

  return format(value, 'yyyy-MM-dd');
};
