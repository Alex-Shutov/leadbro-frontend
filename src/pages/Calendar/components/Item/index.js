import React from 'react';
import { format, startOfDay } from 'date-fns';
import { useDrag } from 'react-dnd';
import { businessTypeStyles } from '../../calendar.types';
import styles from './Item.module.sass';

const BusinessItem = ({ business, showTime = false }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'business',
    item: {
      id: business.id,
      type: business.type,
      startDate: startOfDay(business.startDate),
      endDate: business.endDate,
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={`${styles.businessItem} ${styles[businessTypeStyles[business.type]]} ${
        isDragging ? styles.dragging : ''
      }`}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      {showTime && (
        <div className={styles.time}>
          {format(business.startDate, 'HH:mm')} -{' '}
          {format(business.endDate, 'HH:mm')}
        </div>
      )}
      <div className={styles.title}>{business.name}</div>
    </div>
  );
};

export default BusinessItem;
