import React, { createContext } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useCookies } from '../hooks/useCookies';
import { API_URL } from '../shared/constants';
import {
  adapter,
  http,
  mockHttp,
  resetApiProvider,
  setMockProvider,
} from '../shared/http';
import axios from 'axios';
import useUser from '../hooks/useUser';
import useAppApi from '../api'; // Импортируйте хук

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authToken, setAuthToken, removeAuthToken] = useCookies(
    'accessToken',
    null,
  ); // Используйте хук
  const navigate = useNavigate();
  const location = useLocation();
  const appApi = useAppApi();

  const login = async (email, password) => {
    try {
      resetApiProvider();
      const response = await axios.post(
        `${API_URL}/api/auth`,
        { email: email, password: password },
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
        },
      );
      const { data } = response;
      if (data.token) {
        setAuthToken(data.token);
        const from = location.state?.from?.pathname || '/';
        navigate(from, { replace: true });
        http.defaults.adapter = adapter;
        appApi.getUserProfile();
      } else {
        alert('Неверный email или пароль');
      }
    } catch (error) {
      alert('Произошла ошибка при авторизации');
    }
  };

  const logout = () => {
    removeAuthToken();
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ authToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
