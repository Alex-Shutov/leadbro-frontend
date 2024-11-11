import {useEffect, useMemo, useState} from 'react';
import { observer } from 'mobx-react';
import { taskableTypes, tasksTypes } from '../../pages/Tasks/tasks.types';
import { taskStatusTypes } from '../../pages/Stages/stages.types';
import { handleError } from '../../utils/snackbar';
import { mapStageDataToBackend } from '../../pages/Stages/stages.mapper';
import Modal from '../../shared/Modal';
import styles from './Modal.module.sass';
import { handleSubmit as handleSubmitSnackbar } from '../../utils/snackbar';
import TaskDescriptionPart from '../../pages/Stages/components/StagesPage/components/StagesTable/components/EditModal/components/TaskDescriptionPart';
import TaskTypePart from '../../pages/Stages/components/StagesPage/components/StagesTable/components/EditModal/components/TaskTypePart';
import Comments from "../Comments";

const draftSet = new Set();

const TaskEditModal = observer(
  ({
    // Базовые пропсы
    data,
    handleClose,
    // Пропсы для режима работы со стейджами
    stage,
    stagesStore,
    stageApi,
    // Пропсы для режима работы со сделками
    deal,
    dealsStore,
    dealApi,
    // Пропсы для режима работы с тасками
    taskStore,
    taskApi,
  }) => {
    debugger
    const [isEditMode, _] = useState(Boolean(data));

    const mode = useMemo(() => {
      if (stage) return 'stage';
      if (deal) return 'deal';
      return 'task';
    }, [stage, deal]);





    // Получаем контекстные данные в зависимости от режима
    const contextData = useMemo(() => {
      switch (mode) {
        case 'stage':
          return {
            type: taskableTypes.stage,
            id: stage.id,
            title: stage.title,
            store: stagesStore,
          };
        case 'deal':
          return {
            type: taskableTypes.deal,
            id: deal.id,
            title: deal.title,
            store: dealsStore,
          };
        default:
          return {
            type: null,
            id: null,
            title: null,
            store: taskStore,
          };
      }
    }, [mode, stage, deal, stagesStore, dealsStore, taskStore]);

    // Начальное состояние для новой задачи
    const initialTaskState = {
      name: '',
      description: ' ',
      linked_task: '',
      type: '',
      taskStatus: taskStatusTypes.created,
      deadline: '',
      responsibles: [],
      planned_time: '',
      actual_time: '',
      performer: [],
      show_at_client_cabinet: false,
      auditors: [],
      // Добавляем привязку к сущности в зависимости от режима
      ...(mode !== 'task' && {
        taskable_type: contextData.type,
        taskable_id: contextData.id,
        [mode]: {
          title: contextData.title,
          id: contextData.id,
        },
      }),
    };

    const [localTask, setLocalTask] = useState(initialTaskState);

    // Получаем актуальные данные задачи в зависимости от режима
    const taskData = useMemo(() => {
      if (!isEditMode) return localTask;
      if (mode !== 'task') {
        debugger
        return Object.values(
          contextData.store.getById(contextData.id)?.tasks,
        ).find((el) => el.id === data?.id);
      }

      return taskStore.getById(data.id);
    }, [isEditMode, localTask, data, mode, contextData, taskStore?.drafts]);
    debugger
    const [comments, setComments] = useState(taskData?.comments ?? {});

    const [isLoadingComments, setIsLoadingComments] = useState(false);

    const handleChange = (name, value, withId = true) => {

      if (name.includes('responsibles')) {
        value = value[0];
      }
      debugger
      if (isEditMode) {
        if (mode !== 'task') {
          contextData.store.changeById(contextData.id, name, value, withId);
        } else {
          taskStore.changeById(data.id, name, value, withId);
        }
      } else {
        setLocalTask((prev) => ({
          ...prev,
          [name]: value,
        }));
        draftSet.add(name);
      }
    };

    // Обработчик сброса
    const handleReset = (path = '') => {
      if (mode !== 'task' && isEditMode) {
        contextData.store.resetDraft(contextData.id, path);
      } else if (mode === 'task' && isEditMode) {
        taskStore.resetDraft(data.id, path);
      }
      handleClose();
    };

    // Обработчик отклонения
    const handleDecline = () => {
      handleError('Задача отклонена');
      draftSet.clear();
      handleClose();
    };

    // Обработчик сохранения
    const handleSubmit = async () => {
      try {
        if (isEditMode)
          if (mode !== 'task') {
            await taskApi.updateTask(taskData.id, null, contextData.store.drafts[contextData.id],contextData.store.changedProps);
          } else
            await taskApi.updateTask(
              taskData.id,
              null,
              taskStore.drafts[taskData.id],
              taskStore.changedProps,
            );
        else {
          const payload =
            mode !== 'task'
              ? {
                  ...taskData,
                  [`${mode}_id`]: contextData.id,
                  taskable_type: contextData.type,
                  taskable_id: contextData.id,
                }
              : taskData;

          await taskApi.createTask(
            mapStageDataToBackend(payload, Object.keys(payload)),
          );
          draftSet.clear();
        }

        handleSubmitSnackbar(
          isEditMode
            ? 'Задача успешно отредактирована'
            : 'Задача успешно создана',
        );
        handleClose();
      } catch (error) {
        console.error('Ошибка при сохранении:', error);
      }
    };

    // Получаем текст принадлежности в зависимости от режима
    const getBelongsToText = () => {
      debugger
      switch (mode) {
        case 'stage':
          return `Принадлежит к: ${taskData.stage.title ?? stage?.title}`;
        case 'deal':
          return `Принадлежит к: ${taskData.deal.title ?? deal?.name}`;
        case 'task':
          return isEditMode
            ? taskData?.stage?.id || taskData?.deal?.id
              ? `Принадлежит к: ${taskData?.stage?.title ?? taskData?.deal?.title}`
              : 'Не принадлежит ни к чему'
            : '';
        default:
          return null;
      }
    };

    const handleAddComment = (newComment,value) => {
      debugger
      // Сначала добавляем локально
      setComments(prev => ({
        ...prev,
        [value.id]: value
      }));

    };

    const loadComments = async () => {
      if (!taskData?.id) return;

      try {
        setIsLoadingComments(true);
        const taskComments = await taskApi.getTaskComments(taskData.id);
        setComments(taskComments);
      } catch (error) {
        handleError('Ошибка при загрузке комментариев');
        console.error('Error loading comments:', error);
      } finally {
        setIsLoadingComments(false);
      }
    };

    // Загружаем комментарии при первом рендере и при изменении ID задачи
    useEffect(() => {
      if (isEditMode) {
        loadComments();
      }
    }, [taskData?.id, isEditMode]);

    return (
      taskData && (
        <Modal
          handleClose={handleReset}
          handleSubmit={handleSubmit}
          size={mode !== 'task' ? 'lg' : 'md_up'}
        >
          <div className={styles.name}>
            <div>
              {isEditMode ? 'Редактирование задачи' : 'Создание задачи'}
            </div>
            {<span>{getBelongsToText() ?? ''}</span>}
          </div>
          <div className={styles.gridContainer}>
            <TaskDescriptionPart
              selectedStatus={taskData.taskStatus}
              prefix={
                isEditMode && mode !== 'task' ? `tasks.${taskData.id}.` : ''
              }
              handleSave={() => handleSubmit('Задача принята')}
              handleDecline={handleDecline}
              className={styles.taskDescription}
              data={taskData}
              handleChange={handleChange}
            />
            {isEditMode && <div className={styles.comments}>
              <Comments belongsTo={'tasks'} entityId={taskData.id} comments={comments} prefix={isEditMode && mode !== 'task' ? `tasks.${taskData.id}.` : ''} onChange={handleAddComment}/>

            </div>}
            <TaskTypePart
              isEditMode={isEditMode}
              types={Object.keys(tasksTypes)}
              className={styles.taskType}
              data={
                Array.isArray(taskData.responsibles)
                  ? taskData
                  : { ...taskData, responsibles: [taskData.responsibles] }
              }
              handleAdd={(name, payload) => {
                const fieldName =
                  isEditMode && mode !== 'task'
                    ? `tasks.${data.id}.${name}`
                    : name;
                handleChange(fieldName, payload, false);
              }}
              handleChange={(name, value, withId) => {
                const fieldName =
                  isEditMode && mode !== 'task'
                    ? `tasks.${data.id}.${name}`
                    : name;
                handleChange(fieldName, value, withId);
              }}
            />
          </div>
        </Modal>
      )
    );
  },
);

export default TaskEditModal;
