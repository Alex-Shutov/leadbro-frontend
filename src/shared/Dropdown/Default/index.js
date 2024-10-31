import React, { useRef, useState, useEffect } from 'react';
import cn from 'classnames';
import styles from './Dropdown.module.sass';
import Tooltip from '../../Tooltip';
import useOutsideClick from '../../../hooks/useOutsideClick';
import Chevron from './Chevron';
import Loader from '../../Loader';

const Dropdown = ({
  className,
  classNameContainer,
  classDropdownHead,
  classDropdownLabel,
  value,
  setValue,
  options: initialOptions,
  label,
  tooltip,
  small,
  upBody,
  renderOption,
  noMinWidth,
  placeholder,
  renderValue,
  // Новые пропсы для асинхронной функциональности
  asyncSearch,
  isAsync = false, // флаг для определения режима работы компонента
}) => {
  const [visible, setVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState(initialOptions);
  const [loading, setLoading] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);

  const ref = useRef(null);
  useOutsideClick(ref, () => setVisible(false));

  const shouldShowOptions = isAsync
      ? visible && inputValue.length >= 4
      : visible;

  // Эффект для обновления options при изменении initialOptions в синхронном режиме
  useEffect(() => {
    if (!isAsync) {
      setOptions(initialOptions);
    }
  }, [initialOptions, isAsync]);

  useEffect(() => {
    if (isAsync && value) {
      setInputValue(renderValue ? renderValue(value) : value);
    }
  }, [value, isAsync]);



  const handleClick = (value) => {
    setValue(value);
    setVisible(false);
    if (isAsync) {
      setInputValue(renderValue ? renderValue(value) : value);
    }
  };

  const handleInputChange = async (e) => {
    const value = e.target.value;
    setInputValue(value);

    if (isAsync) {
      // Очищаем предыдущий таймаут
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }

      if (value.length >= 4) {
        setLoading(true);
        // Устанавливаем новый таймаут для дебаунса
        const newTimeout = setTimeout(async () => {
          try {
            const results = await asyncSearch(value);
            setOptions(results);
          } catch (error) {
            console.error('Search error:', error);
            setOptions([]);
          } finally {
            setLoading(false);
          }
        }, 100); // 300ms дебаунс

        setSearchTimeout(newTimeout);
      } else {
        setOptions([]);
      }
    }
  };

  const renderHead = () => {
    if (isAsync) {
      return (
        <input
          type="text"
          className={cn(styles.input, {
            [styles.input_placeholder]: !inputValue,
          })}
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder ?? label ?? ''}
          onClick={() => setVisible(true)}
        />
      );
    }

    return (
      <div
        className={cn(styles.selection, {
          [styles.selection_placeholder]: !value,
        })}
      >
        {value
          ? renderValue
            ? renderValue(value)
            : value
          : placeholder ?? label ?? ''}
      </div>
    );
  };

  return (
    <div
      ref={ref}
      className={cn(classNameContainer, { [styles.noMinWidth]: noMinWidth })}
    >
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
      <div
        className={cn(
          styles.dropdown,
          className,
          { [styles.small]: small },
          { [styles.active]: visible },
        )}
      >
        <div
          className={cn(styles.head, classDropdownHead, {
            [styles.head_placeholder]: isAsync ? !inputValue : !value,
          })}
          onClick={() => !isAsync && setVisible(!visible)}
        >
          {renderHead()}
          <Chevron isOpen={visible} />
        </div>
        {shouldShowOptions && (
          <div className={cn(styles.body, { [styles.bodyUp]: upBody })}>
            {loading ? (
              <div className={styles.loader_container}>
                <Loader />
              </div>
            ) : options.length ?  (
              options.map((option, index) => (
                <div
                  className={cn(styles.option, {
                    [styles.selectioned]: option === value,
                  })}
                  onClick={() => handleClick(option, index)}
                  key={index}
                >
                  {renderOption ? renderOption(option) : option}
                </div>
              ))
            ) : <p className={styles.noOptions}>Нет опций для выбора</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dropdown;
