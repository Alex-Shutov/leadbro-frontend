import {
  handleHttpError,
  handleHttpResponse,
  handleShowError,
  http,
  mockHttp,
  resetApiProvider,
} from '../../shared/http';
import mocks from './services.mocks';
import useStore from '../../hooks/useStore';
import { useEffect, useRef } from 'react';
import {
  mapClientDataToBackend,
  mapClientFromApi,
} from '../Clients/clients.mapper';
import { mapServiceDataToBackend, mapServiceFromApi } from './services.mapper';
import { getQueryParam } from '../../utils/window.utils';
import { changeCurrentElementById } from '../../utils/store.utils';
import useClientsApi from '../Clients/clients.api';

let blob = new Blob([], { type: 'application/pdf' });
let fakeFile = blob;

mockHttp.onGet('/services').reply(200, mocks.createServices());
mockHttp.onPost('/services').reply(200, mocks.createServices());
mockHttp.onGet('/services/types').reply(200, mocks.createServiceTypes());
mockHttp.onGet(`/download/file`).reply((config) => {
  return [200, fakeFile];
});

const useServiceApi = () => {
  const { servicesStore } = useStore();
  const { getClientById } = useClientsApi();
  const getServices = (page = 1) => {
    resetApiProvider();
    return http
      .get('/api/services', { params: { page } })
      .then(handleHttpResponse)
      .then((res) => {
        const mappedServices = res.body.data.map((e) => mapServiceFromApi(e));
        servicesStore.setServices(mappedServices); // Устанавливаем клиентов в store
        servicesStore.setMetaInfoTable(res.body.meta);
      })
      .catch(handleHttpError);
  };

  const setServices = (body) => {
    return http
      .post('/api/services', body)
      .then(handleHttpResponse)
      .then((res) => servicesStore.setServices(res.body))
      .catch(handleHttpError);
  };

  const getServiceTypes = () => {
    return http
      .get('/api/services/types')
      .then(handleHttpResponse)
      .then((res) => servicesStore.setServiceTypes(res.body))
      .then(() => servicesStore.getServiceTypes())
      .catch(handleHttpError);
  };

  const postFile = (blobFile, fileName) => {
    const form = new FormData();
  };

  const getCurrentPage = () => {
    const path = window.location.pathname;
    if (path.includes('/clients/')) {
      return 'client';
    } else if (path.includes('/services')) {
      return 'services';
    }
    return null;
  };

  const createService = (body) => {
    const pageFromUrl = getQueryParam('page', 1);
    const currentPage = getCurrentPage();
    const clientId = body?.client?.id;
    const updateData = mapServiceDataToBackend(body, Object.keys(body));
    resetApiProvider();
    return http
      .post(`/api/companies/${clientId}/services`, updateData)
      .then(handleHttpResponse)
      .then((res) => {
        // В зависимости от страницы вызываем разные методы обновления данных
        if (currentPage === 'client') {
          return getClientById(clientId);
        } else if (currentPage === 'services') {
          return getServices(pageFromUrl);
        }
        return res;
      })
      .catch(handleShowError);
  };

  const updateService = (serviceId, updateData) => {
    resetApiProvider();
    updateData = mapServiceDataToBackend(
      servicesStore.drafts[serviceId],
      servicesStore.changedProps,
    );
    return http
      .patch(`/api/services/${serviceId}`, updateData)
      .then(handleHttpResponse)
      .then(() => getServiceById(serviceId))
      .catch(handleShowError);
  };

  const getServiceById = (serviceId) => {
    resetApiProvider();
    return Promise.all([
      http.get(`/api/services/${serviceId}`),
      http.get(`/api/services/${serviceId}/stages`),
    ])
      .then(([serviceRes, stagesRes]) => {
        const serviceData = serviceRes.data.data; // Данные сервиса
        const stagesData = stagesRes.data.data; // Массив этапов

        const mappedService = mapServiceFromApi(serviceData, stagesData);

        // changeCurrentElementById(servicesStore.services, setServices, mappedService);
        servicesStore.setCurrentService(mappedService);

        return mappedService;
      })
      .catch(handleHttpError);
  };

  return {
    setServices,
    getServiceById,
    updateService,
    getServices,
    getServiceTypes,
    createService,
  };
};

export default useServiceApi;
