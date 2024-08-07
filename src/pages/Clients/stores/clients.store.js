import { makeAutoObservable, action, observable } from 'mobx';
import { isId } from '../../../utils/is.type';
import {
  changeDraft,
  removeDraft,
  resetDraft,
  updateDraftObject,
  updateObjectRecursively,
} from '../../../utils/store.utils';

export class ClientsStore {
  clients = [];
  drafts = {};
  currentClient = null;

  constructor(root) {
    this.root = root;
    makeAutoObservable(this);
  }

  getClients() {
    return this.clients.map((client) => {
      const draft = this.drafts[client.id];
      return draft ? { ...client, ...draft } : client;
    });
  }

  getById(id, isReset = false) {
    const client =
      this.clients.find((x) => x.id === Number(id)) || this.currentClient;
    const draft = this.drafts[id];
    return isReset ? client : draft ? { ...client, ...draft } : client;
  }

  resetDraft(id, path) {
    if (!this.drafts[id]) return;
    let client = this.getById(id, true);

    resetDraft(this, id, client, path);
  }

  submitDraft(id) {
    if (!this.drafts[id]) return;

    const client = this.getById(id);
    if (!client) return;

    const updatedClient = { ...client };
    this.clients = this.clients.map((c) => (c.id === id ? updatedClient : c));
    delete this.drafts[id];
  }

  createDraft(id) {
    const client = this.getById(id);
    if (!client) return;

    this.drafts[id] = { ...client };
  }

  changeById(id, path, value, withId) {
    if (!this.drafts[id]) {
      this.createDraft(id);
    }
    let draft = this.drafts[id];
    changeDraft(this, id, draft, path, value, withId);
  }

  removeById(id, path) {
    if (!this.drafts[id]) {
      this.createDraft(id);
    }

    removeDraft(this, id, path);
  }

  setClients(result) {
    this.clients = result;
  }
  setCurrentClient(client) {
    this.currentClient = client;
  }

  clearCurrentClient() {
    this.currentClient = null;
  }
}
