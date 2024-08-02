import './App.css';
import React, { useEffect } from 'react';
import rootApi from './root.api.js';
import useStore from './hooks/useStore';
import { prepareRoutes } from './routes/routes';
import {
  RouterProvider,
  createBrowserRouter,
  BrowserRouter,
} from 'react-router-dom';
import { AuthProvider } from './providers/AuthProvider';

function App() {
  const { notificationsStore } = useStore();
  useEffect(() => {
    rootApi.getNotifications().then((result) => {
      notificationsStore.setNotifications(result.body);
    });
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>{prepareRoutes()}</AuthProvider>
    </BrowserRouter>
  );
}

export default App;
