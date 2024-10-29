import useStore from '../../../../../../hooks/useStore';
import BillStatsWidget from '../../../../../../shared/Widget';
import styles from './styles.module.sass';
const BillStats = () => {
  const { billsStore } = useStore();
  if (!billsStore.stats) return <></>;
  const { total, paid, expired } = billsStore.stats;

  return (
    <div className={styles.container}>
      <BillStatsWidget
        title="Всего счетов на сумму"
        sum={total}
        showChart={false}
        icon={'/coins.svg'}
      />
      <BillStatsWidget
        type={'accept'}
        title="Оплачено счетов на сумму"
        sum={paid.sum}
        percent={paid.percent}
        showChart={true}
        icon={'/credit-check.png'}
      />
      <BillStatsWidget
        type={'reject'}
        title="Просрочено оплата на сумму"
        sum={expired.sum}
        percent={expired.percent}
        showChart={true}
        icon={'/credit-x.png'}
      />
    </div>
  );
};
export default BillStats;
