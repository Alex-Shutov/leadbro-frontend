import React from 'react';
import useClients from '../../../Clients/hooks/useClients';
import ClientInfo from './components/ClientInfo';
import useParamSearch from '../../../../hooks/useParamSearch';
import { useParams } from 'react-router';
import useStages from '../../hooks/useStages';
import StagesTable from './components/StagesTable';
import styles from './stages.module.sass';
import { motion } from 'framer-motion';
import {observer} from "mobx-react";

const StagesPage = observer(() => {
  // const clientId = useParamSearch('clientId');

  const { stageId } = useParams();
  // const { data: currentClient } = useClients(Number(clientId));
  const { data: stage } = useStages(Number(stageId));
  return (
    <motion.div className={styles.container}>
      {stage && <StagesTable stage={stage} />}
    </motion.div>
  );
});

export default StagesPage;
