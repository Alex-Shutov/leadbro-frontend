import React, { useRef, useState, useEffect } from 'react';
import cn from 'classnames';
import OutsideClickHandler from 'react-outside-click-handler';
import Tooltip from '../Tooltip';
import useOutsideClick from '../../hooks/useOutsideClick';
import Select, { components, ControlProps, Props } from 'react-select';
import Chevron from '../Dropdown/Default/Chevron';
import styles from './Selector.module.sass';
import { motion } from 'framer-motion';
import {
  opacityForSelectTranstion,
  opacityTransition,
} from '../../utils/motion.variants';

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
  small,
  upBody,
  renderOption,
  renderValue,
}) => {
  const ref = useRef(false);

  const handleChange = (selectedOptions) => {
    if (!isMulti && selectedOptions.length > 1) {
      // Оставляем только последний выбранный элемент
      onChange([selectedOptions[selectedOptions.length - 1]]);
    } else {
      onChange(selectedOptions);
    }
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
      <Select
        placeholder={placeholder ?? ''}
        onChange={handleChange}
        value={value ?? null}
        isMulti={true}
        name={name}
        options={options}
        components={{
          MenuList: MenuList,
          IndicatorSeparator: null,
          CrossIcon: null,
          ClearIndicator: null,
          DropdownIndicator: (props) => <Indicator {...props} />,
        }}
        styles={{
          multiValue: (base) => ({
            ...base,
            borderRadius: '8px',
          }),
        }}
        classNames={{
          placeholder: () => styles.selector__container__control__placeholder,
          multiValueLabel: () =>
            styles.selector__container__control_values__label,
          menu: (props) => styles.selector__container__control_menu,
          option: (props) =>
            styles.selector__container__control_menuList__option,
          menuList: (props) => styles.selector__container__control_menuList,
          valueContainer: (state) => styles.selector__container__control_values,
          control: (state) =>
            state.isFocused
              ? styles.selector__container__control_focused
              : cn(styles.selector__container__control, {
                  [styles.hasValue]: value,
                }),
        }}
      />
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
