import React, { useMemo, useState } from 'react';
import TasksTable from './components/TasksTable';
import Title from '../../shared/Title';
import TaskFilter from './components/TaskFilter';
import useStore from '../../hooks/useStore';
import useTasksByStatus from './hooks/useTasksByStatus';
import { observer } from 'mobx-react';
import { taskStatusTypes } from '../Stages/stages.types';
import styles from './tasks.module.sass';
import { LoadingProvider } from '../../providers/LoadingProvider';
import useTasksApi from './tasks.api';
import TaskEditModal from '../../components/TaskModal';
import { useNavigate } from 'react-router';
import { useSearchParams } from 'react-router-dom';

const filters = [
  { label: 'Все', value: 'all' },
  { label: 'Я - Создатель', value: 'creator' },
  { label: 'Я - Исполнитель', value: 'performer' },
  { label: 'Я - Ответственный', value: 'responsible' },
  { label: 'Я - Аудитор', value: 'auditor' },
];

const Index = observer(() => {
  const api = useTasksApi();
  const [taskData, setTaskData] = useState(null);
  const [isCreateMode, setIsCreateMode] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();

  // Получаем значение фильтра из URL или используем значение по умолчанию
  const initialFilter = searchParams.get('filter') || 'all';
  const [statusFilter, setStatusFilter] = useState(initialFilter);
  const { data, isLoading, store: tasksStore } = useTasksByStatus(statusFilter);

  // Обработчик создания новой задачи
  const handleCreateTask = () => {
    setIsCreateMode(true);
    setTaskData(null); // Очищаем данные предыдущей задачи
  };

  // Обработчик закрытия модального окна
  const handleCloseModal = () => {
    setTaskData(null);
    setIsCreateMode(false);
  };

  const handleRadioChange = async (filterValue) => {
    setStatusFilter(filterValue);
    setSearchParams({ filter: filterValue });
    if (filterValue === 'all') {
      await api.getTasks();
    } else {
      await api.getTasksByRole(filterValue);
    }
  };

  const getCountStatusTask = (type) => {
    const tasks = data.filter((task) => task.type === type)[0];
    return tasks.values.length;
  };

  const handleChange = (taskId, newStatus) => {
    tasksStore.changeById(taskId, `taskStatus`, newStatus, true);
    api.updateTask(taskId, { status: newStatus });
  };

  const filteredTasks = data;

  const taskCounts = useMemo(() => {
    return Object.keys(taskStatusTypes).reduce((acc, status) => {
      acc[status] = getCountStatusTask(status);
      return acc;
    }, {});
  }, [data]);

  return (
    <LoadingProvider isLoading={api.isLoading}>
      <Title
        title={'Мои задачи'}
        actions={{
          add: {
            action: handleCreateTask,
            title: 'Создать задачу',
          },
          filter: {
            classNameBody: styles.filter_container,
            title: 'Фильтр',
            children: (
              <TaskFilter
                filters={filters}
                selectedFilter={statusFilter}
                onChange={handleRadioChange}
                taskCounts={taskCounts}
              />
            ),
          },
        }}
      />
      <TasksTable
        onClick={(data) => {
          setIsCreateMode(false);
          setTaskData(data);
        }}
        counts={taskCounts}
        data={filteredTasks}
        handleChange={handleChange}
      />
      {(taskData || isCreateMode) && (
        <TaskEditModal
          data={taskData} // при создании будет null
          handleClose={handleCloseModal}
          taskStore={tasksStore}
          taskApi={api}
        />
      )}
    </LoadingProvider>
  );
});

export default Index;
