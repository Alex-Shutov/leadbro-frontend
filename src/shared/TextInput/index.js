import React, { useEffect, useRef } from 'react';
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
import ActionList from './Actions/ActionList';

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
const TextInput = ({
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
  ...props
}) => {
  const inputRef = useRef(null);
  const wrapRef = useRef(null);

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
            disabled={!props?.edited ?? false}
            autoFocus={props?.makeFocused}
            ref={inputRef}
            className={cn(classInput, styles.input, styles.textarea)}
            {...props}
          />
        ) : (
          <input
            ref={inputRef}
            disabled={!props?.edited ?? false}
            className={cn(classInput, styles.input)}
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
};

export default TextInput;
