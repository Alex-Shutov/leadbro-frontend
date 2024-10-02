import {
  handleHttpError,
  handleHttpResponse,
  handleShowError,
  http,
  mockHttp,
  resetApiProvider,
} from '../../shared/http';
import { statusTypes } from './clients.types';
import mocks from './clients.mocks';
import useStore from '../../hooks/useStore';
import { useEffect, useRef } from 'react';
import { mapClientDataToBackend, mapClientFromApi } from './clients.mapper';
import useQueryParam from '../../hooks/useQueryParam';
import { getQueryParam } from '../../utils/window.utils';
import { enqueueSnackbar } from 'notistack';
import { handleSubmit } from '../../utils/snackbar';

let blob = new Blob([], { type: 'application/pdf' });
let fakeFile = blob;

resetApiProvider();

mockHttp.onGet('/api/companies').reply(200, mocks.createClients());
mockHttp.onPost('/api/companies').reply(200, mocks.createClients());
mockHttp.onGet(/\/api\/companies\/\d+/).reply((config) => {
  const id = parseInt(config.url.split('/').pop());

  const clients = mocks.createClients();
  const client = clients.find((c) => c.id === id);

  if (client) {
    return [200, client];
  } else {
    console.log(`Client with id ${id} not found`);
    return [404, { message: 'Client not found' }];
  }
});
mockHttp.onGet(`/download/file`).reply((config) => {
  return [200, fakeFile];
});
const useClientsApi = () => {
  const { clientsStore } = useStore();

  const getClients = (page = 1) => {
    resetApiProvider();
    return http
      .get('/api/companies', { params: { page: page } })
      .then(handleHttpResponse)
      .then((res) => {
        const mappedClients = res.body.data.map((e) => mapClientFromApi(e));
        clientsStore.setClients(mappedClients); // Устанавливаем клиентов в store
        clientsStore.setMetaInfoTable(res.body.meta);
      })
      .catch(handleHttpError);
  };

  const createCompany = (body) => {
    resetApiProvider();
    const pageFromUrl = getQueryParam('page', 1);

    console.log(http.defaults, 'adapter');

    return http
      .post('/api/companies', body)
      .then(handleHttpResponse)
      .then(() => getClients(pageFromUrl))
      .catch(handleShowError);
  };

  const getClientById = (id) => {
    resetApiProvider();
    return (
      Promise.all([
        http.get(`/api/companies/${id}`), // Запрос для получения данных клиента
        http.get(`/api/companies/${id}/passwords`), // Запрос для получения паролей
        http.get(`/api/companies/${id}/clients`), // Запрос для получения паролей
      ])
        // .then(handleHttpResponse)
        .then(([clientRes, passwordsRes, contactRes]) => {
          // Деструктурируем результаты обоих запросов
          const clientData = clientRes.data.data;
          const passwordsData = passwordsRes.data.data;
          const contactPersonsData = contactRes.data.data;
          // Сначала маппим пароли, затем клиента, передавая пароли в маппер клиента
          const mappedClient = mapClientFromApi(
            clientData,
            passwordsData,
            contactPersonsData,
          );
          clientsStore.setCurrentClient(mappedClient); // Устанавливаем смапленного клиента в store

          return mappedClient; // Возвращаем смапленного клиента
        })
        .catch(handleHttpError)
    );
  };

  // Обновление данных компании
  const updateCompany = (id, updateData, submitText) => {
    resetApiProvider();
    updateData = mapClientDataToBackend(
      clientsStore.drafts[id],
      clientsStore.changedProps,
    );
    return http
      .patch(`/api/companies/${id}`, updateData)
      .then(handleHttpResponse)
      .then(() => getClientById(id))
      .then(() => handleSubmit(submitText ?? 'Сохранение успешно'))
      .catch(handleShowError);
  };

  const updatePasswords = (id, passId, updateData, submitText) => {
    resetApiProvider();
    updateData = mapClientDataToBackend(
      clientsStore.drafts[id],
      clientsStore.changedProps,
      passId,
    );
    return http
      .patch(`/api/passwords/${passId}`, updateData)
      .then(handleHttpResponse)
      .then(() => getClientById(id))
      .then(() => handleSubmit(submitText ?? 'Сохранение успешно'))
      .catch(handleShowError);
  };

  // Удаление компании
  const deleteCompany = (id) => {
    resetApiProvider();
    return http
      .delete(`/api/companies/${id}`)
      .then(handleHttpResponse)
      .then(() => getClientById(id))
      .catch(handleHttpError);
  };

  // Создание клиента в компании
  const createClient = (companyId, clientData) => {
    resetApiProvider();
    return http
      .post(`/api/companies/${companyId}/clients`, clientData)
      .then(handleHttpResponse)
      .then(() => getClientById(companyId))
        .then(() => handleSubmit('Данные клиента сохранены'))

        .catch(handleHttpError);
  };
  const createPassword = (companyId, clientData) => {
    resetApiProvider();

    return http
      .post(`/api/companies/${companyId}/passwords`, clientData)
      .then(handleHttpResponse)
      .then(() => getClientById(companyId))
      .then(() => handleSubmit('Пароль сохранен'))
      .catch(handleHttpError);
  };
  const deletePassword = (clientId, passId) => {
    resetApiProvider();
    return http
      .delete(`/api/passwords/${passId}`)
      .then(handleHttpResponse)
      .then(() => handleSubmit('Пароль удален'))

      .then(() => getClientById(clientId))
      .catch(handleHttpError);
  };

  // Обновление клиента компании
  const updateClient = (companyId,clientId) => {
    resetApiProvider();
    const updateData = mapClientDataToBackend(
        clientsStore.drafts[companyId],
        clientsStore.changedProps,
        clientId,
    );
    return http
      .patch(`/api/clients/${clientId}`, updateData)
      .then(handleHttpResponse)
      .then(() => getClientById(companyId))
      .catch(handleShowError);
  };

  // Удаление клиента
  const deleteClient = (id) => {
    resetApiProvider();
    return http
      .delete(`/api/clients/${id}`)
      .then(handleHttpResponse)
      .then(() => getClientById(id))
      .catch(handleHttpError);
  };

  return {
    getClients,
    createPassword,
    getClientById,
    createCompany,
    updateCompany,
    deleteCompany,
    createClient,
    updateClient,
    updatePasswords,
    deleteClient,
    deletePassword,
  };
};

export default useClientsApi;
