import React, { useMemo } from 'react';
import TableLink from '../../../../../shared/Table/Row/Link';
import Badge, { statusTypes } from '../../../../../shared/Badge';
import ManagerCell from '../../../../../components/ManagerCell';
import ServicesCell from '../../ClientsTable/Cells/ServicesCell';
import ActivitiesCell from '../../ClientsTable/Cells/ActivitiesCell';
import clients from '../../../index';
import Table from '../../../../../shared/Table';
import AdaptiveCard from './AdaptiveCard';
import { formatDate } from '../../../../../utils/formate.date';
import styles from './Services.module.sass';
import { Link } from 'react-router-dom';
import TextLink from '../../../../../shared/Table/TextLink';

const ClientService = ({ services }) => {
  const cols = React.useMemo(
    () => [
      {
        Header: 'Услуга',
        id: 'service',
        Cell: ({ row }) => {
          const data = row?.original;
          return (
            <TextLink className={styles.link}>{data?.description}</TextLink>
          );
        },
      },

      {
        Header: 'Постановщик',
        id: 'manager',
        sortType: 'basic',
        accessor: 'creator.name',
        Cell: ({ row }) => {
          const data = row?.original;
          return (
            <ManagerCell className={styles.manager} manager={data.creator} />
          );
        },
      },
      {
        Header: 'Ответственный',
        id: 'responsible',
        sortType: 'basic',
        accessor: 'responsible.name',
        Cell: ({ row }) => {
          const data = row?.original;
          return <ManagerCell manager={data.responsible} />;
        },
      },
      {
        Header: 'Дедлайн',
        id: 'deadline',
        Cell: ({ row }) => {
          const data = row?.original;
          return <p>{formatDate(data.deadline)}</p>;
        },
      },
    ],
    [],
  );
  const data = useMemo(() => services ?? [], services);
  return (
    <div>
      <Table
        onPagination={true}
        smallTable={true}
        headerInCard={true}
        cardComponent={(data, onPagination) => (
          <AdaptiveCard
            onPagination={onPagination}
            className={styles.card_adaptive}
            data={data}
          />
        )}
        headerActions={{
          sorting: true,
          add: {
            action: () => console.log('1234'),
            title: '',
          },
        }}
        title={'Услуги'}
        data={data}
        columns={cols}
      />
    </div>
  );
};

export default ClientService;
