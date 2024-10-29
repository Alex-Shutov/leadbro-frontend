// useBills.js
import { useState, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import useStore from '../../../hooks/useStore';
import useBillsApi from '../bills.api';

const useBills = (id = null) => {
  const { billsStore } = useStore();
  const api = useBillsApi();
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const currentPage = parseInt(query.get('page')) || 1;

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      if (id !== null) {
        await api.getBillById(id);
      } else if (!billsStore.bills.length) {
        await api.getBills(currentPage);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [id, billsStore, api, currentPage]);

  useMemo(() => {
    fetchData();
  }, [id, billsStore]);

  const result = useMemo(() => {
    if (id && !billsStore.currentBill) return null;
    if (id !== null) {
      return billsStore.getById(id);
    } else {
      return billsStore;
    }
  }, [billsStore.currentBill, billsStore.drafts, billsStore.bills]);

  return { data: result, isLoading, store: billsStore, fetchData };
};

export default useBills;
