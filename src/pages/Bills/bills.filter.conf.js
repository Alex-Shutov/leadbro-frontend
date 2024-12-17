// bills.filters.conf.js
import { billStatusTypesRu } from './bills.types';
import {serviceTypeEnumRu} from "../Services/services.types";

export const createBillsFilters = () => ({
    filters: [
        {
            type: 'select',
            name: 'status',
            label: 'Статус',
            props: {
                isMulti: true,
                options: Object.entries(billStatusTypesRu).map(([value, label]) => ({
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
        }
    ]
});