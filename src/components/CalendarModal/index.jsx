import React, { useEffect, useMemo, useState } from 'react';
import { observer } from 'mobx-react';
import styles from './index.module.sass';
import cn from 'classnames';
import {businessTypes, businessTypesRu} from "../../pages/Calendar/calendar.types";
import FormValidatedModal from "../../shared/Modal/FormModal";
import ConfirmationModal from "../ConfirmationModal";
import TextInput from "../../shared/TextInput";
import Dropdown from "../../shared/Dropdown/Default";
import Comments from "../Comments";
import useStore from "../../hooks/useStore";
import useCalendarApi from "../../pages/Calendar/calendar.api";
import {handleSubmit as handleSubmitSnackbar} from "../../utils/snackbar";
import TypeSelector from "./ui/TypeSelector";
import Icon from "../../shared/Icon";
import Calendar from "../../shared/Datepicker";
import ValuesSelector from "../../shared/Selector";
import useMembers from "../../pages/Members/hooks/useMembers";
import TimeDropdown from "../TimeDropdown";
import Loader from "../../shared/Loader";
import TextLink from "../../shared/Table/TextLink";
import Switch from "../../shared/Switch";

const CalendarModal = observer(({
                                    businessId,
                                    data,
                                    onClose,
                                    // Получаем различные сторы и API как пропсы
                                    // Пропсы для режима работы с календарем

                                    calendarStore,
                                    calendarApi,
                                    // Пропсы для режима работы с клиентами
                                    client,
                                    clientStore,
                                    clientApi,
                                    // Пропсы для режима работы со сделками
                                    deal,
                                    dealStore,
                                    dealApi,
                                    ...rest
                                }) => {
    debugger
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(!!businessId);
    const [comments, setComments] = useState([]);
    const [isCommentsLoading, setIsCommentsLoading] = useState(false);

    const { members } = useMembers();
    const defaultApiHook = useCalendarApi(); // Используем как fallback

    // Определяем текущий режим работы компонента
    const mode = useMemo(() => {
        if (clientStore && client) return 'client';
        if (dealStore && deal) return 'deal';
        return 'calendar';
    }, [calendarStore, clientStore, dealStore]);

    // Initial state for a new business item
    const [localBusiness, setLocalBusiness] = useState({
        name: '',
        description: '',
        type: businessTypes.business,
        participants: [],
        client: null,
        startDate: rest?.startDate ?? null,
        endDate: rest?.endDate ?? new Date(),
        startTime: rest?.startTime ?? null,
        endTime: rest?.endTime ?? null,
        performer: null,
        service: null,
        reminders: [],
    });

    // Получаем контекстные данные в зависимости от режима
    const contextData = useMemo(() => {
        switch (mode) {
            case 'client':
                return {
                    id:client.id,
                    store: clientStore,
                    api: clientApi,
                };
            case 'deal':
                return {
                    store: dealStore,
                    api: dealApi,
                    id:deal.id
                    // afterDelete: () => dealApi.getDealById(businessId),
                    // afterCreate: () => dealApi.getDealById(businessId),
                };
            default:
                return {
                    id:null,
                    store: calendarStore,
                    api: calendarApi
                };
        }
    }, [mode, calendarStore, clientStore, dealStore, businessId]);
    debugger

    // Determine the business data - either from store or initial state
    const business = useMemo(() => {
        if (!isEditMode && !businessId) return localBusiness
        if (mode!=="calendar"){
            const businessFromContext = Object.values( contextData.store.getById(contextData.id)?.businesses).find((el)=>el.id===data?.id)
            if(businessFromContext){
                const newTaskWithTimeTracking = {...businessFromContext,timeTrackings: data.timeTrackings};
                return newTaskWithTimeTracking
            }
        }

        return calendarStore.getById(data?.id??Number(businessId));

    }, [isEditMode, businessId, localBusiness, contextData?.store?.drafts]);

    const [selectedType, setSelectedType] = useState(isEditMode && businessId
        ? business?.type || businessTypes.business
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
            debugger
            setIsCommentsLoading(true);
            try {
                const commentsData = await defaultApiHook.getBusinessComments(businessId);
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
    }, [isEditMode,businessId,contextData.api]);

    const handleAddComment = async (text) => {
        if (!text.trim()) return;

        try {
            const newComment = await contextData.api.addBusinessComment(businessId, text);
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
        debugger
        if (name === 'startTime' && business.startDate) {
            const dateWithTime = new Date(business.startDate);
            const [hours, minutes] = value.split(':').map(Number);
            dateWithTime.setHours(hours, minutes, 0);

            if (isEditMode) {
                contextData.store.changeById(businessId, 'startDate', dateWithTime, withId);
                contextData.store.changeById(businessId, name, value, withId);
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
            const dateWithTime = new Date(business.endDate);
            const [hours, minutes] = value.split(':').map(Number);
            dateWithTime.setHours(hours, minutes, 0);
            debugger
            if (isEditMode) {
                if(mode!=="calendar"){
                    contextData.store.changeById(contextData.id, 'endDate', dateWithTime, withId);
                    contextData.store.changeById(contextData.id, name, value, withId);
                }else{
                    calendarStore.changeById(data.id, 'endDate', dateWithTime, withId);
                    calendarStore.changeById(data.id, name, value, withId);
                }

            } else {
                setLocalBusiness((prev) => ({
                    ...prev,
                    endDate: dateWithTime,
                    [name]: value
                }));
            }
            return;
        }

        if (isEditMode) {
            if(mode!=="calendar"){
                contextData.store.changeById(contextData.id, name, value, withId);

            }else{
                calendarStore.changeById(data.id, name, value, withId);
            }
        } else {
            setLocalBusiness((prev) => ({
                ...prev,
                [name]: value
            }));
        }
    };

    // Handle form submission
    const handleSubmit = async (onError = null) => {
        debugger
        try {
            if (isEditMode) {
                await contextData.api.updateBusiness(businessId, business,contextData.store.changedProps,contextData.id);
                contextData.store.submitDraft && contextData.store.submitDraft(contextData.id);
            } else {
                await contextData.api.createBusiness(business,contextData.id);
            }

            handleSubmitSnackbar(
                isEditMode
                    ? 'Дело успешно отредактировано'
                    : 'Дело успешно создано',
            );

            // Вызываем afterCreate или afterDelete, если они определены
            if (isEditMode && contextData.afterCreate) {
                await contextData.afterCreate();
            }

            onClose();
        } catch (error) {
            console.error('Error saving business:', error);
            onError && onError();
        }
    };

    // Handle form reset/cancel
    const handleReset = () => {
        if (isEditMode && contextData.store.resetDraft) {
            contextData.store.resetDraft(contextData.id);
        }
        onClose();
    };

    // Handle business deletion
    const handleDeleteBusiness = async () => {
        try {
            await contextData.api.deleteBusiness(businessId);

            // Вызываем afterDelete, если он определен
            if (contextData.afterDelete) {
                await contextData.afterDelete();
            }

            onClose();
        } catch (error) {
            console.error('Error deleting business:', error);
        }
    };

    const prefix = useMemo(()=>{
        return mode !== "calendar" && isEditMode ? `businesses.${businessId}.`:''
    },[deal,client,data])

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
                    {isEditMode ? `Редактирование дела` : 'Создание дела'}
                </div>
                <div className={styles.gridContainer}>
                    <div className={styles.border_container}>
                        <TextInput
                            required={true}
                            name={`${prefix}name`}
                            value={business.name}
                            onChange={({ target }) => handleChange(target.name, target.value)}
                            label={'Название'}
                            className={styles.input}
                        />

                        <TextInput
                            name={`${prefix}description`}
                            value={business.description}
                            onChange={({ target }) => handleChange(target.name, target.value)}
                            label={'Описание'}
                            rows={4}
                            className={styles.input}
                        />

                        <div style={{zIndex:50}} className={cn(styles.flex,styles.addZIndex)}>
                            <ValuesSelector
                                name={`${prefix}performer`}
                                required={true}
                                onChange={(e) =>
                                    handleChange(
                                        `${prefix}performer`,
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
                                    label: `${el?.surname ?? el?.lastName ?? ''} ${el?.name ?? ''} ${el?.middleName ?? ''}`,
                                }))}
                                value={
                                    business?.performer?.id != null
                                        ? {
                                            value: business?.performer?.id,
                                            label: `${business?.performer?.surname ?? business?.performer?.lastName ?? ''} ${business?.performer?.name ?? ''} ${business?.performer?.middleName ?? ''}`,
                                        }
                                        : null
                                }
                            />
                        </div>
                        <div className={cn(styles.flex, styles.addZIndex)}>
                            <Calendar
                                required={true}
                                name={`${prefix}startDate`}
                                label={'Дата'}
                                value={business.startDate}
                                onChange={(date) => {
                                    // Обновляем startDate
                                    handleChange(`${prefix}startDate`, date);

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
                                        handleChange(`${prefix}endDate`, newEndDate);
                                    }
                                }}
                            />
                            <div className={styles.fake} style={{width:'10%'}}/>
                            <div className={styles.flex}>
                                <div className={styles.timeDropdownCont}>
                                    <span>С</span>
                                    <TimeDropdown
                                        className={styles.timeDropdown}
                                        label={' '}
                                        disabled={!business.startDate}
                                        onChange={(value) => handleChange(`${prefix}startTime`, value)}
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
                                        onChange={(value) => handleChange(`${prefix}endTime`, value)}
                                        small={true}
                                        value={business.endTime}
                                        validationRules={{allowAnyMinute: true}}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className={cn(styles.lowZIndex)}>
                            { isEditMode && <Switch
                                className={styles.switch}
                                name={'finished'}
                                label={'Дело завершено ?'}
                                value={business.finished}
                                onChange={(name, value) => handleChange(name, value)}
                            />}
                        </div>

                        <div className={styles.reminders}>
                            {/* Здесь можно добавить функциональность напоминаний */}
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
                            handleChange(`${prefix}type`, type);
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

export default CalendarModal;