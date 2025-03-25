import React from 'react';

import styles from './Table.module.sass';
import useStore from '../../../../hooks/useStore';
import StatsWidget from '../../../../shared/Widget';

const CallsStats = () => {
  const { callsStore } = useStore();
  if (!callsStore.stats) return <></>;
  debugger;
  const { total, incoming, outgoing } = callsStore.stats;

  return (
    <div className={styles.container}>
      <StatsWidget
        title="Всего звонков"
        value={total}
        showChart={false}
        icon={'/leadbro/phone-incoming.svg'}
      />
      <StatsWidget
        type={'accept'}
        title="Входящих звонков"
        value={incoming}
        // percent={total > 0 ? Math.round((incoming / total) * 100) : 0}
        icon={'/leadbro/phone-incoming.svg'}
      />
      <StatsWidget
        type={'info'}
        title="Исходящих звонков"
        value={outgoing}
        // percent={total > 0 ? Math.round((outgoing / total) * 100) : 0}
        icon={'/leadbro/phone-outgoing.svg'}
      />
    </div>
  );
};

export default CallsStats;
