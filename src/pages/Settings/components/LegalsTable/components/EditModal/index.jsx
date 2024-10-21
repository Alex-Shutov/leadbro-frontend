import React, { useEffect, useMemo, useState } from 'react';
import { observer } from 'mobx-react';
import { handleSubmit as handleSubmitSnackbar } from '../../../../../../utils/snackbar';
import Modal from '../../../../../../shared/Modal';
import TextInput from '../../../../../../shared/TextInput';
import styles from './Modal.module.sass';
import cn from 'classnames';
import { formatDateToBackend } from '../../../../../../utils/formate.date';
import useLegals from '../../../../hooks/useLegals';
import useLegalsApi from '../../../../api/legals.api';
import {mapChangedFieldsForBackend} from "../../../../../../utils/store.utils";
import {mapSettingsDataToBackend} from "../../../../settings.mapper";
import FileUpload from "../../../../../../shared/FileUpload";

const EditModal = observer(({ legalId, onClose }) => {
    const { store: legalsStore } = useLegals();
    const api = useLegalsApi();
    const [isEditMode, setIsEditMode] = useState(false);
    const [localLegal, setLocalLegal] = useState({
        companyName: '',
        email: '',
        inn: '',
        kpp: '',
        ogrn: '',
        checkingAccount: '',
        correspondentAccount: '',
        bankBic: '',
        bankName: '',
        legalAddress: '',
        realAddress: '',
        postAddress: '',
        certificateOfRegistration: '',
        directorName: '',
        isMainLegalEntity: false,
        signScan: null,
        stampScan: null
    });

    const legal = useMemo(() => {
        return isEditMode ? legalsStore.getById(legalId) : localLegal;
    }, [isEditMode, legalId, legalsStore.services, legalsStore.drafts, localLegal]);

    useEffect(() => {
        if (legalId) {
            setIsEditMode(true);
        } else {
            setIsEditMode(false);
        }
    }, [legalId]);

    const handleChange = (name, value,withId = true) => {
        if (isEditMode) {
            legalsStore.changeById(legalId, name, value,withId);
        } else {
            setLocalLegal((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };



    const handleSubmit = async () => {
        try {
            if (isEditMode) {
                await api.updateLegal(legalId, legal);
            } else {
                await api.createLegal(mapSettingsDataToBackend(localLegal,Object.keys(localLegal)));
            }
            handleSubmitSnackbar(isEditMode ? 'Юр. лицо успешно отредактировано' : 'Юр. лицо успешно создано');
            onClose();
        } catch (error) {
            console.error('Ошибка при сохранении:', error);
        }
    };

    const handleReset = () => {
        if (isEditMode) {
            legalsStore.resetDraft(legalId);
        }
        onClose();
    };

    return (
        <Modal closeButton={'Отменить'} handleSubmit={handleSubmit} handleClose={handleReset} size={'md'}>
            <div className={styles.name}>
                {isEditMode ? 'Редактирование компании' : 'Создание компании'}
            </div>

            <TextInput
                placeholder={'Название предприятия'}
                onChange={({target}) => handleChange('companyName', target.value)}
                value={legal.companyName || ''}
                edited={true}
                className={styles.input}
                label={'Название предприятия'}
            />

            <div className={styles.flex}>
                <TextInput
                    placeholder={'ИНН'}
                    onChange={({target}) => handleChange('inn', target.value)}
                    value={legal.inn || ''}
                    edited={true}
                    className={styles.input}
                    label={'ИНН'}
                />
                <TextInput
                    placeholder={'ОГРН'}
                    onChange={({target}) => handleChange('ogrn', target.value)}
                    value={legal.ogrn || ''}
                    edited={true}
                    className={styles.input}
                    label={'ОГРН'}
                />
            </div>
            <TextInput
                placeholder={'КПП'}
                onChange={({target}) => handleChange('kpp', target.value)}
                value={legal.kpp || ''}
                edited={true}
                className={styles.input}
                label={'КПП'}
            />

            <div className={styles.flex}>
                <TextInput
                    placeholder={'Р/с №'}
                    onChange={({target}) => handleChange('checkingAccount', target.value)}
                    value={legal.checkingAccount || ''}
                    edited={true}
                    className={styles.input}
                    label={'Р/с №'}
                />
                <TextInput
                    placeholder={'Корреспондентский счет'}
                    onChange={({target}) => handleChange('correspondentAccount', target.value)}
                    value={legal.correspondentAccount || ''}
                    edited={true}
                    className={styles.input}
                    label={'Корреспондентский счет'}
                />
            </div>

            <div className={styles.flex}>
                <TextInput
                    placeholder={'БИК'}
                    onChange={({target}) => handleChange('bankBic', target.value)}
                    value={legal.bankBic || ''}
                    edited={true}
                    className={styles.input}
                    label={'БИК'}
                />
                <TextInput
                    placeholder={'Банк'}
                    onChange={({target}) => handleChange('bankName', target.value)}
                    value={legal.bankName || ''}
                    edited={true}
                    className={styles.input}
                    label={'Банк'}
                />
            </div>

            <TextInput
                placeholder={'Юридический адрес'}
                onChange={({target}) => handleChange('legalAddress', target.value)}
                value={legal.legalAddress || ''}
                edited={true}
                className={styles.input}
                label={'Юридический адрес'}
            />

            <TextInput
                placeholder={'Фактический адрес'}
                onChange={({target}) => handleChange('realAddress', target.value)}
                value={legal.realAddress || ''}
                edited={true}
                className={styles.input}
                label={'Фактический адрес'}
            />

            <TextInput
                placeholder={'Почтовый адрес'}
                onChange={({target}) => handleChange('postAddress', target.value)}
                value={legal.postAddress || ''}
                edited={true}
                className={styles.input}
                label={'Почтовый адрес'}
            />

            <TextInput
                placeholder={'Свидетельство о гос. регистрации'}
                onChange={({target}) => handleChange('certificateOfRegistration', target.value)}
                value={legal.certificateOfRegistration || ''}
                edited={true}
                className={styles.input}
                label={'Свидетельство о гос. регистрации'}
            />

            <div className={styles.flex}>
                <TextInput
                    placeholder={'E-mail'}
                    onChange={({target}) => handleChange('email', target.value)}
                    value={legal.email || ''}
                    edited={true}
                    type={'email'}
                    className={styles.input}
                    label={'E-mail'}
                />
                <TextInput
                    placeholder={'Директор'}
                    onChange={({target}) => handleChange('directorName', target.value)}
                    value={legal.directorName || ''}
                    edited={true}
                    className={styles.input}
                    label={'Директор'}
                />
            </div>
            <div className={styles.flex}>
                <FileUpload
                    label="Скан подписи"
                    name="signScan"
                    value={legal.signScan}
                    onChange={handleChange}
                    acceptTypes=".pdf,.png,.jpg"
                />
                <FileUpload
                    label="Скан подписи"
                    name="stampScan"
                    value={legal.stampScan}
                    onChange={handleChange}
                    acceptTypes=".pdf,.png,.jpg"
                />
            </div>

            {/* TODO: Add file upload components for signScan and stampScan */}
        </Modal>
    );
});

export default EditModal;