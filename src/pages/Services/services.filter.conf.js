// services.filters.conf.js
const servicesStatusTypesRu = {
    1:'В работе',
    0:'Завершено'
}
export const createServicesFilters = (appApi) => ({
    filters: [
        {
            type: 'select',
            name: 'status',
            label: 'Статус',
            props: {
                isMulti: false,
                options: Object.entries(servicesStatusTypesRu).map(([value, label]) => ({
                    value,
                    label
                }))
            },
            toUrlValue: value => {
                return value.length ? value[0]?.value : '';
            }
        },
        {
            type: 'input',
            name: 'responsible_id',
            label: 'Менеджер',
            props: {
                isAsync: true,
                asyncSearch: async (query) => {
                    const response = await appApi.getEmployees(query);
                    return response.map((item) => ({
                        value: item?.id,
                        label: `${item?.surname??''} ${item?.name??''} ${item?.middleName??""}`
                    }));
                },
                minInputLength: 2,
                isMulti: true,
                placeholder: 'Поиск менеджера'
            },
            toUrlValue: values => values ? values.map(v => v.value).join(',') : ''
        }
    ]
});