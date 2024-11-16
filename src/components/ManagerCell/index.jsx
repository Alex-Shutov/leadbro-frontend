import React from 'react';
import styles from './ManagerCell.module.sass';
import Avatar from '../../shared/Avatar';
import cn from 'classnames';
import { Link } from 'react-router-dom';
import Tooltip from '../../shared/Tooltip';
import { loadAvatar } from '../../utils/create.utils';

const ManagerCell = ({ manager, ...rest }) => {
  const imageSrc = manager?.image ?? manager?.avatar;

  const renderName = () => {
    if (manager?.fio) {
      return manager.fio;
    }
    debugger;
    const hasNameOrSurname = Boolean(
      manager?.name || manager?.surname || manager?.lastName,
    );
    if (hasNameOrSurname) {
      const surname = manager?.surname ?? manager?.lastName ?? '';
      return `${manager?.name ?? ''} ${surname}`.trim();
    }

    return 'Не указано';
  };

  return (
    <div className={cn(styles.container, rest.className)}>
      <Avatar size={42} imageSrc={imageSrc ?? loadAvatar()} />
      <div className={styles.fioContainer}>
        <div>
          <Link>{renderName()}</Link>
        </div>
        <div style={{ whiteSpace: 'pre' }}>{manager?.role}</div>
      </div>
    </div>
  );
};

export default ManagerCell;
