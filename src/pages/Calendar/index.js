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
import useAppApi from "../../api";
import { FiltersProvider } from "../../providers/FilterProvider";
import CalendarModal from "./components/CalendarModal";
import {createCalendarFilters} from "./calendar.filters";

const CalendarContent = observer(() => {
  const api = useCalendarApi();
  const { calendarStore } = useStore();
  const appApi = useAppApi();
  const currentView = calendarStore.currentView;
  const currentDate = calendarStore.currentDate;
  const [businessData, setbusinessData] = useState(null);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [currentFilters, setCurrentFilters] = useState({});

  // Определяем диапазон дат в зависимости от текущего представления
  const getCurrentDateRange = () => {
    let startDate, endDate;

    if (currentView === calendarViewTypes.month) {
      startDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          1,
      );
      endDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
          0,
      );
    } else if (currentView === calendarViewTypes.week) {
      startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
      endDate = endOfWeek(currentDate, { weekStartsOn: 1 });
    } else if (currentView === calendarViewTypes.day) {
      startDate = new Date(currentDate);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(currentDate);
      endDate.setHours(23, 59, 59, 999);
    }

    return { startDate, endDate };
  };

  // Загрузка данных с учетом текущего представления и фильтров
  const loadData = () => {
    const { startDate, endDate } = getCurrentDateRange();

    // Комбинируем диапазон дат с текущими фильтрами
    api.getBusinesses(
        startDate.toISOString(),
        endDate.toISOString(),
        currentFilters
    );
  };

  useEffect(() => {
    loadData();
  }, [calendarStore.currentDate, currentView, currentFilters]);

  const handleViewChange = (view) => {
    calendarStore.setCurrentView(view);
  };

  const handleFilterChange = async (filters) => {
    // Сохраняем новые фильтры
    setCurrentFilters(filters);

    // Загрузка данных произойдет автоматически благодаря useEffect и зависимости от currentFilters
  };

  const handleDateUpdate = (newDate) => {
    calendarStore.setCurrentDate(newDate);
  };

  const handleOpenModal = (data) => {
    setbusinessData(data);
    setIsCreateMode(false);
  };

  const renderView = () => {
    switch (currentView) {
      case calendarViewTypes.month:
        return <MonthView onOpenModal={handleOpenModal} />;
      case calendarViewTypes.week:
        return <WeekView onOpenModal={handleOpenModal} />;
      default:
        return <MonthView onOpenModal={handleOpenModal} />;
    }
  };

  const handleCreateBusiness = () => {
    setbusinessData(null);
    setIsCreateMode(true);
  };

  const handleCloseModal = () => {
    setbusinessData(null);
    setIsCreateMode(false);
    // Перезагружаем данные после закрытия модалки
    // loadData();
  };

  // Получаем текущий диапазон дат для инициализации фильтров
  const { startDate, endDate } = getCurrentDateRange();

  return (
      <FiltersProvider>
        <LoadingProvider isLoading={api.isLoading}>
          <div className={styles.container}>
            <Title
                title="Календарь дел"
                actions={{
                  add: {
                    action: handleCreateBusiness,
                    title: 'Создать дело',
                  },
                  filter: {
                    title: 'Фильтр',
                    config: createCalendarFilters(appApi),
                    onChange: handleFilterChange,
                    initialValues: {
                      date_from: format(startDate, 'yyyy-MM-dd'),
                      date_to: format(endDate, 'yyyy-MM-dd')
                    }
                  }
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
              <Selector handleUpdate={handleDateUpdate} currentDate={currentDate} type={currentView} />
            </div>

            <div className={styles.calendar}>{renderView()}</div>
          </div>
          {(businessData || isCreateMode) && (
              <CalendarModal
                  data={businessData}
                  calendarStore={calendarStore}
                  calendarApi={api}
                  businessId={businessData?.id ?? null}
                  onClose={handleCloseModal}
              />
          )}
        </LoadingProvider>
      </FiltersProvider>
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