import {formatDateToQuery} from "../../utils/formate.date";

export const createTimeSpendingFilters = ({
                                              appApi,
                                              periodCalendarRef,
                                              hasAllTimeSpendingsAccess
                                          }) => {
    return {
        filters: [
            {
                type: 'date',
                name: 'date_range',
                label: 'Промежуток (от/до)',
                props: {
                    period: true,
                    ref: periodCalendarRef
                },
                toUrlValue: (values) => {
                    if (!values || !Array.isArray(values)) return '';
                    const [start, end] = values;
                    if (!start || !end) return '';
                    const params = [];
                    if (start) params.push(`from=${formatDateToQuery(start)}`);
                    if (end) params.push(`to=${formatDateToQuery(end)}`);
                    return params.join('&');
                },
                decodeUrlValue: (value) => {
                    const decodedValue = decodeURIComponent(value);
                    const rangeParams = new URLSearchParams(decodedValue);
                    const fromDate = rangeParams.get('from');
                    const toDate = rangeParams.get('to');

                    if (fromDate && toDate) {
                        return [new Date(fromDate), new Date(toDate)];
                    }
                    return null;
                },
            },
            // Фильтр по сотруднику только для пользователей с правами
            ...(hasAllTimeSpendingsAccess ? [{
                type: 'select',
                name: 'performer_id',
                label: 'Сотрудник',
                props: {
                    isAsync: true,
                    asyncSearch: async (query) => {
                        const response = await appApi.getEmployees(query);
                        const data = response;
                        return response.map((item) => ({
                            value: item?.id,
                            label: `${item?.last_name??''} ${item?.name??''} ${item?.middle_name??""}`
                        }));
                    },
                    minInputLength: 2,
                    isMulti: false,
                    placeholder: 'Исполнитель'},
                toUrlValue: (values) =>
                    values ? values.map((v) => v.value).join(',') : ''
            }] : [])
        ]
    };
};