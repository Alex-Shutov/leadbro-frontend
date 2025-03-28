import { observer } from 'mobx-react';

import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import usePagingData from '../../../../hooks/usePagingData';
import TableLink from '../../../../shared/Table/Row/Link';
import EditModal from './components/EditModal';
import useStore from '../../../../hooks/useStore';
import useBillsApi from '../../bills.api';
import Table from '../../../../shared/Table';
import Badge, { statusTypes } from '../../../../shared/Badge';
import styles from './Table.module.sass';
import TextLink from '../../../../shared/Table/TextLink';
import BillsStats from './components/BillsStats';
import useQueryParam from '../../../../hooks/useQueryParam';
import { formatDateToQuery } from '../../../../utils/formate.date';
import { format, startOfDay, sub } from 'date-fns';
import ConfirmationModal from '../../../../components/ConfirmationModal';
import { handleError, handleInfo } from '../../../../utils/snackbar';
import TaskFilter from "../../../Tasks/components/TaskFilter";
import BillsTableFilter from "./components/BillsFilters/BillsTableFilter";
import BillsFilter from "./components/BillsFilters/BillsFilter";
import {FiltersProvider} from "../../../../providers/FilterProvider";
import {createTaskFilters} from "../../../Tasks/tasks.filter.conf";
import {createBillsFilters} from "../../bills.filter.conf";
import {LoadingProvider} from "../../../../providers/LoadingProvider";
import {getQueryParam} from "../../../../utils/window.utils";

export const formatDateForUrl = (date) => {
  return format(date, 'yyyy-MM-dd');
};

const BillsTable = observer(() => {
  const { billsStore } = useStore();
  const api = useBillsApi();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentBill, setCurrentBill] = useState(null);
  const [billToDelete, setBillToDelete] = useState(null);
  const periodCalendarRef = useRef()
  const periodSelectorRef = useRef()
  const today = startOfDay(new Date());
  const monthAgo = sub(today, { months: 1 });
  const todayFormatted = formatDateForUrl(today);

  const monthAgoFormatted = formatDateForUrl(monthAgo);

  const from = useQueryParam('from', monthAgoFormatted);
  const to = useQueryParam('to', todayFormatted);

  const fetchBills = useCallback(
    (page) => {
      api.getBills(page, from, to);
    },
    [from, to],
  );

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

  const handleDelete = async (id) => {
    try {
      await api.deleteBill(id, currentPage, from, to);
      handleInfo('Услуга удалена');
    } catch (error) {
      handleError('Ошибка при удалении:', error);
    }
  };

  const handleDownload = (urlToBill) => {
    window.open(urlToBill, '_blank');
  };

  const getActions = (data) => [
    { label: 'Скачать', onClick: () => handleDownload(data.stampedBill) },
    { label: 'Редактировать', onClick: () => handleEdit(data) },
    {
      label: 'Удалить',
      onClick: () => setBillToDelete(data.id),
      disabled: data.id === 0,
    },
  ];

  useEffect(() => {

    api.getBills(
      currentPage,
      from ?? formatDateToQuery(new Date()),
      to ?? formatDateToQuery(new Date()),
    );
  }, [from, to]);

  const handleFilterChange = async (filters) => {
    if (filters.date_range && !getQueryParam('date_range')) return

    await api.getBills(1, from, to, filters).then(()=>handlePageChange(1));
  };


  const cols = useMemo(
    () => [
      {
        Header: 'Номер счета',
        id: 'number',
        accessor: 'number',
        width: '15%',
        Cell: ({ row }) => (
          <TableLink
            onClick={() => handleEdit(row.original)}
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
        Cell: ({ row }) => {

          return <span>{row.original.sum.toLocaleString()} руб.</span>;
        },
      },
      {
        Header: 'Клиент',
        id: 'company',
        width: '20%',
        accessor: 'company.name',
        Cell: ({ row }) => {
          return row.original.company ? (
            <TextLink to={`/clients/${row.original.company.id}`}>
              {row.original.company.name}
            </TextLink>
          ) : (
            <></>
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
            statusType={statusTypes.bills}
          />
        ),
      },
    ],
    [],
  );

  return (
    <FiltersProvider>
      <LoadingProvider isLoading={api.isLoading}>
      <div className={styles.table}>
        <Table
          beforeTable={() => (
            <div>
              {/*<BillsTableFilter />*/}
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
            filter: {
              classNameBody: styles.filter_container,
              title: 'Фильтр',
              config: createBillsFilters({periodSelectorRef,periodCalendarRef}),
              onChange: handleFilterChange
            },
          }}
          title="Счета"
          data={paginatedData}
          columns={cols}
          actions={getActions}
          paging={{
            totalPages,
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
            setEditModalOpen(false);
            setCurrentBill(null);
          }}
        />
      )}
      {billToDelete !== null && (
        <ConfirmationModal
          isOpen={billToDelete !== null}
          onClose={() => setBillToDelete(null)}
          onConfirm={() => {
            handleDelete(billToDelete).then(() => {
              setBillToDelete(null);
            });
          }}
          label="Вы уверены, что хотите удалить счет?"
        />
      )}
      </LoadingProvider>
    </FiltersProvider>
  );
});

export default BillsTable;
