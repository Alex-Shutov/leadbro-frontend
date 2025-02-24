import { makeAutoObservable } from 'mobx';
import { calendarViewTypes } from './calendar.types';
import { changeDraft, removeDraft, resetDraft } from '../../utils/store.utils';

export class CalendarStore {
  businesses = [];
  drafts = {};
  currentView = calendarViewTypes.month;
  currentDate = new Date();
  changedProps = new Set();

  constructor(root) {
    this.root = root;
    makeAutoObservable(this);
  }

  setBusinesses(businesses) {
    this.businesses = businesses;
  }

  getBusinesses() {
    return this.businesses.map((business) => {
      const draft = this.drafts[business.id];
      return draft ? { ...business, ...draft } : business;
    });
  }

  setCurrentView(view) {
    this.currentView = view;
  }

  setCurrentDate(date) {
    this.currentDate = date;
  }

  getById(id, isReset = false) {
    const business = this.businesses.find((x) => x.id === Number(id));
    const draft = this.drafts[id];
    return isReset ? business : draft ? { ...business, ...draft } : business;
  }

  createDraft(id) {
    const business = this.getById(id);
    if (!business) return;
    this.drafts[id] = { ...business };
  }

  updateBusinessEvent(id, updates) {
    const businessIndex = this.businesses.findIndex(b => b.id === id);
    if (businessIndex !== -1) {
      this.businesses[businessIndex] = {
        ...this.businesses[businessIndex],
        ...updates
      };
    }
  }

  changeById(id, path, value, withId) {
    if (!this.drafts[id]) {
      this.createDraft(id);
    }
    let draft = this.drafts[id];
    this.addChangesProps(path);
    changeDraft(this, id, draft, path, value, withId);
  }

  resetDraft(id, path) {
    if (!this.drafts[id]) return;
    let business = this.getById(id, true);
    this.clearChangesSet();
    resetDraft(this, id, business, path);
  }

  submitDraft(id) {
    if (!this.drafts[id]) return;

    const business = this.getById(id);
    if (!business) return;

    const updatedBusiness = { ...business };
    this.businesses = this.businesses.map((b) =>
      b.id === id ? updatedBusiness : b,
    );
    delete this.drafts[id];
    this.clearChangesSet();
  }

  removeById(id, path) {
    if (!this.drafts[id]) {
      this.createDraft(id);
    }
    removeDraft(this, id, path);
  }

  addChangesProps(name) {
    this.changedProps.add(name);
  }

  clearChangesSet() {
    this.changedProps = new Set();
  }
}
