import React, { useRef } from 'react';
import cn from 'classnames';
import Tooltip from '../Tooltip';
import AsyncSelect from 'react-select/async';
import { components } from 'react-select';
import Chevron from '../Dropdown/Default/Chevron';
import styles from './Selector.module.sass';
import { motion } from 'framer-motion';
import {
    opacityForSelectTranstion,
    opacityTransition,
} from '../../utils/motion.variants';
import Select from "react-select";

const ValuesSelector = ({
                            className,
                            classNameContainer,
                            classDropdownHead,
                            classDropdownLabel,
                            value,
                            onChange,
                            isMulti,
                            name,
                            options,
                            label,
                            tooltip,
                            placeholder,
                            readonly,
                            small,
                            upBody,
                            renderOption,
                            renderValue,
                            // Новые пропсы для асинхронности
                            isAsync = false,
                            asyncSearch,
                            minInputLength = 4,
                            loadingMessage = 'Загрузка...',
                            noOptionsMessage = 'Нет результатов',
                        }) => {
    const ref = useRef(false);
    console.log(options,1233333)
    const handleChange = (selectedOptions) => {
        if (!isMulti && selectedOptions.length > 1) {
            onChange([selectedOptions[selectedOptions.length - 1]]);
        } else {
            onChange(selectedOptions);
        }
    };

    const loadOptions = async (inputValue) => {
        if (inputValue.length < minInputLength) {
            return [];
        }

        try {
            const results = await asyncSearch(inputValue);
            return results;
        } catch (error) {
            console.error('Search error:', error);
            return [];
        }
    };

    const SelectComponent = isAsync ? AsyncSelect : Select;

    const commonProps = {
        placeholder: placeholder ? placeholder : typeof label === 'string' ? label : '',
        onChange: handleChange,
        value: value ?? null,
        isMulti: true,
        isDisabled:readonly??false,
        name: name,
        components: {
            MenuList: MenuList,
            IndicatorSeparator: null,
            CrossIcon: null,
            ClearIndicator: null,
            DropdownIndicator: (props) => <Indicator {...props} />,
        },
        styles: {
            multiValue: (base) => ({
                ...base,
                borderRadius: '8px',
            }),
        },
        classNames: {
            placeholder: () => styles.selector__container__control__placeholder,
            multiValueLabel: () => styles.selector__container__control_values__label,
            menu: () => styles.selector__container__control_menu,
            option: () => styles.selector__container__control_menuList__option,
            menuList: () => styles.selector__container__control_menuList,
            valueContainer: () => styles.selector__container__control_values,
            control: (state) =>
                state.isFocused
                    ? styles.selector__container__control_focused
                    : cn(styles.selector__container__control, {
                        [styles.hasValue]: isMulti ? !value?.length : !value,
                    }),
        },
    };

    const asyncProps = {
        ...commonProps,
        loadOptions,
        defaultOptions: options || [],
        cacheOptions: true,
        loadingMessage: () => loadingMessage,
        noOptionsMessage: ({ inputValue }) =>
            inputValue.length < minInputLength
                ? `Введите минимум ${minInputLength} символа`
                : noOptionsMessage,
        minInputLength,
    };


    return (
        <div ref={ref} className={classNameContainer}>
            {label && (
                <div className={cn(styles.label, classDropdownLabel)}>
                    {label}{' '}
                    {tooltip && (
                        <Tooltip
                            className={styles.tooltip}
                            title={tooltip}
                            icon="info"
                            place="right"
                        />
                    )}
                </div>
            )}
            {isAsync ? (
                <AsyncSelect {...asyncProps} />
            ) : (
                <Select {...commonProps} options={options} />
            )}
        </div>
    );
};

const Indicator = ({ children, ...props }) => {
    return (
        <components.DropdownIndicator {...props}>
            <Chevron isOpen={props.selectProps.menuIsOpen}></Chevron>
        </components.DropdownIndicator>
    );
};

const MenuList = (props) => {
    return (
        <motion.div
            initial={'hidden'}
            exit={'hidden'}
            animate={'show'}
            variants={opacityForSelectTranstion}
        >
            <components.MenuList {...props}>{props.children}</components.MenuList>
        </motion.div>
    );
};

export default ValuesSelector;