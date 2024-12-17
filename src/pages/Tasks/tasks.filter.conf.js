// tasks.filters.conf.js
import {taskStatusTypesRu} from "../Stages/stages.types";
import {taskableTypes, tasksTypesRu} from "./tasks.types";

export const createTaskFilters = (appApi,) => ({
    filters: [
        {
            type: 'radio',
            name: 'filter',
            options: [
                { label: 'Все', value: 'all' },
                { label: 'Я - Создатель', value: 'creator' },
                { label: 'Я - Исполнитель', value: 'performer' },
                { label: 'Я - Ответственный', value: 'responsible' },
                { label: 'Я - Аудитор', value: 'auditor' }
            ]
        },
        {
            type: 'input',
            name: 'creator',
            label: 'Постановщик',
            props: {
                isAsync: true,
                asyncSearch: async (query) => {
                    const response = await appApi.getEmployees(query);
                    const data = response;
                    return data.map((item) => ({
                        value: item?.id,
                        label: item?.name,
                    }));
                },
                minInputLength: 2,
                isMulti: false,
                placeholder: 'Постановщик'
            },
            toUrlValue: value => {
                return value.length ? value[0]?.value : '';
            }
        },
        {
            type: 'input',
            name: 'performer',
            label: 'Исполнитель',
            props: {
                isAsync: true,
                asyncSearch: async (query) => {
                    const response = await appApi.getEmployees(query);
                    const data = response;
                    return data.map((item) => ({
                        value: item?.id,
                        label: item?.name,
                    }));
                },
                minInputLength: 2,
                isMulti: false,
                placeholder: 'Исполнитель'
            },
            toUrlValue: value => {
                return value.length ? value[0]?.value : '';
            }
        },
        {
            type: 'select', // Заменили dropdown на select
            name: 'status',
            label: 'Статус',
            props: {
                isMulti: false,
                options: Object.entries(taskStatusTypesRu).map(([value, label]) => ({
                    value,
                    label
                }))
            },
            toUrlValue: value => {
                return value.length ? value[0]?.value : '';
            }
        },
        {
            type: 'select',
            name: 'types',
            label: 'Тип',
            props: {
                isMulti: true,
                options: Object.entries(tasksTypesRu).map(([value, label]) => ({
                    value,
                    label
                }))
            },
            toUrlValue: values => values ? values.map(v => v.value).join(',') : ''
        },
        {
            type: 'select',
            name: 'taskable_type',
            label: 'Создано из',
            props: {
                isMulti: true,
                options: Object.entries(taskableTypes).map(([key, value]) => ({
                    value,
                    label: value === 'App\\Models\\Deal' ? 'Сделка' : 'Этап'
                }))
            },
            toUrlValue: values => values ? values.map(v => v.value).join(',') : ''
        }
    ]
});