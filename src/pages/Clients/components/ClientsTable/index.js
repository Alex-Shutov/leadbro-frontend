import React, { useEffect, useState } from 'react';
import styles from './Table.module.sass';
import Table from '../../../../shared/Table';
import { observer } from 'mobx-react';
import useStore from '../../../../hooks/useStore';
import { Link } from 'react-router-dom';
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

const ClientsTable = observer(() => {
  const { clientsStore } = useStore();
  const api = useClientsApi();
  const [createModalOpen, setModalOpen] = useState(false);
  const fetchClients = React.useCallback((page) => {
    api.getClients(page);
  }, []);

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
          return <TableLink to={`${data.id}`} name={data.title} />;
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
        // flexCol:true,
        // disableResizing:false,
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
          return <ActivitiesCell activities={data.activities} />;
        },
      },
    ],
    [],
  );

  const getActions = (data) => {
    return [
      { label: 'Скачать', onClick: () => console.log('Скачать') },
      { label: 'Редактировать', onClick: () => console.log('Редактировать') },
      {
        label: 'Удалить',
        onClick: () => console.log('Удалить'),
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
                console.log('123', createModalOpen);
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
    </>
  );
});

export default ClientsTable;
