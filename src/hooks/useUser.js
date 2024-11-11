import {useContext, useEffect, useMemo} from "react";
import {StoreContext} from "../providers/StoreProvider";
import useStore from "./useStore";
import useAppApi from "../api";
import {loadAvatar} from "../utils/create.utils";

const mapUser = (userApi) => {
   return {
      id:userApi.id,
      name:userApi.name,
      middleName: userApi.middle_name,
      lastName: userApi.last_name,
      image:loadAvatar(userApi?.avatar),
      role: userApi.position?.name,
      email: userApi.email,
      phone: userApi.phone || null,
   }
}

const useUser = () => {
   const { userStore } = useStore();
   const {getUserProfile, isLoading} = useAppApi()

   const fetchUser = async () => {
      try {
         const response = await getUserProfile();
         debugger
         userStore.setUser(mapUser(response.body.data));
      } catch (error) {
         console.error('Error fetching user profile:', error);
      }
   };

   useEffect(() => {
      if (!userStore.user) {
         fetchUser();
      }
   }, []);

   const user = useMemo(() => userStore.user, [userStore.user]);
   debugger
   return {
      user,
      isLoading,
      refetch: fetchUser
   };
};

export default useUser;

