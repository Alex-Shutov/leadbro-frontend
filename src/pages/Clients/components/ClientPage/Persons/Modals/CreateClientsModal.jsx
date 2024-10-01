import React, { useState } from 'react';
import Modal from '../../../../../../shared/Modal';
import modlaStyles from '../../../ClientsTable/CreateModal/styles.module.sass';
import TextInput from '../../../../../../shared/TextInput';
import styles from '../../../../../Services/components/ServicesTable/components/EditModal/Modal.module.sass';
import cn from 'classnames';
import useClientsApi from '../../../../clients.api';

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
        gender: '',
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
    const handleSubmit = () => {
        console.log(newClient)
        createClient(companyId, newClient);
    };
    return (
        <Modal handleSubmit={handleSubmit} handleClose={handleReset} size={'lg'}>
            <div className={modlaStyles.header}>
                <p>Создание контактного лица</p>
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
                    label={'whatsapp'}
                    placeholder={'whatsapp'}
                />
                <TextInput
                    onChange={({ target }) => handleChange('telegram', target.value)}
                    name={'telegram'}
                    value={newClient.telegram}
                    edited={true}
                    className={cn(styles.input, modlaStyles.grow)}
                    label={'telegram'}
                    placeholder={'telegram'}
                />
            </div>
            <div className={modlaStyles.flexDiv}>
                <TextInput
                    onChange={({ target }) => handleChange('viber', target.value)}
                    name={'viber'}
                    value={newClient.viber}
                    edited={true}
                    className={cn(styles.input, modlaStyles.grow)}
                    label={'viber'}
                    placeholder={'viber'}
                />
                <TextInput
                    onChange={({ target }) => handleChange('email', target.value)}
                    name={'email'}
                    value={newClient.email}
                    edited={true}
                    className={cn(styles.input, modlaStyles.grow)}
                    label={'email'}
                    placeholder={'email'}
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
                    onChange={({ target }) => handleChange('gender', target.value)}
                    name={'gender'}
                    value={newClient.gender}
                    edited={true}
                    className={cn(styles.input, modlaStyles.grow)}
                    label={'Пол'}
                    placeholder={'Пол'}
                />
            </div>
            <div className={modlaStyles.flexDiv}>
                <TextInput
                    onChange={({ target }) => handleChange('name', target.value)}
                    name={'name'}
                    value={newClient.name}
                    edited={true}
                    className={cn(styles.input, modlaStyles.grow)}
                    label={'Имя'}
                    placeholder={'Имя'}
                />
                <TextInput
                    onChange={({ target }) => handleChange('middle_name', target.value)}
                    name={'middle_name'}
                    value={newClient.middle_name}
                    edited={true}
                    className={cn(styles.input, modlaStyles.grow)}
                    label={'Фамилия'}
                    placeholder={'Фамилия'}
                />
            </div>
            <div className={modlaStyles.flexDiv}>
                <TextInput
                    onChange={({ target }) => handleChange('last_name', target.value)}
                    name={'last_name'}
                    value={newClient.last_name}
                    edited={true}
                    className={cn(styles.input, modlaStyles.grow)}
                    label={'Отчество'}
                    placeholder={'Отчество'}
                />
            </div>
        </Modal>
    );
};

export default CreateClientsModal;
