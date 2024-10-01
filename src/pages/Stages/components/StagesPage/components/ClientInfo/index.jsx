import React, { useState } from 'react';
import LabeledParagraph from '../../../../../../shared/LabeledParagraph';
import Card from '../../../../../../shared/Card';
import styles from './Info.module.sass';
import {
  formatDate,
  formatDateWithDateAndYear,
  formatDateWithoutHours,
} from '../../../../../../utils/formate.date';
import HoursComponent from '../../../../../../components/HoursComponent';
import { convertToHours } from '../../../../../../utils/format.time';
import { formatSum } from '../../../../../../utils/format.number';
import CostView from '../../../../../../components/CostView';
import cn from 'classnames';
import CardDropdown from '../../../../../../shared/Dropdown/Card';
import { TranslateYTransition } from '../../../../../../utils/motion.variants';
import { AnimatePresence, motion } from 'framer-motion';
const Index = ({
  data: {
    client,
    service,
    title,
    contactPerson,
    deadline,
    deadlineTime,
    actualTime,
    extraCosts,
  },
  timeActual,
  costsExtra,
}) => {
  const [dropDownClicked, setDropDownCLicked] = useState(true);
  return (
    <>
      <div className={styles.dropdown}>
        <CardDropdown
          classNameContainer={styles.delMargin}
          onClick={() => setDropDownCLicked(!dropDownClicked)}
          size={16}
          className={cn(
            styles.dropdown_inner,
            styles.delMargin,
            styles.dropdown_header,
          )}
          text={<b>Информация о клиенте</b>}
        />
      </div>

      <AnimatePresence>
        {dropDownClicked && (
          <motion.div
            animate={'show'}
            initial={'hidden'}
            exit={'hidden'}
            variants={TranslateYTransition}
            className={cn(styles.col, {
              [styles.col_dropdowned]: dropDownClicked,
            })}
          >
            <div className={styles.container}>
              <Card
                className={styles.card}
                classCardHead={styles.header}
                title={'Клиент'}
              >
                <LabeledParagraph
                  label={'Название компании'}
                  to={`/clients/${client.id}`}
                  text={client.title}
                />
                <LabeledParagraph label={'Услуга'} text={service.title} />
                <LabeledParagraph label={'Этап'} text={title} />
                <LabeledParagraph
                  label={'Контактное лицо'}
                  text={contactPerson}
                />
                <LabeledParagraph
                  label={'Дедлайн'}
                  text={formatDateWithDateAndYear(deadline)}
                />
                <LabeledParagraph
                  label={'Плановое время'}
                  text={
                    <HoursComponent
                      cls={styles.hours}
                      time={convertToHours(deadlineTime)}
                      type={'ч'}
                    />
                  }
                />
                <LabeledParagraph
                  label={'Фактическое время'}
                  text={
                    <HoursComponent
                      cls={cn(styles.hours, styles.hours_actual)}
                      time={
                        actualTime
                          ? convertToHours(actualTime)
                          : convertToHours(timeActual)
                      }
                      type={'ч'}
                    />
                  }
                />
                <LabeledParagraph
                  label={'Стоимость доп. задач'}
                  text={<CostView cost={extraCosts} />}
                />
                {/*<LabeledParagraph text={'123'} />*/}
                {/*<LabeledParagraph text={'123'} />*/}
              </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Index;
