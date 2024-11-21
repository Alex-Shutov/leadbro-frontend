import React, { forwardRef, useEffect, useRef, useState } from 'react';
import cn from 'classnames';
import styles from './TextInput.module.sass';
import Icon from '../Icon';
import Tooltip from '../Tooltip';
import TextArea from '../TextArea';
import { useFormContext } from 'react-hook-form';
import Editor from '../Editor';
import ActionList from './Actions/ActionList';
import Dots from './Dots';

const TextInput = forwardRef(
  (
    {
      className,
      classLabel,
      classInput,
      label,
      classWrap,
      classNameActions,
      icon,
      copy,
      currency,
      tooltip,
      place,
      actions,
      noMinWidth,
      onChange,
      value,
      validate,
      name,
      ...props
    },
    ref,
  ) => {
    const inputRef = useRef(null);
    const wrapRef = useRef(null);
    const [hasError, setHasError] = useState(false);

    // Проверяем, находимся ли мы внутри формы
    const formContext = useFormContext();
    const isInForm = !!formContext && name;

    // Получаем методы формы, если они есть
    const {
      register,
      formState: { errors } = {},
      setValue,
    } = formContext || {};
    const error = isInForm ? errors[name] : null;

    // Регистрируем поле в форме, если мы внутри FormProvider
    useEffect(() => {
      if (isInForm) {
        // Регистрируем поле с валидацией
        register(name, {
          required: props.required && 'Это поле обязательно',
          validate: validate, // Сохраняем существующую валидацию
        });

        // Устанавливаем начальное значение
        setValue(name, value || '');
      }
    }, [isInForm, name, register, setValue, value, props.required, validate]);

    const formatValue = (inputValue) => {
      if (!inputValue) return inputValue;
      let formattedValue = inputValue.replace(/[^0-9.]/g, '');
      const [integer, decimal] = formattedValue.split('.');
      if (decimal) {
        formattedValue = `${integer}.${decimal.slice(0, 2)}`;
      }
      if (!decimal) {
        formattedValue += formattedValue.includes('.') ? '00' : '.00';
      }
      return formattedValue;
    };

    const handleBlur = (e) => {
      if (validate) {
        const isValid = validate(value);
        if (!isValid) {
          inputRef.current.classList.add(styles.errorInput);
        } else {
          inputRef.current.classList.remove(styles.errorInput);
        }
      }
    };

    const handleInputChange = (e) => {
      const rawValue = e.target.value;

      // Обработка для money типа
      if (props.type === 'money') {
        if (rawValue === '') {
          handleChange('');
          return;
        }

        const [integer, decimal] = rawValue.split('.');
        const formattedValue = integer ? formatValue(String(rawValue)) : '';
        if (
          !rawValue.includes('.') &&
          rawValue !== '' &&
          e.target.defaultValue !== ''
        ) {
          return;
        }
        handleChange(formattedValue);
        return;
      }

      handleChange(rawValue);
    };

    // Общий обработчик изменений
    const handleChange = (newValue) => {
      // Если мы в форме, обновляем значение в форме
      if (isInForm) {
        setValue(name, newValue, { shouldValidate: true });
      }

      // Вызываем оригинальный onChange
      if (onChange) {
        onChange({
          target: {
            name,
            value: newValue,
          },
        });
      }
    };

    const commonProps = {
      name,
      onBlur: handleBlur,
      ref: (e) => {
        inputRef.current = e;
        if (typeof ref === 'function') ref(e);
        else if (ref) ref.current = e;
      },
      className: cn(classInput, styles.input, { [styles.errorInput]: error }),
      disabled: !props?.edited ?? false,
      ...props,
    };

    const renderInput = () => {
      if (props.type === 'textarea') {
        return (
          <TextArea
            {...commonProps}
            onChange={handleInputChange}
            value={value}
            className={cn(commonProps.className, styles.textarea)}
          />
        );
      }

      if (props.type === 'editor' && value) {
        return (
          <Editor
            ref={ref}
            placeholder={props?.placeholder}
            name={name ?? ''}
            initialHTML={value}
            onChange={onChange}
          />
        );
      }

      return (
        <input
          {...commonProps}
          value={
            props.type === 'money' ? formatValue(String(value) || '') : value
          }
          onChange={handleInputChange}
        />
      );
    };

    return (
      <div
        className={cn(
          styles.field,
          { [styles.fieldIcon]: icon },
          { [styles.fieldCopy]: copy },
          { [styles.fieldCurrency]: currency },
          { [styles.noMinWidth]: noMinWidth },
          className,
        )}
      >
        {label && (
          <div className={cn(classLabel, styles.label)}>
            {label}
            {props.required && <span className={styles.required}>*</span>}
            {tooltip && (
              <Tooltip
                className={styles.tooltip}
                title={tooltip}
                icon="info"
                place={place ? place : 'right'}
              />
            )}
          </div>
        )}
        <div
          ref={wrapRef}
          id={'input_wrap'}
          className={cn(styles.wrap, classWrap)}
        >
          {renderInput()}
          {icon && (
            <div className={styles.icon}>
              <Icon name={icon} size="24" />
            </div>
          )}
          {copy && (
            <button className={styles.copy}>
              <Icon name="copy" size="24" />
            </button>
          )}
          {currency && <div className={styles.currency}>{currency}</div>}
          {props?.haveDots && (
            <Dots
              classNameDotsContainer={styles.dots_container}
              classNameActions={classNameActions}
              inputRef={inputRef}
              props={props}
              actions={actions}
              className={styles.dots_loader}
              classNameDot={styles.dot}
            />
          )}
          {actions && (
            <ActionList
              props={props}
              actions={actions}
              inputRef={inputRef}
              classNameActions={classNameActions}
            />
          )}
        </div>
        {error && <div className={styles.errorMessage}>{error.message}</div>}
      </div>
    );
  },
);

TextInput.displayName = 'TextInput';

export default TextInput;
