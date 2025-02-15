// hooks/useNavigation.js
import { useContext, useState } from 'react';
import useStore from '../hooks/useStore';
import { AuthContext } from '../providers/AuthProvider';

const useAppNavigation = () => {
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const { logout } = useContext(AuthContext);

  const handleLogout = () => {
    // Здесь ваша логика выхода
    logout(); // или что там у вас для выхода
  };

  const navigation = [
    {
      title: 'Сделки',
      action: () => {},
      url: '/deals',
    },
    {
      title: 'Клиенты',
      action: () => {},
      url: '/clients',
    },
    {
      title: 'Услуги',
      action: () => {},
      url: '/services',
    },
    {
      title: 'Задачи',
      action: () => {},
      url: '/tasks',
    },
    {
      title: 'Счета',
      action: () => {},
      url: '/bills',
    },
    {
      title: 'Настройки',
      action: () => {},
      url: '/settings',
    },
    {
      title: 'Трекер',
      action: () => {},
      url: '/timetrackings',
    },
    {
      title: 'Wiki',
      action: () => {},
      url: 'https://wiki.lead-bro.ru',
    },
    {
      button: true,
      icon: (
        <img
          style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}
          src={'/leadbro/power.svg'}
        />
      ),
      title: 'Выйти',
      action: () => setIsLogoutModalOpen(true),
    },
  ];

  return {
    navigation,
    isLogoutModalOpen,
    setIsLogoutModalOpen,
    handleLogout,
  };
};

// nav.js
export { useAppNavigation };
