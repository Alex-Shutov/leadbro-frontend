import React, { useCallback, useMemo, useRef, useState } from 'react';
import { observer } from 'mobx-react';
import useStageApi from '../../../../stages.api';
import ManagerCell from '../../../../../../components/ManagerCell';
import styles1 from '../../../../../Clients/components/ClientsTable/Table.module.sass';
import styles from './Stages.module.sass';
import Table from '../../../../../../shared/Table';
import { formatDateWithDateAndYear } from '../../../../../../utils/formate.date';
import StageBadge, { StageStatuses } from './components/StagesBadge';
import ClientInfo from '../ClientInfo';
import DeadLineTimeCell from './components/DeadLineTimeCell';
import EditModal from './components/EditModal';
import { convertToHours } from '../../../../../../utils/format.time';
import AdaptiveCard from './components/AdaptiveCard';
import TextLink from '../../../../../../shared/Table/TextLink';
import useOutsideClick from '../../../../../../hooks/useOutsideClick';
import useStore from "../../../../../../hooks/useStore";
import usePagingData from "../../../../../../hooks/usePagingData";

const StagesTable = observer(({ stage }) => {
  const { stagesStore } = useStore();
  const api = useStageApi();
  const [taskData, setTaskData] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const ref = useRef();

  const fetchStages = useCallback((stageId) => {
    api.getTaskStages(stageId);
  }, []);

  const {
    currentPage,
    totalPages,
    totalItems,
    paginatedData,
    itemsPerPage,
    handlePageChange,
  } = usePagingData(stagesStore, fetchStages, () => stagesStore?.getStages());
  const handleEdit = (data) => {
    setTaskData(data);
    setEditModalOpen(true);
  };

  const handleDelete = (id) => {
    // Реализуйте логику удаления
    console.log(`Удалить услугу с ID: ${id}`);
  };

  const getActions = (data) => [
    { label: 'Редактировать', onClick: () => handleEdit(data) },
    {
      label: 'Удалить',
      onClick: () => handleDelete(data.id),
      disabled: data.id === 0
    },
  ];

  const cols = React.useMemo(() => {
    return [
      {
        Header: 'Задача',
        id: 'title',
        accessor: 'title',
        width: '25%',

        Cell: ({ row }) => {
          const data = row?.original[row.index];
          return (
            <TextLink
              onClick={() => {
                setTaskData(data);
              }}
            >
              {data.title}
            </TextLink>
          );
        },
      },
      {
        Header: 'Статус задачи',
        id: 'status',
        width: '20%',
        // editing: true,
        accessor: 'status',
        Cell: ({ row }) => {
          const data = row?.original[row.index];
          return (
            <StageBadge statusType={StageStatuses.tasks} status={data.status} />
          );
        },
      },
      {
        Header: 'Ответственный',
        id: 'responsible',
        width: '25%',
        accessor: 'responsible',
        // editing: true,
        Cell: ({ row }) => {
          const data = row?.original[row.index];
          return Array.isArray(data.responsibles) ? (
            data.responsibles.map((el) => <ManagerCell manager={el} />)
          ) : (
            <ManagerCell manager={data.responsibles} />
          );
        },
      },
      {
        Header: 'Дедлайн',
        id: 'deadline',
        width: '25%',

        Cell: ({ row }) => {
          const data = row?.original[row.index];
          return <span>{formatDateWithDateAndYear(data.deadline)}</span>;
        },
      },
      {
        Header: () => null,
        id: 'deadline_time',
        width: '25%',

        Cell: ({ row }) => {
          const data = row?.original[row.index];
          return (
            <DeadLineTimeCell
              deadLine={data.deadlineTime}
              actualTime={data.actualTime}
            />
          );
        },
      },
    ];
  }, []);

  const sumActualTime = useMemo(() => {
    const totalHours = stage.tasks.reduce(
      (sum, task) =>
        task.actualTime ? sum + (convertToHours(task.actualTime) || 0) : sum,
      0,
    );
    return totalHours + ' ч';
  }, [paginatedData]);
  return (
    <div className={styles.table}>
      <Table
          paging={{
            current: currentPage,
            all: totalItems,
            offset: itemsPerPage,
            onPageChange: handlePageChange,
          }}

        editComponent={(data) => <EditModal stageId={stage.id} data={data} />}
        classContainer={styles.tableContainer}
        // editComponent={(data, onClose) => <EditModal data={data} />}
        // cardComponent={(data) => (
        //   <AdaptiveCard data={data} statusType={StageStatuses.tasks} />
        // )}
          actions={getActions}
        after={<ClientInfo timeActual={sumActualTime} data={paginatedData[0]} />}
        headerActions={{
          add: {
            action: () => console.log('1234'),
            title: 'Добавить услугу',
          },
        }}
        data={paginatedData.map(el=>el.tasks)}
        title={`Этап №${stage.id+1}`}
        columns={cols}
      />
      {/*{stage && <ClientInfo client={stage.client} />}*/}
      {taskData && (
        <EditModal
          idStage={stage.id}
          stageId={stage.id}
          data={taskData}
          handleClose={() => setTaskData(null)}
        />
      )}
    </div>
  );
});

export default StagesTable;
