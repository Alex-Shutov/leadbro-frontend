// src/Calls/calls.api.js
import {
  http,
  handleHttpResponse,
  handleHttpError,
  handleShowError,
  resetApiProvider,
} from '../shared/http';

export const callsApi = {
  getCalls: async () => {
    resetApiProvider();

    try {
      const response = await http.get('/api/calls');
      return handleHttpResponse(response);
    } catch (error) {
      return handleHttpError(error);
    }
  },

  getCompanyCalls: async (companyId) => {
    resetApiProvider();

    try {
      const response = await http.get(`/api/companies/${companyId}/calls`);
      return handleHttpResponse(response);
    } catch (error) {
      return handleShowError(error);
    }
  },

  getDealCalls: async (dealId) => {
    resetApiProvider();

    try {
      const response = await http.get(`/api/deals/${dealId}/calls`);
      return handleHttpResponse(response);
    } catch (error) {
      return handleHttpError(error);
    }
  },

  // makeCall: async (data) => {
  // resetApiProvider();

  //     try {
  //         const response = await http.post('/api/mango/call', data);
  //         return handleHttpResponse(response);
  //     } catch (error) {
  //         return handleHttpError(error);
  //     }
  // }
};
