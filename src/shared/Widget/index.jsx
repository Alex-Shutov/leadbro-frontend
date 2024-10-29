// TotalBillsWidget.js
import React from 'react';
import styles from './styles.module.sass';
import {
  CircularProgressbar,
  buildStyles,
  CircularProgressbarWithChildren,
} from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import cn from 'classnames';

const BillStatsWidget = ({
  title,
  sum,
  percent,
  showChart,
  color,
  icon,
  type,
}) => {
  return (
    <div className={styles.widget}>
      <div className={styles.icon}>
        {showChart ? (
          <CircularProgressbarWithChildren
            value={percent}
            // text={`${percent}%`}
            strokeWidth={2}
            styles={buildStyles({
              textColor: '#ffffff',
              pathTransitionDuration: 0.5,
              pathColor: type === 'accept' ? '#83BF6E' : '#C31212',
              trailColor: '#EFEFEF',
            })}
          >
            <img className={styles.icon_inner} src={icon} />
          </CircularProgressbarWithChildren>
        ) : (
          <img className={styles.icon_inner} src={icon} alt={title} />
        )}
      </div>
      <div className={styles.content}>
        <div className={cn(styles.title)}>{title}</div>
        <div className={cn(styles.value)}>
          {sum.toLocaleString()} ₽
          {!!percent && (
            <span className={cn(styles.percent, styles[type])}>{percent}%</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default BillStatsWidget;
