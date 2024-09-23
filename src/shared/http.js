import axios, { AxiosError, AxiosResponse } from 'axios';
import { API_URL } from './constants';
import Cookies from 'js-cookie';
import MockAdapter from 'axios-mock-adapter';
import { handleError } from '../utils/snackbar';

export let http = axios.create({
  baseURL: API_URL,
});
export const adapter = http.defaults.adapter;

export const mockHttp = new MockAdapter(http);

http.interceptors.request.use(
  async (request) => {
    if (request.url.toLowerCase().includes('/auth')) {
      return request;
    }
    if (request.method === 'GET' || request.method === 'get') {
      request.headers['Cache-Control'] = 'no-cache';
    }
    request.headers.Authorization = `Bearer ${await getToken()}`;
    return request;
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error);
  },
);

// http.interceptors.response.use(
//   async (response) => {
//     if (response.request.url.toString().contains('/auth')) {
//       await handleSetToken(response);
//     }
//     return response;
//   },
//   (err) => {
//     const shouldLogout = err.response && err.response.status === 401;
//     if (shouldLogout) {
//       //TODO redirect to auth
//     }
//
//     throw err;
//   },
// );
const setToken = async (accessToken) => {
  Cookies.set('accessToken', accessToken);
};
export const getToken = async () => {
  return Cookies.get('accessToken') || '';
};
export const removeToken = async () => {
  Cookies.remove('accessToken');
};

export const handleHttpResponse = (response) => {
  return { status: 'success', body: response.data };
};

export const handleHttpError = (error) => {
  const code = error?.code;

  return { status: 'error', message: error?.message, code };
};

export const handleShowError = (errors, delay = 100) => {

    const errorsResp = errors.response?.data?.errors
  const errorsResponse = errorsResp ? errorsResp : errors.response?.data?.message ;
  let delayTime = 0;

  // Преобразуем объект ошибок в массив сообщений
  const getErrorMessages = () =>Object.entries(errorsResponse).flatMap(
    ([field, messages]) => {
      return messages?.map((message) => `${field}: ${message}`);
    },
  );

  // Показываем каждую ошибку с задержкой
    (errorsResp ? getErrorMessages() : [errorsResponse]).forEach((message) => {
    setTimeout(() => {
      handleError(message); // Показ ошибки через notistack
    }, delayTime);

    delayTime += delay; // Увеличиваем задержку
  });
};

export const resetApiProvider = () => {
  // mockHttp.restore(); // Отключаем моки
  setAdapter(); // Восстанавливаем реальный адаптер
};
export const setAdapter = () => {
  http.defaults.adapter = adapter;
};

export const setMockProvider = () => {
  http.defaults.adapter = mockHttp.adapter();
};

const handleSetToken = async (response) => {
  await setToken(response.data.accessToken);
};
