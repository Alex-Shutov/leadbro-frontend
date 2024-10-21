import { observer } from "mobx-react";
import useStore from "../../../../hooks/useStore";
import { useCallback, useState } from "react";
import usePagingData from "../../../../hooks/usePagingData";
import Table from "../../../../shared/Table";
import useLegalsApi from "../../api/legals.api"; // Апи для юридических лиц
import styles from './Table.module.sass';
import React from "react";
import { LoadingProvider } from "../../../../providers/LoadingProvider";
import EditModal from "./components/EditModal";

const LegalsTable = observer(({ currentSwitcher }) => {
    const { legalsStore } = useStore();
    const api = useLegalsApi();
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [currentEntity, setCurrentEntity] = useState(null);

    const fetchLegalEntities = useCallback((page) => {
        api.getLegals(page);
    }, []);

    const {
        currentPage,
        totalPages,
        totalItems,
        paginatedData,
        itemsPerPage,
        handlePageChange,
    } = usePagingData(legalsStore, fetchLegalEntities, () =>
        legalsStore?.getLegals(),
    );

    const handleEdit = (entity) => {
        setCurrentEntity(entity);
        setEditModalOpen(true);
    };

    const cols = React.useMemo(
        () => [
            {
                Header: 'ID',
                id: 'id',
                accessor: 'id',
                width: '10%',
                Cell: ({ row }) => <span>{row.original.id}</span>,
            },
            {
                Header: 'Название компании',
                id: 'companyName',
                accessor: 'companyName',
                width: '40%',
                Cell: ({ row }) => <span>{row.original.companyName}</span>,
            },
            {
                Header: 'Основное юр. лицо',
                id: 'isMainLegalEntity',
                accessor: 'isMainLegalEntity',
                width: '25%',
                Cell: ({ row }) => (
                    <span>{row.original.isMainLegalEntity ? 'Да' : 'Нет'}</span>
                ),
            },
            {
                Header: 'Дата создания',
                id: 'createdAt',
                accessor: 'createdAt',
                width: '25%',
                Cell: ({ row }) => (
                    <span>{row.original.createdAt.toLocaleDateString()}</span>
                ),
            },
        ],
        [],
    );

    const handleDelete = (id) => {
        // Реализуйте логику удаления
        console.log(`Удалить услугу с ID: ${id}`);
    };



    const getActions = (data) => [
        { label: 'Редактировать', onClick: () => handleEdit(data) },
        {
            label: 'Уволить',
            onClick: () => handleDelete(data.id),
            disabled: data.id === 0, // Можно добавить дополнительные условия для деактивации
        }]

    return (
        <LoadingProvider isLoading={api.isLoading}>
            <div className={styles.table}>
                <Table
                    headerActions={{
                        sorting: true,
                        add: {
                            action: () => setEditModalOpen(true),
                            title: 'Добавить юр. лицо',
                        },
                    }}
                    title="Юридические лица"
                    settingsSwithcerValue={currentSwitcher}
                    data={paginatedData}
                    actions={getActions}
                    columns={cols}
                    paging={{
                        current: currentPage,
                        all: totalItems,
                        offset: itemsPerPage,
                        onPageChange: handlePageChange,
                    }}
                />
            </div>
            {editModalOpen && (
                <EditModal
                    legalId={currentEntity?.id ?? null}
                    onClose={() =>{
                        setEditModalOpen(false)
                        setCurrentEntity(null)
                    }}
                />
            )}
        </LoadingProvider>
    );
});

export default LegalsTable;
