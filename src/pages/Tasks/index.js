import React, { useMemo, useState } from 'react';
import TasksTable from './components/TasksTable';
import Title from '../../shared/Title';
import TaskFilter from './components/TaskFilter';
import useStore from '../../hooks/useStore';
import useTasksByStatus from './hooks/useTasksByStatus';
import { observer } from 'mobx-react';
import { taskStatusTypes } from '../Stages/stages.types';
import styles from './tasks.module.sass';
import { LoadingProvider } from "../../providers/LoadingProvider";
import useTasksApi from "./tasks.api";
import EditModal from "../Stages/components/StagesPage/components/StagesTable/components/EditModal";
import EditTaskModal from "./components/TaskEditModal";

const filters = [
    { label: 'Все', value: 'all' },
    { label: 'Я - Создатель', value: 'creator' },
    { label: 'Я - Исполнитель', value: 'performer' },
    { label: 'Я - Ответственный', value: 'responsible' },
    { label: 'Я - Аудитор', value: 'auditor' },
];

const Index = observer(() => {
  const { data, isLoading, store: tasksStore } = useTasksByStatus();
  const api = useTasksApi()
    const [taskData,setTaskData] = useState(null)
  const getCountStatusTask = (type) => {
    const tasks = data.filter((task) => task.type === type)[0];
    return tasks.values.length;
  };




    const [statusFilter, setStatusFilter] = useState(filters[0].value);

    const handleRadioChange = async (filterValue) => {
        setStatusFilter(filterValue);
        if (filterValue === 'all') {
            await api.getTasks();
        } else {
            await api.getTasksByRole(filterValue);
        }
    };

  const handleChange = (taskId, newStatus) => {
    tasksStore.changeById(taskId, `status`, newStatus, true);
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
            onClick={(data)=>setTaskData(data)}
            counts={taskCounts}
            data={filteredTasks}
            handleChange={handleChange}
        />
          {taskData && (
              <EditTaskModal
                  data={taskData}
                  handleClose={() => setTaskData(null)}
              />)}
      </LoadingProvider>
  );
});

export default Index;
