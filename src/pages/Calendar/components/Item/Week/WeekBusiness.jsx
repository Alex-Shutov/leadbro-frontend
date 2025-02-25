import React, {forwardRef, useState, useEffect, useCallback, useRef} from 'react';
import styles from './Item.module.sass';
import {
    format,
    addMinutes,
    setHours,
    setMinutes,
    differenceInMinutes,
    areIntervalsOverlapping,
    isSameDay
} from "date-fns";
import withBusinessItem from "../Base/Item.hoc";
import useCalculate from "../../WeekView/components/WeekGrid/calculate.hook";
import { useBusinessLayout } from "../../../hooks/useBusinessLayout";
import useStore from "../../../../../hooks/useStore";
import calendarStyles from '../../../Calendar.module.sass'
import cn from "classnames";
import {transform} from "css-calc-transform";
import {useDrop} from "react-dnd";
import CalendarItemLabel from "../../../../../components/Calendar/ItemLabel/CalendarItemLabel";
import useCalendarApi from "../../../calendar.api";
import {id} from "date-fns/locale";

const BaseWeekItem = forwardRef(({
                                     allItems,
                                     business,
                                     isDragging,
                                     businessTypeStyles,
                                     style = {},
                                    onModalOpen,
                                 }, ref) => {
    const { calendarStore } = useStore();
    const [isResizing, setIsResizing] = useState(false);
    const calendarApi = useCalendarApi();
    const [resizeDirection, setResizeDirection] = useState(null);
    const [tempStartDate, setTempStartDate] = useState(business.startDate);
    const [tempEndDate, setTempEndDate] = useState(business.endDate);
    const contentRef = useRef(null);
    const [hasOverflow, setHasOverflow] = useState(false);
    const layout = useBusinessLayout(allItems, 'week');
    const { calculateTimePosition, calculateEventHeight } = useCalculate(layout);
    const itemLayout = layout[business.id];
    const itemRef = useRef(null);
    const [isItemForOneSlot,setItemForOneSlot] = useState(differenceInMinutes(business.startDate, business.endDate)>=15);




    useEffect(() => {
        if (contentRef.current) {
            const hasTextOverflow = contentRef.current.scrollHeight > contentRef.current.clientHeight;
            setHasOverflow(hasTextOverflow);
        }
    }, [business, style.height]);



    // Функция для привязки к 15-минутным слотам
    const snapToTimeSlot = useCallback((y, containerRect) => {
        const relativeY = y - containerRect.top;
        const hourHeight = containerRect.height / 15; // 14 часов (9:00 - 23:00)

        // Находим час и минуты
        const totalMinutesFromStart = (relativeY / hourHeight) * 60;
        const hour = 8 + Math.floor(totalMinutesFromStart / 60);
        const minutes = totalMinutesFromStart % 60;

        // Привязка к 15-минутным интервалам
        const snappedMinutes = Math.round(minutes / 15) * 15;

        const date = new Date(business.startDate);
        date.setHours(
            Math.max(8, Math.min(23, hour)),
            Math.max(0, Math.min(45, snappedMinutes)),
            0,
            0
        );

        return date;
    }, [business.startDate]);


    const [{ isOver }, drop] = useDrop(() => ({
        accept: 'week-business',
        hover: (item, monitor) => {
            if (item.id === business.id) return; // Не реагируем, если перетаскиваем на себя же

            // Можно добавить визуальные эффекты при наведении
        },
        drop: (item, monitor) => {
            if (item.id === business.id) return; // Предотвращаем дроп на себя
            if (!itemRef.current || !ref.current) return;
            debugger
            const clientOffset = monitor.getClientOffset();
            if (!clientOffset) return;

            const itemRect = itemRef.current.getBoundingClientRect();
            const containerRect = ref.current.parentElement.getBoundingClientRect();

            // Определяем положение дропа относительно элемента
            const dropY = clientOffset.y;
            const itemTop = itemRect.top;
            const itemBottom = itemRect.bottom;
            const itemCenter = (itemTop + itemBottom) / 2;

            // Определяем, куда перетаскиваем - выше элемента, ниже или внутрь
            let newStartDate;

            if (dropY < itemCenter) {
                // Перетаскиваем выше текущего элемента

                newStartDate = new Date(business.startDate);
                if (newStartDate.getHours() === 8 && newStartDate.getMinutes() === 0) {
                    newStartDate.setMinutes(newStartDate.getMinutes() + 30);
                }
                newStartDate.setMinutes(newStartDate.getMinutes() - 30);
            } else {
                // Перетаскиваем ниже текущего элемента
                newStartDate = new Date(business.endDate);
            }

            // Сохраняем продолжительность перетаскиваемого элемента
            const duration = differenceInMinutes(item.endDate, item.startDate);
            const newEndDate = addMinutes(newStartDate, duration);

            calendarStore.updateBusinessEvent(item.id, {
                startDate: newStartDate,
                endDate: newEndDate
            });
            calendarStore.changeById(item.id,'startDate', newStartDate);
            calendarStore.changeById(item.id,'endDate', newEndDate);
            calendarApi.updateBusiness(item.id);

            return { dropped: true };
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop()
        })
    }), [business]);

    const setRefs = (node) => {
        itemRef.current = node;
        ref.current = node;
        drop(node);
    };

    const handleMouseDown = (e, direction) => {
        console.log('Mouse down:', direction); // Проверяем событие
        e.stopPropagation();
        e.preventDefault();
        setIsResizing(true);
        setResizeDirection(direction);
        document.body.style.cursor = direction === 'top' ? 'n-resize' : 's-resize';
    };

    useEffect(() => {
        console.log('Resize effect, isResizing:', isResizing);
        if (!isResizing) return;

        const handleMouseMove = (e) => {
            console.log('Mouse move:', e.clientY);
            if (!ref.current) return;

            const containerRect = ref.current.parentElement.getBoundingClientRect();
            const newTime = snapToTimeSlot(e.clientY, containerRect);
            if (resizeDirection === 'bottom') {
                if (newTime > tempStartDate) {
                    setTempEndDate(newTime);
                }
            } else if (resizeDirection === 'top') {
                if (newTime < tempEndDate) {
                    setTempStartDate(newTime);
                }
            }
                setItemForOneSlot(ref.current.clientHeight <=12)
        };

        const handleMouseUp = () => {
            console.log('Mouse up');
            if (tempStartDate !== business.startDate || tempEndDate !== business.endDate) {
                calendarStore.updateBusinessEvent(business.id, {
                    startDate: tempStartDate,
                    endDate: tempEndDate,
                });
                calendarStore.changeById(business.id,'startDate', tempStartDate);
                calendarStore.changeById(business.id,'endDate', tempEndDate);
                calendarApi.updateBusiness(business.id);
            }
            setIsResizing(false);
            setResizeDirection(null);
            document.body.style.cursor = '';
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = '';
        };
    }, [isResizing, resizeDirection, tempStartDate, tempEndDate, ref, snapToTimeSlot]);

    // Обновляем временные даты при изменении бизнес-события
    useEffect(() => {
        setTempStartDate(business.startDate);
        setTempEndDate(business.endDate);
    }, [business.startDate, business.endDate]);

    const displayStartDate = isResizing ? tempStartDate : business.startDate;
    const displayEndDate = isResizing ? tempEndDate : business.endDate;

    const getOverlapClass = () => {
        if (!itemLayout) return ['', {}];

        // Параллельные события
        const parallelEvents = allItems.filter(item =>
            item.id !== business.id &&
            Math.abs(differenceInMinutes(item.startDate, business.startDate)) <= 30
        );

        if (parallelEvents.length) {
            // Сортируем по длительности - сначала короткие, затем длинные
            const allParallel = [...parallelEvents, business].sort((a, b) => {
                const durationA = differenceInMinutes(a.endDate, a.startDate);
                const durationB = differenceInMinutes(b.endDate, b.startDate);
                return durationA - durationB; // Короткие слева, длинные справа
            });

            const index = allParallel.findIndex(item => item.id === business.id);
            const totalItems = allParallel.length;

            const width = `calc(${style.width} / ${totalItems})`;
            const leftOffset = `calc(${style.left} + (${style.width} * ${index} / ${totalItems}))`;

            return [
                styles.parallel,
                {
                    width: width,
                    left: leftOffset,
                    zIndex: index + 1
                }
            ];
        }

    const isInside = allItems.some(item =>
        item.id !== business.id &&
        isSameDay(item.startDate, business.startDate) &&
        item.startDate <= business.startDate &&
        item.endDate <= business.endDate
    );


    if (isInside) {
        return [
            styles.inside,
            {
                width: `calc(${style.width} - 24px)`,
                left: `calc(${style.left} + 12px)`,
                zIndex: 5
            }
        ];
    }
    // Перекрытие сверху
    const topOverlapEvents = allItems.filter(item => {
            return item.id !== business.id &&
                isSameDay(item.startDate, business.startDate) &&
            Math.abs(differenceInMinutes(item.endDate, business.startDate)) > 60 &&
            item.startDate < business.startDate
        }
    );

    if (topOverlapEvents.length) {
        // Если элемент очень длинный по сравнению с перекрывающими сверху
        const isDominant = topOverlapEvents.every(item =>
            differenceInMinutes(business.endDate, item.endDate) > 120 // Длиннее на 2+ часа
        );

        // if (isDominant) {
        //     return [
        //         styles.overlapTopDominant,
        //         {
        //             width: style.width,
        //             left: style.left,
        //             zIndex: 3
        //         }
        //     ];
        // }

        return [
            styles.overlapTop,
            {
                width: `calc(${style.width} - 20px)`,
                // left: `calc(${style.left} + 20px)`,
                zIndex: 3
            }
        ];
    }

    // Перекрытие снизу
    const bottomOverlapEvents = allItems.filter(item =>
        item.id !== business.id &&
        item.startDate < business.endDate &&
        isSameDay(item.startDate, business.startDate) &&
        item.endDate > business.endDate
    );

    if (bottomOverlapEvents.length) {
        // Если элемент очень длинный по сравнению с перекрывающими снизу
        const isDominant = bottomOverlapEvents.every(item =>
            differenceInMinutes(business.startDate, item.startDate) < -120 // Раньше на 2+ часа
        );

        if (isDominant) {
            return [
                styles.overlapBottomDominant,
                {
                    width: style.width,
                    left: style.left,
                    zIndex: 1
                }
            ];
        }

        return [
            styles.overlapBottom,
            {
                width: `calc(${style.width} - 20px)`,
                left: style.left,
                zIndex: 1
            }
        ];
    }



    // Каскадные события проверяем в последнюю очередь
    const cascadingEvents = allItems.filter(item =>
        item.id !== business.id &&
        isSameDay(item.startDate, business.startDate) &&
        Math.abs(differenceInMinutes(item.startDate, business.startDate)) > 30 &&
        areIntervalsOverlapping(
            { start: business.startDate, end: business.endDate },
            { start: item.startDate, end: item.endDate }
        )
    );

    if (cascadingEvents.length) {
        // Сортируем по времени начала
        const allCascading = [business, ...cascadingEvents].sort((a, b) =>
            differenceInMinutes(a.startDate, b.startDate)
        );

        const index = allCascading.findIndex(item => item.id === business.id);
        const totalItems = allCascading.length;

        const width = `calc(${style.width} - 20px)`;
        const leftOffset = `calc(${style.left} + ${index * 10}px)`;

        // return [
        //     styles.cascading,
        //     {
        //         width: width,
        //         left: leftOffset,
        //         zIndex: totalItems - index
        //     }
        // ];
    }

    return ['', {}]; // Без перекрытия
};

    const currentTypeOfOverlap = getOverlapClass()

    const handleOpenModal = (e) => {
            debugger
        e.stopPropagation()
        e.preventDefault()
            if (!isResizing && !isDragging )
                onModalOpen(business)
    }

    return (
        <div

            ref={setRefs}
            className={cn(styles.weekItem,calendarStyles.businessItem, {
                [calendarStyles[businessTypeStyles[business.type]]]: true,
                [styles.dragging]: isDragging,
                [styles.resizing]: isResizing,
                [styles.oneSlotItem]: isItemForOneSlot,
                    [styles.dropTarget]: isOver
                //     [styles.hasOverlappingBefore]: itemLayout?.hasOverlappingBefore,
                // [styles.hasOverlappingAfter]: itemLayout?.hasOverlappingAfter,
            },
                currentTypeOfOverlap[0]
            )}
            style={{
                ...style,
                opacity: isDragging || isResizing ? 0.2 : 1,
                top: `${calculateTimePosition(displayStartDate)}%`,
                height: `${calculateEventHeight({
                    startDate: displayStartDate,
                    endDate: displayEndDate
                })}%`,
                zIndex: isOver ? 100 : (itemLayout?.zIndex || 1),
                // width: itemLayout?.hasOverlappingBefore ? style.width - '20px' ? itemLayout?.hasOverlappingAfter : style.width + '10px' : style.width,
                    ...currentTypeOfOverlap[1],
                pointerEvents: isDragging ? 'none' : 'auto'

            }}
        >
            <div

                className={styles.resizeHandleTop}
                onMouseDown={(e) => handleMouseDown(e, 'top')}
            />
            <div ref={contentRef}
                 onClick={(e)=>handleOpenModal(e)}

                 className={cn(styles.content, {
                // [styles.hasOverflow]: hasOverflow
            })}>
                <CalendarItemLabel name={business.name} endDate={business.endDate} startDate={business.startDate} showTime={true} />
            </div>
            <div
                className={styles.resizeHandleBottom}
                onMouseDown={(e) => handleMouseDown(e, 'bottom')}
            />
        </div>
    );
});
const WeekBusinessItem = withBusinessItem(BaseWeekItem, 'week-business');
export default WeekBusinessItem;