import { makeAutoObservable, action, observable } from 'mobx';
import {
  changeDraft,
  removeDraft,
  resetDraft,
  updateDraftObject,
  updateObjectRecursively,
} from '../../../utils/store.utils';

export class TasksStore {
  tasks = [];
  drafts = {};
  taskStatuses = null;
  metaInfoTable = {};
  changedProps = new Set();

  constructor(root) {
    this.root = root;
    makeAutoObservable(this);
  }

  getTasks() {
    return this.tasks.map((task) => {
      const draft = this.drafts[task.id];
      return draft ? { ...task, ...draft } : task;
    });
  }

  getById(id, isReset = false) {
    const task = this.tasks.find((x) => x.id === Number(id));
    const draft = this.drafts[id];
    return isReset ? task : draft ? { ...task, ...draft } : task;
  }

  resetDraft(id, path) {
    if (!this.drafts[id]) return;
    let task = this.getById(id, true);

    resetDraft(this, id, task, path);
  }

  submitDraft(id) {
    if (!this.drafts[id]) return;

    const task = this.getById(id);
    if (!task) return;

    const updatedTask = { ...task };
    this.tasks = this.tasks.map((c) => (c.id === id ? updatedTask : c));
    delete this.drafts[id];
    this.clearChangesSet();
  }

  createDraft(id) {
    const task = this.getById(id);
    if (!task) return;

    this.drafts[id] = { ...task };
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

  setTasks(result) {
    this.tasks = result;
  }
  setStatuses(result) {
    this.taskStatuses = result;
  }

  setMetaInfoTable(info) {
    this.metaInfoTable = info;
  }

  getMetaInfoTable() {
    return this.metaInfoTable;
  }
  getStatuses() {
    return this.taskStatuses;
  }

  addChangesProps(name) {
    this.changedProps.add(name);
  }

  clearChangesSet() {
    this.changedProps = new Set();
  }
}
