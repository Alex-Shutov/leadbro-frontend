import { useContext, useEffect, useMemo } from 'react';
import { StoreContext } from '../providers/StoreProvider';
import useStore from './useStore';
import useAppApi from '../api';
import { loadAvatar } from '../utils/create.utils';
import { toCamelCase } from '../utils/mapper';

const mapUser = (userApi) => {
  return {
    id: userApi.id,
    name: userApi.name,
    middleName: userApi.middle_name,
    lastName: userApi.last_name,
    image: loadAvatar(userApi?.avatar),
    role: userApi.position?.name,
    email: userApi.email,
    phone: userApi.phone || null,
  };
};

const mapPermissions = (permissions) => {
  if (!permissions || typeof permissions !== 'object') {
    return {};
  }

  return Object.entries(permissions).reduce((acc, [key, value]) => {
    const camelCaseKey = toCamelCase(key);
    acc[camelCaseKey] = value;
    return acc;
  }, {});
};

const useUser = () => {
  const { userStore } = useStore();
  const { getUserProfile, isLoading, getUserRights } = useAppApi();

  const fetchUser = async () => {
    try {
      const response = await getUserProfile();
      userStore.setUser(mapUser(response.body.data));
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchUserRights = async () => {
    try {
      const response = await getUserRights();

      userStore.setRights(mapPermissions(response.body));
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  useEffect(() => {
    if (!userStore.rights) {
      fetchUserRights();
    }
  }, []);

  useEffect(() => {
    if (!userStore.user) {
      fetchUser();
    }
  }, []);
  const user = useMemo(() => userStore.user, [userStore.user]);
  const permissions = useMemo(() => userStore.rights, [userStore.rights]);
  return {
    permissions,
    user,
    isLoading,
    refetch: fetchUser,
  };
};

export default useUser;
