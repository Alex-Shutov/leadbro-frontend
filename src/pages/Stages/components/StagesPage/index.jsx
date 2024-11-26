import React, { useMemo } from 'react';
import useClients from '../../../Clients/hooks/useClients';
import ClientInfo from './components/ClientInfo';
import useParamSearch from '../../../../hooks/useParamSearch';
import { useParams } from 'react-router';
import useStages from '../../hooks/useStages';
import {
  StagesTable,
  StagesTableWithTasksQuery,
} from './components/StagesTable';
import styles from './stages.module.sass';
import { motion } from 'framer-motion';
import { observer } from 'mobx-react';
import useStore from '../../../../hooks/useStore';
import useStageApi from '../../stages.api';
import useTasksApi from '../../../Tasks/tasks.api';

const StagesPage = observer(() => {
  const { stagesStore } = useStore();
  const { tasksStore } = useStore();
  const api = useStageApi();
  const taskApi = useTasksApi();

  const { stageId } = useParams();

  const { data: stage } = useStages(Number(stageId));
  return (
    <motion.div className={styles.container}>
      {stage && (
        <StagesTableWithTasksQuery
          stage={stage}
          stagesStore={stagesStore}
          stageApi={api}
          taskStore={tasksStore}
          taskApi={taskApi}
        />
      )}
    </motion.div>
  );
});

export default StagesPage;
