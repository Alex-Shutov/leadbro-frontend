import React, {forwardRef, useCallback, useMemo, useRef, useState} from 'react';
import styles from './Grid.module.sass';
import {useBusinessEvents} from "../../../../hooks/useBussinessEvent";

import useCalculate from "./calculate.hook";
import WeekBusinessItem from "../../../Item/Week/WeekBusiness";
import {useBusinessLayout} from "../../../../hooks/useBusinessLayout";
import useStore from "../../../../../../hooks/useStore";
import {addMinutes, areIntervalsOverlapping, differenceInMinutes, format} from "date-fns";
import cn from "classnames";
import {useDrop} from "react-dnd";
import {observer} from "mobx-react";
import useCalendarApi from "../../../../calendar.api";
import CalendarModal from "../../../CalendarModal";
const WeekGrid = observer(forwardRef(({hours,weekDays,timeSlots,onOpenModal,children},ref) => {
    const { calendarStore } = useStore();
    const currentDate = calendarStore.currentDate;
    const calendarApi = useCalendarApi();
    const businesses = calendarStore.getBusinesses();
    const layout = useBusinessLayout(businesses, 'week',currentDate);
    const businessesByDay = useBusinessEvents(businesses, currentDate, 'week');
    const {calculateTimePosition,calculateEventLeft,calculateEventHeight,calculateEventWidth} = useCalculate(layout);
    const [hoveredDay, setHoveredDay] = useState(null);
    const [tempHover,setTempHover] = useState(null);
    const [businessData, setbusinessData] = useState(null);
    const [isCreateMode, setIsCreateMode] = useState(false);

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
        const hourHeight = containerRect.height / hours.length;
        const slotHeight = hourHeight / 4; // 4 слота по 15 минут в часе

        const slotIndex = Math.floor(relativeY / slotHeight);
        const hour = 8 + Math.floor(slotIndex / 4);
        const minutes = (slotIndex % 4) * 15;

        // Добавляем ограничения
        return {
            hour: Math.max(8, Math.min(23, hour)),
            minutes: Math.max(0, Math.min(45, minutes))
        };
    }, [hours]);

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
    //
    //
    //
    //     },
    //     collect: (monitor) => ({
    //         isOver: monitor.isOver(),
    //     }),
    // }), [hours, weekDays, calendarStore, calculateDropPosition]);
    const handleDayHover = (dayIndex) => {
       setHoveredDay(dayIndex);
    };

    const handleCloseModal = () => {
        setbusinessData(null);
        setIsCreateMode(false);

    };

    const handleMouseEnter = (dayIndex) => {
        // const parentTimeCell=e.target.parentNode ?? null
        // if(parentTimeCell) {
            handleDayHover(dayIndex);
        // }
    };

    const handleMouseLeave = () => {
        !tempHover && handleDayHover(null);
    };

    const handleCreateBusiness = (date,hour) => {
        const startDate = date;
        const startTime = format(new Date().setHours(hour - 1, 0, 0, 0), 'HH:mm');
        const endTime = format(new Date().setHours(hour, 0, 0, 0), 'HH:mm');

        setbusinessData({ startDate, startTime, endTime });
        setIsCreateMode(true);
    };

    return (
        <>
        <div ref={gridRef} className={styles.timeGrid}>
            <div className={styles.gridStructure}>
                {hours.map((hour, index) => {
                    const isLastHour = index === hours.length - 1;
                    return (
                        <div key={hour}
                             className={cn(styles.hourRow, { [styles.lastRow]: isLastHour })}>
                            <div className={styles.timeGutter}>
                                {!isLastHour ? `${hour}:00` : ''}
                            </div>
                            {weekDays.map((day,dayIndex) => (
                                <div
                                    onMouseEnter={(e) => tempHover && handleMouseEnter(dayIndex)}
                                    onMouseLeave={(e)=> tempHover && handleMouseLeave(e)}
                                    onClick={()=>handleCreateBusiness(day,hour)}
                                    data-day={format(day, 'yyyy-MM-dd')}
                                    key={format(day, 'yyyy-MM-dd')}
                                    className={styles.timeCell}
                                >
                                    {timeSlots.map(minute => (
                                        <TimeSlot
                                            onDrag={()=>tempHover && handleMouseEnter(dayIndex)}
                                            onDragEnd={()=>tempHover && handleMouseLeave()}
                                            api = {calendarApi}
                                            allItems={filteredBusinesses}
                                            weekDays={weekDays}
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
                    console.log(dayIndex===hoveredDay,'dayIndex',dayIndex,'hoveredDay',hoveredDay);
                    const shouldShiftRight =
                        hoveredDay &&
                        dayIndex === hoveredDay || tempHover===dayIndex;
                    return (
                        <WeekBusinessItem
                            dayIndex={dayIndex}
                            shouldShiftRight={shouldShiftRight}
                            onModalOpen={onOpenModal}
                            key={business.id}
                            onHoverStart={(index)=>setTempHover(index)}
                            onHoverEnd={()=>tempHover!==hoveredDay && setTempHover(false)}
                            business={business}
                            allItems = {filteredBusinesses}
                            onDrag={(index)=>{
                                handleMouseEnter(index)}}
                            onDragEnd={handleMouseLeave}
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
            {(businessData || isCreateMode) && (
                <CalendarModal
                    data={businessData}
                    calendarApi={calendarApi}
                    calendarStore={calendarStore}
                    startTime={businessData?.startTime}
                    endTime={businessData?.endTime}
                    startDate={businessData?.startDate}
                    businessId={businessData?.id ?? null}
                    onClose={handleCloseModal}
                />
            )}
        </>
    );
}));
// WeekGrid.js - TimeSlot component
const TimeSlot = ({ api,day, calendarStore, gridRef, getTimeSlotFromOffset, weekDays,onDragEnd,onDrag,dayIndex }) => {
    const [{ isOver }, drop] = useDrop(() => ({
        accept: 'week-business',
        drop: (item, monitor) => {
            if (!gridRef.current) return;
            const clientOffset = monitor.getClientOffset();
            if (!clientOffset) return;

            const gridRect = gridRef.current.getBoundingClientRect();
            const gutterWidth = 46;

            // Расчет дня
            const gridContentWidth = gridRect.width - gutterWidth;
            const xOffset = clientOffset.x - gridRect.left - gutterWidth;
            if (xOffset < 0) return;

            const dayIndex = Math.floor(xOffset / (gridContentWidth / weekDays.length));
            if (dayIndex < 0 || dayIndex >= weekDays.length) return;

            // Расчет времени
            const { hour: snapHour, minutes: snapMinutes } = getTimeSlotFromOffset(clientOffset.y, gridRect);
            const newStartDate = new Date(weekDays[dayIndex]);
            newStartDate.setHours(snapHour, snapMinutes, 0, 0);

            const currItemFromStore = calendarStore.getById(item.id)
            const duration = differenceInMinutes(currItemFromStore.endDate, currItemFromStore.startDate);
            const newEndDate = addMinutes(newStartDate, duration);

            // Обновляем позицию элемента
            calendarStore.updateBusinessEvent(item.id, {
                startDate: newStartDate,
                endDate: newEndDate
            });
            calendarStore.changeById(item.id,'startDate', newStartDate);
            calendarStore.changeById(item.id,'endDate', newEndDate);
            api.updateBusiness(item.id);

            if (onDragEnd)
                onDragEnd()

        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
    }), [gridRef, weekDays, calendarStore]);

    return (
        <div
            onMouseEnter={()=>onDrag(dayIndex)}
            ref={drop}
            className={cn(styles.timeSlot, { [styles.dropTarget]: isOver })}
            style={{ zIndex: isOver ? 3 : 1 }}
        />
    );
};
export default WeekGrid;