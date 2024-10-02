import React, { useEffect, useMemo, useState } from 'react';
import useStore from '../../../hooks/useStore';
import useStagesApi from '../stages.api';

const useStages = (id = null) => {
  const { stagesStore } = useStore();
  const api = useStagesApi();
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        if (id !== null) {
          if (!stagesStore.stages.length) {
            await api.getStageById(id);
          } else {
            const stageFromStore = stagesStore.getById(id);
            if (stageFromStore) {
              stagesStore.setCurrentStage(stageFromStore);
            } else {
              await api.getStageById(id);
            }
          }
        } else if (!stagesStore.stages.length) {
          await api.getStages();
        }
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();

    return () => {
      if (id !== null) {
        stagesStore.clearCurrentStage();
      }
    };
  }, [stagesStore, id, api]);

  const result = useMemo(() => {
    if (id !== null) {
      return (
        stagesStore.currentStage ||
        stagesStore.getById(id) ||
        api.getStageById(id)
      );
    } else {
      return stagesStore;
    }
  }, [id, stagesStore.currentStage, stagesStore.stages, api, isLoading]);

  return { data: result, isLoading };
};

export default useStages;
