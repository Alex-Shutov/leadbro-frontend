import {
  handleHttpError,
  handleHttpResponse,
  http,
  mockHttp,
} from '../../shared/http';
import mocks from './stages.mocks';
import useStore from '../../hooks/useStore';
import { useEffect, useRef } from 'react';

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
  const getStages = () => {
    return http
      .get('/stages')
      .then(handleHttpResponse)
      .then((res) => stagesStore.setStages(res.body))
      .then(() => stagesStore.getStages())
      .catch(handleHttpError);
  };

  const getStageById = (id) => {
    return http
      .get(`/stages/${id}`)
      .then((e) => handleHttpResponse(e))
      .then((res) => {
        stagesStore.setCurrentStage(res.body);
      })
      .then(() => stagesStore.getById(id))
      .catch((e) => {
        handleHttpError(e);
      });
  };

  const setStages = (body) => {
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

  const postFile = (blobFile, fileName) => {
    const form = new FormData();
  };

  return {
    setStages,
    getStages,
    getStageTypes,
    getStageById,
    getTemplateTypes,
  };
};

export default useStageApi;
