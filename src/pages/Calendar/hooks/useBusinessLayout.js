import {useMemo} from "react";
import {areIntervalsOverlapping, differenceInHours, differenceInMinutes, format, isSameDay} from "date-fns";

export const useBusinessLayout = (businesses, view,date) => {
    return useMemo(() => {
        if (!businesses) return {};

        const layout = {};
        let eventsToProcess = [...businesses];

        if (view === 'day') {
            eventsToProcess = businesses.filter(business =>
                isSameDay(business.startDate, date)
            );
        }

        const eventsByDay = eventsToProcess.reduce((acc, business) => {
            const dateKey = format(business.startDate, 'yyyy-MM-dd');
            if (!acc[dateKey]) {
                acc[dateKey] = [];
            }
            acc[dateKey].push(business);
            return acc;
        }, {});


        Object.entries(eventsByDay).forEach(([dateKey, dayEvents]) => {
            const sortedEvents = [...dayEvents].sort((a, b) =>
                differenceInMinutes(a.startDate, b.startDate)
            );
            const columnsInUse = new Map();

            sortedEvents.forEach(event => {
                const startHour = event.startDate.getHours();
                const duration = differenceInHours(event.endDate, event.startDate);
                const isAllDay = startHour <= 8 && duration >= 4;

                if (isAllDay) {
                    layout[event.id] = {
                        isAllDay: true,
                        column: 0,
                        columnSpan: 1,
                        dateKey
                    };
                    return;
                }

                const eventInterval = {
                    start: event.startDate,
                    end: event.endDate
                };
                const overlappingEvents = sortedEvents.filter(otherEvent =>
                    otherEvent.id !== event.id &&
                    !otherEvent.isAllDay &&
                    areIntervalsOverlapping(
                        eventInterval,
                        { start: otherEvent.startDate, end: otherEvent.endDate }
                    )
                );

                let column = 0;
                let found = false;

                while (!found) {
                    const timeKey = `${dateKey}-${column}`;
                    const columnEvents = columnsInUse.get(timeKey) || [];

                    const isColumnFree = !columnEvents.some(existingEvent =>
                        areIntervalsOverlapping(
                            eventInterval,
                            { start: existingEvent.startDate, end: existingEvent.endDate }
                        )
                    );

                    if (isColumnFree) {
                        found = true;
                        if (!columnsInUse.has(timeKey)) {
                            columnsInUse.set(timeKey, []);
                        }
                        columnsInUse.get(timeKey).push(event);
                    } else {
                        column++;
                    }
                }

                const maxColumn = Math.max(
                    column,
                    ...overlappingEvents.map(e => (layout[e.id]?.column || 0))
                );

                layout[event.id] = {
                    column,
                    columnCount: maxColumn + 1,
                    overlappingEvents: overlappingEvents.length,
                    duration: differenceInMinutes(event.endDate, event.startDate),
                    dateKey,
                    isAllDay: false
                };
            });
        });

        return layout;
    }, [businesses, view]);
};
