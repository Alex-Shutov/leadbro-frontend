import React from 'react';
import StatsWidget from "../../../../../../shared/Widget";
import Icon from "../../../../../../shared/Icon";
import  './Stats.sass'

const TimeSpendingStats = ({ totalTime, totalCost }) => {
    const formatTotalTime = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return `${hours} ч${remainingMinutes ? `, ${remainingMinutes} мин` : ''}`;
    };

    return (
        <div className={'timetracking_container'}>
            <StatsWidget
                title="Времени затрачено"
                value={formatTotalTime(totalTime)}
                showChart={false}
                icon={<Icon name="clock" size={24} />}
            />
            <StatsWidget
                title="Стоимость затраченного времени"
                sum={totalCost}
                showChart={false}
                icon={<Icon name="dollar" size={24} />}
            />
        </div>
    );
};
export default TimeSpendingStats