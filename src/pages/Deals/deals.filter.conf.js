import {dealStatusTypes, dealStatusTypesRu, sourceTypeRu} from "./deals.types";
import {serviceTypeEnumRu} from "../Services/services.types";
import Calendar from "../../shared/Datepicker";
import {format} from "date-fns";
import {getQueryParam} from "../../utils/window.utils";
import {periodEnum, periodEnumRu} from "../Bills/bills.filter.conf";

export const createDealsFilters = (appApi) => ({
    filters: [
        {
            type: 'input',
            name: 'manager_id',
            label: 'Менеджер',
            props: {
                isAsync: true,
                asyncSearch: async (query) => {
                    const response = await appApi.getEmployees(query);
                    return response.map((item) => ({
                        value: item?.id,
                        label: `${item?.last_name??''} ${item?.name??''} ${item?.middle_name??""}`
                    }));
                },
                minInputLength: 2,
                isMulti: true,
                placeholder: 'Поиск менеджера'
            },
            toUrlValue: values => values ? values.map(v => v.value).join(',') : ''
        },
        {
            type: 'select',
            name: 'status',
            label: 'Статус это',
            props: {
                isMulti: true,
                options: Object.entries(dealStatusTypesRu).map(([value, label]) => ({
                    value,
                    label
                }))
            },
            toUrlValue: values => values ? values.map(v => v.value).join(',') : ''
        },
        {
            type: 'select',
            name: 'status_no',
            label: 'Статус это не',
            props: {
                defaultValue:  [{label:dealStatusTypesRu.refused,value:dealStatusTypes.refused},{label:dealStatusTypesRu.failed,value:dealStatusTypes.failed}],
                isMulti: true,
                options: Object.entries(dealStatusTypesRu).map(([value, label]) => ({
                    value,
                    label
                }))
            },
            toUrlValue: values => values ? values.map(v => v.value).join(',') : ''
        },
        {
            type: 'select',
            name: 'source',
            label: 'Рекламный источник',
            props: {
                isMulti: true,
                options: Object.entries(sourceTypeRu).map(([value, label]) => ({
                    value,
                    label
                }))
            },
            toUrlValue: values => values ? values.map(v => v.value).join(',') : ''
        },
        {
            type: 'select',
            name: 'service_type',
            label: 'Тип услуги',
            props: {
                isMulti: true,
                options: Object.entries(serviceTypeEnumRu).map(([value, label]) => ({
                    value,
                    label
                }))
            },
            toUrlValue: values => values ? values.map(v => v.value).join(',') : ''
        },
        {
            type: 'date',
            name: 'created_at',
            label: 'Дата создания',
            component: Calendar,
            props: {
                placeholder: 'Выберите дату'
            },
            toUrlValue: value => value ? format(value, 'yyyy-MM-dd') : ''
        },
        {
            type: 'input',
            name: 'company_id',
            label: 'Клиент',
            props: {
                isAsync: true,
                asyncSearch: async (query) => {
                    const response = await appApi.getCompanies(query);
                    return response.map((item) => ({
                        value: item?.id,
                        label: item?.name
                    }));
                },
                minInputLength: 2,
                isMulti: false,
                placeholder: 'Поиск клиента'
            },
            toUrlValue: values => values ? values.map(v => v.value).join(',') : ''
        }
    ]
});