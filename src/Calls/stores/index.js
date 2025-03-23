// src/Calls/stores/calls.store.js
import { makeAutoObservable, reaction } from 'mobx';
import {
  changeDraft,
  removeDraft,
  resetDraft,
  updateDraftObject,
  updateObjectRecursively,
} from '../../utils/store.utils';
import { callsApi } from '../calls.api';
import { mapCallsResponse } from '../calls.mapper';
import { handleShowError } from '../../shared/http';

export class CallsStore {
  calls = [];
  drafts = {};
  currentCall = null;
  metaInfoTable = {};
  changedProps = new Set();
  isLoading = false;
  contextType = null;
  contextId = null;

  constructor(root) {
    this.root = root;
    makeAutoObservable(this);

    this.disposeReaction = reaction(
      () => this.currentCall,
      (currentCall) => {
        this.isLoading = currentCall === null;
      },
    );
  }

  dispose() {
    if (this.disposeReaction) {
      this.disposeReaction();
    }
  }

  setContext(type, id) {
    this.contextType = type;
    this.contextId = id;
    this.calls = []; // Сбрасываем звонки при смене контекста
  }

  getCalls() {
    debugger;
    return this.calls.map((call) => {
      const draft = this.drafts[call.id];
      return draft ? { ...call, ...draft } : call;
    });
  }

  getById(id, isReset = false) {
    const call =
      this.currentCall || this.calls.find((x) => x.id === Number(id));
    const draft = this.drafts[id];
    return isReset ? call : draft ? { ...call, ...draft } : call;
  }

  resetDraft(id, path) {
    if (!this.drafts[id]) return;
    let call = this.getById(id, true);

    resetDraft(this, id, call, path);
  }

  submitDraft(id) {
    if (!this.drafts[id]) return;

    const call = this.getById(id);
    if (!call) return;

    const updatedCall = { ...call };
    this.calls = this.calls.map((c) => (c.id === id ? updatedCall : c));
    delete this.drafts[id];
    this.clearChangesSet();
  }

  createDraft(id) {
    const call = this.getById(id);
    if (!call) return;

    this.drafts[id] = { ...call };
  }

  changeById(id, path, value, withId) {
    if (!this.drafts[id]) {
      this.createDraft(id);
    }

    let draft = this.drafts[id];
    this.addChangesProps(path);
    changeDraft(this, id, draft, path, value, withId);
  }

  removeById(id, path) {
    if (!this.drafts[id]) {
      this.createDraft(id);
    }

    removeDraft(this, id, path);
  }

  setCalls(result) {
    this.calls = result;
  }

  setMetaInfoTable(info) {
    this.metaInfoTable = info;
  }

  getMetaInfoTable() {
    return this.metaInfoTable;
  }

  setCurrentCall(call) {
    this.currentCall = call;
  }

  clearCurrentCall() {
    this.currentCall = null;
  }

  addChangesProps(name) {
    this.changedProps.add(name);
  }

  clearChangesSet() {
    this.changedProps = new Set();
  }

  // API методы для загрузки звонков
  async fetchCallsData() {
    this.isLoading = true;
    debugger;
    try {
      let response;

      if (this.contextType === 'company') {
        response = await callsApi.getCompanyCalls(this.contextId);
      } else if (this.contextType === 'deal') {
        response = await callsApi.getDealCalls(this.contextId);
      } else {
        response = await callsApi.getCalls();
      }
      debugger;
      if (response.status === 'success') {
        response.body.data = [
          ...response.body.data,
          ...response.body.data,
          ...response.body.data,
          ...response.body.data,
          ...response.body.data,
          ...response.body.data,
          ...response.body.data,
          {
            id: 1,
            created_at: '2025-03-23 00:10:45',
            mango_id: '123',
            type: 'incoming',
            success: 1,
            duration: 65,
            phone: '79999999999',
            phone_client: '79999999998',
            company: {
              id: 1,
              name: 'МФО Инж',
              description: null,
              status: 'not_working',
              manager: {
                id: 4,
                name: 'Даниил',
                middle_name: 'Владимирович',
                last_name: null,
                avatar: '/storage/avatars/default/males/avatar1.jpg',
                birthday: '1995-07-03',
                position: {
                  id: 5,
                  name: 'Менеджер по продажам',
                },
                email: null,
                phone: '+8562234051625',
                gender: 'male',
                permissions: [],
                hourly_rate: 381,
              },
              services: {
                total: 3,
                last: {
                  id: 3,
                  name: 'Лидген для сайта semenov.com',
                  type: 'leadgen',
                  responsible: {
                    id: 10,
                    name: 'Аркадий',
                    middle_name: null,
                    last_name: null,
                    avatar: '/storage/avatars/default/males/avatar2.jpg',
                    birthday: '1981-03-04',
                    position: {
                      id: 5,
                      name: 'Менеджер по продажам',
                    },
                    email: 'cpolakova@example.net',
                    phone: null,
                    gender: 'male',
                    permissions: [],
                    hourly_rate: 0,
                  },
                  creator: {
                    id: 2,
                    name: 'Витольд',
                    middle_name: 'Романович',
                    last_name: null,
                    avatar: '/storage/avatars/default/males/avatar6.jpg',
                    birthday: null,
                    position: {
                      id: 13,
                      name: 'Контент менеджер',
                    },
                    email: null,
                    phone: '+50268931221',
                    gender: 'male',
                    permissions: [],
                    hourly_rate: 891,
                  },
                  active: false,
                  deadline: '2020-11-12',
                  participants: [
                    {
                      id: 21,
                      name: 'Альбина',
                      middle_name: null,
                      last_name: null,
                      avatar: '/storage/avatars/default/females/avatar1.jpg',
                      birthday: '2007-12-30',
                      position: {
                        id: 6,
                        name: 'Менеджер ведения клиентов',
                      },
                      email: 'dev@lead-bro.ru',
                      phone: '+35692748328',
                      gender: 'female',
                      permissions: ['super admin'],
                      hourly_rate: 0,
                    },
                    {
                      id: 19,
                      name: 'Полина',
                      middle_name: 'Евгеньевна',
                      last_name: 'Миронова',
                      avatar: '/storage/avatars/default/females/avatar6.jpg',
                      birthday: null,
                      position: {
                        id: 1,
                        name: 'Администратор',
                      },
                      email: null,
                      phone: null,
                      gender: 'female',
                      permissions: [],
                      hourly_rate: 0,
                    },
                  ],
                  stages: {
                    total: 4,
                    last: {
                      id: 9,
                      name: 'Этап 3',
                      technical_specification:
                        'Quaerat magni dolorem laboriosam dolorum. Animi iste illum et nam eos. In ut est repellat nihil id. Sunt eum et itaque possimus voluptatem facere. Commodi quam ut corrupti porro cupiditate earum ad.',
                      start: '1993-11-07',
                      deadline: '2014-02-21',
                      active: 0,
                      act_sum: 1134594.64,
                      bills: [],
                      planned_time: null,
                      time_over_planned: null,
                      actual_time: 0,
                      task_count: 3,
                      stamped_act:
                        'https://stage.api.lead-bro.ru/stages/9/print_stamped_act/',
                      unstamped_act:
                        'https://stage.api.lead-bro.ru/stages/9/print_unstamped_act/',
                      company: {
                        id: 1,
                        name: 'МФО Инж',
                      },
                      service: {
                        id: 3,
                        name: 'Лидген для сайта semenov.com',
                      },
                    },
                  },
                  tasks: {
                    total: 14,
                    last: {
                      id: 30,
                      name: 'Qui in eligendi distinctio consequatur corrupti quis animi.',
                      description: null,
                      linked_task: '',
                      type: 'seo',
                      status: 'finished',
                      deadline: '2022-10-29',
                      responsible: {
                        id: 21,
                        name: 'Альбина',
                        middle_name: null,
                        last_name: null,
                        avatar: '/storage/avatars/default/females/avatar1.jpg',
                        birthday: '2007-12-30',
                        position: {
                          id: 6,
                          name: 'Менеджер ведения клиентов',
                        },
                        email: 'dev@lead-bro.ru',
                        phone: '+35692748328',
                        gender: 'female',
                        permissions: ['super admin'],
                        hourly_rate: 0,
                      },
                      creator: {
                        id: 8,
                        name: 'Нина',
                        middle_name: null,
                        last_name: null,
                        avatar: '/storage/avatars/default/females/avatar1.jpg',
                        birthday: null,
                        position: {
                          id: 6,
                          name: 'Менеджер ведения клиентов',
                        },
                        email: null,
                        phone: null,
                        gender: 'female',
                        permissions: [],
                        hourly_rate: 0,
                      },
                      planned_time: null,
                      actual_time: 0,
                      performer: {
                        id: 10,
                        name: 'Аркадий',
                        middle_name: null,
                        last_name: null,
                        avatar: '/storage/avatars/default/males/avatar2.jpg',
                        birthday: '1981-03-04',
                        position: {
                          id: 5,
                          name: 'Менеджер по продажам',
                        },
                        email: 'cpolakova@example.net',
                        phone: null,
                        gender: 'male',
                        permissions: [],
                        hourly_rate: 0,
                      },
                      auditors: [
                        {
                          id: 15,
                          name: 'Федосья',
                          middle_name: 'Дмитриевна',
                          last_name: null,
                          avatar:
                            '/storage/avatars/default/females/avatar6.jpg',
                          birthday: '2001-03-22',
                          position: {
                            id: 1,
                            name: 'Администратор',
                          },
                          email: null,
                          phone: '+244385359073',
                          gender: 'female',
                          permissions: [],
                          hourly_rate: 539,
                        },
                        {
                          id: 19,
                          name: 'Полина',
                          middle_name: 'Евгеньевна',
                          last_name: 'Миронова',
                          avatar:
                            '/storage/avatars/default/females/avatar6.jpg',
                          birthday: null,
                          position: {
                            id: 1,
                            name: 'Администратор',
                          },
                          email: null,
                          phone: null,
                          gender: 'female',
                          permissions: [],
                          hourly_rate: 0,
                        },
                      ],
                      show_at_client_cabinet: 1,
                      related_entity: {
                        id: 9,
                        name: 'Этап 3',
                        type: 'App\\Models\\Stage',
                        link: '/services/3/stages/9',
                      },
                      time_trackings: [],
                      cost: 0,
                    },
                  },
                  contract_number: null,
                  company: {
                    id: 1,
                    name: 'МФО Инж',
                  },
                },
              },
              phone: null,
              email: null,
              site: 'ustinov.net',
              address:
                '890366, Амурская область, город Красногорск, ул. Сталина, 27',
              legals: {
                inn: null,
                kpp: null,
                ogrn: null,
                checking_account: '30702502046149487784',
                correspondent_account: '55204450669406066776',
                bank_bic: null,
                bank_name: null,
                legal_address: null,
                real_address: null,
              },
              ymetrics_token: 'OZeVR;Br;KtQ:yAZY@_X',
              topvisor_token: '6r^_FSeAN{u`z|UpHL!`',
            },
            manager: {
              id: 21,
              name: 'Альбина',
              middle_name: null,
              last_name: null,
              avatar: '/storage/avatars/default/females/avatar1.jpg',
              birthday: '2007-12-30',
              position: {
                id: 6,
                name: 'Менеджер ведения клиентов',
              },
              email: 'dev@lead-bro.ru',
              phone: '+35692748328',
              gender: 'female',
              permissions: ['super admin'],
              hourly_rate: 0,
            },
            record:
              'https://app.mango-office.ru/vpbx/queries/recording/issa/1/play',
          },
        ];
        this.setCalls(mapCallsResponse(response.body.data));
      }
    } catch (error) {
      console.error('Ошибка при загрузке звонков:', error);
      handleShowError([error]);
    } finally {
      this.isLoading = false;
    }
  }

  // async makeCall(phoneNumber) {
  //   try {
  //     const contextData = this.contextType
  //       ? { entityType: this.contextType, entityId: this.contextId }
  //       : {};
  //
  //     const response = await callsApi.makeCall({
  //       phone: phoneNumber,
  //       ...contextData,
  //     });
  //     return { success: response.status === 'success', data: response.body };
  //   } catch (error) {
  //     console.error('Ошибка при совершении звонка:', error);
  //     return { success: false, error: error.message };
  //   }
  // }
  get sortedCalls() {
    return [...this.calls].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );
  }

  get groupedByDateCalls() {
    const grouped = {};
    debugger;
    this.sortedCalls.forEach((call) => {
      const dateStr = new Date(call.createdAt).toDateString();

      if (!grouped[dateStr]) {
        grouped[dateStr] = [];
      }

      grouped[dateStr].push(call);
    });

    return grouped;
  }
}
