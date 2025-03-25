import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { observer } from 'mobx-react';
import Table from '../../../../shared/Table';
import styles from './Table.module.sass';
import {
  formatDate,
  formatDateOnlyHours,
  formatDateToQuery,
  formatDateWithoutHours,
} from '../../../../utils/formate.date';
import Badge, { statusTypes } from '../../../../shared/Badge';
import {
  callDirectionTypesRu,
  colorDirectionTypes,
  colorStatusTypes,
} from '../../calls.types';
import TextLink from '../../../../shared/Table/TextLink';
import useStore from '../../../../hooks/useStore';
import useCallsApi from '../../calls.api';
import { FiltersProvider } from '../../../../providers/FilterProvider';
import { LoadingProvider } from '../../../../providers/LoadingProvider';
import { useLocation, useNavigate } from 'react-router-dom';
import { format, startOfDay, sub } from 'date-fns';
import useQueryParam from '../../../../hooks/useQueryParam';
import { createCallsFilters } from '../../calls.filter.conf';
import usePagingData from '../../../../hooks/usePagingData';
import { getQueryParam } from '../../../../utils/window.utils';
import CallsStats from './CallStats';
import { formatSeconds } from '../../../../utils/format.time';

const CallsTable = observer(() => {
  const { callsStore } = useStore();
  const api = useCallsApi();
  const periodCalendarRef = useRef();
  const periodSelectorRef = useRef();
  const location = useLocation();
  const navigate = useNavigate();

  // Get date params
  const today = startOfDay(new Date());
  const monthAgo = sub(today, { months: 1 });
  const todayFormatted = formatDateToQuery(today);
  const monthAgoFormatted = formatDateToQuery(monthAgo);

  const from = useQueryParam('from', monthAgoFormatted);
  const to = useQueryParam('to', todayFormatted);

  const fetchCalls = useCallback(
    (page) => {
      api.getCalls(page);
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
  } = usePagingData(callsStore, fetchCalls, () => callsStore?.getCalls());

  const handleCheckRecord = (urlToRecord) => {
    debugger;
    window.open(urlToRecord, '_blank');
  };

  // useEffect(() => {
  //   api.getCalls(currentPage);
  // }, [currentPage, location.search]);

  const handleFilterChange = async (filters) => {
    debugger;
    if (filters.date_range && !getQueryParam('date_range')) return;

    await api.getCalls(1).then(() => handlePageChange(1));
  };

  // Render phone/contact cell
  const renderContactInfo = useCallback((entity) => {
    if (!entity) return <span>-</span>;

    return (
      <div className={styles.contactInfo}>
        {entity.name && (
          <TextLink to={`/clients/${entity.id}`}>{entity.name}</TextLink>
        )}
        <div className={styles.phoneNumber}>{entity.phone || '-'}</div>
      </div>
    );
  }, []);

  const renderPhone = useCallback((phone) => {
    return <div className={styles.phone}>{phone}</div>;
  }, []);

  // Table columns definition
  const cols = useMemo(
    () => [
      {
        Header: 'ID',
        accessor: 'mangoId',
      },
      {
        Header: 'Тип/Дата',
        accessor: 'type',
        Cell: ({ row }) => {
          debugger;
          return (
            <div className={styles.typeCell}>
              <Badge
                statusType={colorDirectionTypes}
                status={row.original.type}
              />
              <div className={styles.callDate}>
                {formatDate(row.original.createdAt)}
              </div>
            </div>
          );
        },
      },
      {
        Header: 'Статус',
        accessor: 'success',
        Cell: ({ row }) => (
          <Badge statusType={colorStatusTypes} status={row.original.success} />
        ),
      },
      {
        Header: 'Кто звонил',
        accessor: 'company',
        Cell: ({ row }) =>
          row.original?.company
            ? renderContactInfo(row.original.company)
            : renderPhone(row.original.phone),
      },
      {
        Header: 'Кому звонили',
        Header: 'Кому звонили',
        accessor: 'manager',
        Cell: ({ row }) =>
          row.original?.manager
            ? renderContactInfo(row.original.manager)
            : renderPhone(row.original.phoneClient),
      },
      {
        Header: 'Длительность',
        accessor: 'duration',
        Cell: ({ row }) => (
          <div className={styles.durationCell}>
            {formatSeconds(row.original.duration)}
          </div>
        ),
      },
    ],
    [renderContactInfo],
  );

  const getActions = (data) => [
    {
      label: 'Запись разговора',
      onClick: () => handleCheckRecord(data.record),
    },
  ];

  return (
    <FiltersProvider>
      <LoadingProvider isLoading={api.isLoading}>
        <div className={styles.container}>
          <Table
            beforeTable={() => (
              <div>
                <CallsStats />
              </div>
            )}
            headerActions={{
              sorting: true,
              settings: true,
              filter: {
                title: 'Фильтр',
                config: createCallsFilters({
                  periodSelectorRef,
                  periodCalendarRef,
                }),
                onChange: handleFilterChange,
              },
            }}
            title="Звонки"
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
      </LoadingProvider>
    </FiltersProvider>
  );
});
export default CallsTable;
