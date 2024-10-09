import { createBlob } from '../../utils/create.utils';
import { stageStatusTypes, taskStatusTypes } from './stages.types';

export const mapStageFromApi = (stageData, tasksData) => {
    return {
        id: stageData.id,
        number: stageData.number || '1234', // Номер этапа
        title: stageData.name,
        startTime: stageData.start ? new Date(stageData.start) : new Date(),
        deadline: stageData.deadline ? new Date(stageData.deadline) : new Date(),
        deadlineTime: '5 ч', // Время дедлайна по умолчанию
        actualTime: '5 ч', // Время дедлайна по умолчанию
        contactPerson: stageData.contactPerson || 'Александр Шилов',
        extraCosts: stageData.extraCosts || '7500',
        actSum: stageData.actSum || '2500',
        budgetTimeValue: stageData.budgetTimeValue || 20,
        budgetTimeType: stageData.budgetTimeType || 'minutes',
        status: stageData.active === 1 ? stageStatusTypes.inProgress : stageStatusTypes.created,
        taskDescription: stageData.taskDescription || 'Нарисовать СРМ',
        sumByHand: true,
        service: {
            id: stageData.service?.id || 0,
            title: stageData.service?.title || 'Услуга 1',
        },
        client: {
            id: stageData.client?.id || 0,
            title: stageData.client?.title || 'a ООО ПКФ «Катав-Ивановский лакокрасочный завод»',
        },
        tasks: tasksData.map(mapTaskFromApi),
    };
};

const mapTaskFromApi = (task) => {
    return {
        id: task.id,
        title: task.name,
        status: mapTaskStatus(task.status),
        service: {
            id: task.service?.id || 0,
            title: task.service?.title || 'Название услуги 1',
        },
        template: {
            id: task.template?.id || 0,
            title: task.template?.title || 'Название шаблона 1',
        },
        description: task.description || 'Описание отсутствует',
        showInLK: task.show_at_client_cabinet === 1,
        comments: task.comments ? mapComments(task.comments) : {},
        taskLinked: {
            id: task.taskLinked?.id || 0,
            title: task.taskLinked?.title || 'Задача № 3 - разработать сайт',
        },
        type: {
            id: task.type?.id || 0,
            title: task.type?.title || 'Тип задачи 1',
        },
        auditors: task.auditors ? task.auditors.map(mapParticipant) : [],
        executors: task.executors ? task.executors.map(mapParticipant) : [],
        responsibles: task.responsible ? task.responsible : [],
        deadline: task.deadline ? new Date(task.deadline) : new Date(),
        deadlineTime: task.deadlineTime || '5 ч',
        actualTime: task.actual_time ? `${task.actual_time} ч` : 'Не задано',
        isNewForUser: task.isNewForUser || false,
    };
};

const mapParticipant = (participant) => {
    return {
        id: participant.id,
        fio: participant.fio || 'Неизвестный',
        role: participant.role || 'Неизвестная роль',
        image: participant.avatar ? createBlob(participant.avatar) : null,
    };
};

const mapComments = (comments) => {
    return Object.keys(comments).reduce((acc, key) => {
        const comment = comments[key];
        acc[key] = {
            id: comment.id,
            date: comment.date ? new Date(comment.date) : new Date(),
            sender: mapParticipant(comment.sender),
            value: comment.value || { text: 'Текст комментария отсутствует' },
        };
        return acc;
    }, {});
};

const mapTaskStatus = (status) => {
    switch (status) {
        case 'created':
            return taskStatusTypes.created;
        case 'finished':
            return taskStatusTypes.finished;
        default:
            return taskStatusTypes.inProgress;
    }
};
