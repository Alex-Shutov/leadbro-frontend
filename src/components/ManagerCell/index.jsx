import React from 'react';
import styles from './ManagerCell.module.sass';
import Avatar from '../../shared/Avatar';
import cn from 'classnames';
import { Link } from 'react-router-dom';
import Tooltip from '../../shared/Tooltip';

const ManagerCell = ({ manager, ...rest }) => {
  const imageSrc = manager?.image ?? manager?.avatar;
  return (
    <div className={cn(styles.container, rest.className)}>
      <Avatar size={42} imageSrc={imageSrc} />
      <div className={styles.fioContainer}>
        <div>
          <Link>
            {manager?.name} {manager?.surname ?? manager?.lastName} {manager?.fio}
          </Link>
        </div>
        <div style={{whiteSpace:'pre'}}>{manager?.role}</div>
      </div>
    </div>
  );
};

export default ManagerCell;
