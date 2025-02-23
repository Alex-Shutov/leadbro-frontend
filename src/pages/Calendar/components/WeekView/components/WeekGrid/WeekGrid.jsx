import React, {forwardRef, useMemo} from 'react';
import styles from './Grid.module.sass';
import {useBusinessEvents} from "../../../../hooks/useBussinessEvent";

import useCalculate from "./calculate.hook";
import WeekBusinessItem from "../../../Item/Week/WeekBusiness";
import {useBusinessLayout} from "../../../../hooks/useBusinessLayout";
import useStore from "../../../../../../hooks/useStore";
import {format} from "date-fns";
import cn from "classnames";
const WeekGrid = forwardRef(({hours,weekDays,timeSlots,children},ref) => {
    const { calendarStore } = useStore();
    const currentDate = calendarStore.currentDate;

    const businesses = calendarStore.getBusinesses();
    const layout = useBusinessLayout(businesses, 'week',currentDate);
    const businessesByDay = useBusinessEvents(businesses, currentDate, 'week');
    const {calculateTimePosition,calculateEventLeft,calculateEventHeight,calculateEventWidth} = useCalculate(layout);

    const eventsByDayAndHour = useMemo(() => {
        const result = {};

        weekDays.forEach(day => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const dayEvents = businessesByDay[dateKey] || [];

            result[dateKey] = hours.reduce((acc, hour) => {
                acc[hour] = dayEvents.filter(business => {
                    // Исключаем полнодневные события
                    if (layout[business.id]?.isAllDay) return false;
                    return business.startDate.getHours() === hour;
                });
                return acc;
            }, {});
        });

        return result;
    }, [businessesByDay, weekDays, hours, layout]);

    return (
        <div ref={ref} className={styles.timeGrid}>
            {hours.map((hour,index) => {
                const isLastHour = index === hours.length - 1
                return <div key={hour} className={cn(styles.hourRow,{[styles.lastRow]:isLastHour})}>
                    <div className={styles.timeGutter}>
                        { !isLastHour ? `${hour}:00` : ''}
                    </div>
                    {weekDays.map((day, index) => {
                        const dateKey = format(day, 'yyyy-MM-dd');
                        const hourEvents = eventsByDayAndHour[dateKey]?.[hour] || [];

                        return (
                            <div
                                key={`${dateKey}-${hour}`}
                                className={styles.timeCell}
                            >
                                {timeSlots.map(minutes => (
                                    <div key={minutes} className={styles.timeSlot}/>
                                ))}

                                {hourEvents.map(business => (
                                    <WeekBusinessItem
                                        key={business.id}
                                        business={business}
                                        style={{
                                            top: `${calculateTimePosition(business.startDate)}%`,
                                            height: `${calculateEventHeight(business)}%`,
                                            width: calculateEventWidth(business),
                                            left: calculateEventLeft(business)
                                        }}
                                        customDragProps={{
                                            hour,
                                            dayIso: dateKey
                                        }}
                                    />
                                ))}
                            </div>
                        );
                    })}
                </div>
            })}
            {children}
        </div>
    );
});

export default WeekGrid;