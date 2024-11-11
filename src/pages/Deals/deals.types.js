export const dealStatusTypes = {
    new_lead: 'new_lead',
    lead_processed: 'lead_processed',
    brief_filled: 'brief_filled',
    offer_sent: 'offer_sent',
    contract_signed: 'contract_signed',
    bill_paid: 'bill_paid',
    paused: 'paused',
    refused: 'refused',
    failed: 'failed',
};

export const dealStatusTypesRu = {
    new_lead: 'Новый лид',
    lead_processed: 'Лид обработан',
    brief_filled: 'Бриф заполнен',
    offer_sent: 'Предложение отправлено',
    contract_signed: 'Договор подписан',
    bill_paid: 'Счёт оплачен',
    paused: 'Приостановлено',
    refused: 'Отказ',
    failed: 'Ошибка',
};

export const colorStatusDealTypes = {
    new_lead: { status: dealStatusTypesRu.new_lead, class: 'status-task-aqua' },
    lead_processed: { status: dealStatusTypesRu.lead_processed, class: 'status-task-blue' },
    brief_filled: { status: dealStatusTypesRu.brief_filled, class: 'status-task-light-green' },
    offer_sent: { status: dealStatusTypesRu.offer_sent, class: 'status-task-green' },
    contract_signed: { status: dealStatusTypesRu.contract_signed, class: 'status-task-dark-green' },
    bill_paid: { status: dealStatusTypesRu.bill_paid, class: 'status-task-yellow' },
    paused: { status: dealStatusTypesRu.paused, class: 'status-task-disabled' },
    refused: { status: dealStatusTypesRu.refused, class: 'status-task-red' },
    failed: { status: dealStatusTypesRu.failed, class: 'status-task-red-dark' },
};


export const colorStatsuDealTypesForPage = {
    new_lead: { status: dealStatusTypesRu.new_lead, class: 'status-aqua' },
    lead_processed: { status: dealStatusTypesRu.lead_processed, class: 'status-blue' },
    brief_filled: { status: dealStatusTypesRu.brief_filled, class: 'status-light-green' },
    offer_sent: { status: dealStatusTypesRu.offer_sent, class: 'status-green' },
    contract_signed: { status: dealStatusTypesRu.contract_signed, class: 'status-dark-green' },
    bill_paid: { status: dealStatusTypesRu.bill_paid, class: 'status-yellow' },
    paused: { status: dealStatusTypesRu.paused, class: 'status-disabled' },
    refused: { status: dealStatusTypesRu.refused, class: 'status-red' },
    failed: { status: dealStatusTypesRu.failed, class: 'status-red-dark' },
};