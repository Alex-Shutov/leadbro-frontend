import React, { createContext, useContext } from 'react';
import Loader from "../shared/Loader";

const LoadingContext = createContext();

export const LoadingProvider = ({ isLoading, children }) => {
    if (isLoading) {
        return <Loader/>;  // Здесь ваш Loader
    }

    return (
        <LoadingContext.Provider value={{ isLoading }}>
            {children}
        </LoadingContext.Provider>
    );
};

export const useLoading = () => {
    return useContext(LoadingContext);
};
