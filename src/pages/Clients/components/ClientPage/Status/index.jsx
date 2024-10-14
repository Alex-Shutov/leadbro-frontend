import React, {useState} from 'react';
import styles from './Status.module.sass';
import ManagerCell from '../../../../../components/ManagerCell';
import Badge, { statusTypes } from '../../../../../shared/Badge';
import Card from '../../../../../shared/Card';
import cn from 'classnames';
import StatusDropdown from "../../../../../components/StatusDropdown";

const ClientStatus = ({ client, className }) => {
    const statuses = [
        {
            label: 'Новый лид',
            value: 1,
            className: 'blue',
        },
        {
            label: 'Лид обработан',
            value: 2,
            className: 'darkBlue',
        },
        {
            label: 'Бриф заполнен',
            value: 3,
            className: 'green',
        },
        {
            label: 'КП отправлено',
            value: 4,
            className: 'red',
        },
    ];
    const [selectedOption, setSelectedOption] = useState(statuses[0]);

    const handleChange = (option) => {
        setSelectedOption(statuses[option]);
    };

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
        <StatusDropdown options={statuses} value={selectedOption} onChange={handleChange}/>
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
