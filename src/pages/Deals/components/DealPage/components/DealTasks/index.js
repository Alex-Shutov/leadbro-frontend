import React, { useEffect, useMemo, useState } from 'react';
import styles from './styles.module.sass';
import TextLink from '../../../../../../shared/Table/TextLink';
import ManagerCell from '../../../../../../components/ManagerCell';
import Table from '../../../../../../shared/Table';
import AdaptiveCard from '../../../../../Clients/components/ClientPage/Services/AdaptiveCard';
import TaskEditModal from '../../../../../../components/TaskModal';
import useStore from '../../../../../../hooks/useStore';
import useDealsApi from '../../../../deals.api';
import useTasksApi from '../../../../../Tasks/tasks.api';
import StageBadge, {
  StageStatuses,
} from '../../../../../Stages/components/StagesPage/components/StagesTable/components/StagesBadge';
import Badge, { statusTypes } from '../../../../../../shared/Badge';
import DeadLineTimeCell from '../../../../../Stages/components/StagesPage/components/StagesTable/components/DeadLineTimeCell';
import { formatDate } from '../../../../../../utils/formate.date';

const DealTasks = ({ deal }) => {
  const { dealsStore } = useStore();
  const { tasksStore } = useStore();
  const dealsApi = useDealsApi();
  const taskApi = useTasksApi();
  const [taskData, setTaskData] = useState(null);
  const [editTaskModalOpen, setEditTaskModalOpen] = useState(false);

  const cols = useMemo(
    () => [
      {
        Header: 'Задача',
        id: 'task',
        width: '25%',

        Cell: ({ row }) => {
          const data = row?.original;
          return (
            <TextLink
              onClick={() => {
                handleEditTask(data);
              }}
              className={styles.link}
            >
              {data?.title}
            </TextLink>
          );
        },
      },
      {
        Header: 'Статус задачи',
        id: 'status',
        width: '15%',
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
        Cell: ({ row }) => {
          const data = row?.original;
          return <ManagerCell manager={data.responsibles[0]} />;
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
      {
        Header: () => null,
        id: 'deadline_time',
        width: '10%',

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
    ],
    [],
  );

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

  const data = useMemo(() => Object.values(deal?.tasks ?? []), [deal?.tasks]);

  const getActions = (data) => [
    { label: 'Редактировать', onClick: () => handleEditTask(data) },
    {
      label: 'Удалить',
      onClick: () => handleDelete(data.id),
      disabled: data.id === 0,
    },
  ];

  return (
    <div>
      <Table
        onPagination={true}
        smallTable={true}
        headerInCard={true}
        actions={getActions}
        headerActions={{
          add: {
            action: () => handleCreateTask(),
            title: 'Создать задачу',
          },
        }}
        title={'Задачи'}
        data={data}
        columns={cols}
      />
      {editTaskModalOpen && (
        <TaskEditModal
          data={taskData}
          handleClose={handleCloseTaskModal}
          deal={deal}
          dealsStore={dealsStore}
          taskApi={taskApi}
          taskStore={tasksStore}
        />
      )}
    </div>
  );
};

export default DealTasks;
