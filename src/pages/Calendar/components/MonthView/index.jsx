import React from 'react';
import { observer } from 'mobx-react';
import { useDrop } from 'react-dnd';
import { format, parseISO } from 'date-fns';
import { useCalendarGrid } from '../../hooks/useCalendarGrid';
import { useBusinessEvents } from '../../hooks/useBussinessEvent';
import { useBusinessDrag } from '../../hooks/useBussinesDrag';
import BusinessItem from '../Item/Base';
import styles from './View.module.sass';
import useStore from '../../../../hooks/useStore';
import MonthBusinessItem from "../Item/Month/MonthBusiness";

const WEEKDAYS = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'];

const DayCell = ({ date, isCurrentMonth, businesses, isWeekend,onOpenModal,onCreateBusiness }) => {
  const { handleDragEnd } = useBusinessDrag();

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'month-business',
    drop: (item) => {
      handleDragEnd({
        businessId: item.id,
        sourceDate: item.startDate,
        targetDate: date,
      });
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  return (
    <div
        onClick={()=>onCreateBusiness(date)}
      ref={drop}
      className={`${styles.day} ${isWeekend ? styles.weekend : ''} ${!isCurrentMonth ? styles.otherMonth : ''}`}
    >
      <div className={styles.dayHeader}>
        <span className={styles.dayNumber}>{format(date, 'd')}</span>
      </div>
      <div className={styles.businessList}>
        {businesses.map((business) => (<div onClick={()=>onOpenModal(business)}>
            <MonthBusinessItem
                key={business.id}
                business={business}
                showTime={true}
            />
            </div>
        ))}
      </div>
    </div>
  );
};

const MonthView = observer(({onEditBusiness,onCreateBusiness}) => {

  const { calendarStore } = useStore();
  const currentDate = calendarStore.currentDate;
  const weeks = useCalendarGrid(currentDate);
  const businessesByDay = useBusinessEvents(
    calendarStore.getBusinesses(),
    currentDate,
    'month',
  );

  return (
    <div className={styles.monthView}>
      <div className={styles.weekDays}>
        {WEEKDAYS.map((day) => (
          <div key={day} className={styles.weekDay}>
            {day}
          </div>
        ))}
      </div>
      <div className={styles.grid}>
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className={styles.week}>
            {week.map(({ date, isCurrentMonth, isWeekend }) => {
              if (!date) return;
              const dateKey = format(date, 'yyyy-MM-dd');
              const dayBusinesses = businessesByDay[dateKey] || [];

              return (
                <DayCell
                    onCreateBusiness={onCreateBusiness}
                  key={dateKey}
                  date={date}
                  isCurrentMonth={isCurrentMonth}
                  businesses={dayBusinesses}
                  isWeekend={isWeekend}
                  onOpenModal={onEditBusiness}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
});

export default MonthView;
