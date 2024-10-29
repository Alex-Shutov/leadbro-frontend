// billsApi.js

import useStore from '../../hooks/useStore';
import { getQueryParam } from '../../utils/window.utils';
import { mapBillDataToBackend, mapBillFromApi } from './bills.mapper';
import {
  handleHttpError,
  handleHttpResponse,
  http,
  resetApiProvider,
} from '../../shared/http';

const useBillsApi = () => {
  const { billsStore } = useStore();

  const getBills = (page = 1, from, to) => {
    resetApiProvider();
    return http
      .get('/api/bills', { params: { page, from, to } })
      .then(handleHttpResponse)
      .then((res) => {
        const mappedBills = res.body.data.map((bill) => mapBillFromApi(bill));
        billsStore.setBills(mappedBills);
        billsStore.setMetaInfoTable(res.body.meta);
        billsStore.setStats(res.body.stats);
      })
      .catch(handleHttpError);
  };

  const createBill = (body) => {
    const pageFromUrl = getQueryParam('page', 1);
    resetApiProvider();
    return http
      .post('/api/bills', body)
      .then(handleHttpResponse)
      .then(() => getBills(pageFromUrl))
      .catch(handleHttpError);
  };

  const updateBill = (billId, updateData) => {
    resetApiProvider();
    updateData = mapBillDataToBackend(
      billsStore.drafts[billId],
      billsStore.changedProps,
    );
    return http
      .patch(`/api/bills/${billId}`, updateData)
      .then(handleHttpResponse)
      .then(() => getBillById(billId))
      .catch(handleHttpError);
  };

  const getBillById = (billId) => {
    resetApiProvider();
    return http
      .get(`/api/bills/${billId}`)
      .then(handleHttpResponse)
      .then((res) => {
        const mappedBill = mapBillFromApi(res.body.data);
        billsStore.setCurrentBill(mappedBill);
      })
      .catch(handleHttpError);
  };

  return {
    getBills,
    createBill,
    updateBill,
    getBillById,
  };
};

export default useBillsApi;
