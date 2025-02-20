import React, { useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Title from '../../shared/Title';
import { observer } from 'mobx-react';
import useStore from '../../hooks/useStore';
import { LoadingProvider } from '../../providers/LoadingProvider';
import { calendarViewTypes, calendarViewTypesRu } from './calendar.types';
import MonthView from './components/MonthView';
// import DayView from './components/DayView';
import styles from './Calendar.module.sass';
import useCalendarApi from './calendar.api';
import { addMonths, format, subMonths } from 'date-fns';
import { ru } from 'date-fns/locale/ru';
import Selector from './components/Selector';

const CalendarContent = observer(() => {
  const api = useCalendarApi();
  const { calendarStore } = useStore();
  const currentView = calendarStore.currentView;
  const currentDate = calendarStore.currentDate;

  useEffect(() => {
    // Используем форматирование даты для API
    debugger;
    const startDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1,
    ).toISOString();
    const endDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0,
    ).toISOString();

    api.getBusinesses(startDate, endDate);
  }, [calendarStore.currentDate, currentView]); // Добавляем зависимости

  const handleViewChange = (view) => {
    calendarStore.setCurrentView(view);
  };

  const handlePrevMonth = () => {
    const newDate = subMonths(currentDate, 1);
    calendarStore.setCurrentDate(newDate);
  };

  const handleNextMonth = () => {
    const newDate = addMonths(currentDate, 1);
    calendarStore.setCurrentDate(newDate);
  };

  const renderView = () => {
    switch (currentView) {
      case calendarViewTypes.month:
        return <MonthView />;
      // case calendarViewTypes.day:
      //   return <DayView />;
      default:
        return <MonthView />;
    }
  };

  const renderSelector = () => {
    switch (currentView) {
      case calendarViewTypes.month:
        return (
          <Selector
            type={'month'}
            handleNext={handleNextMonth}
            handlePrev={handlePrevMonth}
            currentDate={currentDate}
          />
        );
      // case calendarViewTypes.day:
      //   return <DayView />;
      default:
        return (
          <Selector
            type={'month'}
            handleNext={handleNextMonth}
            handlePrev={handlePrevMonth}
            currentDate={currentDate}
          />
        );
    }
  };

  const handleCreateBusiness = () => {
    // ToDo: Открыть модальное окно создания дела
  };

  return (
    <LoadingProvider isLoading={api.isLoading}>
      <div className={styles.container}>
        <Title
          title="Календарь дел"
          actions={{
            add: {
              action: handleCreateBusiness,
              title: 'Создать дело',
            },
          }}
        />
        <div className={styles.header}>
          <div className={styles.viewSelector}>
            {Object.entries(calendarViewTypesRu).map(([type, label]) => (
              <button
                key={type}
                className={`${currentView === type ? styles.active : ''}`}
                onClick={() => handleViewChange(type)}
              >
                {label}
              </button>
            ))}
          </div>
          {renderSelector()}
        </div>

        <div className={styles.calendar}>{renderView()}</div>
      </div>
    </LoadingProvider>
  );
});

const Calendar = () => {
  return (
    <DndProvider backend={HTML5Backend}>
      <CalendarContent />
    </DndProvider>
  );
};

export default Calendar;
