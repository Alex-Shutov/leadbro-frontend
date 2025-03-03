import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Clients from '../pages/Clients';
import ClientPage from '../pages/Clients/components/ClientPage';
import Page from '../shared/Page';
import Services from '../pages/Services';
import ServicePage from '../pages/Services/components/ServicePage';
import { Tasks, TasksWithQuery } from '../pages/Tasks';
import NotFound from '../pages/NotFound';
import { AuthContext } from '../providers/AuthProvider';
import LoginPage from '../pages/Login';
import { useLocation } from 'react-router';
import StagesPage from '../pages/Stages/components/StagesPage';
import Settings from '../pages/Settings';
import Bills from '../pages/Bills';
import Deals from '../pages/Deals';
import DealPage from '../pages/Deals/components/DealPage';
import Forbidden from '../pages/Forbidden';
import TimeTrackings from '../pages/TimeTracking';
import Calendar from '../pages/Calendar';

export const paths = {
  MAIN: '/',
  CLIENTS: '/clients',
  CLIENTS_ID: '/clients/:id',
  SERVICES: '/services',
  SERVICES_ID: '/services/:id',
  SERVICES_ID_STAGES: '/services/:id/stages/:stageId',
  TASKS: '/tasks',
  CALENDAR: '/calendar',
  SETTINGS: '/settings',
  BILLS: '/bills',
  TIME_TRACKINGS: '/timetrackings',
  LOGIN: '/login',
  NOTFOUND: '*',
  DEALS: '/deals',
  DEALS_ID: '/deals/:id',
  FORBIDDEN: '/forbidden',
};

const PrivateRoute = ({ element }) => {
  const { authToken } = useContext(AuthContext);
  const location = useLocation();

  if (!authToken) {
    return <Navigate to="/login" state={{ from: location }} />;
  }

  return <Page>{element}</Page>;
};

const protectedRoutes = [
  {
    path: paths.MAIN,
    element: <></>,
  },
  {
    path: paths.DEALS,
    element: <Deals />,
  },
  {
    path: paths.DEALS_ID,
    element: <DealPage />,
  },
  {
    path: paths.CLIENTS,
    element: <Clients />,
  },

  {
    path: paths.CLIENTS_ID,
    element: <ClientPage />,
  },
  {
    path: paths.SERVICES,
    element: <Services />,
  },
  {
    path: paths.SERVICES_ID,
    element: <ServicePage />,
  },
  {
    path: paths.SERVICES_ID_STAGES,
    element: <StagesPage />,
  },
  {
    path: paths.TASKS,
    element: <TasksWithQuery />,
  },
  {
    path: paths.CALENDAR,
    element: <Calendar />,
  },
  {
    path: paths.SETTINGS,
    element: <Settings />,
  },
  {
    path: paths.BILLS,
    element: <Bills />,
  },
  {
    path: paths.TIME_TRACKINGS,
    element: <TimeTrackings />,
  },
];

const openRoutes = [
  {
    path: paths.LOGIN,
    element: <LoginPage />,
  },
  {
    path: paths.NOTFOUND,
    element: <NotFound />,
  },
  {
    path: paths.FORBIDDEN,
    element: <Forbidden />,
  },
];

export const prepareRoutes = () => {
  return (
    <Routes>
      {protectedRoutes.map(({ path, element }) => (
        <Route
          key={path}
          path={path}
          element={<PrivateRoute element={element} />}
        />
      ))}
      {openRoutes.map(({ path, element }) => (
        <Route key={path} path={path} element={element} />
      ))}
      <Route path="*" element={<Navigate to={paths.NOTFOUND} />} />
    </Routes>
  );
};
