import {mockHttp} from "../../shared/http";
import {statusTypes} from "./clients.types";

export const createRequisites = ({INN = '', KPP = '', OGRN = '', RS = '', BIK = '', BankName = ''}) => {
    return {
        INN,
        KPP,
        OGRN,
        RS,
        BIK,
        BankName
    }
}

const createClients = () => {
    return [
        {
            id: 0,
            description: 'Лакокрасочный завод XYZ специализируется на производстве качественных лакокрасочных материалов и покрытий для различных отраслей промышленности с 2004 года. Мы постоянно совершенствуем наши технологии и материалы, чтобы отвечать высоким требованиям наших клиентов. ',
            title: 'a ООО ПКФ «Катав-Ивановский лакокрасочный завод»',
            status: statusTypes.inProgress,
            manager: {
                image: createBlob(),
                name:
                    'Александр',
                surname:
                    'Шилов',
                role:
                    'Директор'
            },
            contactPersons: [{
                id: 0,
                role: 'Руководитель',
                fio: 'Шилов Александр Александрович',
                tel: '+7 987 654-32-10',
                email: 'example@mail.ru',
                messengers: [{
                    telegram: '',
                }, {
                    whatsapp: ''
                }]
            },
                {
                    id: 0,
                    role: 'Руководитель',
                    fio: 'Шилов Александр Александрович',
                    tel: '+7 987 654-32-10',
                    email: 'example@mail.ru',
                    messengers: [{
                        telegram: '',
                    }, {
                        whatsapp: ''
                    }]
                }
            ],
            passwords:[{
                id:0,
                name:'Хостинг',
                values:{
                    0:'12345678',
                    1:'12345678'
                }
            }],
            contactData: {
                address: {
                    0: '620131, г. Екатеринбург, ул. Крауля, д. 182, оф...'
                },
                tel: {
                    0: '+7 987 654-32-10',
                    1: '1'
                },
                email: {0: 'example@mail.ru'},
                site: {0: 'example.ru'},
                requisites: {
                    0: createRequisites({
                        INN: '1234567890',
                        BankName: 'ФИЛИАЛ "ЕКАТЕРИНБУРГСКИЙ" АО "АЛЬФА-БАНК"',
                        KPP: '1234567890',
                        OGRN: '620131, г. Екатеринбург, ул. Крауля, д. 182, офис 201',
                        RS: '4002402400000020400',
                        BIK: '046577964'
                    })
                }
            },
            activities: [{
                date: new Date(2024, 1, 11),
                time: new Date(),
                description: 'Звонок клиенту для отчетности за март',
                assignee: {
                    image: createBlob(),
                    name:
                        'Александр',
                    surname:
                        'Шилов',
                    role:
                        'Директор'
                }
            },
                {
                    date: new Date(2024, 9, 20),
                    time: new Date(),
                    description: 'Звонок клиенту для отчетности за март',
                    assignee: {
                        image: createBlob(),
                        name:
                            'Александр',
                        surname:
                            'Шилов',
                        role:
                            'Директор'
                    }
                }
            ],
            services: [{
                description: 'SEONeo',
                creator: {
                    image: createBlob(),
                    name:
                        'Александр',
                    surname:
                        'Шилов',
                    role:
                        'Директор'
                },
                responsible: {
                    image: createBlob(),
                    name:
                        'Александр',
                    surname:
                        'Шилов',
                    role:
                        'Директор',
                },
                deadline: new Date()
            }],
            deals: [{
                status: 'Догоовр подписан',
                sum: '39000',
                description: 'Связаться с клиентом',
                deadline: new Date(),
                responsible: {
                    image: createBlob(),
                    name:
                        'Александр',
                    surname:
                        'Шилов',
                    role:
                        'Директор',
                    deadline: new Date()
                }
            }]
        },
        {
            id: 1,
            description: 'Лакокрасочный завод XYZ специализируется на производстве качественных лакокрасочных материалов и покрытий для различных отраслей промышленности с 2004 года. Мы постоянно совершенствуем наши технологии и материалы, чтобы отвечать высоким требованиям наших клиентов. ',
            title: 'в ООО ПКФ «Катав-Ивановский лакокрасочный завод»',
            status: statusTypes.notInProgress,
            manager: {
                image: createBlob(),
                name:
                    'Николай',
                surname:
                    'Шилов',
                role:
                    'Директор'
            },
            passwords:[{
                id:0,
                name:'Хостинг',
                values:{
                    0:'12345678',
                    1:'12345678'
                }
            }],
            contactData: {
                address: {
                    0: '620131, г. Екатеринбург, ул. Крауля, д. 182, оф...'
                },
                tel: {
                    0: '+7 987 654-32-10',
                    1: '1'
                },
                email: {0: 'example@mail.ru'},
                site: {0: 'example.ru'},
                requisites: {
                    0: createRequisites({
                        INN: '1234567890',
                        BankName: 'ФИЛИАЛ "ЕКАТЕРИНБУРГСКИЙ" АО "АЛЬФА-БАНК"',
                        KPP: '1234567890',
                        OGRN: '620131, г. Екатеринбург, ул. Крауля, д. 182, офис 201',
                        RS: '4002402400000020400',
                        BIK: '046577964'
                    })
                }
            },
            contactPersons: [{
                0: {
                    id: 0,
                    role: 'Руководитель',
                    fio: 'Шилов Александр Александрович',
                    tel: '+7 987 654-32-10',
                    email: 'example@mail.ru',
                    messengers: [{
                        telegram: '',
                        whatsApp: ''
                    }]
                }
            }],
            activities: [{
                date: new Date(2024, 1, 11),
                time: new Date(),
                description: 'Звонок клиенту для отчетности за март',
                assignee: {
                    image: createBlob(),
                    name:
                        'Александр',
                    surname:
                        'Шилов',
                    role:
                        'Директор'
                }
            },
                {
                    date: new Date(2024, 1, 11),
                    time: new Date(),
                    description: 'Звонок клиенту для отчетности за март',
                    assignee: {
                        image: createBlob(),
                        name:
                            'Александр',
                        surname:
                            'Шилов',
                        role:
                            'Директор'
                    }
                }
            ],

            services: [{
                description: 'SEO',
                creator: {
                    image: createBlob(),
                    name:
                        'Александр',
                    surname:
                        'Шилов',
                    role:
                        'Директор'
                },
                responsible: {
                    image: createBlob(),
                    name:
                        'Александр',
                    surname:
                        'Шилов',
                    role:
                        'Директор',
                },
                deadline: new Date()
            }, {
                description: 'SEO',
                creator: {
                    image: createBlob(),
                    name:
                        'Александр',
                    surname:
                        'Шилов',
                    role:
                        'Директор'
                },
                responsible: {
                    image: createBlob(),
                    name:
                        'Александр',
                    surname:
                        'Шилов',
                    role:
                        'Директор',
                },
                deadline: new Date()
            }],

            deals: [{
                description: 'Связаться с клиентом',
                deadline: new Date(),
                status: 'Догоовр подписан',
                responsible: {
                    image: createBlob(),
                    name:
                        'Александр',
                    surname:
                        'Шилов',
                    role:
                        'Директор',
                    deadline: new Date()
                }
            }]
        }
    ]
}

const resetApiProvider = () => mockHttp.restore()


const createBlob = () => {
    const imageBase64 = "data:image/png;base64,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"
    const byteCharacters = atob(imageBase64.split(',')[1]);
    const byteNumbers = []
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers.push(byteCharacters.charCodeAt(i));
    }
    const byteArray = new Uint8Array(byteNumbers);
    const imageBlob = new Blob([byteArray], {type: 'image/png'});
    return imageBase64
}

export default {createClients, resetApiProvider}