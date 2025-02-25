import React, { useEffect, useMemo, useState } from 'react';
import { observer } from 'mobx-react';
import styles from './index.module.sass';
import cn from 'classnames';
import { useParams } from 'react-router-dom';
import {businessTypes, businessTypesRu} from "../../calendar.types";
import FormValidatedModal from "../../../../shared/Modal/FormModal";
import ConfirmationModal from "../../../../components/ConfirmationModal";
import TextInput from "../../../../shared/TextInput";
import Dropdown from "../../../../shared/Dropdown/Default";
import Comments from "../../../../components/Comments";
import useStore from "../../../../hooks/useStore";
import useCalendarApi from "../../calendar.api";
import {handleSubmit as handleSubmitSnackbar} from "../../../../utils/snackbar";
import TypeSelector from "./TypeSelector";
import Icon from "../../../../shared/Icon";
import Calendar from "../../../../shared/Datepicker";
import ValuesSelector from "../../../../shared/Selector";
import useMembers from "../../../Members/hooks/useMembers";
import TimeDropdown from "../../../../components/TimeDropdown";
import Loader from "../../../../shared/Loader";
import TextLink from "../../../../shared/Table/TextLink";

const Index = observer(({
                                        businessId,
                                        onClose,
                                    }) => {
    const { calendarStore } = useStore();
    const api = useCalendarApi();
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(!!businessId);
    const [comments, setComments] = useState([]);
    const [isCommentsLoading, setIsCommentsLoading] = useState(false);

    const { members } = useMembers();




    // Initial state for a new business item
    const [localBusiness,setLocalBusiness] = useState({
        title: '',
        description: '',
        type: businessTypes.business,
        participants: [],
        client: null,
        startDate: null,
        endDate: new Date(),
        startTime: null,
        endTime: null,
        responsible: null,
        service: null,
        reminders: [],
    });

    // Determine the business data - either from store or initial state
    const business = useMemo(() => {
        if (isEditMode && businessId) {
            return calendarStore.getById(businessId)
        }
        return localBusiness
    }, [isEditMode, businessId, localBusiness,calendarStore.drafts]);

    const [selectedType, setSelectedType] = useState(isEditMode && businessId
        ? calendarStore.getById(businessId)?.type || businessTypes.business
        : localBusiness.type || businessTypes.business);

    // Effect to set edit mode
    useEffect(() => {
        setIsEditMode(!!businessId);
    }, [businessId]);

    useEffect(() => {
        if (business && business.type) {
            setSelectedType(business.type);
        }
    }, [business?.type]);

    useEffect(() => {
        const loadComments = async () => {
            setIsCommentsLoading(true);
            try {
                const commentsData = await api.getBusinessComments(businessId);
                debugger
                setComments(commentsData);
            } catch (error) {
                console.error('Error loading comments:', error);
            } finally {
                setIsCommentsLoading(false);
            }
        };
        if (isEditMode && businessId) {
            loadComments();
        }
    }, [isEditMode, businessId]);

    const handleAddComment = async (text) => {
        if (!text.trim()) return;

        try {
            const newComment = await api.addBusinessComment(businessId, text);
            debugger
            setComments((prev) => [...prev, newComment]);
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };
    const handleRemoveComment = (commentId) => {
        // Удаляем комментарий локально
        setComments((prev) => {
            const updatedComments = { ...prev };
            delete updatedComments[commentId];
            return updatedComments;
        });
    };

    const handleCommentChange = (key, value) => {
        setComments(prevComments => ({
            ...prevComments,
            [key.replace(`businesses.${businessId}.comments.`, '')]: value
        }));
    };

    // Handle changes to business item
    const handleChange = (name, value, withId = true) => {
        // Обработка специальных случаев для дат и времени
        if (name === 'startTime' && business.startDate) {
            // Если меняем startTime и у нас есть startDate, обновим время в startDate
            const dateWithTime = new Date(business.startDate);
            const [hours, minutes] = value.split(':').map(Number);
            dateWithTime.setHours(hours, minutes, 0);

            // Обновляем состояние
            if (isEditMode) {
                calendarStore.changeById(businessId, 'startDate', dateWithTime, withId);
                calendarStore.changeById(businessId, name, value, withId);
            } else {
                setLocalBusiness((prev) => ({
                    ...prev,
                    startDate: dateWithTime,
                    [name]: value
                }));
            }
            return;
        }

        if (name === 'endTime' && business.endDate) {
            // Если меняем endTime и у нас есть endDate, обновим время в endDate
            const dateWithTime = new Date(business.endDate);
            const [hours, minutes] = value.split(':').map(Number);
            dateWithTime.setHours(hours, minutes, 0);

            // Обновляем состояние
            if (isEditMode) {
                calendarStore.changeById(businessId, 'endDate', dateWithTime, withId);
                calendarStore.changeById(businessId, name, value, withId);
            } else {
                setLocalBusiness((prev) => ({
                    ...prev,
                    endDate: dateWithTime,
                    [name]: value
                }));
            }
            return;
        }

        // Стандартная обработка других полей
        if (isEditMode) {
            calendarStore.changeById(businessId, name, value, withId);
        } else {
            setLocalBusiness((prev) => ({
                ...prev,
                [name]: value
            }));
        }
    };

    // Handle form submission
    const handleSubmit = async (onError=null) => {
        try {
            if (isEditMode) {
                // Update existing business item
                await api.updateBusiness(businessId, business);
                calendarStore.submitDraft(businessId);
            } else {
                // Create new business item
                await api.createBusiness(business);
                // TODO: Handle new business creation in store
            }
            handleSubmitSnackbar(
                isEditMode
                    ? 'Дело успешно отредактирована'
                    : 'Дело успешно создана',
            );
            onClose();
        } catch (error) {
            console.error('Error saving business:', error);
            onError && onError()
        }
    };

    // Handle form reset/cancel
    const handleReset = () => {
        if (isEditMode) {
            calendarStore.resetDraft(businessId);
        }
        onClose();
    };

    // Handle business deletion
    const handleDeleteBusiness = async () => {
        try {
            await api.deleteBusiness(businessId);
            // TODO: Handle deletion in store
            onClose();
        } catch (error) {
            console.error('Error deleting business:', error);
        }
    };
    debugger
    business.performer = Array.isArray(business.performer) ? business.performer : [business.performer];
    // const serviceClient = service?.client ?? props?.client ?? null;

    return (
        <>
           <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteBusiness}
        label="Вы уверены, что хотите удалить дело?"
      />

            <FormValidatedModal
                handleClose={handleReset}
                handleSubmit={handleSubmit}
                customButtons={isEditMode && (
                    <div className={styles.addButtons}>
                        <DeleteButton handleDelete={() => setIsDeleteModalOpen(true)} />
                    </div>
                )}
                size={'md_up'}
            >
                <div className={styles.name}>
                    {isEditMode ? 'Редактирование дела' : 'Создание дела'}
                </div>
                <div className={styles.gridContainer}>
                    <div className={styles.border_container}>
                <TextInput
                    required={true}
                    name={'name'}
                    value={business.name}
                    onChange={({ target }) => handleChange(target.name, target.value)}
                    label={'Название'}
                    className={styles.input}
                />

                <TextInput
                    name={'description'}
                    value={business.description}
                    onChange={({ target }) => handleChange(target.name, target.value)}
                    label={'Описание'}
                    rows={4}
                    className={styles.input}
                />



                {/*<div className={cn(styles.flex, styles.lowZIndex)}>*/}
                {/*    <Dropdown*/}
                {/*        required={true}*/}
                {/*        name={'type'}*/}
                {/*        label={'Тип дела'}*/}
                {/*        options={Object.keys(businessTypes)}*/}
                {/*        renderOption={(opt) => businessTypesRu[opt]}*/}
                {/*        renderValue={(value) => businessTypesRu[value]}*/}
                {/*        setValue={(e) => handleChange('type', e)}*/}
                {/*        value={business.type}*/}
                {/*        className={styles.dropdown}*/}
                {/*    />*/}

                {/*    /!* Participants Dropdown *!/*/}
                {/*    /!* TODO: Implement participants selection *!/*/}
                {/*</div>*/}
                <div className={styles.flex}>
                    {/*<ValuesSelector*/}
                    {/*    minInputLength={4}*/}
                    {/*    // readonly={props?.client || isEditMode}*/}
                    {/*    placeholder={'Клиент'}*/}
                    {/*    name={'client'}*/}
                    {/*    onChange={(e) => {*/}
                    {/*        handleChange(*/}
                    {/*            'client',*/}
                    {/*            e.length*/}
                    {/*                ? appStore?.companies.find((el) => el?.id === e[0]?.value)*/}
                    {/*                : null,*/}
                    {/*        );*/}
                    {/*    }}*/}
                    {/*    isMulti={false}*/}
                    {/*    label={*/}
                    {/*        <div className={styles.client_label}>*/}
                    {/*            <span>Клиент</span>*/}
                    {/*            {!props.client && <TextLink>Создать клиента</TextLink>}*/}
                    {/*        </div>*/}
                    {/*    }*/}
                    {/*    isAsync*/}
                    {/*    asyncSearch={async (query) => {*/}
                    {/*        const response = await appApi.getCompanies(query);*/}
                    {/*        const data = response;*/}
                    {/*        return data.map((item) => ({*/}
                    {/*            value: item?.id,*/}
                    {/*            label: item?.name,*/}
                    {/*        }));*/}
                    {/*    }}*/}
                    {/*    value={*/}
                    {/*        serviceClient*/}
                    {/*            ? {*/}
                    {/*                value: serviceClient.id,*/}
                    {/*                label: serviceClient?.name ?? serviceClient?.title ?? '',*/}
                    {/*            }*/}
                    {/*            : null*/}
                    {/*    }*/}
                    {/*/>*/}
                </div>
                <div className={cn(styles.flex, styles.addZIndex)}>
                    <Calendar
                        required={true}
                        name={'startDate'}
                        label={'Дата'}
                        value={business.startDate}
                        onChange={(date) => {
                            // Обновляем startDate
                            handleChange('startDate', date);

                            // Синхронно обновляем endDate сохраняя то же число
                            if (business.endDate) {
                                const newEndDate = new Date(date);
                                // Сохраняем время из существующей endDate если оно есть
                                if (business.endDate instanceof Date) {
                                    newEndDate.setHours(
                                        business.endDate.getHours(),
                                        business.endDate.getMinutes(),
                                        business.endDate.getSeconds()
                                    );
                                }
                                handleChange('endDate', newEndDate);
                            }
                        }}
                    />

                    {/* Time input */}
                    {/*<TextInput*/}
                    {/*    name={'time'}*/}
                    {/*    value={business.time}*/}
                    {/*    onChange={({ target }) => handleChange(target.name, target.value)}*/}
                    {/*    label={'Время'}*/}
                    {/*    type={'time'}*/}
                    {/*    className={styles.input}*/}
                    {/*/>*/}
                    <div className={styles.fake} style={{width:'10%'}}/>
                    <div className={styles.flex}>
                        <div className={styles.timeDropdownCont}>
                            <span>С</span>
                    <TimeDropdown
                        className={styles.timeDropdown}
                        label={' '}
                        disabled={!business.startDate}
                        onChange={( value) => handleChange('startTime',value)}
                        small={true}
                        value={business.startTime}
                        validationRules={{allowAnyMinute: true}}
                    />
                        </div>
                        <div className={styles.timeDropdownCont}>
                            <span>До</span>
                    <TimeDropdown
                        className={styles.timeDropdown}
                        label={'  '}
                        disabled={!business.startTime}
                        onChange={( value) => handleChange('endTime',value)}
                        small={true}
                        value={business.endTime}
                        validationRules={{allowAnyMinute: true}}
                    />
                        </div>
                    </div>
                </div>
                    <div className={cn(styles.lowZIndex)}>
                        {/*<ValuesSelector*/}
                        {/*    required={true}*/}
                        {/*    onChange={(e) => {*/}
                        {/*        handleChange(*/}
                        {/*            'performer',*/}
                        {/*            e.length*/}
                        {/*                ? members.filter((member) =>*/}
                        {/*                    e.some((option) => option.value === member.id),*/}
                        {/*                )*/}
                        {/*                : [],*/}
                        {/*        );*/}
                        {/*    }}*/}
                        {/*    isMulti={false}*/}
                        {/*    label="Ответственный"*/}
                        {/*    options={members.map((el) => ({*/}
                        {/*        value: el.id,*/}
                        {/*        label: `${el?.surname ?? el?.lastName ?? ''} ${el?.name ?? ''} ${el?.middleName ?? ''}`,*/}
                        {/*    }))}*/}
                        {/*    value={*/}
                        {/*        // initialResponsibles && initialResponsibles[0]*/}
                        {/*        business?.performer ? business?.performer.map((el) => ({*/}
                        {/*                value: el?.id ?? null,*/}
                        {/*                label: `${el?.surname ?? el?.lastName ?? ''} ${el?.name ?? ''} ${el?.middleName ?? ''}`,*/}
                        {/*            }))[0]*/}
                        {/*            : []*/}
                        {/*    }*/}
                        {/*/>*/}
                    </div>

                {/* Responsible person Dropdown */}
                {/* TODO: Implement responsible person selection */}

                {/* Reminders section */}
                <div className={styles.reminders}>
                    {/* TODO: Implement reminders functionality */}
                    {/*<div onClick={() => /!* Add reminder *!/}>*/}
                    {/*    + Добавить напоминание*/}
                    {/*</div>*/}
                </div>
                    </div>



                    {isEditMode && (
                        <div className={styles.comments}>
                            {isCommentsLoading ? (
                                <Loader/>
                            ) : (
                                <Comments
                                    comments={comments}
                                    onDelete={handleRemoveComment}
                                    onChange={handleCommentChange}
                                    entityId={businessId}
                                    belongsTo={'businesses'}
                                    isLoading={isCommentsLoading}
                                />
                            )}
                        </div>
                    )}

                    <TypeSelector
                        className={styles.itemType}
                        selectedType={selectedType}
                        onTypeSelect={(type) => {
                            setSelectedType(type);
                            handleChange('type', type);
                        }}
                    />
                </div>
            </FormValidatedModal>
        </>
    );
});

// Delete button component
const DeleteButton = ({ handleDelete }) => {
    return (
        <div className={styles.delete} onClick={handleDelete}>
            <span>Удалить дело</span>
            <Icon name={'close'} size={20} />
        </div>
    );
};

export default Index;