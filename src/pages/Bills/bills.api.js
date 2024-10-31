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
import {useState} from "react";

const useBillsApi = () => {
  const { billsStore } = useStore();
  const [isLoading,setIsLoading] = useState(false)
  const getBills = (page = 1, from, to) => {
    resetApiProvider();
    setIsLoading(true)
    return http
      .get('/api/bills', { params: { page, from, to } })
      .then(handleHttpResponse)
      .then((res) => {
        const mappedBills = res.body.data.map((bill) => mapBillFromApi(bill));
        billsStore.setBills(mappedBills);
        billsStore.setMetaInfoTable(res.body.meta);
        billsStore.setStats(res.body.stats);
      })
      .catch(handleHttpError)
        .finally(()=>setIsLoading(false));
  };

  const createBill = (body) => {
    const pageFromUrl = getQueryParam('page', 1);
    resetApiProvider();
    setIsLoading(true)

    return http
      .post('/api/bills', body)
      .then(handleHttpResponse)
      .then(() => getBills(pageFromUrl))
      .catch(handleHttpError)
  .finally(()=>setIsLoading(false));

  };

  const updateBill = (billId, updateData) => {
    resetApiProvider();
    setIsLoading(true)
    debugger
    updateData = mapBillDataToBackend(
      billsStore.drafts[billId],
      billsStore.changedProps,
    );
    return http
      .patch(`/api/bills/${billId}`, updateData)
      .then(handleHttpResponse)
      .then(() => getBillById(billId))
      .catch(handleHttpError)
        .finally(()=>setIsLoading(false));

  };

  const getBillById = (billId) => {
    resetApiProvider();
    setIsLoading(true)

    return http
      .get(`/api/bills/${billId}`)
      .then(handleHttpResponse)
      .then((res) => {
        const mappedBill = mapBillFromApi(res.body.data);
        billsStore.setCurrentBill(mappedBill);
      })
      .catch(handleHttpError)
        .finally(()=>setIsLoading(false));

  };

  const deleteBill = async (billId) => {
    resetApiProvider();
    setIsLoading(true);
  debugger
    try {
      await http.delete(`/api/bills/${billId}`);
      const pageFromUrl = getQueryParam('page', 1);
      await getBills(pageFromUrl);
      return true;
    } catch (error) {
      handleHttpError(error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const downloadBill = (billId) => {
    const url = `https://api.lead-bro.ru/bills/${billId}/print_stamped/`;
    window.open(url, '_blank');
  };

  return {
    getBills,
    createBill,
    updateBill,
    getBillById,
    deleteBill,
    downloadBill,
    isLoading
  };
};

export default useBillsApi;
