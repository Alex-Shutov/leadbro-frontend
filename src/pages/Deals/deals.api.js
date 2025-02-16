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
import {getPageTypeFromUrl, getQueryParam, sanitizeUrlFilters} from '../../utils/window.utils';
import './deals.mock';
import { sanitizeObjectForBackend } from '../../utils/create.utils';

const useDealsApi = () => {
  const { dealsStore } = useStore();
  const [isLoading, setIsLoading] = useState(false);

  const getDeals = (page = 1, filters = {}) => {
    resetApiProvider();
    setIsLoading(true);

    const sanitizedFilters = sanitizeUrlFilters(filters)
    debugger
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
        .then(handleHttpResponse)



    const tasksPromise = http
      .get(`/api/deals/${dealId}/tasks`)
      .then(handleHttpResponse);

    const commentsPromise = http
      .get(`/api/deals/${dealId}/comments`)
      .then(handleHttpResponse);

    const contactPersonsPromise = (id) => {
      return http
          .get(`/api/companies/${id}/clients`)
          .then(handleHttpResponse)
          // .catch(error => { // The first request fails
          //   return error !== undefined
          // });
    }


    return Promise.all([dealPromise, tasksPromise, commentsPromise])
        // .then( ([dealResp,taskResp,commentResp])=>{
        //   debugger
        //
        //   // const contactResp =  contactPersonsPromise(companyId)
        //   return contactPersonsPromise(companyId).then((contactResp)=> [dealResp, taskResp,commentResp,contactResp]);
        // })
      .then(([{ body: deal }, { body: tasks }, { body: comments }]) => {
        setTimeout(async ()=> {
          const contactResp = await contactPersonsPromise(deal.data.company.id)
          const mapperDeals = mapDealFromApi(
              deal.data,
              tasks.data,
              comments.data,
              contactResp.body.data
          );
          dealsStore.setCurrentDeal(mapperDeals);
          return mapperDeals;
        },0)
      })
      .catch(handleShowError)
      .finally(() => {
        resetApiProvider(); // Возвращаем провайдер в исходное состояние
        setIsLoading(false);
      });
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

  return {
    getDeals,
    createDeal,
    updateDeal,
    getDealById,
    deleteDeal,
    updateDealStatus,
    isLoading,
  };
};

export default useDealsApi;
