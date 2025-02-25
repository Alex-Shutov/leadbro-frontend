import { useState } from 'react';
import { mapBusinessFromApi, mapBusinessToBackend } from './calendar.mapper';
import {
    handleHttpError,
    handleHttpResponse, handleShowError,
    http,
    resetApiProvider,
} from '../../shared/http';
import useStore from '../../hooks/useStore';
import {
  formatDateToBackend,
  formatDateToQuery,
} from '../../utils/formate.date';
import { format } from 'date-fns';
import {mapCommentsFromApi} from "../Clients/clients.mapper";

const useCalendarApi = () => {
  const { calendarStore } = useStore();
  const [isLoading, setIsLoading] = useState(false);

  const getBusinesses = (dateFrom, dateTo) => {
    setIsLoading(true);
    resetApiProvider();
    debugger;
    const urlParams = new URLSearchParams();
    urlParams.append(
      'date_from',
      formatDateToQuery(
        new Date(format(dateFrom, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")),
      ),
    );
    urlParams.append(
      'date_to',
      formatDateToQuery(
        new Date(format(dateTo, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")),
      ),
    );
    return (
      http
        .get(`/api/businesses?${urlParams.toString().replace(/['"]/g, '')}`)
        .then(handleHttpResponse)
        // .get('/api/businesses', {
        //   params: {
        //     date_from: format(dateFrom, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"),
        //     date_to: format(dateTo, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"),
        //   },
        // })
        // .then(handleHttpResponse)
        .then((res) => {
          const mappedBusinesses = res.body.data.map((business) =>
            mapBusinessFromApi(business),
          );
          calendarStore.setBusinesses(mappedBusinesses);
        })
        .catch(handleHttpError)
        .finally(() => setIsLoading(false))
    );
  };

  const createBusiness = (data) => {
    setIsLoading(true);
    return http
      .post('/api/businesses', mapBusinessToBackend(data,Object.keys(data)))
      .then(handleHttpResponse)
      .then((res) => {
        const mappedBusiness = mapBusinessFromApi(res.body.data);
        calendarStore.setBusinesses([
          ...calendarStore.getBusinesses(),
          mappedBusiness,
        ]);
      })
      .catch(handleShowError)
      .finally(() => setIsLoading(false));
  };

  const updateBusiness = (id, drafts, changedFieldsSet) => {
    setIsLoading(true);
    debugger
    const dataToSend = mapBusinessToBackend(drafts??calendarStore.drafts[id],changedFieldsSet?? calendarStore.changedProps);

    return http
      .patch(`/api/businesses/${id}`, dataToSend)
      .then(handleHttpResponse)
      .then((res) => {
        const mappedBusiness = mapBusinessFromApi(res.body.data);
        calendarStore.submitDraft(id);
        debugger;
        const businesses = calendarStore.getBusinesses();
        const updatedBusinesses = businesses.map((business) =>
          business.id === id ? mappedBusiness : business,
        );
        calendarStore.setBusinesses(updatedBusinesses);
      })
      .catch(handleShowError)
      .finally(() => setIsLoading(false));
  };

  const deleteBusiness = (id) => {
    setIsLoading(true);
    return http
      .delete(`/api/businesses/${id}`)
      .then(handleHttpResponse)
      .then(() => {
        const businesses = calendarStore.getBusinesses();
        const updatedBusinesses = businesses.filter(
          (business) => business.id !== id,
        );
        calendarStore.setBusinesses(updatedBusinesses);
      })
      .catch(handleHttpError)
      .finally(() => setIsLoading(false));
  };

    const getBusinessComments = (businessId) => {
        setIsLoading(true);
        return http
            .get(`/api/businesses/${businessId}/comments`)
            .then(handleHttpResponse)
            .then((res) => mapCommentsFromApi(res.body.data))
            .catch(handleHttpError)
            .finally(() => setIsLoading(false));
    };

    const addBusinessComment = (businessId, comment) => {
        setIsLoading(true);
        return http
            .post(`/api/businesses/${businessId}/comments`, { content: comment })
            .then(handleHttpResponse)
            .then((res) => res.body.data)
            .catch(handleHttpError)
            .finally(() => setIsLoading(false));
    };

    const deleteBusinessComment = (businessId, commentId) => {
        setIsLoading(true);
        return http
            .delete(`/api/businesses/${businessId}/comments/${commentId}`)
            .then(handleHttpResponse)
            .catch(handleHttpError)
            .finally(() => setIsLoading(false));
    };

  return {
    isLoading,
    getBusinesses,
    createBusiness,
    updateBusiness,
    deleteBusiness,
      getBusinessComments,
      addBusinessComment,
      deleteBusinessComment
  };
};

export default useCalendarApi;
