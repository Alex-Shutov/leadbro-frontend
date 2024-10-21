import {
  handleHttpError,
  handleHttpResponse,
  http,
  mockHttp,
  resetApiProvider,
} from '../../shared/http';
import mocks from './tasks.mocks';
import useStore from '../../hooks/useStore';
import { mapTaskFromApi } from './tasks.mapper';
import {useCallback, useState} from "react";
import {useParams} from "react-router";
import useStageApi from "../Stages/stages.api";
import {mapStageDataToBackend} from "../Stages/stages.mapper";
import {taskStatusTypes} from "../Stages/stages.types";

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
  const [isLoading,setIsLoading] = useState(false)
  const { tasksStore } = useStore();
  const {stagesStore} = useStore()
  const stagesApi = useStageApi()
  const {stageId} = useParams()
  debugger
  const getTasks = useCallback(() => {
    resetApiProvider();
    return http
      .get('api/tasks/mine')
      .then(handleHttpResponse)
      .then((res) => {
        const mappedTasks = res.body.data.map(mapTaskFromApi);
        tasksStore.setTasks(mappedTasks);
        return mappedTasks;
      })
      .catch(handleHttpError);
  },[]);

  const getTaskById = useCallback((id) => {
    return http
      .get(`/tasks/${id}`)
      .then(handleHttpResponse)
      .then((res) => tasksStore.setCurrentTask(res.body))
      .catch(handleHttpError);
  },[]);

  const getTasksByRole = useCallback((role) => {
    resetApiProvider();
    const roleMapping = {
      creator: 'i_am_creator',
      performer: 'i_am_performer',
      responsible: 'i_am_responsible',
      auditor: 'i_am_auditor',
    };
    setIsLoading(true)
    return http
        .get(`api/tasks/mine/${roleMapping[role]}`)
        .then(handleHttpResponse)
        .then((res) => {
          const mappedTasks = res.body.data.map(mapTaskFromApi);
          tasksStore.setTasks(mappedTasks);
          return mappedTasks;
        })
        .then(()=>setIsLoading(false))

        .catch(handleHttpError);
  },[]);

  const createTask = useCallback((updateData) => {
    return http
        .post('/api/tasks', {...updateData,status:taskStatusTypes.created, stage_id:stageId}, )
        .then(handleHttpResponse)
        .then(()=>stageId !== undefined && stagesApi.getStageById(stageId) )
        .catch(handleHttpError);
  }, []);

  // PUT/PATCH - Обновление задачи
  const updateTask = useCallback((id, updateData) => {
    debugger
    updateData = mapStageDataToBackend(
        stagesStore.drafts[stageId],
        stagesStore.changedProps,
        id,
    );

    return http
        .put(`/api/tasks/${id}`, updateData)
        .then(handleHttpResponse)
        .then(()=>stageId !== undefined && stagesApi.getStageById(stageId) )
        .catch(handleHttpError);
  }, []);

  // DELETE - Удаление задачи
  const deleteTask = useCallback((id) => {
    return http
        .delete(`/api/tasks/${id}`)
        .then(handleHttpResponse)
        .then(()=>stageId !== undefined && stagesApi.getStageById(stageId) )
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


  return {
    isLoading,
    getTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
    // setTasks,
    getTasksByRole
  };
};

export default useTasksApi;
