import React, {useEffect, useRef, useState} from 'react';
import styles from "../../../pages/Calendar/components/Item/Base/Item.module.sass";
import {format} from "date-fns";

const CalendarItemLabel = ({name,startDate,endDate,showTime}) => {
    const ref = useRef(null);

    useEffect(() => {
        if(ref.current && ref.current.parentNode) {
            const parent = ref.current.parentNode

            if(parent.clientWidth<120) {
                ref.current.classList.add(styles.smallTime);
                if(parent.clientHeight<40){
                    ref.current.classList.add(styles.disableTime);
                } else{
                    ref.current.classList.remove(styles.disableTime);
                }
            }
            else{
                ref.current.classList.remove(styles.smallTime);
                ref.current.classList.remove(styles.disableTime);
            }
        }
    }, [ref?.current?.clientHeight,ref?.current?.clientWidth]);

    return (
        <div ref={ref} className={styles.title}><span>{name}</span>
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