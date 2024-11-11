import React, { useCallback, useMemo, useState, useEffect } from 'react';
import Modal from '../../../../../../shared/Modal';
import styles from './Modal.module.sass';
import TextInput from '../../../../../../shared/TextInput';
import Dropdown from '../../../../../../shared/Dropdown/Default';
import useServiceTypes from '../../../../hooks/useServiceTypes';
import { observer } from 'mobx-react';
import ValuesSelector from '../../../../../../shared/Selector';
import useMembers from '../../../../../Members/hooks/useMembers';
import useServiceStatuses from '../../../../hooks/useServiceStatuses';
import { serviceTypeEnumRu, statusTypesRu } from '../../../../services.types';
import Calendar from '../../../../../../shared/Datepicker';
import useClients from '../../../../../Clients/hooks/useClients';
import useServices from '../../../../hooks/useServices';
import useServiceApi from '../../../../services.api';
import { handleSubmit as handleSubmitSnackbar } from '../../../../../../utils/snackbar';
import TextLink from '../../../../../../shared/Table/TextLink';
import cn from 'classnames';
import useStore from "../../../../../../hooks/useStore";
import useAppApi from "../../../../../../api";

const EditModal = observer(({ serviceId, onClose, ...props }) => {
  const serviceTypes = useServiceTypes();
  const { store: serviceStore } = useServices();
  const {appStore} = useStore()
  const appApi = useAppApi()
  const { members } = useMembers();
  const statuses = useServiceStatuses();
  const {
    data: { clients },
  } = useClients();
  const api = useServiceApi();
  debugger
  const [isEditMode, setIsEditMode] = useState(false);
  const [localService, setLocalService] = useState({
    title: '',
    type: null,
    manager: null,
    command: null,
    status: 'created',
    deadline: null,
    client: props.client ?? null,
    stages: [{ task: { endDate: new Date() } }],
  });

  const service = useMemo(() => {
    return isEditMode ? serviceStore.getById(serviceId) : localService;
  }, [
    isEditMode,
    serviceId,
    serviceStore.services,
    serviceStore.drafts,
    localService,
  ]);

  useEffect(() => {
    if (serviceId) {
      setIsEditMode(true); // Режим редактирования
    } else {
      setIsEditMode(false); // Режим создания
    }
  }, [serviceId]);

  const handleChange = (name, value, withId = true) => {
    if (isEditMode) {
      serviceStore.changeById(serviceId, name, value, withId);
    } else {
      setLocalService((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      if (isEditMode) {
        await api.updateService(serviceId, service); // Обновляем услугу
      } else {
        await api.createService({
          ...localService,
          manager_id: localService.manager?.id ?? 0,
          type: localService.type,
        }); // Создаем новую услугу
      }
      handleSubmitSnackbar(
        isEditMode
          ? 'Услуга успешно отредактирована'
          : 'Услуга успешно создана',
      );
      onClose(); // Закрываем модалку
    } catch (error) {
      console.error('Ошибка при сохранении:', error);
    }
  };
  console.log(serviceTypes, 'serviceTypes');

  const serviceClient = service?.client ?? props?.client ?? null;
    debugger
  const handleReset = () => {
    if (isEditMode) {
      serviceStore.resetDraft(serviceId); // Сброс черновика в режиме редактирования
    }
    onClose(); // Закрытие модалки
  };

  return (
    <Modal handleSubmit={handleSubmit} handleClose={handleReset} size={'md'}>
      <div className={styles.name}>
        {isEditMode ? 'Редактирование услуги' : 'Создание услуги'}
      </div>
      <TextInput
        placeholder={'Название услуги'}
        onChange={({ target }) =>
          handleChange(isEditMode ? 'title' : 'title', target.value)
        }
        name={isEditMode ? 'title' : 'name'}
        value={service?.title || ''}
        edited={true}
        className={styles.input}
        label={'Название услуги'}
      />
      <Dropdown
        setValue={(e) => handleChange(isEditMode ? 'type' : 'type', e[0])}
        classNameContainer={styles.input}
        renderValue={(val) => serviceTypeEnumRu[val]}
        label={'Тип услуги'}
        placeholder={'Тип услуги'}
        value={
          service?.type
            ? serviceTypes?.find((el) => el[0] === service?.type)[0]
            : ''
        }
        renderOption={(opt) => serviceTypeEnumRu[opt[0]]}
        options={serviceTypes}
      />
      <ValuesSelector
        onChange={(e) =>
          handleChange(
            isEditMode ? 'manager' : 'manager',
            e.length ? members.find((el) => el?.id === e[0]?.value) : null,
          )
        }
        isMulti={false}
        label="Ответственный"
        options={members.map((el) => ({
          value: el.id,
          label: `${el.surname} ${el.name} ${el.middleName}`,
        }))}
        value={
          service.manager
            ? {
                value: service.manager?.id,
                label: `${service.manager.surname} ${service.manager.name} ${service.manager.middleName}`,
              }
            : null
        }
      />
      <ValuesSelector
        onChange={(e) =>
          handleChange(
            isEditMode ? 'command' : 'command',
            e.length
              ? members.filter((member) =>
                  e.some((option) => option.value === member.id),
                )
              : [],
          )
        }
        isMulti={true}
        label="Участники"
        options={members.map((el) => ({
          value: el.id,
          label: `${el.surname} ${el.name} ${el.middleName}`,
        }))}
        value={
          service.command
            ? service.command.map((el) => ({
                value: el.id,
                label: `${el.surname} ${el.name} ${el.middleName}`,
              }))
            : []
        }
      />
      <div className={styles.flex}>
        <Dropdown
          setValue={(e) => handleChange(isEditMode ? 'status' : 'status', e[0])}
          classNameContainer={styles.input}
          label={'Статус'}
          value={statusTypesRu[service.status] || ''}
          renderOption={(opt) => opt[1]}
          options={statuses}
        />
        <Calendar
          label={'Дедлайн'}
          value={service?.deadline}
          onChange={(date) =>
            handleChange(isEditMode ? 'deadline' : 'deadline', date)
          }
        />
      </div>
      {/*<ValuesSelector*/}
      {/*  readonly={props?.client || isEditMode}*/}
      {/*  placeholder={'Клиент'}*/}
      {/*  onChange={(e) =>*/}
      {/*    handleChange(*/}
      {/*      isEditMode ? 'client' : 'client',*/}
      {/*      e.length ? clients.find((el) => el.id === e[0]?.value) : null,*/}
      {/*    )*/}
      {/*  }*/}
      {/*  isMulti={false}*/}
      {/*  label={*/}
      {/*    <div className={styles.client_label}>*/}
      {/*      <span>Клиент</span>*/}
      {/*      {!props.client && <TextLink>Создать клиента</TextLink>}*/}
      {/*    </div>*/}
      {/*  }*/}
      {/*  options={clients.map((el) => ({ value: el.id, label: el.title }))}*/}
      {/*  value={*/}
      {/*    serviceClient*/}
      {/*      ? { value: serviceClient.id, label: serviceClient.title }*/}
      {/*      : null*/}
      {/*  }*/}
      {/*/>*/}
        <ValuesSelector
            minInputLength={4}
            readonly={props?.client || isEditMode}
            placeholder={'Клиент'}
            onChange={(e) =>{
                handleChange(
                    'client',
                    e.length ? appStore?.companies.find((el) => el?.id === e[0]?.value) : null,
                )
            }
            }
            isMulti={false}
            label={
                <div className={styles.client_label}>
                    <span>Клиент</span>
                    {!props.client && <TextLink>Создать клиента</TextLink>}
                </div>
            }
            isAsync
            asyncSearch={async (query) => {
                const response = await appApi.getCompanies(query);
                const data = response
                return data.map(item => ({
                    value: item?.id,
                    label: item?.name
                }));
            }}
            value={
                serviceClient
                    ? { value: serviceClient.id, label: serviceClient?.name ?? serviceClient?.title }
                    : null
            }
        />
    </Modal>
  );
});

export default EditModal;
