import React, { useEffect, useState } from 'react';
import ResponsibleInput from '../../../../../../../../../../shared/Input/ResponsibleInput';
import TextInput from '../../../../../../../../../../shared/TextInput';
import styles from '../../../../../../../../../Services/components/ServicesTable/components/EditModal/Modal.module.sass';
import {
  formatDate,
  formatDateWithOnlyDigits,
} from '../../../../../../../../../../utils/formate.date';
import { convertToHours } from '../../../../../../../../../../utils/format.time';
import Switch from '../../../../../../../../../../shared/Switch';
import Dropdown from '../../../../../../../../../../shared/Dropdown/Default';
import Calendar from '../../../../../../../../../../shared/Datepicker';
import ValuesSelector from '../../../../../../../../../../shared/Selector';
import useMembers from '../../../../../../../../../Members/hooks/useMembers';
import { tasksTypesRu } from '../../../../../../../../../Tasks/tasks.types';

const Index = ({
  data: {
    auditors: initialAuditors,
    executors: initialExecutors,
    responsibles: initialResponsibles,
    type,
    showInLK,
    taskLinked,
    deadline,
    deadlineTime,
    actualTime,
  },
  isEditMode,
  types,
  handleChange,
  handleAdd,
  className,
}) => {
  const [mappedAuditors, setMappedAuditors] = useState([]);
  const [mappedExecutors, setMappedExecutors] = useState([]);
  const [mappedResponsibles, setMappedResponsibles] = useState([]);
  const { members } = useMembers();

  debugger;
  // const mapValuesForInput = (values) => {
  //   if (Array.isArray(values)) {
  //     return values.map((el, index) => ({
  //       value: el.id !== null ? el.id : index,
  //       label: el.id !== null ? `${el.surname} ${el.name}` : el.fio,
  //     }));
  //   }
  //   return [];
  // };
  //
  // useEffect(() => {
  //   // setMappedAuditors(mapValuesForInput(initialAuditors));
  //   // setMappedExecutors(mapValuesForInput(initialExecutors));
  //   // setMappedResponsibles(mapValuesForInput(initialResponsibles));
  // }, [initialAuditors, initialExecutors, initialResponsibles]);
  return (
    <div className={className}>
      <TextInput
        label={'Связанная задача'}
        name={'taskLinked'}
        value={taskLinked}
        disabled={isEditMode}
        onChange={({ target }) => handleChange(target.name, target.value)}
        className={styles.input}
      />
      <Dropdown
        // value={selectedService}
        // setValue={handleServiceChange}
        // options={serviceOptions}
        // label="Услуга"
        renderOption={(opt) => tasksTypesRu[opt]}
        label={'Тип задачи'}
        options={types}
        setValue={(e) => handleChange('type', e)}
        value={type}
        renderValue={(value) => tasksTypesRu[value]}
        className={styles.dropdown}
      />
      <Calendar
        onChange={(data) => handleChange('deadline', data)}
        label={'Дедлайн'}
        name={'deadline'}
        value={deadline}
        // value={formatDateWithOnlyDigits(deadline)}
        readonly={true}
        className={styles.input}
      />
      <ValuesSelector
        onChange={(e) => {
          handleChange(
            'responsibles',
            e.length
              ? members.filter((member) =>
                  e.some((option) => option.value === member.id),
                )
              : [],
          );
        }}
        isMulti={false}
        label="Ответственный"
        options={members.map((el) => ({
          value: el.id,
          label: `${el?.surname ?? ''} ${el?.name ?? ''} ${el?.middleName ?? ''}`,
        }))}
        value={
          initialResponsibles && initialResponsibles[0]
            ? initialResponsibles.map((el) => ({
                value: el?.id ?? null,
                label: `${el?.surname ?? ''} ${el?.name ?? ''} ${el?.middleName ?? ''}`,
              }))
            : []
        }
      />
      {/*<ResponsibleInput*/}
      {/*  canAdd={false}*/}
      {/*  max={1}*/}
      {/*  onAdd={(name) =>*/}
      {/*    handleAdd(name, { fio: '', id: initialResponsibles.length })*/}
      {/*  }*/}
      {/*  onChange={(name, value) => handleChange(`${name}.fio`, value)}*/}
      {/*  name={'responsibles'}*/}
      {/*  label={'Ответственный'}*/}
      {/*  values={mappedResponsibles}*/}
      {/*/>*/}
      <ValuesSelector
        onChange={(e) =>
          handleChange(
            'auditors',
            e.length
              ? members.filter((member) =>
                  e.some((option) => option.value === member.id),
                )
              : [],
          )
        }
        isMulti={true}
        label="Аудиторы"
        options={members.map((el) => ({
          value: el.id,
          label: `${el?.surname ?? ''} ${el?.name ?? ''} ${el?.middleName ?? ''}`,
        }))}
        value={
          initialAuditors
            ? initialAuditors.map((el) => ({
                value: el.id,
                label: `${el?.surname ?? ''} ${el?.name ?? ''} ${el?.middleName ?? ''}`,
              }))
            : []
        }
      />
      <TextInput
        label={'Плановое время, ч'}
        name={'deadlineTime'}
        type={'number'}
        value={convertToHours(deadlineTime)}
        disabled={isEditMode}
        onChange={({ target }) => handleChange(target.name, target.value)}
        className={styles.input}
      />
      <TextInput
        type={'number'}
        label={'Фактическое время, ч'}
        name={'actualTime'}
        onChange={({ target }) => handleChange(target.name, target.value)}
        value={convertToHours(actualTime)}
        disabled={isEditMode}
        className={styles.input}
      />

      <ValuesSelector
        onChange={(e) =>
          handleChange(
            'executors',
            e.length
              ? members.filter((member) =>
                  e.some((option) => option.value === member.id),
                )
              : [],
          )
        }
        isMulti={false}
        label="Исполнитель"
        options={members.map((el) => ({
          value: el.id,
          label: `${el?.surname ?? ''} ${el?.name ?? ''} ${el?.middleName ?? ''}`,
        }))}
        value={
          initialExecutors
            ? initialExecutors.map((el) => ({
                value: el.id,
                label: `${el?.surname ?? ''} ${el?.name ?? ''} ${el?.middleName ?? ''}`,
              }))
            : []
        }
      />
      <Switch
        className={styles.switch}
        name={'showInLK'}
        label={'Показать в личном кабинете'}
        value={showInLK}
        onChange={(name, value) => handleChange(name, value)}
      />
    </div>
  );
};

export default Index;
