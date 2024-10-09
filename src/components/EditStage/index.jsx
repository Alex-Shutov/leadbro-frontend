import useStages from "../../pages/Stages/hooks/useStages";
import useStageApi from "../../pages/Stages/stages.api";
import {useEffect, useMemo, useState} from "react";
import {handleSubmit as handleSubmitSnackbar} from "../../utils/snackbar";
import TextInput from "../../shared/TextInput";
import Calendar from "../../shared/Datepicker";
import styles from '../../pages/Services/components/ServicesTable/components/EditModal/Modal.module.sass';
import additionStyles from './Edit.module.sass';
import Dropdown from "../../shared/Dropdown/Default";
import Switch from "../../shared/Switch";
import Modal from "../../shared/Modal";
import cn from "classnames";
import {stageStatusTypesRu} from "../../pages/Stages/stages.types";
import useStageStatuses from "../../pages/Stages/hooks/useStageStatuses";

const EditStage = ({ handleClose, stageId }) => {
  const { store: stagesStore } = useStages(stageId);
  const api = useStageApi();
  const [isEditMode, setIsEditMode] = useState(false);
  const [localStage, setLocalStage] = useState({
    title: '',
    status: 'created',
    startTime: null,
    deadline: null,
    actSum: 0,
    sumByHand: false,
    taskDescription: `
<h1><span>Heading 1</span></h1>
<h2>Heading 2</h2>
<h3>Heading 3</h3>
<ul>
  <li>List item 1</li>
  <li>List item 2</li>
  <li>List item 3</li>
</ul>
<p><span>This is a paragraph with some text to check if the editor correctly parses paragraphs and renders them as separate blocks.</span></p>
`
  });

  const stage = useMemo(() => {
    return isEditMode ? stagesStore.getById(+stageId) : localStage;
  }, [isEditMode, stageId, stagesStore.stages, stagesStore.drafts, localStage]);

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
      debugger
      setLocalStage((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      if (isEditMode) {
        await stagesStore.submitDraft(); // Обновляем существующий stage
      } else {
        await api.createStage(localStage); // Создаем новый stage
      }
      handleSubmitSnackbar(isEditMode ? 'Этап успешно отредактирован' : 'Этап успешно создан');
      handleClose(); // Закрываем модалку
    } catch (error) {
      console.error('Ошибка при сохранении:', error);
    }
  };

  console.log(localStage,'localstage')
  return (
      <Modal handleClose={() => handleClose()} handleSubmit={() => handleSubmit()} size={'lg'}>
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
                  options={useStageStatuses()}
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
                  type={'money'}
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
                  onChange={({ target }) => handleChange('taskDescription', target.value)}
                  name="taskDescription"
                  value={stage.taskDescription || ''}
                  edited={true}
                  className={styles.textarea}
                  label="Задача"
                  rows={14}
              />
            </div>
          </div>
        </div>
      </Modal>
  );
};

export default EditStage