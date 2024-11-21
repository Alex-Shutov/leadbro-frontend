import {
  handleHttpError,
  handleHttpResponse,
  handleShowError,
  http,
  mockHttp,
  resetApiProvider,
  setMockProvider,
} from '../../shared/http';
import mocks from './tasks.mocks';
import useStore from '../../hooks/useStore';
import { mapTaskFromApi } from './tasks.mapper';
import { useCallback, useState } from 'react';
import { useParams } from 'react-router';
import useStageApi from '../Stages/stages.api';
import { mapStageDataToBackend } from '../Stages/stages.mapper';
import { taskStatusTypes } from '../Stages/stages.types';
import { mapCommentsFromApi } from '../Clients/clients.mapper';

mockHttp.onGet('/tasks').reply(200, mocks.createTasks());
mockHttp.onPost('/tasks').reply(200, mocks.createTasks());
mockHttp.onGet(/\/tasks\/\d+/).reply((config) => {
  const urlParts = config.url.split('/');
  const taskId = parseInt(urlParts[urlParts.length - 1]);
  const tasks = mocks.createTasks();
  const task = tasks.find((c) => c.id === taskId);

  if (task) {
    return [200, task];
  } else {
    console.log(`Task with id ${taskId} not found`);
    return [404, { message: 'Task not found' }];
  }
});

const useTasksApi = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { tasksStore } = useStore();
  const { stagesStore } = useStore();
  const stagesApi = useStageApi();
  const { stageId } = useParams();

  const getTasks = useCallback(() => {
    resetApiProvider();
    setIsLoading(true);
    return http
      .get('api/tasks/mine')
      .then(handleHttpResponse)
      .then((res) => {
        const mappedTasks = res.body.data.map((e) => mapTaskFromApi(e));
        tasksStore.setTasks(mappedTasks);
        return mappedTasks;
      })
      .catch(handleShowError)
      .finally(() => setIsLoading(false));
  }, []);

  const getTaskById = useCallback((id) => {
    resetApiProvider();

    return Promise.all([
      http.get(`api/tasks/${id}`),
      http.get(`/api/tasks/${id}/comments`),
    ])
      .then(([taskData, commentsData]) => {
        debugger;
        tasksStore.setCurrentTask(
          mapTaskFromApi(taskData.data.data, commentsData.data.data),
        );
      })
      .catch(handleShowError);
  }, []);

  const getTasksByRole = useCallback((role) => {
    resetApiProvider();
    const roleMapping = {
      creator: 'i_am_creator',
      performer: 'i_am_performer',
      responsible: 'i_am_responsible',
      auditor: 'i_am_auditor',
    };
    setIsLoading(true);
    return http
      .get(`api/tasks/mine/${roleMapping[role]}`)
      .then(handleHttpResponse)
      .then((res) => {
        const mappedTasks = res.body.data.map((e) => mapTaskFromApi(e));
        tasksStore.setTasks(mappedTasks);
        return mappedTasks;
      })
      .then(() => setIsLoading(false))

      .catch(handleShowError);
  }, []);

  const createTask = useCallback((updateData) => {
    resetApiProvider();
    return http
      .post('/api/tasks', { ...updateData, stage_id: stageId })
      .then(handleHttpResponse)
      .then((res) => {
        debugger;
        const newTask = mapTaskFromApi(res.body.data);
        tasksStore.setTasks([...tasksStore.tasks, newTask]);
      })
      .then(() => stageId !== undefined && stagesApi.getStageById(stageId))
      .catch(handleShowError);
  }, []);

  const updateTask = useCallback(
    (
      id,
      updateData,
      drafts = stagesStore.drafts[stageId],
      props = stagesStore.changedProps,
    ) => {
      debugger;
      updateData = updateData ?? mapStageDataToBackend(drafts, props, id);

      resetApiProvider();
      return http
        .put(`/api/tasks/${id}`, updateData)
        .then(handleHttpResponse)
        .then(() => stageId !== undefined && stagesApi.getStageById(stageId))
        .catch(handleShowError);
    },
    [],
  );

  // DELETE - Удаление задачи
  const deleteTask = useCallback((id) => {
    resetApiProvider();

    return http
      .delete(`/api/tasks/${id}`)
      .then(handleHttpResponse)
      .then(() => stageId !== undefined && stagesApi.getStageById(stageId))
      .catch(handleHttpError);
  }, []);

  // const setTasks = (body) => {
  //   return http
  //     .post('/tasks', body)
  //     .then(handleHttpResponse)
  //     .then((res) => tasksStore.setTasks(res.body))
  //
  //     .catch(handleHttpError);
  // };

  // const getTaskTypes = useCallback(() => {
  //   resetApiProvider()
  //   return http.get('/api/enums/task_types')
  //       .then(handleHttpResponse)
  //       .then((res)=>tasksStore.setTypes(res.body))
  //       .catch(handleHttpError)
  // },[])
  // if(!tasksStore.getTypes()?.length)
  //   getTaskTypes()

  const getTaskComments = useCallback((taskId) => {
    resetApiProvider();

    return http
      .get(`/api/tasks/${taskId}/comments`)
      .then(handleHttpResponse)
      .then((response) => {
        return mapCommentsFromApi(response.body.data);
      })
      .catch(handleHttpError);
  }, []);

  return {
    isLoading,
    getTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
    getTaskComments,
    getTasksByRole,
  };
};

export default useTasksApi;
