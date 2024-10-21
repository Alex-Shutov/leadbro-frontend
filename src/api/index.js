import useStore from "../hooks/useStore";
import {handleHttpError, handleHttpResponse, http, resetApiProvider} from "../shared/http";
import {mapEmployeesFromApi} from "../pages/Settings/settings.mapper";

const useAppApi = () => {
    const {appStore} = useStore()
    const getEmployees = (query) => {
        resetApiProvider()

        return http
            .get(`/api/selector/employees`, {
                params: { query }
            })
            .then(handleHttpResponse)
            .then((res) => {
                appStore.setEmployees(res.data); // Сохраняем сотрудников в стор
            })
            .catch(handleHttpError);
    };

    // Функция для получения компаний
    const getCompanies = (query) => {
        resetApiProvider()

        return http
            .get(`/api/selector/companies`, {
                params: { query }
            })
            .then(handleHttpResponse)
            .then((res) => {
                appStore.setCompanies(res.data); // Сохраняем компании в стор
            })
            .catch(handleHttpError);
    };

    // Функция для получения клиентов
    const getClients = (query) => {
        resetApiProvider()

        return http
            .get(`/api/selector/clients`, {
                params: { query }
            })
            .then(handleHttpResponse)
            .then((res) => {
                appStore.setClients(res.data); // Сохраняем клиентов в стор
            })
            .catch(handleHttpError);
    };

    // Функция для получения должностей сотрудников
    const getEmployeePositions = () => {
        debugger
        resetApiProvider()
        return http
            .get(`/api/selector/employee_position`)
            .then(handleHttpResponse)
            .then((res) => {
                appStore.setEmployeePositions(res.body.data); // Сохраняем должности сотрудников в стор
            })
            .catch(handleHttpError);
    };

    // Функция для получения задач
    const getTasks = (query) => {
        resetApiProvider()

        return http
            .get(`/api/selector/tasks`, {
                params: { query }
            })
            .then(handleHttpResponse)
            .then((res) => {
                appStore.setTasks(res.data); // Сохраняем задачи в стор
            })
            .catch(handleHttpError);
    };

    // Функция для получения услуг
    const getServices = (query) => {
        resetApiProvider()
        return http
            .get(`/api/selector/services`, {
                params: { query }
            })
            .then(handleHttpResponse)
            .then((res) => {
                appStore.setServices(res.data); // Сохраняем услуги в стор
            })
            .catch(handleHttpError);
    };

    return {
        getEmployees,
        getCompanies,
        getClients,
        getEmployeePositions,
        getTasks,
        getServices,
    };
};

export default useAppApi