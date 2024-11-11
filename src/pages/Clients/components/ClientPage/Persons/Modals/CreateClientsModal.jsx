import React, { useState } from 'react';
import Modal from '../../../../../../shared/Modal';
import modlaStyles from '../../../ClientsTable/CreateModal/styles.module.sass';
import TextInput from '../../../../../../shared/TextInput';
import styles from '../../../../../Services/components/ServicesTable/components/EditModal/Modal.module.sass';
import cn from 'classnames';
import useClientsApi from '../../../../clients.api';
import { genderType } from '../../../../../Settings/settings.types';
import Radio from '../../../../../../shared/Radio';
import RadioGenderInput from '../../../../../../components/RadioGenderInput';
import { handleSubmit as handleSubmitSnackbar } from '../../../../../../utils/snackbar';

const CreateClientsModal = ({ companyId, onClose }) => {
  const { createClient } = useClientsApi();

  const [newClient, setNewClient] = useState({
    site: '',
    role: '',
    whatsapp: '',
    telegram: '',
    viber: '',
    email: '',
    phone: '',
    gender: genderType.male,
    name: '',
    middle_name: '',
    last_name: '',
  });
  const handleChange = (name, value) => {
    setNewClient((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleReset = () => {
    setNewClient({});
    onClose();
  };
  const handleSubmit = async () => {
    // createClient(companyId, newClient);
    try {
      await createClient(companyId, newClient);
      handleSubmitSnackbar('Контактное лицо создано');
      onClose(); // Закрываем модалку
    } catch (error) {
      console.error('Ошибка при сохранении:', error);
    }
  };
  return (
    <Modal handleSubmit={handleSubmit} handleClose={handleReset} size={'md'}>
      <div className={modlaStyles.header}>
        <p>Создание контактного лица</p>
      </div>
      <div className={modlaStyles.flexDiv}>
        <TextInput
          onChange={({ target }) => handleChange('middle_name', target.value)}
          name={'middle_name'}
          value={newClient.middle_name}
          edited={true}
          className={cn(styles.input, modlaStyles.grow)}
          label={'Фамилия'}
          placeholder={'Фамилия'}
        />
        <TextInput
          onChange={({ target }) => handleChange('name', target.value)}
          name={'name'}
          value={newClient.name}
          edited={true}
          className={cn(styles.input, modlaStyles.grow)}
          label={'Имя'}
          placeholder={'Имя'}
        />
      </div>
      <div className={modlaStyles.flexDiv}></div>
      <div className={modlaStyles.flexDiv}>
        <TextInput
          onChange={({ target }) => handleChange('last_name', target.value)}
          name={'last_name'}
          value={newClient.last_name}
          edited={true}
          className={cn(styles.input)}
          label={'Отчество'}
          placeholder={'Отчество'}
        />
        <RadioGenderInput
          value={newClient.gender}
          onChange={handleChange}
          isEditMode={false}
        />
      </div>
      <div className={modlaStyles.flexDiv}>
        <TextInput
          onChange={({ target }) => handleChange('phone', target.value)}
          name={'phone'}
          value={newClient.phone}
          edited={true}
          className={cn(styles.input, modlaStyles.grow)}
          label={'Телефон'}
          placeholder={'Телефон'}
        />
        <TextInput
          onChange={({ target }) => handleChange('email', target.value)}
          name={'email'}
          value={newClient.email}
          edited={true}
          className={cn(styles.input, modlaStyles.grow)}
          label={'Почта'}
          placeholder={'Почта'}
        />

        {/*<TextInput*/}
        {/*  onChange={({ target }) => handleChange('email', target.value)}*/}
        {/*  name={'email'}*/}
        {/*  value={newClient.email}*/}
        {/*  edited={true}*/}
        {/*  className={cn(styles.input, modlaStyles.grow)}*/}
        {/*  label={'email'}*/}
        {/*  placeholder={'email'}*/}
        {/*/>*/}
      </div>
      <div className={modlaStyles.flexDiv}>
        <TextInput
          onChange={({ target }) => handleChange('site', target.value)}
          name={'site'}
          value={newClient.site}
          edited={true}
          className={cn(styles.input, modlaStyles.grow)}
          label={'Сайт'}
          placeholder={'Сайт'}
        />
        <TextInput
          onChange={({ target }) => handleChange('role', target.value)}
          name={'role'}
          value={newClient.role}
          edited={true}
          className={cn(styles.input, modlaStyles.grow)}
          label={'Должность'}
          placeholder={'Должность'}
        />
      </div>
      <div className={modlaStyles.flexDiv}>
        <TextInput
          onChange={({ target }) => handleChange('whatsapp', target.value)}
          name={'whatsapp'}
          value={newClient.whatsapp}
          edited={true}
          className={cn(styles.input, modlaStyles.grow)}
          label={'Whatsapp'}
          placeholder={'whatsapp'}
        />
        <TextInput
          onChange={({ target }) => handleChange('telegram', target.value)}
          name={'telegram'}
          value={newClient.telegram}
          edited={true}
          className={cn(styles.input, modlaStyles.grow)}
          label={'Telegram'}
          placeholder={'telegram'}
        />
        <TextInput
          onChange={({ target }) => handleChange('viber', target.value)}
          name={'viber'}
          value={newClient.viber}
          edited={true}
          className={cn(styles.input, modlaStyles.grow)}
          label={'Viber'}
          placeholder={'viber'}
        />
      </div>

      <div className={modlaStyles.flexDiv}></div>
    </Modal>
  );
};

export default CreateClientsModal;
