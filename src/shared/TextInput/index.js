import React, { forwardRef, useEffect, useRef, useState } from 'react';
import cn from 'classnames';
import styles from './TextInput.module.sass';
import Icon from '../Icon';
import Tooltip from '../Tooltip';
import TextArea from '../TextArea';
import { toast } from 'react-toastify';
import { enqueueSnackbar } from 'notistack';
import { handleSubmit } from '../../utils/snackbar';
import Dots from './Dots';
import Copy from './Actions/Copy';
import Delete from './Actions/Delete';
import Close from './Actions/Close';
import Submit from './Actions/Submit';
import Edit from './Actions/Edit';
import See from './Actions/See';
import { createReactEditorJS } from 'react-editor-js';
import MarkdownIt from 'markdown-it';
import ActionList from './Actions/ActionList';
import Editor from '../Editor';

// onMouseLeave={() => {
//     if (!props?.edited && props?.onHover)
//         props?.onHover()
// }
// } onMouseEnter={() => {
//     if ((props?.edited && props?.hovered) || !props?.onHover)
//         return
//     props?.onHover()
// }
// }

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
      ...props
    },
    ref,
  ) => {
    const inputRef = useRef(null);
    const wrapRef = useRef(null);
    const [hasError, setHasError] = useState(false);
    const formatValue = (inputValue) => {
      if (!inputValue) return inputValue;
      // Удаляем все, кроме чисел и точки
      let formattedValue = inputValue.replace(/[^0-9.]/g, '');

      // Разделяем значение на целую и дробную части
      const [integer, decimal] = formattedValue.split('.');
      if (decimal) {
        // Ограничиваем дробную часть двумя знаками
        formattedValue = `${integer}.${decimal.slice(0, 2)}`;
      }

      // Добавляем .00 только если значение не пустое и нет дробной части
      if (!decimal) {
        formattedValue += formattedValue.includes('.') ? '00' : '.00';
      }
      // } else if (formattedValue.split('.')[1]?.length === 1) {
      //   formattedValue += '0';
      // }

      return formattedValue;
    };

    const handleBlur = () => {
      if (validate) {
        const isValid = validate(value);
        if (!isValid) {
          inputRef.current.classList.add(styles.errorInput); // Добавляем класс ошибки
        } else {
          inputRef.current.classList.remove(styles.errorInput); // Убираем класс ошибки
        }
      }
    };

    const handleInputChange = (e) => {
      const currentCursorPosition = e.target.selectionStart;
      const rawValue = e.target.value;
      if (rawValue === '') {
        onChange({
          target: {
            ...e.target,
            value: '',
          },
        });
      }

      // if(!rawValue.includes('.') && rawValue!=='') return

      //
      const [integer, decimal] = rawValue.split('.');
      const formattedValue = integer ? formatValue(String(rawValue)) : '';
      if (
        !rawValue.includes('.') &&
        rawValue !== '' &&
        e.target.defaultValue !== ''
      )
        return;

      onChange({
        target: {
          ...e.target,
          value: formattedValue,
        },
      });
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
          {props.type === 'textarea' ? (
            <TextArea
              onBlur={handleBlur}
              onChange={onChange}
              value={value}
              disabled={!props?.edited ?? false}
              autoFocus={props?.makeFocused}
              ref={inputRef}
              className={cn(classInput, styles.input, styles.textarea)}
              {...props}
            />
          ) : props.type === 'editor' ? (
            value && (
              <Editor
                ref={ref}
                placeholder={props?.placeholder}
                name={props.name ?? ''}
                initialHTML={value}
                onChange={onChange}
              />
            )
          ) : (
            <input
              disabled={!props?.edited ?? false}
              onBlur={handleBlur}
              ref={inputRef}
              className={cn(classInput, styles.input)}
              value={
                props.type === 'money'
                  ? formatValue(String(value) || '')
                  : value
              }
              onChange={props.type === 'money' ? handleInputChange : onChange}
              {...props}
            />
          )}
          {icon && (
            <div className={styles.icon}>
              <Icon name={icon} size="24" />{' '}
            </div>
          )}
          {copy && (
            <button className={styles.copy}>
              <Icon name="copy" size="24" />{' '}
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
          {true && (
            <ActionList
              props={props}
              actions={actions}
              inputRef={inputRef}
              classNameActions={classNameActions}
            />
          )}
        </div>
      </div>
    );
  },
);

TextInput.displayName = 'TextInput';

export default TextInput;
