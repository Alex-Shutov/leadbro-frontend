// billsApi.js

import useStore from '../../hooks/useStore';
import {getPageTypeFromUrl, getQueryParam, sanitizeUrlFilters} from '../../utils/window.utils';
import { mapBillDataToBackend, mapBillFromApi } from './bills.mapper';
import {
  handleHttpError,
  handleHttpResponse,
  handleShowError,
  http,
  resetApiProvider,
} from '../../shared/http';
import { useState } from 'react';
import { API_URL } from '../../shared/constants';
import { sanitizeObjectForBackend } from '../../utils/create.utils';
import { startOfDay, sub } from 'date-fns';
import useQueryParam from '../../hooks/useQueryParam';
import { formatDateForUrl } from './components/BillsTable';
import useStageApi from '../Stages/stages.api';
import useServiceApi from '../Services/services.api';
import { useParams } from 'react-router';
import {periodEnum} from "./bills.filter.conf";
import {formatDateToQuery} from "../../utils/formate.date";

const useBillsApi = () => {
  const { billsStore } = useStore();
  const serviceApi = useServiceApi();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const getBills = (page = 1, from, to,filters={}) => {
    debugger
    resetApiProvider();
    setIsLoading(true);
    const sanitizedFilters = sanitizeUrlFilters(filters)
    const params = { page };

    if (getQueryParam('date_range')) {

      const rangeParams = new URLSearchParams(getQueryParam('date_range'));
      params.from = rangeParams.get('from')
      params.to = rangeParams.get('to')
      delete sanitizedFilters.date_range;
      delete sanitizedFilters.period;
    }
    else if (sanitizedFilters.period) {
      params.period = sanitizedFilters.period;
      delete sanitizedFilters.period;
      delete sanitizedFilters.date_range;
    }
    else if (from && to) {
      params.period = periodEnum.month
      delete sanitizedFilters.date_range;

    }

    return http
        .get('api/bills', {
          params: {
           ...params,
            ...sanitizedFilters // Добавляем параметры фильтрации
          }
        })
      .then(handleHttpResponse)
      .then((res) => {
        const mappedBills = res.body.data.map((bill) => mapBillFromApi(bill));
        billsStore.setBills(mappedBills);
        billsStore.setMetaInfoTable(res.body?.meta);
        billsStore.setStats(res.body.stats);
      })
      .catch(handleHttpError)
      .finally(() => setIsLoading(false));
  };

  const createBill = (body,stageId) => {
    const today = startOfDay(new Date());
    const monthAgo = sub(today, { months: 1 });
    const todayFormatted = formatDateForUrl(today);

    const monthAgoFormatted = formatDateForUrl(monthAgo);

    const from = getQueryParam('from', monthAgoFormatted);
    const to = getQueryParam('to', todayFormatted);
    const pageFromUrl = getQueryParam('page', 1);
    resetApiProvider();
    setIsLoading(true);
    const createData = mapBillDataToBackend(body, Object.keys(body));
    const finalData = sanitizeObjectForBackend(createData, [
      'legal_entity_id',
      'creation_date',
      'number',
      'payment_date',
      'payment_reason',
      'stage_id',
      'bill_items',
    ]);
    return http
      .post('/api/bills', finalData)
      .then(handleHttpResponse)
      .then(() => stageId === null && getBills(pageFromUrl, from, to))
      .catch(handleShowError)
      .finally(() => setIsLoading(false));
  };

  const updateBill = (billId, updateData, stageMode = false) => {
    const today = startOfDay(new Date());
    const page = getQueryParam('page', 1);
    const monthAgo = sub(today, { months: 1 });
    const todayFormatted = formatDateForUrl(today);

    const monthAgoFormatted = formatDateForUrl(monthAgo);

    const from = getQueryParam('from', monthAgoFormatted);
    const to = getQueryParam('to', todayFormatted);
    resetApiProvider();
    setIsLoading(true);

    const allowedFields = [
      'legal_entity_id',
      'creation_date',
      'number',
      'payment_date',
      'payment_reason',
      'stage_id',
      'status',
      'bill_items',
    ];

    let dataToUpdate = mapBillDataToBackend(
      billsStore.drafts[billId],
      billsStore.changedProps,
    );

    if (dataToUpdate.bill_items) {
      const allowedItemFields = [
        'name',
        'price',
        'quantity',
        'measurement_unit',
      ];
      dataToUpdate.bill_items = dataToUpdate.bill_items.map((item) => {
        const sanitizedItem = sanitizeObjectForBackend(item, allowedItemFields);

        if (sanitizedItem.hasOwnProperty('measurementUnit')) {
          delete sanitizedItem.measurementUnit;
        }

        return sanitizedItem;
      });
    }

    const sanitizedData = sanitizeObjectForBackend(dataToUpdate, allowedFields);

    return http
      .patch(`/api/bills/${billId}`, sanitizedData)
      .then(handleHttpResponse)
      .then(() => {
        if (!stageMode) return getBills(page, from, to);
        return serviceApi.getServiceById(id, true);
      })
      .catch(handleHttpError)
      .finally(() => setIsLoading(false));
  };

  const getBillById = (billId) => {
    const page = getQueryParam('page', 1);
    resetApiProvider();
    setIsLoading(true);

    return http
      .get(`/api/bills/${billId}`)
      .then(handleHttpResponse)
      .then((res) => {
        const mappedBill = mapBillFromApi(res.body.data);
        billsStore.setCurrentBill(mappedBill);
      })
      .catch(handleHttpError)
      .finally(() => setIsLoading(false));
  };

  const deleteBill = async (billId, currentPage, from, to) => {
    resetApiProvider();
    setIsLoading(true);

    try {
      await http.delete(`/api/bills/${billId}`);
      const pageFromUrl = currentPage ?? getQueryParam('page', 1);
      await getBills(pageFromUrl, from, to);
      return true;
    } catch (error) {
      handleHttpError(error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const downloadBill = (url) => {
    window.open(url, '_blank');
  };

  return {
    getBills,
    createBill,
    updateBill,
    getBillById,
    deleteBill,
    downloadBill,
    isLoading,
  };
};

export default useBillsApi;
