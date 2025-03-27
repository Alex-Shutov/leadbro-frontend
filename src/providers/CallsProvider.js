import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import useStore from "../hooks/useStore";
import CallButton from "../pages/Calls/components/CallButton";
import CallModal from "../pages/Calls/components/CallModal";

// Создаем контекст для функционала звонков
const CallsContext = createContext(null);

export const CallsProvider = ({ children,withHistory=true,entity=null,entityId=null, }) => {
    const [isCallModalOpen, setIsCallModalOpen] = useState(false);
    const isRenderedFirst = useRef();
    const [selectedPhone, setSelectedPhone] = useState(null);
    const { callsStore } = useStore();
    const updateIntervalRef = useRef(null);

    const openCallModal = (phone = null) => {
        if (phone) {
            setSelectedPhone(phone);
        }
        setIsCallModalOpen(true);
    };

    const closeCallModal = () => {
        setIsCallModalOpen(false);
        setSelectedPhone(null);
    };

    useEffect(() => {
        if (isCallModalOpen) {
           if (!isRenderedFirst.current) {
               callsStore.setContext(entity,entityId)
               isRenderedFirst.current = true;
           }
            callsStore.fetchCallsData();
            if(withHistory) {
                updateIntervalRef.current = setInterval(() => {
                    callsStore.fetchCallsData();
                }, 5000);
            }
        }

        return () => {
            if (updateIntervalRef.current) {
                isRenderedFirst.current = false;
                clearInterval(updateIntervalRef.current);
                updateIntervalRef.current = null;
            }
        };
    }, [isCallModalOpen, callsStore]);

    const contextValue = {
        openCallModal,
        closeCallModal,
        isCallModalOpen,
        selectedPhone,
        setSelectedPhone,
        makeCall: (phoneNumber) => callsStore.makeCall(phoneNumber)
    };

    return (
        <CallsContext.Provider value={contextValue}>
            {children}

                <>
                        <CallButton
                        isOpen={isCallModalOpen}
                        onClose={closeCallModal}
                        onClick={() => openCallModal()}
                        />
                    <CallModal
                        withHistory={withHistory}
                        isRendered={isRenderedFirst}
                        isOpen={isCallModalOpen}
                        onClose={closeCallModal}
                        initialPhone={selectedPhone}
                    />
                </>
        </CallsContext.Provider>
    );
};

export const useCallsContext = () => {
    const context = useContext(CallsContext);
    if (!context) {
        throw new Error('useCallsContext must be used within CallsProvider');
    }
    return context;
};