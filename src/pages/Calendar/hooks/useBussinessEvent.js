import { useMemo } from 'react';
import {
  isSameDay,
  parseISO,
  differenceInMinutes,
  differenceInHours,
  format,
} from 'date-fns';

export const useBusinessEvents = (businesses, date, view) => {
  return useMemo(() => {
    switch (view) {
      case 'month': {
        return businesses.reduce((acc, business) => {
          // Преобразуем строку даты в объект Date
          const businessDate = business.startDate;
          const dateKey = format(businessDate, 'yyyy-MM-dd');

          if (!acc[dateKey]) {
            acc[dateKey] = [];
          }

          acc[dateKey].push({
            ...business,
            startDate: businessDate,
            endDate: business.endDate,
          });
          return acc;
        }, {});
      }

      case 'day': {
        return businesses.filter((business) =>
          isSameDay(business.startDate, date),
        );
      }

      default:
        return {};
    }
  }, [businesses, date, view]);
};

export const useBusinessLayout = (businesses, view) => {
  return useMemo(() => {
    if (view !== 'day') return {};

    const layout = {};
    const timeSlots = new Map();

    // Сортируем события по времени начала
    const sortedBusinesses = [...businesses].sort((a, b) =>
      differenceInMinutes(a.startDate, b.startDate),
    );

    sortedBusinesses.forEach((business) => {
      const duration = differenceInHours(business.endDate, business.startDate);
      const startHour = business.startDate.getHours();

      // Находим свободную колонку
      let column = 0;
      let isSlotFound = false;

      while (!isSlotFound) {
        isSlotFound = true;

        for (let hour = startHour; hour < startHour + duration; hour++) {
          const slotKey = `${hour}-${column}`;
          if (timeSlots.has(slotKey)) {
            isSlotFound = false;
            column++;
            break;
          }
        }

        if (isSlotFound) {
          // Помечаем слоты как занятые
          for (let hour = startHour; hour < startHour + duration; hour++) {
            timeSlots.set(`${hour}-${column}`, business.id);
          }

          layout[business.id] = {
            column,
            duration,
          };
        }
      }
    });

    return layout;
  }, [businesses, view]);
};
