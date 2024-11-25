import React, { useEffect, useState } from 'react';
import styles from './Table.module.sass';
import Table from '../../../../shared/Table';
import { observer } from 'mobx-react';
import useStore from '../../../../hooks/useStore';
import { Link, useSearchParams } from 'react-router-dom';
import TableLink from '../../../../shared/Table/Row/Link';
import Badge, { statusTypes } from '../../../../shared/Badge';
import ManagerCell from '../../../../components/ManagerCell';
import ServicesCell from './Cells/ServicesCell';
import ActivitiesCell from './Cells/ActivitiesCell';
import logo from '../../../../shared/Logo';
import AdaptiveCard from './Cells/AdaptiveCard';
import usePagingData from '../../../../hooks/usePagingData';
import CreateModal from './CreateModal';
import useClientsApi from '../../clients.api';
import ConfirmationModal from '../../../../components/ConfirmationModal';
import {
  handleError,
  handleInfo,
  handleSubmit,
} from '../../../../utils/snackbar';
import { useNavigate } from 'react-router';
import { getQueryParam } from '../../../../utils/window.utils';

const ClientsTable = observer(() => {
  const { clientsStore } = useStore();
  const api = useClientsApi();
  const [createModalOpen, setModalOpen] = useState(false);
  const page = getQueryParam('page', 1);
  const fetchClients = React.useCallback((page) => {
    api.getClients(page);
  }, []);
  console.log();
  const {
    currentPage,
    totalPages,
    totalItems,
    paginatedData,
    itemsPerPage,
    handlePageChange,
  } = usePagingData(clientsStore, fetchClients, () =>
    clientsStore?.getClients(),
  );

  const [editData, setEditData] = useState(null);
  const [editModalOpen, setEditModalIpen] = useState(false);
  const [clientDelete, setClientDelete] = useState(null);
  const cols = React.useMemo(
    () => [
      {
        Header: 'ФИО/Название',
        id: 'fio',
        sortType: 'basic',
        accessor: 'name',
        width: '25%',
        Cell: ({ row }) => {
          const data = row?.original;
          return <TableLink to={`${data.id}?page=${page}`} name={data.title} />;
        },
      },
      {
        Header: 'Статус клиента',
        id: 'status',
        Cell: ({ row }) => {
          const data = row?.original;
          return (
            <Badge
              classname={styles.badge}
              status={data.status}
              statusType={statusTypes.clients}
            />
          );
        },
      },
      {
        Header: 'Ответственный менеджер',
        id: 'manager',
        sortType: 'basic',
        accessor: 'manager.name',

        Cell: ({ row }) => {
          const data = row?.original;
          return <ManagerCell manager={data.manager} />;
        },
      },
      {
        Header: 'Активные услуги',
        id: 'services',
        width: '5%',
        Cell: ({ row }) => {
          const data = row?.original;
          return <ServicesCell services={data.services} />;
        },
      },
      {
        Header: 'Активные дела',
        id: 'activities',
        width: '18%',

        Cell: ({ row }) => {
          const data = row?.original;
          // return <ActivitiesCell activities={data.activities} />;
        },
      },
    ],
    [],
  );

  const handleDeleteClient = async (clientId) => {
    try {
      await api.deleteClient(clientId, currentPage);
      handleInfo('Клиент удален');
    } catch (error) {
      handleError('Ошибка при удалении:', error);
    }
  };

  const handleEditClient = (data) => {
    setEditModalIpen(true);
    setEditData(data);
  };

  const getActions = (data) => {
    return [
      { label: 'Скачать', onClick: () => console.log('Скачать') },
      { label: 'Редактировать', onClick: () => handleEditClient(data) },
      {
        label: 'Удалить',
        onClick: () => setClientDelete(data?.id),
        disabled: data.id === 0,
      },
    ];
  };

  return (
    <>
      <div className={styles.table}>
        <Table
          cardComponent={(data) => (
            <AdaptiveCard data={data} statusType={statusTypes.clients} />
          )}
          headerActions={{
            sorting: true,
            settings: true,
            add: {
              action: () => {
                setModalOpen(true);
              },
              title: 'Добавить клиента',
            },
          }}
          title={'Клиенты'}
          data={paginatedData}
          columns={cols}
          actions={getActions}
          paging={{
            current: currentPage,
            all: totalItems,
            offset: itemsPerPage,
            onPageChange: handlePageChange, // Функция для смены страниц
          }}
        />
      </div>
      {createModalOpen && <CreateModal onClose={() => setModalOpen(false)} />}
      {editModalOpen && (
        <CreateModal
          clientId={editData.id}
          onClose={() => {
            setEditModalIpen(false);
            setEditData(null);
            clientsStore.clearCurrentClient();
          }}
        />
      )}
      {clientDelete !== null && (
        <ConfirmationModal
          isOpen={clientDelete !== null}
          onClose={() => setClientDelete(null)}
          onConfirm={() => {
            handleDeleteClient(clientDelete).then(() => {
              setClientDelete(null);
            });
          }}
          label="Вы уверены, что хотите удалить клиента?"
        />
      )}
    </>
  );
});

export default ClientsTable;
