// components/FilterManager/index.jsx
import React, {useState, useCallback, useEffect, useRef} from 'react';
import { useSearchParams } from 'react-router-dom';
import Radio from '../Radio';
import styles from './FilterManager.module.sass';
import ValuesSelector from "../Selector";
import Calendar from "../Datepicker";
import Dropdown from "../Dropdown/Default";
import Filters from "../Filter";
import {useFilters} from "../../providers/FilterProvider";

const FILTER_COMPONENTS = {
    radio: Radio,
    select: ValuesSelector,
    input: ValuesSelector,
    date: Calendar,
    dropdown:Dropdown,
};

const FilterManager = ({
                           filterConfig,
                           onFilterChange,
                           className,
                           classNameBody,
                           classNameTitle,
                           title
                       }) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const { setFilters, setFilterValue, getFilterValue } = useFilters();
    const getInitialValues = useCallback(() => {
        const values = {};
        filterConfig.filters.forEach(filter => {
            const paramValue = searchParams.get(filter.name);
            // debugger

            if (paramValue) {
                // Пробуем получить значение из контекста
                const savedValue = getFilterValue(filter.name);
                if (savedValue) {
                    values[filter.name] = savedValue;

                }
                    else {
                    // Если в контексте нет - используем значение из URL как id
                    // и ждем, когда компонент обновит значение при загрузке данных
                    values[filter.name] = filter.decodeUrlValue ?
                        filter.decodeUrlValue(paramValue) :
                        paramValue;
                }
            }else if (filter.props?.defaultValue) {
                values[filter.name] = filter.props?.defaultValue
            }
        });
        return values;
    }, [filterConfig, searchParams, getFilterValue]);

    const [filterValues, setFilterValues] = useState(getInitialValues);

    useEffect(() => {
        const initialValues = getInitialValues();
        if (Object.keys(initialValues).length > 0) {
            // Если это первый запрос, вызываем onFilterChange
            if (setFilters(initialValues)) {
                onFilterChange(initialValues);
            }
        }
    }, []);

    const handleFilterChange = (name, value) => {
        const filter = filterConfig.filters.find(f => f.name === name);
        const isMulti = filter.props?.isMulti;

        // Сохраняем полное значение в контекст
        setFilterValue(name, value);

        // Обновляем URL только с id
        const updatedParams = new URLSearchParams(searchParams);
        const urlValue = filter.toUrlValue ?
            filter.toUrlValue(value) :
            value; // Если нет toUrlValue, используем значение как есть
        const paramToDelete = filter.onChange && filter.onChange(updatedParams)
        if (urlValue) {
            updatedParams.set(name, urlValue);
        } else {
            updatedParams.delete(name);
        }
        setSearchParams(updatedParams);

        // Обновляем общее состояние фильтров
        const newValues = {
            ...filterValues,
            [name]: value,
            [paramToDelete]:null
        };
        setFilterValues(newValues);
        setFilters(newValues);
        onFilterChange(newValues);
    };



    const renderFilter = (filterConfig) => {
        const { type, component, props = {}, name, ...rest } = filterConfig;
        const FilterComponent = component || FILTER_COMPONENTS[type];

        if (!FilterComponent) return null;

        if (type === 'radio') {
            return rest?.options && rest?.options.map((option) => (
                <Radio
                    key={option.value}
                    className={styles.radioOption}
                    name={name}
                    content={option.label}
                    value={filterValues[name] === option.value}
                    onChange={() => handleFilterChange(name, option.value)}
                />
            ));
        }

        return (
            <FilterComponent
                key={name}
                {...props}
                {...rest}
                name={name}
                value={filterValues[name]}
                onChange={(value) => handleFilterChange(name, value)}
            />
        );
    };

    const filtersContent = (
        <div className={styles.filtersContent}>
            {filterConfig.filters.map(renderFilter)}
        </div>
    );

    return (
        <Filters
            className={className}
            classNameBody={classNameBody}
            classNameTitle={classNameTitle}
            title={title}
        >
            {filtersContent}
        </Filters>
    );
};

export default FilterManager;