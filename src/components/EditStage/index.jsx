import useStages from '../../pages/Stages/hooks/useStages';
import useStageApi from '../../pages/Stages/stages.api';
import { useEffect, useMemo, useState } from 'react';
import { handleSubmit as handleSubmitSnackbar } from '../../utils/snackbar';
import TextInput from '../../shared/TextInput';
import Calendar from '../../shared/Datepicker';
import styles from '../../pages/Services/components/ServicesTable/components/EditModal/Modal.module.sass';
import additionStyles from './Edit.module.sass';
import Dropdown from '../../shared/Dropdown/Default';
import Switch from '../../shared/Switch';
import Modal from '../../shared/Modal';
import cn from 'classnames';
import { stageStatusTypesRu } from '../../pages/Stages/stages.types';
import useStageStatuses from '../../pages/Stages/hooks/useStageStatuses';
import { useParams } from 'react-router';

const EditStage = ({ handleClose, stageId }) => {
  const { store: stagesStore } = useStages(stageId);
  const api = useStageApi();
  const { id: serviceId } = useParams();
  const [isEditMode, setIsEditMode] = useState(false);
  const stageStatuses = useStageStatuses();
  const [localStage, setLocalStage] = useState({
    title: '',
    status: stageStatuses.inProgress,
    startTime: null,
    deadline: null,
    actSum: 0,
    sumByHand: false,
    taskDescription: '',
  });

  const stage = useMemo(() => {
    return isEditMode ? stagesStore.getById(+stageId) : localStage;
  }, [isEditMode, stageId, stagesStore.stages, stagesStore.drafts, localStage]);
  console.log(stage.taskDescription, 'taskDescription');
  useEffect(() => {
    if (stageId) {
      setIsEditMode(true);
    } else {
      setIsEditMode(false);
    }
  }, [stageId]);

  const handleChange = (name, value, withId = true) => {
    if (isEditMode) {
      stagesStore.changeById(stageId, name, value, withId);
    } else {
      setLocalStage((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      if (isEditMode) {
        await api.updateStage(stageId, stage); // Обновляем существующий stage
      } else {
        await api.createStage(Number(serviceId), localStage); // Создаем новый stage
      }
      handleSubmitSnackbar(
        isEditMode ? 'Этап успешно отредактирован' : 'Этап успешно создан',
      );
      handleClose(); // Закрываем модалку
    } catch (error) {
      console.error('Ошибка при сохранении:', error);
    }
  };
  if (stageId && !isEditMode) return <></>;

  return (
    <Modal
      handleClose={() => handleClose()}
      handleSubmit={() => handleSubmit()}
      size={'lg'}
    >
      <div className={cn(styles.stageModal, additionStyles.flex)}>
        <div className={styles.flexBig}>
          <div className={styles.name}>
            {isEditMode ? 'Редактирование этапа' : 'Создание этапа'}
          </div>
          <div className={cn(styles.flex, additionStyles.flex)}>
            <TextInput
              onChange={({ target }) => handleChange('title', target.value)}
              name="title"
              value={stage?.title || ''}
              edited={true}
              className={styles.input}
              label="Название этапа"
            />
            <Dropdown
              setValue={(e) => handleChange('status', e[0])}
              classNameContainer={styles.input}
              label="Статус"
              renderOption={(opt) => opt[1]}
              options={stageStatuses}
              value={stageStatusTypesRu[stage.status] || ''}
            />
          </div>
          <div className={cn(styles.flex, styles.flex__lowerGap)}>
            <Calendar
              label="Дата начала"
              value={stage.startTime}
              onChange={(date) => handleChange('startTime', date)}
            />
            <Calendar
              label="Дата окончания"
              value={stage.deadline}
              onChange={(date) => handleChange('deadline', date)}
            />
          </div>
          <div className={cn(styles.flex, styles.flex__lowerGap)}>
            <TextInput
              onChange={({ target }) => handleChange('actSum', target.value)}
              name="actSum"
              type={'number'}
              value={stage.actSum}
              edited={true}
              className={styles.input}
              label="Сумма в акте"
            />
            {/*<Switch*/}
            {/*    className={styles.switch}*/}
            {/*    name="sumByHand"*/}
            {/*    label="Указать сумму акта вручную"*/}
            {/*    value={stage.sumByHand || false}*/}
            {/*    onChange={(checked) => handleChange('sumByHand', checked)}*/}
            {/*/>*/}
          </div>
          <div>
            <TextInput
              type="editor"
              onChange={({ target }) =>
                handleChange('taskDescription', target.value)
              }
              name="taskDescription"
              value={stage.taskDescription || ''}
              edited={true}
              className={styles.textarea}
              label="Задача"
              // rows={14}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default EditStage;
