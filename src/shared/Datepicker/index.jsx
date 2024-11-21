import React, { forwardRef, useState, useEffect, useRef } from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import { ru } from 'date-fns/locale/ru';
import TextInput from '../TextInput';
import styles from './datepicker.module.sass';
import { parse, isValid } from 'date-fns';
import { formatDateWithOnlyDigits } from '../../utils/formate.date';
import cn from 'classnames';
import { useFormContext } from 'react-hook-form';

registerLocale('ru', ru);

const Calendar = ({
  value,
  onChange,
  label,
  placeholder = null,
  name,
  required,
  ...props
}) => {
  const datePickerRef = useRef();
  const [isTouched, setIsTouched] = useState(false);

  // Интеграция с react-hook-form
  const formContext = useFormContext();
  const isInForm = !!formContext && name;

  const {
    register,
    formState: { errors, isSubmitted },
    setValue: setFormValue,
    trigger,
  } = formContext || {};

  // Показываем ошибку если поле тронуто ИЛИ была попытка отправки формы
  const error = isInForm && (isTouched || isSubmitted) ? errors[name] : null;

  // Регистрируем поле в форме
  useEffect(() => {
    if (isInForm) {
      register(name, {
        required: required ? 'Это поле обязательно' : false,
        validate: (value) => {
          if (required && !value) {
            return 'Это поле обязательно';
          }
          return true;
        },
      });

      if (value) {
        setFormValue(name, value, { shouldValidate: true });
      }
    }
  }, [isInForm, name, register, setFormValue, value, required]);

  // Отмечаем поле как тронутое при отправке формы
  useEffect(() => {
    if (isSubmitted) {
      setIsTouched(true);
    }
  }, [isSubmitted]);

  const CustomInput = forwardRef(({ onClick }, ref) => {
    const [inputValue, setInputValue] = useState(
      value ? formatDateWithOnlyDigits(value) : '',
    );

    useEffect(() => {
      if (value) {
        setInputValue(formatDateWithOnlyDigits(value));
      }
    }, [value]);

    const handleInputChange = (e) => {
      setInputValue(e.target.value);
      setIsTouched(true);
    };

    const handleBlur = () => {
      setIsTouched(true);
      const parsedDate = parse(inputValue, 'dd.MM.yyyy', new Date());
      if (isValid(parsedDate)) {
        handleDateChange(parsedDate);
      } else {
        setInputValue(value ? formatDateWithOnlyDigits(value) : '');
        if (isInForm) {
          setFormValue(name, value, {
            shouldValidate: true,
            shouldTouch: true,
          });
        }
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        handleBlur();
        e.target.blur();
        datePickerRef.current.setOpen(false);
      }
    };

    return (
      <>
        <TextInput
          placeholder={placeholder ?? label ?? ''}
          icon={'calendar'}
          classWrap={styles.datepicker_wrapper}
          classInput={cn(styles.datepicker_input, {
            [styles.datepicker_input__placeholder]: !inputValue,
            [styles.error]: error,
          })}
          classLabel={styles.datepicker_label}
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          edited={true}
          label={label}
          required={required}
          onClick={(e) => {
            setIsTouched(true);
            onClick(e);
          }}
          ref={ref}
          error={error}
        />
        {error && <div className={styles.errorMessage}>{error.message}</div>}
      </>
    );
  });

  const handleDateChange = (date) => {
    setIsTouched(true);

    if (isInForm) {
      setFormValue(name, date, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });
      trigger(name);
    }

    onChange(date);
  };

  return (
    <div className={cn({ [styles.hasError]: error })}>
      <DatePicker
        ref={datePickerRef}
        selected={value}
        dateFormat="dd.MM.yyyy"
        onChange={handleDateChange}
        customInput={<CustomInput />}
        locale={'ru'}
        {...props}
      />
    </div>
  );
};

export default Calendar;
