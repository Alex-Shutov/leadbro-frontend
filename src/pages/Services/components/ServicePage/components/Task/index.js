import React, { useRef, useState } from 'react';
import styles from './Task.module.sass';
import {
  formatDateWithDateAndYear,
  formatDateWithOnlyDigits,
  formatDateWithoutHours,
} from '../../../../../../utils/formate.date';
import CardField from '../CardField';
import Button from '../../../../../../shared/Button';
import Badge from '../../../../../../shared/Badge';
import ServiceBadge, { serviceStatuses } from '../Statuses';
import Image from '../../../../../../shared/Image';
import Icon from '../../../../../../shared/Icon';
import TextLink from '../../../../../../shared/Table/TextLink';
import Basis from '../../../../../../shared/Basis';
import EditStage from '../EditStage';
import useOutsideClick from '../../../../../../hooks/useOutsideClick';

const Task = ({ stage, task, taskName }) => {
  const {last:localTask,total} = task
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef();
  // useOutsideClick(ref, () => setIsOpen(false));
  return (
    <div className={styles.task_container}>
      <div>
        <CardField label={'ТЗ и сроки'}>
          <Basis className={styles.taskDatesAndStatus}>
            <Icon size={20} name={'calendar'} />
            <span>
              {formatDateWithOnlyDigits(localTask.startDate)} -{' '}
              {formatDateWithOnlyDigits(localTask.endDate)}
            </span>
            <ServiceBadge
              statusType={serviceStatuses.tasks}
              status={localTask.status}
            />
          </Basis>
          <Button
            classname={styles.button}
            type={'primary'}
            isSmallButton={true}
            adaptiveIcon={<Icon size={16} viewBox={'0 0 20 20'} name={'add'} />}
          />
        </CardField>
        <CardField label={'Задача'}>
          <Basis className={styles.taskName}>
            <div>
              <TextLink
                onClick={() => setIsOpen(true)}
                className={styles.taskName_primary}
              >
                <span>{`${total} задач`}</span>
              </TextLink>
            </div>
            <div className={styles.dateDeadline}>
              <Icon size={20} name={'calendar'} />
              <span>{formatDateWithDateAndYear(localTask.startDate)}</span>
              <span className={styles.taskName_secondary}>Дедлайн</span>
            </div>
          </Basis>
        </CardField>
      </div>
      <div>
        {isOpen && (
          <EditStage stageId={stage.id} idStage={stage.id} handleClose={() => setIsOpen(false)} />
        )}
      </div>
    </div>
  );
};

export default Task;
