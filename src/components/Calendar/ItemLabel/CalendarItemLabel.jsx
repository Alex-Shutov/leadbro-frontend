import React from 'react';
import styles from "../../../pages/Calendar/components/Item/Base/Item.module.sass";
import {format} from "date-fns";

const CalendarItemLabel = ({name,startDate,endDate,showTime}) => {
    return (
        <div className={styles.title}><span>{name}</span>
            {showTime && (
                <div className={styles.time}>
                    {format(startDate, 'HH:mm')} -{' '}
                    {format(endDate, 'HH:mm')}
                </div>
            )}
        </div>
    );
};

export default CalendarItemLabel;