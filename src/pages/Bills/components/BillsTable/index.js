import { observer } from 'mobx-react';

import { useCallback, useEffect, useMemo, useState } from 'react';
import usePagingData from '../../../../hooks/usePagingData';
import TableLink from '../../../../shared/Table/Row/Link';
import EditModal from './components/EditModal';
import useStore from '../../../../hooks/useStore';
import useBillsApi from '../../bills.api';
import Table from '../../../../shared/Table';
import BillsFilters from './components/BillsFilter';
import Badge, { statusTypes } from '../../../../shared/Badge';
import styles from './Table.module.sass';
import TextLink from '../../../../shared/Table/TextLink';
import BillsStats from './components/BillsStats';
import useQueryParam from '../../../../hooks/useQueryParam';
import { formatDateToQuery } from '../../../../utils/formate.date';
import {format, startOfDay, sub} from "date-fns";

export const formatDateForUrl = (date) => {
  return format(date, 'yyyy-MM-dd');
};

const BillsTable = observer(() => {
  const { billsStore } = useStore();
  const api = useBillsApi();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentBill, setCurrentBill] = useState(null);

  const today = startOfDay(new Date());
  const monthAgo = sub(today, { months: 1 });
  const todayFormatted = formatDateForUrl(today);

  const monthAgoFormatted = formatDateForUrl(monthAgo);
  debugger

  const from = useQueryParam('from', monthAgoFormatted);
  const to = useQueryParam('to', todayFormatted);

  const fetchBills = useCallback(
    (page) => {
      api.getBills(page, from, to);
    },
    [from, to],
  );
  // Поправить редактирвоание счета
  // Активные дела заголовок оставить,а значения пустые

  const {
    currentPage,
    totalPages,
    totalItems,
    paginatedData,
    itemsPerPage,
    handlePageChange,
  } = usePagingData(billsStore, fetchBills, () => billsStore?.getBills());

  const handleEdit = (bill) => {
    setCurrentBill(bill);
    setEditModalOpen(true);
  };

  const handleDelete = (id) => {
    // Реализуйте логику удаления
    console.log(`Удалить счет с ID: ${id}`);
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

  useEffect(() => {
    api.getBills(
      currentPage,
      from ?? formatDateToQuery(new Date()),
      to ?? formatDateToQuery(new Date()),
    );
  }, [from, to]);



  // const handleFilter = (period) => {
  //   debugger;
  //   // Вызываем API для фильтрации счетов по выбранному периоду
  //   api.getBills(currentPage, from, to);
  // };

  const cols = useMemo(
    () => [
      {
        Header: 'Номер счета',
        id: 'number',
        accessor: 'number',
        width: '15%',
        Cell: ({ row }) => (
          <TableLink
            to={`/bills/${row.original.id}`}
            name={row.original.number}
          />
        ),
      },
      {
        Header: 'Дата создания',
        id: 'creationDate',
        width: '15%',
        accessor: 'creationDate',
        Cell: ({ row }) => (
          <span>
            {new Date(row.original.creationDate).toLocaleDateString()}
          </span>
        ),
      },
      {
        Header: 'План. дата оплаты',
        id: 'paymentDate',
        width: '15%',
        accessor: 'paymentDate',
        Cell: ({ row }) => (
          <span>{new Date(row.original.paymentDate).toLocaleDateString()}</span>
        ),
      },
      {
        Header: 'Сумма',
        id: 'sum',
        width: '15%',
        accessor: 'sum',
        Cell: ({ row }) => (
          <span>{row.original.sum.toLocaleString()} руб.</span>
        ),
      },
      {
        Header: 'Клиент',
        id: 'company',
        width: '20%',
        accessor: 'company.name',
        Cell: ({ row }) => {
          return row.original.company ?  (
          <TextLink to={`/clients/${row.original.company.id}`}>
            {row.original.company.name}
          </TextLink>
        ) : <></>},
      },

      {
        Header: 'Статус',
        id: 'status',
        Cell: ({ row }) => (
          <Badge
            classname={styles.badge}
            status={row.original.status}
            statusType={statusTypes.bills}
          />
        ),
      },
    ],
    [],
  );

  return (
    <>
      <div className={styles.table}>
        <Table
          beforeTable={() => (
            <div>
              <BillsFilters />
              <BillsStats />
            </div>
          )}
          // cardComponent={(data) => (
          //   <AdaptiveCard data={data} statusType={statusTypes.bills} />
          // )}

          headerActions={{
            sorting: true,
            settings: true,
            add: {
              action: () => setEditModalOpen(true),
              title: 'Добавить счет',
            },
          }}
          title="Счета"
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
          billId={currentBill?.id ?? null}
          onClose={() => {
            setEditModalOpen(false)
            setCurrentBill(null)
          }}
        />
      )}
    </>
  );
});

export default BillsTable;
