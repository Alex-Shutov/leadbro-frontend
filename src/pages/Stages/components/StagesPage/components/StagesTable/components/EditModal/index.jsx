import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { observer } from 'mobx-react';
import useStages from '../../../../../../hooks/useStages';
import {
  handleError,
  handleSubmit as handleSubmitSnackbar,
} from '../../../../../../../../utils/snackbar';
import useStageApi from '../../../../../../stages.api';
import Modal from '../../../../../../../../shared/Modal';
import TaskDescriptionPart from './components/TaskDescriptionPart';
import TaskTypePart from './components/TaskTypePart';
import Button from '../../../../../../../../shared/Button';
import styles from './Modal.module.sass';
import TextInput from '../../../../../../../../shared/TextInput';
import cn from 'classnames';
import CommentsList from '../../../../../../../../components/CommentsList';
import taskStyles from './components/TaskDescriptionPart/Description.module.sass';

const EditModal = observer(({ stageId, data, handleClose }) => {
  const { store: stagesStore } = useStages(stageId);
  const stageTask = useMemo(
    () => stagesStore.getById(stageId)?.tasks.find((el) => el.id === data.id),
    [
      data.id,
      stagesStore.stages,
      stageId,
      stagesStore.currentStage,
      stagesStore.drafts,
    ],
  );
  const [isOpened, setOpened] = useState(true);
  const api = useStageApi();
  const handleChange = (name, payload, withId = true) => {
    stagesStore.changeById(stageId, name, payload, withId);
  };
  const handleReset = useCallback((path = '') => {
    stagesStore.resetDraft(stageId, path);
  }, []);

  const handleDecline = () => {
    handleError('Задача отклонена');
    setOpened(false);
    handleClose && handleClose(null);
  };

  const handleSubmit = useCallback((text) => {
    handleSubmitSnackbar(text ?? 'Задача успешно отредактирована');
    stagesStore.submitDraft(stageId);
    api.setStages(stagesStore.stages);
    setOpened(false);
    handleClose && handleClose(null);
  }, []);
  return (
    stageTask &&
    isOpened && (
      <Modal
        closeButton={false}
        handleClose={() => handleClose && handleClose(null)}
        handleSubmit={() => handleSubmit()}
        size={'lg'}
        stageId={stageId}
      >
        <div className={styles.gridContainer}>
          <TaskDescriptionPart
            handleSave={() => handleSubmit('Задача принята')}
            handleDecline={() => handleDecline()}
            className={styles.taskDescription}
            data={stageTask}
            handleChange={(name, value, withId) =>
              handleChange(name, value, withId)
            }
          />
          <TaskTypePart
            className={styles.taskType}
            data={stageTask}
            handleAdd={(name, payload) => {
              handleChange(`tasks.${data.id}.${name}`, payload, false);
            }}
            handleChange={(name, value, withId) =>
              handleChange(`tasks.${data.id}.${name}`, value, true)
            }
          />
          <CommentComponent
            className={styles.comment}
            data={stageTask}
            handleChange={(name, value, withId) =>
              handleChange(name, value, withId)
            }
          />
        </div>
      </Modal>
    )
  );
});

const CommentComponent = ({
  handleChange,
  data: { comment, comments, id },
}) => {
  return (
    <div>
      <div className={taskStyles.border_container_comment}>
        <TextInput
          onChange={({ target }) => handleChange(target.name, target.value)}
          name={`tasks.${id}.comment`}
          value={comment}
          rows={6}
          edited={true}
          type={'textarea'}
          className={cn(taskStyles.input, taskStyles.textarea)}
          label={<span className={taskStyles.label_bold}>Комментарии</span>}
        />
      </div>
      <CommentsList cls={styles.comment_list} comments={comments} />
    </div>
  );
};

export default EditModal;
