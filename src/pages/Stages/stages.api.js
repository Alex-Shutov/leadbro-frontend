import {
  handleHttpError,
  handleHttpResponse,
  handleShowError,
  http,
  mockHttp,
  resetApiProvider,
} from '../../shared/http';
import mocks from './stages.mocks';
import useStore from '../../hooks/useStore';
import { useEffect, useRef } from 'react';
import { getQueryParam } from '../../utils/window.utils';
import {
  mapServiceDataToBackend,
  mapServiceFromApi,
} from '../Services/services.mapper';
import { mapStageDataToBackend, mapStageFromApi } from './stages.mapper';
import useServiceApi from '../Services/services.api';
import servicesApi from '../Services/services.api';
import { stageStatusTypes } from './stages.types';
import { format } from 'date-fns';

let blob = new Blob([], { type: 'application/pdf' });
let fakeFile = blob;

mockHttp.onGet('/stages').reply(200, mocks.createStages());
mockHttp.onPost('/stages').reply(200, mocks.createStages());
mockHttp.onGet('/stages/templates').reply(200, mocks.createTemplateTypes());
// mockHttp.onGet('/stages/types').reply(200, mocks.createStageTypes())
mockHttp.onGet(/\/stages\/\d+/).reply((config) => {
  // Разделяем URL по "/"
  const urlParts = config.url.split('/');
  // Получаем ID stage из конца URL
  const stageId = parseInt(urlParts[urlParts.length - 1]);

  // Создаем моки
  const stages = mocks.createStages();
  // Ищем stage по ID
  const stage = stages.find((c) => c.id === stageId);

  if (stage) {
    return [200, stage];
  } else {
    console.log(`Stage with id ${stageId} not found`);
    return [404, { message: 'Stage not found' }];
  }
});
mockHttp.onGet(`/download/file`).reply((config) => {
  return [200, fakeFile];
});

const useStageApi = () => {
  const { stagesStore } = useStore();
  const serviceApi = useServiceApi();
  const getTaskStages = (stageId, page = null) => {
    const pageFromUrl = page ?? getQueryParam('page', 1);
    resetApiProvider();
    return Promise.all([
      http.get(`/api/stages/${stageId}`, { params: { page: pageFromUrl } }),
      http.get(`/api/stages/${stageId}/tasks`, {
        params: { page: pageFromUrl },
      }),
    ])
      .then(([stageResponse, tasksResponse]) => {
        const stageData = stageResponse.body.data;
        const tasksData = tasksResponse.body.data;

        const mappedStage = mapStageFromApi(stageData, tasksData); // Маппинг данных
        stagesStore.setStages([mappedStage]); // Сохраняем в store
        stagesStore.setMetaInfoTable(tasksResponse.body.meta); // Метаданные задач

        return mappedStage;
      })
      .catch(handleHttpError);
  };

  const getStageById = (id, page) => {
    const pageFromUrl = page ?? getQueryParam('page', 1);
    resetApiProvider();
    return Promise.all([
      http.get(`/api/stages/${id}`, { params: { page: pageFromUrl } }),
      http.get(`/api/stages/${id}/tasks`, { params: { page: pageFromUrl } }),
    ])
      .then(([stageResponse, tasksResponse]) => {
        const stageData = stageResponse.data.data;
        const tasksData = tasksResponse.data.data;

        const mappedStage = mapStageFromApi(stageData, tasksData); // Маппинг данных
        stagesStore.setCurrentStage(mappedStage);
        // stagesStore.setStages(mappedStage); // Сохраняем в store
        stagesStore.setMetaInfoTable(tasksResponse.body.meta); // Метаданные задач

        return mappedStage;
      })
      .catch(handleHttpError);
  };

  const setStages = (body) => {
    resetApiProvider();
    return http
      .post('/stages', body)
      .then(handleHttpResponse)
      .then((res) => stagesStore.setStages(res.body))
      .catch(handleHttpError);
  };

  const getTemplateTypes = () => {
    return http
      .get('/stages/templates')
      .then(handleHttpResponse)
      .then((res) => stagesStore.setStageTemplates(res.body))
      .then(() => stagesStore.getStageTemplates())
      .catch(handleHttpError);
  };
  const getStageTypes = () => {
    return http
      .get('/stages/types')
      .then(handleHttpResponse)
      .then((res) => stagesStore.setStageTypes(res.body))
      .then(() => stagesStore.getStageTypes())
      .catch(handleHttpError);
  };

  const updateStage = (stageId, updateData) => {
    resetApiProvider();
    debugger;
    const serviceId = updateData.service.id;
    updateData = mapStageDataToBackend(
      stagesStore.drafts[stageId],
      stagesStore.changedProps,
    );
    return http
      .patch(`/api/stages/${stageId}`, updateData)
      .then(handleHttpResponse)
      .then(() =>
        Promise.all([
          getStageById(stageId),
          serviceApi.getServiceById(serviceId),
        ]),
      )
      .catch(handleShowError);
  };

  const createStage = (serviceId, data) => {
    data = {
      ...data,
      name: data.title,
      active: data.status === stageStatusTypes.inProgress,
      start: format(data.startTime, "yyyy-MM-dd'T'HH:mm:ss"),
      deadline: format(data.deadline, "yyyy-MM-dd'T'HH:mm:ss"),
      act_sum: data.actSum,
      technical_specification: data.taskDescription,
    };
    resetApiProvider();
    return http
      .post(`api/services/${serviceId}/stages`, data)
      .then(handleHttpResponse)
      .then(() => serviceApi.getServiceById(serviceId))
      .catch(handleShowError);
  };

  const postFile = (blobFile, fileName) => {
    const form = new FormData();
  };

  return {
    createStage,
    updateStage,
    setStages,
    getTaskStages,
    getStageTypes,
    getStageById,
    getTemplateTypes,
  };
};

export default useStageApi;
