import React, { forwardRef } from 'react';
import styles from './Item.module.sass';
import withBusinessItem from "../Base/Item.hoc";
import {format} from "date-fns";
import BaseBusinessItem from "../Base";
const BaseWeekItem = forwardRef(({
                                     business,
                                     isDragging,
                                     showTime,
                                     businessTypeStyles,
                                     style = {},
                                 }, ref) => {
    return (
        <div
            ref={ref}
            className={`${styles.weekItem} ${styles[businessTypeStyles[business.type]]} ${
                isDragging ? styles.dragging : ''
            }`}
            style={{
                ...style,
                opacity: isDragging ? 0.5 : 1
            }}
        >
            <div className={styles.time}>
                {format(business.startDate, 'HH:mm')} -{' '}
                {format(business.endDate, 'HH:mm')}
            </div>
            <div className={styles.title}>{business.name}</div>
        </div>
    );
});

const WeekBusinessItem = withBusinessItem(BaseBusinessItem, 'week-business');

export default WeekBusinessItem;