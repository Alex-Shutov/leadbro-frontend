import React, {useEffect, useState} from 'react';
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
import {addMonths, endOfWeek, format, startOfWeek, subMonths} from 'date-fns';
import { ru } from 'date-fns/locale/ru';
import Selector from './components/Selector';
import WeekView from "./components/WeekView";
import businessEditModal from "../Deals/components/DealEditModal";
import CalendarModal from "./components/CalendarModal";

const CalendarContent = observer(() => {
  const api = useCalendarApi();
  const { calendarStore } = useStore();
  const currentView = calendarStore.currentView;
  const currentDate = calendarStore.currentDate;
  const [businessData, setbusinessData] = useState(null);
  const [isCreateMode, setIsCreateMode] = useState(false);

    useEffect(() => {
      let startDate, endDate;

      if (currentView === calendarViewTypes.month) {
        startDate = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            1,
        ).toISOString();
        endDate = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() + 1,
            0,
        ).toISOString();
      } else if (currentView === calendarViewTypes.week) {
        startDate = startOfWeek(currentDate, { weekStartsOn: 1 }).toISOString();
        endDate = endOfWeek(currentDate, { weekStartsOn: 1 }).toISOString();
      } else if (currentView === calendarViewTypes.day) {
        startDate = new Date(currentDate).toISOString().split('T')[0] + 'T00:00:00Z';
        endDate = new Date(currentDate).toISOString().split('T')[0] + 'T23:59:59Z';
      }

    api.getBusinesses(startDate, endDate);
  }, [calendarStore.currentDate, currentView]); // Добавляем зависимости

  const handleViewChange = (view) => {
    calendarStore.setCurrentView(view);
  };


  const handleDateUpdate = (newDate) => {
    calendarStore.setCurrentDate(newDate);
  }

  const handleOpenModal = (data) => {
    debugger
    setbusinessData(data)
    setIsCreateMode(false)
  }

  const renderView = () => {
    switch (currentView) {
      case calendarViewTypes.month:
        return <MonthView onOpenModal={handleOpenModal} />;
      case calendarViewTypes.week:
        return <WeekView onOpenModal={handleOpenModal} />;
      default:
        return <MonthView />;
    }
  };



  const handleCreateBusiness = () => {
    setbusinessData(null)
    setIsCreateMode(true)
  };

  const handleCloseModal = () => {
    setbusinessData(null);
    setIsCreateMode(false);
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
          {/*{renderSelector()}*/}
          <Selector handleUpdate={handleDateUpdate} currentDate={currentDate} type={currentView} />
        </div>

        <div className={styles.calendar}>{renderView()}</div>
      </div>
      {(businessData || isCreateMode) && (
          <CalendarModal
              businessId={businessData?.id ?? null}
              onClose={handleCloseModal}
          />
      )}
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
