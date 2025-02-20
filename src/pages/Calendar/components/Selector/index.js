import React from 'react';
import styles from '../../Calendar.module.sass';
// import arrowLeft from '@public/icons/arrows/arrow_left.svg';

import { format, startOfWeek, endOfWeek, isSameMonth } from 'date-fns';
import { ru } from 'date-fns/locale/ru';
import { formatDateWithoutHours } from '../../../../utils/formate.date';
import {
  NextButton,
  PreviousButton,
} from '../../../../shared/PaginationButton';

const Index = ({ handlePrev, handleNext, currentDate, type }) => {
  const getWeekRange = (date) => {
    const start = startOfWeek(date, { weekStartsOn: 1 }); // Неделя начинается с понедельника
    const end = endOfWeek(date, { weekStartsOn: 1 });

    if (isSameMonth(start, end)) {
      return `${format(start, 'd', { locale: ru })}-${format(end, 'd MMMM', { locale: ru })}`;
    } else {
      return `${format(start, 'd MMMM', { locale: ru })}-${format(end, 'd MMMM', { locale: ru })}`;
    }
  };
  const renderSelectorLabel = () => {
    switch (type) {
      case 'month':
        return format(currentDate, 'LLLL yyyy', { locale: ru });

      case 'week':
        return getWeekRange(currentDate);
      case 'day':
        return formatDateWithoutHours(currentDate);
      default:
        return '';
    }
  };
  return (
    <div className={styles.monthSelector}>
      <span className={styles.month}>{renderSelectorLabel()}</span>
      <PreviousButton
        onClick={() => handlePrev()}
        label={''}
        cls={styles.pagination}
      />
      <NextButton
        onClick={() => handleNext()}
        label={''}
        cls={styles.pagination}
      />
    </div>
  );
};

export default Index;
