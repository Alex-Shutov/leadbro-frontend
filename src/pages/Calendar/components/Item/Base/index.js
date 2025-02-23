import React, {forwardRef} from 'react';
import { format, startOfDay } from 'date-fns';
import { useDrag } from 'react-dnd';
import { businessTypeStyles } from '../../../calendar.types';
import styles from './Item.module.sass';

const BaseBusinessItem = forwardRef(({
                               business,
                               isDragging,
                               showTime,
                               businessTypeStyles,
                               className = ''
                             }, ref) => {

  return (
    <div
      ref={ref}
      className={`${styles.businessItem} ${styles[businessTypeStyles[business.type]]} ${
        isDragging ? styles.dragging : ''
      }`}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >

        <div className={styles.title}><span>{business.name}</span>
          {showTime && (
              <div className={styles.time}>
                  {format(business.startDate, 'HH:mm')} -{' '}
                  {format(business.endDate, 'HH:mm')}
              </div>
          )}
      </div>
    </div>
  );
});

export default BaseBusinessItem;
