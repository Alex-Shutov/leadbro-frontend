import { getQueryParam } from './window.utils';
import { periodEnum } from '../pages/Bills/bills.filter.conf';

export const sanitizeDateAndPeriodFilters = (params, sanitizedFilters) => {
  if (getQueryParam('date_range')) {
    const rangeParams = new URLSearchParams(getQueryParam('date_range'));
    params.from = rangeParams.get('from');
    params.to = rangeParams.get('to');
    delete sanitizedFilters.date_range;
    delete sanitizedFilters.period;
  } else if (sanitizedFilters.period) {
    params.period = sanitizedFilters.period;
    delete sanitizedFilters.period;
    delete sanitizedFilters.date_range;
  } else {
    params.period = getQueryParam('period', periodEnum.month);
    delete sanitizedFilters.date_range;
    delete sanitizedFilters.period;
  }
  if (sanitizedFilters?.is_submit) {
    delete sanitizedFilters.is_submit;
  }
  return [params, sanitizedFilters];
};
