import React from 'react';
import Card from '../../../../../../shared/Card';
import styles from '../../page.module.sass';
import cn from 'classnames';
import Button from '../../../../../../shared/Button';
import Icon from '../../../../../../shared/Icon';
import LabeledParagraph from '../../../../../../shared/LabeledParagraph';
import {
  serviceTypeEnumRu,
  statusTypes,
  statusTypesRu,
} from '../../../../services.types';
import ManagerCell from '../../../../../../components/ManagerCell';
import {
  formatDateWithDateAndYear,
  formatDateWithoutHours,
} from '../../../../../../utils/formate.date';

const Index = ({ service }) => {
  console.log(service, 'service');
  return (
    <>
      <Card
        classCardHead={styles.card_title}
        className={cn(styles.card, styles.infoCard)}
        title={'Информация об услуге'}
      >
        {Boolean(service.type) && (
          <LabeledParagraph
            label={'Тип услуги'}
            text={serviceTypeEnumRu[service.type]}
          />
        )}
        {Boolean(service.status) && (
          <LabeledParagraph
            textClass={
              service.status === statusTypes.inProgress
                ? styles.inProgress
                : styles.closed
            }
            label={'Статус'}
            text={statusTypesRu[service.status]}
          />
        )}
        {!!service.manager && (
          <LabeledParagraph
            label={'Ответственный'}
            text={<ManagerCell manager={service.manager} />}
          />
        )}
        {!!service.command.length && (
          <LabeledParagraph
            label={'Участники'}
            text={service.command.map((el) => (
              <ManagerCell manager={el} />
            ))}
          />
        )}

        <LabeledParagraph
          label={'Дедлайн'}
          text={formatDateWithDateAndYear(service.deadline)}
        />

        {!!service.client && (
          <LabeledParagraph
            label={'Клиент'}
            text={service.client.title}
            to={`/clients/${service.client.id}`}
          />
        )}
      </Card>
    </>
  );
};

export default Index;
