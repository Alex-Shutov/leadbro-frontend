import React, { useState, useCallback } from 'react';
import { observer } from 'mobx-react';
import Table from '../../../../shared/Table';
import Badge, { statusTypes } from '../../../../shared/Badge';
import ManagerCell from '../../../../components/ManagerCell';
import StagesCell from './components/StagesCell';
import { getCorrectWordForm } from '../../../../utils/format.string';
import usePagingData from '../../../../hooks/usePagingData';
import useServiceApi from '../../services.api';
import useServices from '../../hooks/useServices';
import TableLink from '../../../../shared/Table/Row/Link';
import Tooltip from '../../../../shared/Tooltip';
import EditModal from './components/EditModal';
import AdaptiveCard from './components/AdaptiveCard';
import styles from './Table.module.sass';
import useStore from '../../../../hooks/useStore';

const ServicesTable = observer(() => {
  const { servicesStore } = useStore();
  const api = useServiceApi();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentService, setCurrentService] = useState(null);

  const fetchServices = useCallback((page) => {
    debugger;
    api.getServices(page);
  }, []);

  const {
    currentPage,
    totalPages,
    totalItems,
    paginatedData,
    itemsPerPage,
    handlePageChange,
  } = usePagingData(servicesStore, fetchServices, () =>
    servicesStore?.getServices(),
  );
  debugger;
  const handleEdit = (service) => {
    setCurrentService(service);
    setEditModalOpen(true);
  };

  const handleDelete = (id) => {
    // Реализуйте логику удаления
    console.log(`Удалить услугу с ID: ${id}`);
  };

  const getActions = (data) => [
    { label: 'Скачать', onClick: () => console.log('Скачать') },
    { label: 'Редактировать', onClick: () => handleEdit(data) },
    {
      label: 'Удалить',
      onClick: () => handleDelete(data.id),
      disabled: data.id === 0, // Можно добавить дополнительные условия для деактивации
    },
  ];

  const cols = React.useMemo(
    () => [
      {
        Header: 'ID',
        id: 'id',
        accessor: 'id',
        width: '0',
        Cell: ({ row }) => <span>{row.original.id}</span>,
      },
      {
        Header: 'Услуга',
        id: 'title',
        accessor: 'title',
        width: '20%',
        Cell: ({ row }) => (
          <TableLink
            to={`/services/${row.original.id}`}
            name={row.original.title}
          />
        ),
      },
      {
        Header: '№ договора',
        id: 'contractNumber',
        width: '12%',
        accessor: 'contractNumber',
        Cell: ({ row }) => <p>{row.original.contractNumber}</p>,
      },
      {
        Header: 'Создатель',
        id: 'manager',
        width: '15%',
        accessor: 'manager.name',
        Cell: ({ row }) => <ManagerCell manager={row.original.manager} />,
      },
      {
        Header: 'Команда',
        id: 'command',
        width: '10%',
        Cell: ({ row }) => {
          const data = row.original;
          const teamMembers = data.command.map((member) => (
            <p key={member.id}>
              {member.name} {member.surname}
            </p>
          ));
          return (
            <Tooltip title={teamMembers}>
              <div>
                <TableLink
                  name={getCorrectWordForm(data.command.length, 'участник')}
                />
              </div>
            </Tooltip>
          );
        },
      },
      {
        Header: 'Статус',
        id: 'status',
        Cell: ({ row }) => (
          <Badge
            classname={styles.badge}
            status={row.original.status}
            statusType={statusTypes.services}
          />
        ),
      },
      {
        Header: 'Этапы',
        id: 'stages',
        width: '20%',
        Cell: ({ row }) => {
          const maxCellLength = Math.floor(800 / 18);
          return (
            <StagesCell
              stages={row.original.stages}
              maxCellLength={maxCellLength}
            />
          );
        },
      },
    ],
    [],
  );

  return (
    <>
      <div className={styles.table}>
        <Table
          cardComponent={(data) => (
            <AdaptiveCard data={data} statusType={statusTypes.services} />
          )}
          headerActions={{
            sorting: true,
            settings: true,
            add: {
              action: () => setEditModalOpen(true),
              title: 'Добавить услугу',
            },
          }}
          title="Услуги"
          data={paginatedData}
          columns={cols}
          actions={getActions}
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
          serviceId={currentService?.id ?? null}
          onClose={() => setEditModalOpen(false)}
        />
      )}
    </>
  );
});

export default ServicesTable;
