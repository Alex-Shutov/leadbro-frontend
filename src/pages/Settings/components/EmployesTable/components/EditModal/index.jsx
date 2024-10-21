
import useEmployes from "../../../../hooks/useEmployes";
import useEmployesApi from "../../../../api/employes.api";
import {observer} from "mobx-react";
import React, {useEffect, useMemo, useState} from "react";
import {handleSubmit as handleSubmitSnackbar} from "../../../../../../utils/snackbar";
import Modal from "../../../../../../shared/Modal";
import styles from './Modal.module.sass'
import Calendar from "../../../../../../shared/Datepicker";
import useAppApi from "../../../../../../api";
import Dropdown from "../../../../../../shared/Dropdown/Default";
import {useSelectorEmployeePositions} from "../../../../../../hooks/useSelectors";
import TextInput from "../../../../../../shared/TextInput";
import Radio from "../../../../../../shared/Radio";
import {genderType, genderTypeRu} from "../../../../settings.types";
import cn from "classnames";
import {formatDateToBackend} from "../../../../../../utils/formate.date";

const EditModal = observer(({ employeId, onClose }) => {
    const {store:employeStore} = useEmployes();
    const api = useEmployesApi();
    const positions = useSelectorEmployeePositions()
    console.log(positions,'positions')
    const [isEditMode, setIsEditMode] = useState(false);
    const [localEmploye, setlocalEmploye] = useState({
        birthday: '',
        position: {},
        name: '',
        middle_name: '',
        last_name: '',
        email: '',
        phone: '',
        gender:genderType.male,
        password:'',
        confirmPassword:''
    });

    const [errors,setErrors] = useState({
        passwordError:null,
        confirmPasswordError:null
    })

    const employe = useMemo(() => {
        return isEditMode ? employeStore.getById(employeId) : localEmploye;
    }, [isEditMode, employeId, employeStore.services, employeStore.drafts, localEmploye]);

    useEffect(() => {
        if (employeId) {
            setIsEditMode(true); // Режим редактирования
        } else {
            setIsEditMode(false); // Режим создания
        }
    }, [employeId]);

    const handleChange = (name, value, withId = true) => {
        if (isEditMode) {
            employeStore.changeById(employeId, name, value, withId);
        } else {
            setlocalEmploye((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };
    const handleSubmit = async () => {
        try {
            if (isEditMode) {
                await api.updateEmploye(employeId, employe); // Обновляем услугу
            } else {
                await api.createEmploye({
                    ...localEmploye,
                    ['birthday']:formatDateToBackend(localEmploye.birthday)
                }); // Создаем новую услугу
            }
            handleSubmitSnackbar(isEditMode ? 'Услуга успешно отредактирована' : 'Услуга успешно создана');
            onClose(); // Закрываем модалку
        } catch (error) {
            console.error('Ошибка при сохранении:', error);
        }
    };

    const validatePassword = (value) => {
        return value.length >= 4;  // Пароль должен быть не менее 4 символов
    };

    const validateConfirmPassword = (value) => {
        return value === employe.password;  // Пароли должны совпадать
    };



    const handleReset = () => {
        if (isEditMode) {
            employeStore.resetDraft(employeId); // Сброс черновика в режиме редактирования
        }
        onClose(); // Закрытие модалки
    };

    return (
        <Modal closeButton={'Отменить'}  handleSubmit={handleSubmit} handleClose={handleReset} size={'md'}>
            <div className={styles.name}>
                {isEditMode ? 'Редактирование сотрудника' : 'Создание сотрудника'}
            </div>
            <div className={cn(styles.flex,styles.addZIndex)}>
                <Calendar
                    label={'Дата рождения'}
                    name={'birthday'}
                    value={employe.birthday}
                    // readonly={true}
                    className={styles.input}
                    // placeholder={''}
                    onChange={(element) =>
                        handleChange(
                            isEditMode ? 'birthday' : 'birthday',
                            element
                        )
                    }

                />
                <Dropdown
                    setValue={(e) => handleChange(isEditMode ? 'position' : 'position', e)}
                    classNameContainer={styles.input}
                    renderValue={(val) => positions?.find(el => el.id === val)?.name
                    }
                    label={'Должность'}
                    placeholder={'Должность'}
                    value={employe.position.id}
                    renderOption={(opt) => opt.name}
                    options={positions}
                />

            </div>
            <div className={cn(styles.flex, styles.lowZIndex)}>
                <TextInput
                    placeholder={'Фамилия'}
                    onChange={({target}) =>
                        handleChange(
                            isEditMode ? 'lastName' : 'last_name',
                            target.value
                        )
                    }
                    name={isEditMode ? 'lastName' : 'last_name'}
                    value={isEditMode ? employe.lastName : employe.last_name}
                    edited={true}
                    className={styles.input}
                    label={'Фамилия'}
                />
                <TextInput
                    placeholder={'Имя'}
                    onChange={({target}) =>
                        handleChange(
                            isEditMode ? 'name' : 'name',
                            target.value
                        )
                    }
                    name={isEditMode ? 'name' : 'name'}
                    value={employe?.name || ''}
                    edited={true}
                    className={styles.input}
                    label={'Имя'}
                />
            </div>
            <div className={styles.flex}>
                <TextInput
                    placeholder={'Отчество'}
                    onChange={({target}) =>
                        handleChange(
                            isEditMode ? 'middleName' : 'middle_name',
                            target.value
                        )
                    }
                    name={isEditMode ? 'middleName' : 'middle_name'}
                    value={isEditMode ? employe.middleName : employe.middle_name}
                    edited={true}
                    className={styles.input}
                    label={'Отчество'}
                />
                <div className={styles.radio_container}>
                    <label>Пол</label>
                    <div className={styles.radio_buttons}>
                        <Radio content={'Муж'} onChange={({target}) =>
                            handleChange(
                                isEditMode ? 'gender' : 'gender',
                                genderType.male
                            )
                        } name={'gender'} value={employe.gender === genderType.male || employe.gender === null}/>
                        <Radio content={'Жен'} onChange={({target}) =>
                            handleChange(
                                isEditMode ? 'gender' : 'gender',
                                genderType.female
                            )
                        } name={'gender'} value={employe.gender === genderType.female}/>
                    </div>
                </div>
            </div>
            <div className={styles.flex}>
                <TextInput
                    placeholder={'Почта'}
                    onChange={({target}) =>
                        handleChange(
                            isEditMode ? 'email' : 'email',
                            target.value
                        )
                    }
                    name={isEditMode ? 'email' : 'email'}
                    value={isEditMode ? employe.email : employe.email}
                    edited={true}
                    type={'email'}
                    className={styles.input}
                    label={'Почта'}
                />
                <TextInput
                    placeholder={'Телефон'}
                    onChange={({target}) =>
                        handleChange(
                            isEditMode ? 'phone' : 'phone',
                            target.value
                        )
                    }
                    name={isEditMode ? 'phone' : 'phone'}
                    value={isEditMode ? employe.phone : employe.phone}
                    edited={true}
                    type={'tel'}
                    className={styles.input}
                    label={'Телефон'}
                />
            </div>
            {!isEditMode && <div className={styles.flex}>
                <TextInput
                    placeholder={'Новый пароль'}
                    onChange={(e => {
                        console.log('target',e)
                        handleChange(
                            isEditMode ? 'password' : 'password',
                            e.target.value
                        )

                    })}
                    name={isEditMode ? 'password' : 'password'}
                    value={isEditMode ? employe.password : employe.password}
                    edited={true}
                    className={cn(styles.input, errors.passwordError && styles.errorInput)}
                    label={'Новый пароль'}
                    validate={validatePassword}
                /><TextInput
                placeholder={'Повторите пароль'}
                onChange={({target}) =>{
                    handleChange(
                        isEditMode ? 'confirmPassword' : 'confirmPassword',
                        target.value
                    )
                }
                }
                name={isEditMode ? 'confirmPassword' : 'confirmPassword'}
                value={isEditMode ? employe.confirmPassword : employe.confirmPassword}
                edited={true}
                className={cn(styles.input, errors.confirmPasswordError && styles.errorInput)}
                label={'Повторите пароль'}
                validate={validateConfirmPassword}
            />
            </div>}


            {/*<ValuesSelector*/}
            {/*    onChange={(e) =>*/}
            {/*        handleChange(*/}
            {/*            isEditMode ? 'manager' : 'manager',*/}
            {/*            e.length ? members.find((el) => el?.id === e[0]?.value) : null,*/}
            {/*        )*/}
            {/*    }*/}
            {/*    isMulti={false}*/}
            {/*    label="Ответственный"*/}
            {/*    options={members.map((el) => ({*/}
            {/*        value: el.id,*/}
            {/*        label: `${el.surname} ${el.name} ${el.middleName}`,*/}
            {/*    }))}*/}
            {/*    value={*/}
            {/*        service.manager*/}
            {/*            ? {*/}
            {/*                value: service.manager?.id,*/}
            {/*                label: `${service.manager.surname} ${service.manager.name} ${service.manager.middleName}`,*/}
            {/*            }*/}
            {/*            : null*/}
            {/*    }*/}
            {/*/>*/}
            {/*<ValuesSelector*/}
            {/*    onChange={(e) =>*/}
            {/*        handleChange(*/}
            {/*            isEditMode ? 'command' : 'command',*/}
            {/*            e.length*/}
            {/*                ? members.filter((member) =>*/}
            {/*                    e.some((option) => option.value === member.id),*/}
            {/*                )*/}
            {/*                : []*/}
            {/*        )*/}
            {/*    }*/}
            {/*    isMulti={true}*/}
            {/*    label="Участники"*/}
            {/*    options={members.map((el) => ({*/}
            {/*        value: el.id,*/}
            {/*        label: `${el.surname} ${el.name} ${el.middleName}`,*/}
            {/*    }))}*/}
            {/*    value={*/}
            {/*        service.command*/}
            {/*            ? service.command.map((el) => ({*/}
            {/*                value: el.id,*/}
            {/*                label: `${el.surname} ${el.name} ${el.middleName}`,*/}
            {/*            }))*/}
            {/*            : []*/}
            {/*    }*/}
            {/*/>*/}
            {/*<div className={styles.flex}>*/}
            {/*    <Dropdown*/}
            {/*        setValue={(e) => handleChange(isEditMode ? 'status' : 'status', e[0])}*/}
            {/*        classNameContainer={styles.input}*/}
            {/*        label={'Статус'}*/}
            {/*        value={statusTypesRu[service.status] || ''}*/}
            {/*        renderOption={(opt) => opt[1]}*/}
            {/*        options={statuses}*/}
            {/*    />*/}
            {/*    <Calendar*/}
            {/*        label={'Дедлайн'}*/}
            {/*        value={service?.deadline}*/}
            {/*        onChange={(date) => handleChange(isEditMode ? 'deadline' : 'deadline', date)}*/}
            {/*    />*/}
            {/*</div>*/}
            {/*<ValuesSelector*/}
            {/*    placeholder={'Клиент'}*/}
            {/*    onChange={(e) =>*/}
            {/*        handleChange(*/}
            {/*            isEditMode ? 'client' : 'client',*/}
            {/*            e.length ? clients.find((el) => el.id === e[0]?.value) : null,*/}
            {/*        )*/}
            {/*    }*/}
            {/*    isMulti={false}*/}
            {/*    label={*/}
            {/*        <div className={styles.client_label}>*/}
            {/*            Клиент<TextLink>Создать клиента</TextLink>*/}
            {/*        </div>*/}
            {/*    }*/}
            {/*    options={clients.map((el) => ({ value: el.id, label: el.title }))}*/}
            {/*    value={*/}
            {/*        service.client*/}
            {/*            ? { value: service.client.id, label: service.client.title }*/}
            {/*            : null*/}
            {/*    }*/}
            {/*/>*/}
        </Modal>
    );
});

export default EditModal
