import TaskEditModal from './index';
import { observer } from 'mobx-react';
import { useSearchParams } from 'react-router-dom';
import { useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import { handleError } from '../../utils/snackbar';

const withTaskModalHandler = (WrappedComponent) => {
  return observer(
    ({
      taskStore,
      taskApi,
      stage = null,
      stagesStore = null,
      stageApi = null,
      deal = null,
      dealsStore = null,
      dealApi = null,
      ...props
    }) => {
      const [searchParams, setSearchParams] = useSearchParams();
      const navigate = useNavigate();
      const [taskData, setTaskData] = useState(null);
      const [isModalOpen, setIsModalOpen] = useState(false);

      // Загрузка данных задачи
      const loadTaskData = async (taskId) => {
        try {
          console.log('Loading task:', taskId); // Для отладки
          const task = await taskApi.getTaskById(taskId);

          // Проверки принадлежности
          if (deal && task.deal?.id !== deal.id) {
            handleError('Задача не принадлежит текущей сделке');
            return null;
          }

          if (stage && task.stage?.id !== stage.id) {
            handleError('Задача не принадлежит текущему этапу');
            return null;
          }

          return task;
        } catch (error) {
          console.error('Error loading task:', error);
          handleError('Ошибка при загрузке задачи');
          return null;
        }
      };

      // Обработка taskId из URL при монтировании
      useEffect(() => {
        const handleTaskFromUrl = async () => {
          const taskId = searchParams.get('taskId');
          if (!taskId) return;

          const task = await loadTaskData(taskId);
          if (task) {
            setTaskData(task);
            setIsModalOpen(true);
          }
        };

        handleTaskFromUrl();
      }, [searchParams.get('taskId')]);

      const handleEditTask = async (task) => {
        if (!task) {
          setTaskData(null);
          setIsModalOpen(true);
          return;
        }

        const taskId = task.id;
        const loadedTask = await loadTaskData(taskId);

        if (loadedTask) {
          setTaskData(loadedTask);
          setIsModalOpen(true);
          // Добавляем id в URL только при успешной загрузке
          searchParams.set('taskId', taskId.toString());
          setSearchParams(searchParams);
        }
      };

      const handleCloseModal = () => {
        setTaskData(null);
        setIsModalOpen(false);
        searchParams.delete('taskId');
        setSearchParams(searchParams);
      };

      const handleCreateTask = () => {
        setTaskData(null);
        setIsModalOpen(true);
      };

      return (
        <>
          <WrappedComponent
            {...props}
            deal={deal}
            stage={stage}
            onEditTask={handleEditTask}
            onCreateTasks={handleCreateTask}
          />
          {isModalOpen && (
            <TaskEditModal
              data={taskData}
              handleClose={handleCloseModal}
              stage={stage}
              stagesStore={stagesStore}
              stageApi={stageApi}
              deal={deal}
              dealsStore={dealsStore}
              dealApi={dealApi}
              taskStore={taskStore}
              taskApi={taskApi}
            />
          )}
        </>
      );
    },
  );
};

export default withTaskModalHandler;
