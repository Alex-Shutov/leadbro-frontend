import useStore from '../../hooks/useStore';
import {
  handleHttpError,
  handleHttpResponse,
  handleShowError,
  http,
  resetApiProvider,
  setMockProvider,
} from '../../shared/http';
import { useCallback, useState } from 'react';
import { mapDealDataToBackend, mapDealFromApi } from './deals.mapper';
import {
  getPageTypeFromUrl,
  getQueryParam,
  sanitizeUrlFilters,
} from '../../utils/window.utils';
import './deals.mock';
import { sanitizeObjectForBackend } from '../../utils/create.utils';
import {mapClientDataToBackend} from "../Clients/clients.mapper";
import {mapBusinessFromApi, mapBusinessToBackend} from "../Calendar/calendar.mapper";

const useDealsApi = () => {
  const { dealsStore } = useStore();
  const [isLoading, setIsLoading] = useState(false);

  const getDeals = (page = 1, filters = {}) => {
    resetApiProvider();
    setIsLoading(true);

    const sanitizedFilters = sanitizeUrlFilters(filters);
    ;
    return http
      .get('/api/deals', { params: { page, ...sanitizedFilters } })
      .then(handleHttpResponse)
      .then((res) => {
        const mappedDeals = res.body.data.map((deal) => mapDealFromApi(deal));
        dealsStore.setDeals(mappedDeals);
      })
      .catch(handleHttpError)
      .finally(() => setIsLoading(false));
  };

  const createDeal = (body) => {
    resetApiProvider();
    setIsLoading(true);
    const createData = mapDealDataToBackend(body, Object.keys(body));
    return http
      .post('/api/deals', createData)
      .then(handleHttpResponse)
      .then(() => getDeals(1))
      .catch(handleShowError)
      .finally(() => setIsLoading(false));
  };

  const updateDeal = (dealId, updateData) => {
    resetApiProvider();
    setIsLoading(true);

    const mappedData = mapDealDataToBackend(
      dealsStore.drafts[dealId],
      dealsStore.changedProps,
    );

    return http
      .patch(`/api/deals/${dealId}`, mappedData)
      .then(handleHttpResponse)
      .then(() => getDealById(dealId))
      .catch(handleShowError)
      .finally(() => setIsLoading(false));
  };

  const updateDealStatus = (dealId, updateData) => {
    resetApiProvider();
    setIsLoading(true);

    // const mappedData = mapDealDataToBackend(
    //     dealsStore.drafts[dealId],
    //     new Set().add('status'),
    // );

    return (
      http
        .patch(`/api/deals/${dealId}`, updateData)
        .then(handleHttpResponse)
        // .then(() => getDealById(dealId))
        // .catch(handleHttpError)
        .finally(() => setIsLoading(false))
    );
  };

  const getDealById = (dealId, needToReload = true) => {
    resetApiProvider();
    needToReload && setIsLoading(true);

    const dealPromise = http
      .get(`/api/deals/${dealId}`)
      .then(handleHttpResponse);

    const tasksPromise = http
      .get(`/api/deals/${dealId}/tasks`)
      .then(handleHttpResponse);

    const commentsPromise = http
      .get(`/api/deals/${dealId}/comments`)
      .then(handleHttpResponse);

    const contactPersonsPromise = (id) => {
      return http.get(`/api/companies/${id}/clients`).then(handleHttpResponse).catch(handleHttpError);
      // .catch(error => { // The first request fails
      //   return error !== undefined
      // });
    };

    const businessesPromise = http
        .get(`/api/deals/${dealId}/businesses`)
        .then(handleHttpResponse);

    return (
      Promise.all([dealPromise, tasksPromise, commentsPromise,businessesPromise])

        .then(([{ body: deal }, { body: tasks }, { body: comments },{body:businesses}]) => {
          debugger
          setTimeout(async () => {
            const contactResp =
              deal.data?.company?.id &&
              (await contactPersonsPromise(deal.data?.company?.id));
            debugger

            const mapperDeals = mapDealFromApi(
              deal.data,
              tasks.data,
              comments.data,
              contactResp && contactResp.body ? contactResp.body.data : [],
                businesses.data
            );
            dealsStore.setCurrentDeal(mapperDeals);
            return mapperDeals;
          }, 0);
        })
        .catch(handleShowError)
        .finally(() => {
          // resetApiProvider(); // Возвращаем провайдер в исходное состояние
          setIsLoading(false);
        })
    );
  };

  const deleteDeal = (dealId) => {
    resetApiProvider();
    setIsLoading(true);

    // try {
    //    http.delete(`/api/bills/${billId}`);
    //   const pageFromUrl = getQueryParam('page', 1);
    //   await getBills(pageFromUrl);
    //   return true;
    // } catch (error) {
    //   handleHttpError(error);
    //   return false;
    // } finally {
    //   setIsLoading(false);
    // }
    return http
      .delete(`/api/deals/${dealId}`)
      .then(handleHttpResponse)
      .then(() => getDeals())
      .catch(handleHttpError)
      .finally(() => setIsLoading(false));
  };

  // const getDealById = (dealId)=>{
  //     // resetApiProvider()
  //     setMockProvider()
  //     return   http.get(`/api/deals/${dealId}/tasks`)
  //         .then(handleHttpResponse)
  //         .then((res) => {
  //
  //         })
  //         .catch(handleHttpError)
  //         .finally(() => setIsLoading(false));
  // }

  const updateBusiness = (dealId,businessId, drafts,changedFieldsSet) => {
    setIsLoading(true);

    const dataToSend = mapDealDataToBackend({businesses:drafts},changedFieldsSet,businessId);

    return http
        .patch(`/api/businesses/${businessId}`, dataToSend)
        .then(handleHttpResponse)
        .then((res) => {
          const mappedBusiness = mapBusinessFromApi(res.body.data);
          const currDeal = dealsStore.getById(dealId);
          const updatedBusinesses = {
            ...currDeal.businesses,
            [businessId]: mappedBusiness
          };
          dealsStore.setCurrentDeal({...currDeal,businesses:updatedBusinesses});
        })
        .catch(handleShowError)
        .finally(() => setIsLoading(false));
  };

  const createBusiness = (data,dealId) => {
    setIsLoading(true);
    return http
        .post(`/api/deals/${dealId}/business`, {...mapBusinessToBackend(data,Object.keys(data))})
        .then(handleHttpResponse)
        .then((res) => {
          const mappedBusiness = mapBusinessFromApi(res.body.data);
          const currDeal = dealsStore.getById(dealId);
          const updatedBusinesses = {
            ...currDeal.businesses,
            [mappedBusiness.id]: mappedBusiness
          };
          dealsStore.setCurrentDeal({...currDeal,businesses:updatedBusinesses});
        })
        .catch(handleShowError)
        .finally(() => setIsLoading(false));
  };

  return {
    getDeals,
    createDeal,
    updateDeal,
    getDealById,
    createBusiness,
    updateBusiness,
    deleteDeal,
    updateDealStatus,
    isLoading,
  };
};

export default useDealsApi;
