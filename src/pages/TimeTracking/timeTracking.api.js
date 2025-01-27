import {useState} from "react";
import useStore from "../../hooks/useStore";
import {handleHttpError, handleHttpResponse, http, resetApiProvider} from "../../shared/http";
import {getQueryParam, sanitizeUrlFilters} from "../../utils/window.utils";
import {mapServiceFromApi} from "../Services/services.mapper";
import {mapTimeTrackingsFromApi} from "./timeTracking.mapper";
import {handleError} from "../../utils/snackbar";

const useTimeTrackingApi = () =>{
    const {timeTrackingStore} = useStore()
    const [isLoading, setIsLoading] = useState(false);

    const getTimeTrackings = (page = 1,from,to,filters={}) => {
        debugger
        resetApiProvider();
        setIsLoading(true);
        const sanitizedFilters = sanitizeUrlFilters(filters ?? {
            performer_id:getQueryParam('performer_id'),
        })
        const params = { page };
        if (getQueryParam('date_range')) {
            const rangeParams = new URLSearchParams(getQueryParam('date_range'));
            params.from = rangeParams.get('from')
            params.to = rangeParams.get('to')
            delete sanitizedFilters.date_range;
        }
        return http
            .get('/api/timetrackings', { params: { page,...params,...sanitizedFilters } })
            .then(handleHttpResponse)
            .then((res) => {
                debugger
                const mappedTimeTrackings = mapTimeTrackingsFromApi(res.body.data)
                timeTrackingStore.setTimeTrackings(mappedTimeTrackings); // Устанавливаем клиентов в store
                timeTrackingStore.setMetaInfoTable(res.body?.meta);
                timeTrackingStore.setStats(res.body?.stats);
            })
            .catch(handleHttpError)
            .finally(() => setIsLoading(false));
    };
    const sendTimeTracking = (timeTracking,taskId) => {
        resetApiProvider();
        setIsLoading(true);

        return http
            .post('/api/timetrackings', {task_id:Number(taskId),minutes:timeTracking.minutes})
            .then(handleHttpResponse)
            .then((res) => {
                debugger
                return mapTimeTrackingsFromApi([res.body.data]);
            })
            .catch(handleHttpError)
            .finally(() => {
                setIsLoading(false)
            });
    };

    const updateTimeTracking = ({id,hours,minutes}) => {
        resetApiProvider();
        setIsLoading(true);

        const totalMinutes = (parseInt(hours) || 0) * 60 + (parseInt(minutes) || 0);

        return http
            .patch(`/api/timetrackings/${id}`, {
                minutes: totalMinutes
            })
            .then(handleHttpResponse)
            .then((res) => {
                debugger
                const mappedTimeTracking = mapTimeTrackingsFromApi([res.body.data]);
                timeTrackingStore.updateTimeTrackInCurrentTask(id, mappedTimeTracking);
                return mappedTimeTracking;
            })
            .catch(handleHttpError)
            .finally(() => setIsLoading(false));
    };

    const deleteTimeTracking = async (id) => {
        resetApiProvider();
        setIsLoading(true);

        try {
            await http.delete(`/api/timetrackings/${id}`);
            return true;
        } catch (error) {
            handleError(error?.message, error);
            return false;
        } finally {
            setIsLoading(false);
        }
    };


    return {sendTimeTracking,getTimeTrackings,updateTimeTracking,deleteTimeTracking,isLoading}
}
export default useTimeTrackingApi;
