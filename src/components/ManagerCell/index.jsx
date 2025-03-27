import React from 'react';
import styles from './ManagerCell.module.sass';
import Avatar from '../../shared/Avatar';
import cn from 'classnames';
import { Link } from 'react-router-dom';
import Tooltip from '../../shared/Tooltip';
import { loadAvatar } from '../../utils/create.utils';
import TextLink from '../../shared/Table/TextLink';

const ManagerCell = ({ manager, children, ...rest }) => {
  const imageSrc = manager?.image ?? manager?.avatar;
  const renderName = () => {
    if (manager?.fio) {
      return manager.fio;
    }
    const hasNameOrSurname = Boolean(
      manager?.name || manager?.surname || manager?.lastName,
    );
    if (hasNameOrSurname) {
      const surname = manager?.surname ?? manager?.lastName ?? '';
      return `${surname} ${manager?.name ?? ''} ${manager?.middleName??''}`.trim() ;
    }

    return 'Не указано';
  };

  return (
    <div className={cn(styles.container, rest.className)}>
      {!rest?.disableAvatar && <Avatar size={42} imageSrc={imageSrc ?? loadAvatar()} />}
      <div className={styles.fioContainer}>
        <div className={styles.fio}>
          <TextLink>{renderName()}</TextLink>
        </div>
        {!rest?.disableRole && <div className={styles.role}>{manager?.role}</div>}
        {children}

      </div>
    </div>
  );
};

export default ManagerCell;
