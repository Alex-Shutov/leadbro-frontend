import { makeAutoObservable, reaction } from 'mobx';
import {
  changeDraft,
  removeDraft,
  resetDraft,
} from '../../../utils/store.utils';
import { callsApi } from '../calls.api';
import { mapCallsResponse } from '../calls.mapper';
import { handleShowError } from '../../../shared/http';

export class CallsStore {
  calls = [];
  drafts = {};
  currentCall = null;
  metaInfoTable = {};
  stats = null;
  changedProps = new Set();
  isLoading = false;
  contextType = null;
  contextId = null;

  constructor(root) {
    this.root = root;
    makeAutoObservable(this);

    // Track when the current call changes
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

  setCalls(calls) {
    this.calls = calls;
  }

  setStats(stats) {
    this.stats = stats;
  }

  getStats() {
    return this.stats;
  }

  getCalls() {
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

  get sortedCalls() {
    return [...this.calls].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );
  }

  get groupedByDateCalls() {
    const grouped = {};

    this.sortedCalls.forEach((call) => {
      const dateStr = new Date(call.createdAt).toDateString();

      if (!grouped[dateStr]) {
        grouped[dateStr] = [];
      }

      grouped[dateStr].push(call);
    });

    return grouped;
  }

  // API methods for fetching call data
  async fetchCallsData() {
    this.isLoading = true;

    try {
      let response;

      if (this.contextType === 'company') {
        response = await callsApi.getCompanyCalls(this.contextId);
      } else if (this.contextType === 'deal') {
        response = await callsApi.getDealCalls(this.contextId);
      } else {
        response = await callsApi.getCalls();
      }

      if (response.status === 'success') {
        this.setCalls(mapCallsResponse(response.body.data));
      }
    } catch (error) {
      console.error('Error loading calls:', error);
      handleShowError([error]);
    } finally {
      this.isLoading = false;
    }
  }

  // Method for initiating a call
  async makeCall(phoneNumber) {
    try {
      // const contextData = this.contextType
      //   ? { entityType: this.contextType, entityId: this.contextId }
      //   : {};

      const response = await callsApi.makeCall({
        phone: phoneNumber,
        // ...contextData,
      });
      return { success: response.status === 'success', data: response.body };
    } catch (error) {
      console.error('Error making call:', error);
      return { success: false, error: error.message };
    }
  }
}
