import React from 'react';
import styles from './Status.module.sass';
import ManagerCell from '../../../../../components/ManagerCell';
import Badge, { statusTypes } from '../../../../../shared/Badge';
import Card from '../../../../../shared/Card';
import cn from 'classnames';

const ClientStatus = ({ client, className }) => {
  return (
    <Card className={cn(styles.card, className)}>
      <div className={styles.adaptive}>
        <div className={styles.container_adaptive}>
          <ManagerCell manager={client?.manager} />
          <div className={cn(styles.clientId, styles.clientId_adaptive)}>
            <span>{client?.id}</span>
            <span>ID клиента</span>
          </div>
        </div>
        <div className={styles.adaptive_badge}>
          <Badge status={client?.status} statusType={statusTypes?.clients} />
        </div>
      </div>
      <div className={styles.container}>
        <ManagerCell manager={client?.manager} />
        <Badge status={client?.status} statusType={statusTypes?.clients} />
      </div>
      <div className={styles.clientId}>
        <span>{client?.id}</span>
        <span>ID клиента</span>
      </div>
    </Card>
  );
};

export default ClientStatus;
