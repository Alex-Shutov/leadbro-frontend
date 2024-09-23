import React, { useEffect, useMemo, useState } from 'react';
import Modal from '../../../../../shared/Modal';
import styles from '../../../../Services/components/ServicesTable/components/EditModal/Modal.module.sass';
import modlaStyles from './styles.module.sass';
import TextInput from '../../../../../shared/TextInput';
import ResponsibleInput from '../../../../../shared/Input/ResponsibleInput';
import useStore from '../../../../../hooks/useStore';
import { observer } from 'mobx-react';
import ValuesSelector from '../../../../../shared/Selector';
import useMembers from '../../../../Members/hooks/useMembers';
import cn from 'classnames';
import useClientsApi from '../../../clients.api';

const Index = observer(({ clientId, onClose, onSubmit }) => {
  const { clientsStore } = useStore(); // Подключение к MobX Store
  const { createCompany, updateCompany } = useClientsApi();
  const [isEditMode, setIsEditMode] = useState(false);
  const { members } = useMembers();

  // Локальное состояние для создания нового клиента
  const [localClient, setLocalClient] = useState({
    title: '',
    address: '',
    status: 'partner',
    tel: '',
    email: '',
    site: '',
    requisites: '',
    description: '',
    manager: null,
  });
  const [mappedResponsibles, setMappedResponsibles] = useState([]);

  const client = useMemo(() => {
    // Если режим редактирования — берем клиента из store
    return isEditMode ? clientsStore.getById(clientId) : localClient;
  }, [
    isEditMode,
    clientId,
    clientsStore.clients,
    localClient,
    clientsStore.drafts,
  ]);
  // При изменении clientId определяем режим работы
  useEffect(() => {
    if (clientId) {
      setIsEditMode(true); // Режим редактирования
    } else {
      setIsEditMode(false); // Режим создания
    }
  }, [clientId]);

  // Обработчик изменений полей
  const handleChange = (name, value, withId = true) => {
    if (isEditMode) {
      // Если режим редактирования — меняем через MobX store
      clientsStore.changeById(clientId, name, value, withId);
    } else {
      // Если режим создания — меняем в локальном состоянии
      setLocalClient((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Обработчик сохранения
  const handleSubmit = async () => {
    try {
      if (isEditMode) {
        await updateCompany(clientId, client); // Обновляем компанию
      } else {
        await createCompany({
          ...localClient,
          manager_id: localClient?.manager?.id ?? 0,
          phone: localClient.tel,
          name: localClient.title,
        }); // Создаём новую компанию
      }
      onClose(); // Закрываем модалку
    } catch (error) {
      console.error('Ошибка при сохранении:', error);
    }
  };

  // Обработчик сброса
  const handleReset = () => {
    if (isEditMode) {
      clientsStore.resetDraft(clientId); // Сброс черновика в режиме редактирования
    }
    onClose(); // Закрытие модалки
  };

  const mapValuesForInput = (values) => {
    if (Array.isArray(values)) {
      return values.map((el, index) => ({
        value: el.id !== null ? el.id : index,
        label: el.id !== null ? `${el.surname} ${el.name}` : el.fio,
      }));
    }
    return [];
  };

  useEffect(() => {
    if (client?.manager) {
      setMappedResponsibles(mapValuesForInput([client.manager]));
    }
  }, [client?.manager]);

  return (
    client && (
      <Modal handleSubmit={handleSubmit} handleClose={handleReset} size={'md'}>
        <div className={modlaStyles.header}>
          <p>{isEditMode ? 'Редактирование клиента' : 'Создание клиента'}</p>
        </div>
        <TextInput
          onChange={({ target }) => handleChange('title', target.value)}
          name={'title'}
          value={client?.title || ''}
          edited={true}
          className={styles.input}
          label={'Название'}
          placeholder={'ООО «Компания»'}
          required
        />
        <div className={modlaStyles.flexDiv}>
          <TextInput
            onChange={({ target }) =>
              handleChange(
                isEditMode ? 'contactData.tel.0' : 'tel',
                target.value,
              )
            }
            name={isEditMode ? 'contactData.tel.0' : 'tel'}
            value={isEditMode ? client?.contactData?.tel[0] || '' : client.tel}
            edited={true}
            className={cn(styles.input, modlaStyles.grow)}
            label={'Телефон'}
            placeholder={'+79999999999'}
          />
          <TextInput
            onChange={({ target }) =>
              handleChange(
                isEditMode ? 'contactData.email.0' : 'email',
                target.value,
              )
            }
            name={'contactData.email.0'}
            value={
              isEditMode ? client?.contactData?.email[0] || '' : client.email
            }
            edited={true}
            className={cn(styles.input, modlaStyles.grow)}
            label={'Почта'}
            placeholder={'email@example.ru'}
          />
        </div>
        <TextInput
          placeholder={'Страна, регион, город, адрес'}
          onChange={({ target }) =>
            handleChange(
              isEditMode ? 'contactData.address.0' : 'address',
              target.value,
            )
          }
          name={'contactData.address.0'}
          value={
            isEditMode ? client?.contactData?.address[0] || '' : client.address
          }
          edited={true}
          className={styles.input}
          label={'Адрес'}
        />
        <ValuesSelector
          onChange={(e) =>
            handleChange(
              'manager',
              e.length
                ? members.filter((member) =>
                    e.some((option) => option.value === member.id),
                  )[0]
                : null,
            )
          }
          isMulti={false}
          placeholder={'Выберите ответственного'}
          label="Ответственный"
          options={members.map((el) => ({
            value: el.id,
            label: `${el.name} ${el.surname}`,
          }))}
          value={
            client?.manager?.id != null
              ? {
                  value: client?.manager?.id,
                  label: `${client?.manager?.name} ${client?.manager?.surname}`,
                }
              : null
          }
        />
        <TextInput
          onChange={({ target }) => handleChange('description', target.value)}
          name={'description'}
          value={client?.description || ''}
          edited={true}
          className={styles.input}
          label={'Описание'}
          placeholder={'Введите описание клиента'}
        />
        <TextInput
          onChange={({ target }) =>
            handleChange(
              isEditMode ? 'contactData.site.0' : 'site',
              target.value,
            )
          }
          name={'contactData.site.0'}
          value={isEditMode ? client?.contactData?.site[0] || '' : client.site}
          edited={true}
          className={styles.input}
          label={'Сайт'}
          placeholder={'Введите сайт'}
        />
      </Modal>
    )
  );
});

export default Index;
