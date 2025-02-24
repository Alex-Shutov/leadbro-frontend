import React, {forwardRef, useCallback, useMemo, useRef} from 'react';
import styles from './Grid.module.sass';
import {useBusinessEvents} from "../../../../hooks/useBussinessEvent";

import useCalculate from "./calculate.hook";
import WeekBusinessItem from "../../../Item/Week/WeekBusiness";
import {useBusinessLayout} from "../../../../hooks/useBusinessLayout";
import useStore from "../../../../../../hooks/useStore";
import {addMinutes, differenceInMinutes, format} from "date-fns";
import cn from "classnames";
import {useDrop} from "react-dnd";
import {observer} from "mobx-react";
const WeekGrid = observer(forwardRef(({hours,weekDays,timeSlots,children},ref) => {
    const { calendarStore } = useStore();
    const currentDate = calendarStore.currentDate;

    const businesses = calendarStore.getBusinesses();
    const layout = useBusinessLayout(businesses, 'week',currentDate);
    const businessesByDay = useBusinessEvents(businesses, currentDate, 'week');
    const {calculateTimePosition,calculateEventLeft,calculateEventHeight,calculateEventWidth} = useCalculate(layout);

    // const eventsByDayAndHour = useMemo(() => {
    //     const result = {};
    //
    //     weekDays.forEach(day => {
    //         const dateKey = format(day, 'yyyy-MM-dd');
    //         const dayEvents = businessesByDay[dateKey] || [];
    //
    //         result[dateKey] = hours.reduce((acc, hour) => {
    //             acc[hour] = dayEvents.filter(business => {
    //                 // Исключаем полнодневные события
    //                 if (layout[business.id]?.isAllDay) return false;
    //                 return business.startDate.getHours() === hour;
    //             });
    //             return acc;
    //         }, {});
    //     });
    //
    //     return result;
    // }, [businessesByDay, weekDays, hours, layout]);
    const filteredBusinesses = businesses.filter(business => !layout[business.id]?.isAllDay);

    const gridRef = useRef(null);

    // const calculateDropPosition = useCallback((clientY, gridRect) => {
    //     const hourHeight = gridRect.height / hours.length;
    //     const yRelative = clientY - gridRect.top;
    //
    //     // Находим ближайший временной слот
    //     const totalSlots = hours.length * (60/15); // Общее количество 15-минутных слотов
    //     const slotHeight = gridRect.height / totalSlots;
    //     const slotIndex = Math.floor(yRelative / slotHeight);
    //
    //     // Вычисляем время
    //     const totalMinutes = slotIndex * 15;
    //     const hour = 9 + Math.floor(totalMinutes / 60);
    //     const minutes = totalMinutes % 60;
    //
    //     return { hour, minutes };
    // }, [hours]);
    const getTimeSlotFromOffset = useCallback((clientY, containerRect) => {
        const relativeY = clientY - containerRect.top;
        const totalHeight = containerRect.height;

        // Находим процент от общей высоты
        const percentOfDay = (relativeY / totalHeight) * 100;

        // Общее количество минут в рабочем дне (14 часов * 60 минут)
        const totalWorkMinutes = 14 * 60;

        // Переводим проценты в минуты
        const minutesFromStart = (percentOfDay * totalWorkMinutes) / 100;

        // Находим час и минуты
        let hour = 9 + Math.floor(minutesFromStart / 60);
        let minutes = Math.floor(minutesFromStart % 60);

        // Округляем минуты до ближайших 15
        minutes = Math.round(minutes / 15) * 15;

        // Корректируем час если минуты стали 60
        if (minutes === 60) {
            minutes = 0;
            hour += 1;
        }

        // Применяем ограничения
        return {
            hour: Math.max(9, Math.min(23, hour)),
            minutes: Math.max(0, Math.min(45, minutes))
        };
    }, []);

    // const TimeSlot = useCallback(({ day, hour, minute }) => {
    //     const [{ isOver }, drop] = useDrop(() => ({
    //         accept: 'week-business',
    //         drop: (item, monitor) => {
    //             const newStartDate = new Date(day);
    //             newStartDate.setHours(hour, minute, 0, 0);
    //
    //             const durationMinutes = differenceInMinutes(item.endDate, item.startDate);
    //             const newEndDate = addMinutes(newStartDate, durationMinutes);
    //
    //             calendarStore.updateBusinessEvent(item.id, {
    //                 startDate: newStartDate,
    //                 endDate: newEndDate
    //             });
    //         },
    //         collect: monitor => ({
    //             isOver: monitor.isOver()
    //         })
    //     }), [day, hour, minute]);
    //     return (
    //         <div
    //             ref={drop}
    //             className={cn(styles.timeSlot, {
    //                 [styles.dropTarget]: isOver
    //             })}
    //         />
    //     );
    // }, [calendarStore]);

    // const [{ isOver }, drop] = useDrop(() => ({
    //     accept: 'week-business',
    //     drop: (item, monitor) => {
    //         console.log('Drop called with item:', item);
    //         console.log('Monitor state:', {
    //             didDrop: monitor.didDrop(),
    //             isOver: monitor.isOver(),
    //             clientOffset: monitor.getClientOffset()
    //         });
    //         const clientOffset = monitor.getClientOffset();
    //         if (!clientOffset || !gridRef.current) return;
    //
    //         const gridRect = gridRef.current.getBoundingClientRect();
    //
    //         // Определяем день
    //         const dayWidth = (gridRect.width - 46) / weekDays.length;
    //         const xOffset = clientOffset.x - gridRect.left - 46;
    //         const dayIndex = Math.floor(xOffset / dayWidth);
    //         if (dayIndex < 0 || dayIndex >= weekDays.length) return;
    //
    //         // Определяем время
    //         const { hour, minutes } = calculateDropPosition(clientOffset.y, gridRect);
    //
    //         const dateKey = format(weekDays[dayIndex], 'yyyy-MM-dd');
    //         const newStartDate = new Date(dateKey);
    //         newStartDate.setHours(hour, minutes, 0, 0);
    //
    //         // Сохраняем длительность события
    //         const durationMinutes = differenceInMinutes(item.endDate, item.startDate);
    //         const newEndDate = addMinutes(newStartDate, durationMinutes);
    //
    //         calendarStore.updateBusinessEvent(item.id, {
    //             startDate: newStartDate,
    //             endDate: newEndDate
    //         });
    //     },
    //     hover: (item, monitor) => {
    //         const clientOffset = monitor.getClientOffset();
    //         if (!clientOffset || !gridRef.current) return;
    //         debugger
    //
    //
    //     },
    //     collect: (monitor) => ({
    //         isOver: monitor.isOver(),
    //     }),
    // }), [hours, weekDays, calendarStore, calculateDropPosition]);


    return (
        <div ref={gridRef} className={styles.timeGrid}>
            <div className={styles.gridStructure}>
                {hours.map((hour, index) => {
                    const isLastHour = index === hours.length - 1;
                    return (
                        <div key={hour} className={cn(styles.hourRow, { [styles.lastRow]: isLastHour })}>
                            <div className={styles.timeGutter}>
                                {!isLastHour ? `${hour}:00` : ''}
                            </div>
                            {weekDays.map(day => (
                                <div
                                    key={format(day, 'yyyy-MM-dd')}
                                    className={styles.timeCell}
                                >
                                    {timeSlots.map(minute => (
                                        <TimeSlot
                                            key={minute}
                                            day={day}
                                            hour={hour}
                                            minute={minute}
                                            calendarStore={calendarStore}
                                            gridRef={gridRef}
                                            getTimeSlotFromOffset={getTimeSlotFromOffset}
                                        />
                                    ))}
                                </div>
                            ))}
                        </div>
                    );
                })}
                </div>
            <div className={styles.eventsContainer}>
                {filteredBusinesses.map(business => {
                    const dayIndex = weekDays.findIndex(day =>
                        format(day, 'yyyy-MM-dd') === format(business.startDate, 'yyyy-MM-dd')
                    );
                    if (dayIndex === -1) return null;
                    return (
                        <WeekBusinessItem
                            key={business.id}
                            business={business}
                            allItems = {filteredBusinesses}
                            style={{
                                top: `${calculateTimePosition(business.startDate)}%`,
                                height: `${calculateEventHeight(business)}%`,
                                left: `calc((100% - 46px) * ${dayIndex} / ${weekDays.length} + 46px)`,
                                width: `calc((100% - 46px) / ${weekDays.length})`,
                            }}
                            customDragProps={{
                                hour: business.startDate.getHours(),
                                dayIso: format(business.startDate, 'yyyy-MM-dd'),
                                dayIndex,
                                endDate: business.endDate,
                                startDate: business.startDate
                            }}
                        />
                    );
                })}
            </div>
            {children}
        </div>
    );
}));

const TimeSlot = ({ day, hour, minute, calendarStore, gridRef,getTimeSlotFromOffset }) => {
    const [{ isOver }, drop] = useDrop(() => ({
        accept: 'week-business',
        drop: (item, monitor) => {
            debugger
            if (!gridRef.current) return;

            const clientOffset = monitor.getClientOffset();
            if (!clientOffset) return;

            const gridRect = gridRef.current.getBoundingClientRect();
            const { hour: snapHour, minutes: snapMinutes } = getTimeSlotFromOffset(clientOffset.y, gridRect);
            console.log('Snapped to:', { snapHour, snapMinutes, originalHour: hour, originalMinute: minute });


            const newStartDate = new Date(day);
            newStartDate.setHours(snapHour, snapMinutes, 0, 0);

            const durationMinutes = differenceInMinutes(
                new Date(item.endDate),
                new Date(item.startDate)
            );
            const newEndDate = addMinutes(newStartDate, durationMinutes);

            calendarStore.updateBusinessEvent(item.id, {
                startDate: newStartDate,
                endDate: newEndDate
            });
        },
        hover: (item, monitor) => {
            if (!gridRef.current) return;

            const clientOffset = monitor.getClientOffset();
            if (!clientOffset) return;

            const gridRect = gridRef.current.getBoundingClientRect();
            const { hour: hoverHour, minutes: hoverMinutes } = getTimeSlotFromOffset(clientOffset.y, gridRect);
            console.log('Hovering at:', { hoverHour, hoverMinutes });
        },
        collect: monitor => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop()
        })
    }), [day, hour, minute, calendarStore, gridRef]);

    return (
        <div
            ref={drop}
            className={cn(styles.timeSlot, {
                [styles.dropTarget]: isOver
            })}
        />
    );
};
export default WeekGrid;