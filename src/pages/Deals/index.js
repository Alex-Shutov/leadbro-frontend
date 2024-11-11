import React, { useState } from 'react';
import { observer } from 'mobx-react';
import useDealsApi from "./deals.api";
import {useNavigate} from "react-router";
import useDealsByStatus from "./hooks/useDealsByStatus";
import {LoadingProvider} from "../../providers/LoadingProvider";
import Title from "../../shared/Title";
import DealsTable from "./components/DealsTable";
import DealEditModal from "./components/DealEditModal";



const Deals = observer(() => {
    const api = useDealsApi();
    const navigate = useNavigate();
    const [dealData, setDealData] = useState(null);
    const [isCreateMode, setIsCreateMode] = useState(false);

    // Получаем значение фильтра из URL или используем значение по умолчанию

    const { data, isLoading, store: dealsStore } = useDealsByStatus();

    // Обработчик создания новой сделки
    const handleCreateDeal = () => {
        setIsCreateMode(true);
        setDealData(null);
    };

    // Обработчик закрытия модального окна
    const handleCloseModal = () => {
        setDealData(null);
        setIsCreateMode(false);
    };



    // Подсчет количества сделок в каждом статусе
    const getCountStatusDeal = (type) => {
        const deals = data.find((deal) => deal.type === type);
        return deals ? deals.values.length : 0;
    };

    // Обработчик изменения статуса сделки
    const handleChange = (dealId, newStatus) => {
        dealsStore.changeById(dealId, 'status', newStatus, true);
        api.updateDeal(dealId, { status: newStatus });
    };

    // Обработчик клика по карточке сделки
    const handleDealClick = (deal) => {
        navigate(`/deals/${deal.id}`);
    };

    return (
        <LoadingProvider isLoading={false}>
            <Title
                title={'Сделки'}
                actions={{
                    add: {
                        action: handleCreateDeal,
                        title: 'Создать сделку',
                    },
                }}
            />
            <DealsTable
                onClick={handleDealClick}
                data={data}
                handleChange={handleChange}
            />
            {(dealData || isCreateMode) && (
                <DealEditModal
                    data={dealData}
                    handleClose={handleCloseModal}
                    dealStore={dealsStore}
                    dealApi={api}
                />
            )}
        </LoadingProvider>
    );
});

export default Deals;