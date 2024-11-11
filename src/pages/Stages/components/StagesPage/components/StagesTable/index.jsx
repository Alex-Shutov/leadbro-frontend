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
import useStore from '../../../../../../hooks/useStore';
import usePagingData from '../../../../../../hooks/usePagingData';
import EditStage from '../../../../../../components/EditStage';
import { useParams } from 'react-router';
import TaskEditModal from '../../../../../../components/TaskModal';
import useTasksApi from '../../../../../Tasks/tasks.api';

const StagesTable = observer(({ stage }) => {
  const { stagesStore } = useStore();
  const { stageId } = useParams();
  const api = useStageApi();
  const [taskData, setTaskData] = useState(null);
  const [editStageModalOpen, setEditStageModalOpen] = useState(false);
  const [editTaskModalOpen, setEditTaskModalOpen] = useState(false);
  const ref = useRef();
  const taskApi = useTasksApi();
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
  const handleEditTask = (data) => {
    setTaskData(data);
    setEditTaskModalOpen(true);
  };
  const handleCreateTask = () => {
    setTaskData(null);
    setEditTaskModalOpen(true);
  };

  const handleCloseTaskModal = () => {
    setTaskData(null);
    setEditTaskModalOpen(false);
  };
  const handleDelete = (id) => {
    console.log(`Удалить услугу с ID: ${id}`);
  };

  const getActions = (data) => [
    { label: 'Редактировать', onClick: () => handleEditTask(data) },
    {
      label: 'Удалить',
      onClick: () => handleDelete(data.id),
      disabled: data.id === 0,
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
          const data = row?.original;
          return (
            <TextLink
              onClick={() => {
                handleEditTask(data);
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
          const data = row?.original;
          return (
            <StageBadge
              statusType={StageStatuses.tasks}
              status={data.taskStatus}
            />
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
          const data = row?.original;
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
          const data = row?.original;
          return <span>{formatDateWithDateAndYear(data.deadline)}</span>;
        },
      },
      {
        Header: () => null,
        id: 'deadline_time',
        width: '30%',

        Cell: ({ row }) => {
          const data = row?.original;

          return (
            <DeadLineTimeCell
              deadLine={data.deadlineTime}
              actualTime={data.actualTime}
            />
          );
        },
      },
    ];
  }, [paginatedData]);

  const sumActualTime = useMemo(() => {
    const totalHours = Object.values(stage?.tasks)?.reduce(
      (sum, task) =>
        task.actualTime ? sum + (convertToHours(task.actualTime) || 0) : sum,
      0,
    );
    return totalHours + ' ч';
  }, [paginatedData[0]]);
  return (
    <div className={styles.table}>
      <Table
        paging={{
          current: currentPage,
          all: totalItems,
          offset: itemsPerPage,
          onPageChange: handlePageChange,
        }}
        // editComponent={(data) => <EditModal stageId={stage.id} data={data} />}
        classContainer={styles.tableContainer}
        // editComponent={(data, onClose) => <EditModal data={data} />}
        // cardComponent={(data) => (
        //   <AdaptiveCard data={data} statusType={StageStatuses.tasks} />
        // )}
        actions={getActions}
        after={
          <ClientInfo timeActual={sumActualTime} data={paginatedData[0]} />
        }
        headerActions={{
          add: {
            action: () => handleCreateTask(),
            title: 'Создать задачу',
          },
          edit: {
            action: () => setEditStageModalOpen(true),
          },
        }}
        data={Object.values(paginatedData[0]?.tasks)}
        title={`${stage.title}`}
        columns={cols}
      />
      {/*{stage && <ClientInfo client={stage.client} />}*/}
      {editTaskModalOpen && (
        <TaskEditModal
          data={taskData}
          handleClose={handleCloseTaskModal}
          stage={stage}
          stagesStore={stagesStore}
          stageApi={api}
          taskApi={taskApi}
        />
      )}
      {editStageModalOpen && (
        <EditStage
          stageId={Number(stageId)}
          handleClose={() => setEditStageModalOpen(false)}
        />
      )}
    </div>
  );
});

export default StagesTable;
