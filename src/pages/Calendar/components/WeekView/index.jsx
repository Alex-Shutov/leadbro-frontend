import React, {useEffect, useRef, useState} from 'react';
import {observer} from "mobx-react";
import useStore from "../../../../hooks/useStore";
import {eachDayOfInterval, endOfWeek, format, startOfWeek} from "date-fns";
import styles from './View.module.sass'
import {ru} from "date-fns/locale/ru";
import WeekHeader from "./components/WeekHeader/WeekHeader";
import WeekGrid from "./components/WeekGrid/WeekGrid";
import CurrentTimer from "./components/CurrentTimer/CurrentTimer";
const HOURS = Array.from({ length: 16 }, (_, i) => i + 9);
const TIME_SLOTS = [0,15, 30, 45];

const WeekView = observer(() => {
    const { calendarStore } = useStore();
    const currentDate = calendarStore.currentDate;

    const weekDays = eachDayOfInterval({
        start: startOfWeek(currentDate, { weekStartsOn: 1 }),
        end: endOfWeek(currentDate, { weekStartsOn: 1 })
    });

    const [currentTime, setCurrentTime] = useState(new Date());

    const gridRef = useRef(null); // Ref for WeekGrid
    const [gridHeight, setGridHeight] = useState(0);

    useEffect(() => {
        const updateGridHeight = () => {
            if (gridRef.current) {
                setGridHeight(gridRef.current.offsetHeight);
            }
        };

        updateGridHeight();

        window.addEventListener('resize', updateGridHeight);

        return () => window.removeEventListener('resize', updateGridHeight);
    }, []);

    useEffect(() => {
        const timer = setInterval(()=>setCurrentTime(new Date()),60*1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className={styles.weekView}>
            <WeekHeader weekDays={weekDays} />
            <WeekGrid ref={gridRef} weekDays={weekDays} hours={HOURS} timeSlots={TIME_SLOTS} >
                {/*<CurrentTimer gridHeight={gridHeight} currentTime={currentTime} weekDays={weekDays} />*/}

            </WeekGrid>
        </div>
    );
});

export default WeekView;