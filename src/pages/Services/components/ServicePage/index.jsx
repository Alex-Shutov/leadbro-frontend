import React, { useMemo } from 'react';
import { opacityTransition } from '../../../../utils/motion.variants';
import { motion } from 'framer-motion';
import Title from '../../../../shared/Title';
import { useParams } from 'react-router';
import useClientsApi from '../../../Clients/clients.api';
import useServices from '../../hooks/useServices';
import useServiceApi from '../../services.api';
import Card from '../../../../shared/Card';
import styles from './page.module.sass';
import Task from './components/Task';
import Hours from './components/Hours';
import Act from './components/Act';
import Bills from './components/Bills';
import Report from './components/Report';
import TextLink from '../../../../shared/Table/TextLink';
import { observer } from 'mobx-react';
import AdaptiveStages from './components/AdaptiveCard';
import Agreement from './components/Agreement';
import AdditionalAgreement from './components/AdditionalAgreement';
import Icon from '../../../../shared/Icon';
import Button from '../../../../shared/Button';
import cn from 'classnames';
import Loader from "../../../../shared/Loader";

const ServicePage = observer(() => {
  let { id } = useParams();
  const {data:service,store:services} = useServices(Number(id));
  const api = useServiceApi();

  if (!service) return <Loader/>
  // const service = useMemo(
  //   () => services.getById(+id),
  //   [id, , services, services.services, services.drafts],
  // );
  return (
    <motion.div
      initial={'hidden'}
      animate={'show'}
      variants={`opacityTransition`}
    >
      {service?.stages.map((el) => (
        <div className={styles.cards}>
          <Card
            classCardHead={styles.card_title}
            className={styles.card}
            classCardHead={styles.head}
            classTitle={styles.card_title}
            head={
              <TextLink to={`stages/${el.id}`} className={styles.etap}>
                Этап №{el.number}
              </TextLink>
            }
            title={el.title}
          >
            <Task stage={el} taskName={service.title} task={service.tasks} />
            <Hours time={el.time} />
            <Report />
            <Act act={el.act} />
            {/*<Agreement/>*/}
            {/*<AdditionalAgreement/>*/}
            <Bills bills={el.bills} />
          </Card>
          <Card
            classCardHead={styles.card_title}
            className={cn(styles.card, styles.secondCard)}
            title={'Документы'}
          >
            <div className={styles.buttons}>
              <Button
                type={'secondary'}
                after={<Icon size={24} name={'download'} />}
                classname={styles.button}
                name={'Договор'}
              />
              <Button
                type={'secondary'}
                after={<Icon size={24} name={'download'} />}
                classname={styles.button}
                name={'Доп.соглашение'}
              />
            </div>
          </Card>
          {/*<AdaptiveStages data={service.tasks} />*/}
        </div>
      ))}
    </motion.div>
  );
});

export default ServicePage;
